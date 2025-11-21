const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// POST /api/auth/login
// Placeholder if you want to do server-side verification
router.post('/login', async (req, res) => {
    res.json({ message: 'Use Supabase Client SDK for Login' });
});

// DELETE /api/auth/account
// REQUIRED for App Store Compliance
router.delete('/account', async (req, res) => {
    try {
        const { user_id } = req.body; // In production, verify JWT from header

        if (!user_id) {
            return res.status(400).json({ error: 'User ID required' });
        }

        // Delete from auth.users (Requires Service Role)
        const { error } = await supabase.auth.admin.deleteUser(user_id);

        if (error) throw error;

        // Optional: Cleanup profiles/reports if not handled by Cascade
        // Our SQL schema has ON DELETE CASCADE for profiles, so it should be fine.

        res.json({ success: true, message: 'Account deleted' });

    } catch (error) {
        console.error('Delete Account Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
