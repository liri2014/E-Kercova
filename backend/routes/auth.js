const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify the JWT with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

// POST /api/auth/login
// Placeholder if you want to do server-side verification
router.post('/login', async (req, res) => {
    res.json({ message: 'Use Supabase Client SDK for Login' });
});

// DELETE /api/auth/account
// REQUIRED for App Store Compliance
// SECURED: User can only delete their own account
router.delete('/account', verifyToken, async (req, res) => {
    try {
        // User ID comes from verified JWT, not request body
        const user_id = req.user.id;

        // Delete from auth.users (Requires Service Role)
        const { error } = await supabase.auth.admin.deleteUser(user_id);

        if (error) throw error;

        // Optional: Cleanup profiles/reports if not handled by Cascade
        // Our SQL schema has ON DELETE CASCADE for profiles, so it should be fine.

        res.json({ success: true, message: 'Account deleted' });

    } catch (error) {
        console.error('Delete Account Error:', error.message);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

module.exports = router;
