const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Note: For production FCM, you would need firebase-admin SDK
// This implementation stores notifications in Supabase and provides
// the infrastructure for FCM integration when ready

// Get all users with FCM tokens (for notification targeting)
router.get('/users', async (req, res) => {
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

// Send notification (stores in DB, FCM integration ready)
router.post('/send', async (req, res) => {
    try {
        const { title, body, target, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        // Get target users based on target type
        let targetUsers = [];
        let query = supabase.from('profiles').select('id, phone, fcm_token');

        if (target === 'all') {
            // All users with FCM tokens
            const { data } = await query.not('fcm_token', 'is', null);
            targetUsers = data || [];
        } else if (target === 'admins') {
            // Only admins
            const { data } = await query.eq('role', 'admin').not('fcm_token', 'is', null);
            targetUsers = data || [];
        } else if (target === 'citizens') {
            // Only citizens
            const { data } = await query.eq('role', 'citizen').not('fcm_token', 'is', null);
            targetUsers = data || [];
        } else if (Array.isArray(target)) {
            // Specific user IDs
            const { data } = await query.in('id', target);
            targetUsers = data || [];
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
                status: 'sent'
            })
            .select()
            .single();

        if (notificationError) throw notificationError;

        // TODO: Integrate Firebase Admin SDK for actual push notifications
        // For now, we're storing the notification and returning success
        // 
        // Example FCM integration (when firebase-admin is added):
        // const admin = require('firebase-admin');
        // const tokens = targetUsers.map(u => u.fcm_token).filter(Boolean);
        // if (tokens.length > 0) {
        //     await admin.messaging().sendEachForMulticast({
        //         tokens,
        //         notification: { title, body },
        //         data: data || {}
        //     });
        // }

        res.json({
            success: true,
            message: `Notification queued for ${targetUsers.length} users`,
            notification,
            targetCount: targetUsers.length
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete notification from history
router.delete('/:id', async (req, res) => {
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

