const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

router.post('/pay', async (req, res) => {
    try {
        const { user_id, zone_id, duration, plate_number, amount } = req.body;

        // 1. Check Capacity
        const { data: zone, error: zoneError } = await supabase
            .from('parking_zones')
            .select('*')
            .eq('id', zone_id)
            .single();

        if (zoneError || !zone) {
            return res.status(404).json({ error: 'Zone not found' });
        }

        if (zone.occupied >= zone.capacity) {
            return res.status(400).json({ error: 'Zone is full' });
        }

        // 2. Process Payment (Mock)
        // In a real app, integrate Stripe/PayPal here.
        const paymentSuccess = true;
        if (!paymentSuccess) {
            return res.status(402).json({ error: 'Payment failed' });
        }

        // 3. Record Transaction
        const { data: transaction, error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id,
                zone_id,
                amount,
                duration,
                plate_number
            })
            .select()
            .single();

        if (txError) throw txError;

        // 4. Update Occupancy
        // Note: This is a simple increment. In reality, you'd need a way to decrement when time expires.
        // For this MVP, we just increment.
        await supabase
            .from('parking_zones')
            .update({ occupied: zone.occupied + 1 })
            .eq('id', zone_id);

        res.json({ success: true, transaction });

    } catch (error) {
        console.error('Parking Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
