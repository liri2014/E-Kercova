const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Firebase Admin SDK - Initialize only if credentials are available
let firebaseAdmin = null;
try {
    const admin = require('firebase-admin');
    
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
        // Initialize with service account from environment variable
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
            ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
            : null;
        
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            firebaseAdmin = admin;
            console.log('Firebase Admin SDK initialized successfully');
        } else {
            console.log('Firebase Admin SDK not configured - notifications will be queued only');
        }
    } else {
        firebaseAdmin = admin;
    }
} catch (error) {
    console.log('Firebase Admin SDK not available:', error.message);
}

// Helper function to send FCM notification
const sendFCMNotification = async (tokens, title, body, data = {}) => {
    if (!firebaseAdmin || tokens.length === 0) {
        return { success: 0, failure: tokens.length, results: [] };
    }

    try {
        const message = {
            notification: { title, body },
            data: Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v)])
            ),
            tokens: tokens.filter(Boolean)
        };

        const response = await firebaseAdmin.messaging().sendEachForMulticast(message);
        
        console.log(`FCM: ${response.successCount} sent, ${response.failureCount} failed`);
        
        return {
            success: response.successCount,
            failure: response.failureCount,
            results: response.responses
        };
    } catch (error) {
        console.error('FCM send error:', error);
        return { success: 0, failure: tokens.length, error: error.message };
    }
};

// Middleware to verify admin API key
const verifyAdminKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.headers['x-admin-key'];
    const validKey = process.env.ADMIN_API_KEY;

    if (!validKey) {
        console.warn('ADMIN_API_KEY not set - notification routes unprotected');
        return next();
    }

    if (!apiKey || apiKey !== validKey) {
        return res.status(401).json({ error: 'Unauthorized - Invalid admin API key' });
    }

    next();
};

// Get all users with FCM tokens (Admin only)
router.get('/users', verifyAdminKey, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, phone, fcm_token, role')
            .not('fcm_token', 'is', null);

        if (error) throw error;

        res.json({
            success: true,
            users: data || [],
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error fetching users with FCM tokens:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get notification history
router.get('/history', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({
            success: true,
            notifications: data || []
        });
    } catch (error) {
        console.error('Error fetching notification history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send notification to users (Admin only)
router.post('/send', verifyAdminKey, async (req, res) => {
    try {
        const { title, body, target, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        // Get target users based on target type
        let targetUsers = [];
        let query = supabase.from('profiles').select('id, phone, fcm_token');

        if (target === 'all') {
            const { data } = await query.not('fcm_token', 'is', null);
            targetUsers = data || [];
        } else if (target === 'admins') {
            const { data } = await query.eq('role', 'admin').not('fcm_token', 'is', null);
            targetUsers = data || [];
        } else if (target === 'citizens') {
            const { data } = await query.eq('role', 'citizen').not('fcm_token', 'is', null);
            targetUsers = data || [];
        } else if (Array.isArray(target)) {
            const { data } = await query.in('id', target);
            targetUsers = data || [];
        }

        // Get FCM tokens
        const tokens = targetUsers.map(u => u.fcm_token).filter(Boolean);

        // Send via FCM
        let fcmResult = { success: 0, failure: tokens.length };
        if (firebaseAdmin && tokens.length > 0) {
            fcmResult = await sendFCMNotification(tokens, title, body, data);
        }

        // Store notification in database
        const { data: notification, error: notificationError } = await supabase
            .from('notifications')
            .insert({
                title,
                body,
                target_type: Array.isArray(target) ? 'specific' : target,
                target_count: targetUsers.length,
                data: data || {},
                status: fcmResult.success > 0 ? 'sent' : 'queued',
                sent_count: fcmResult.success,
                failed_count: fcmResult.failure
            })
            .select()
            .single();

        if (notificationError) throw notificationError;

        res.json({
            success: true,
            message: `Notification sent to ${fcmResult.success}/${targetUsers.length} users`,
            notification,
            fcmResult
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send notification to specific user
router.post('/send-to-user', async (req, res) => {
    try {
        const { user_id, title, body, data } = req.body;

        if (!user_id || !title || !body) {
            return res.status(400).json({ error: 'user_id, title, and body are required' });
        }

        // Get user's FCM token
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', user_id)
            .single();

        if (userError) throw userError;

        let fcmResult = { success: 0, failure: 1 };
        if (user?.fcm_token && firebaseAdmin) {
            fcmResult = await sendFCMNotification([user.fcm_token], title, body, data);
        }

        res.json({
            success: fcmResult.success > 0,
            message: fcmResult.success > 0 ? 'Notification sent' : 'User has no FCM token or FCM not configured'
        });
    } catch (error) {
        console.error('Error sending notification to user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Schedule parking reminder
router.post('/parking-reminder', async (req, res) => {
    try {
        const { user_id, parking_zone, end_time, plate_number } = req.body;

        if (!user_id || !end_time) {
            return res.status(400).json({ error: 'user_id and end_time are required' });
        }

        // Store reminder in database for scheduled job to process
        const { data: reminder, error: reminderError } = await supabase
            .from('parking_reminders')
            .insert({
                user_id,
                parking_zone,
                end_time,
                plate_number,
                reminder_time: new Date(new Date(end_time).getTime() - 10 * 60 * 1000).toISOString(), // 10 min before
                status: 'pending'
            })
            .select()
            .single();

        if (reminderError) {
            // Table might not exist, create it
            console.log('Creating parking_reminders table...');
            throw reminderError;
        }

        res.json({
            success: true,
            message: 'Parking reminder scheduled',
            reminder
        });
    } catch (error) {
        console.error('Error scheduling parking reminder:', error);
        res.status(500).json({ error: error.message });
    }
});

// Process pending parking reminders (Admin/Cron only)
router.post('/process-parking-reminders', verifyAdminKey, async (req, res) => {
    try {
        const now = new Date().toISOString();

        // Get pending reminders that should be sent
        const { data: reminders, error: fetchError } = await supabase
            .from('parking_reminders')
            .select('*, profiles!inner(fcm_token)')
            .eq('status', 'pending')
            .lte('reminder_time', now);

        if (fetchError) throw fetchError;

        let sent = 0;
        let failed = 0;

        for (const reminder of (reminders || [])) {
            const token = reminder.profiles?.fcm_token;
            if (token && firebaseAdmin) {
                const result = await sendFCMNotification(
                    [token],
                    '⏰ Parking Expiring Soon!',
                    `Your parking for ${reminder.plate_number} expires in 10 minutes. Zone: ${reminder.parking_zone}`,
                    { view: 'parking', type: 'parking_reminder' }
                );

                if (result.success > 0) {
                    sent++;
                    await supabase
                        .from('parking_reminders')
                        .update({ status: 'sent' })
                        .eq('id', reminder.id);
                } else {
                    failed++;
                }
            }
        }

        res.json({
            success: true,
            processed: reminders?.length || 0,
            sent,
            failed
        });
    } catch (error) {
        console.error('Error processing parking reminders:', error);
        res.status(500).json({ error: error.message });
    }
});

// Notify user about report status change
router.post('/report-status', async (req, res) => {
    try {
        const { report_id, user_id, status, category } = req.body;

        if (!user_id || !status) {
            return res.status(400).json({ error: 'user_id and status are required' });
        }

        const statusMessages = {
            'in_progress': { title: '🔧 Report In Progress', body: `Your ${category || 'report'} is now being worked on!` },
            'resolved': { title: '✅ Report Resolved', body: `Your ${category || 'report'} has been resolved. Thank you!` },
            'rejected': { title: '❌ Report Closed', body: `Your ${category || 'report'} has been reviewed and closed.` }
        };

        const message = statusMessages[status] || { title: 'Report Update', body: `Status changed to: ${status}` };

        // Get user's FCM token
        const { data: user } = await supabase
            .from('profiles')
            .select('fcm_token')
            .eq('id', user_id)
            .single();

        let sent = false;
        if (user?.fcm_token && firebaseAdmin) {
            const result = await sendFCMNotification(
                [user.fcm_token],
                message.title,
                message.body,
                { view: 'history', report_id, type: 'report_status' }
            );
            sent = result.success > 0;
        }

        res.json({
            success: true,
            sent,
            message: sent ? 'Notification sent' : 'Notification queued (FCM not available)'
        });
    } catch (error) {
        console.error('Error sending report status notification:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete notification from history (Admin only)
router.delete('/:id', verifyAdminKey, async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
