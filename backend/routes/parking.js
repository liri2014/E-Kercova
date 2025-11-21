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

// POST /api/parking/zones - Create new parking zone
router.post('/zones', async (req, res) => {
    try {
        const { name, rate, capacity } = req.body;

        if (!name || !rate || !capacity) {
            return res.status(400).json({ error: 'Missing required fields: name, rate, capacity' });
        }

        const { data, error } = await supabase
            .from('parking_zones')
            .insert([{ name, rate, capacity, occupied: 0 }])
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Parking zone created', zone: data });
    } catch (error) {
        console.error('Error creating parking zone:', error);
        res.status(500).json({ error: 'Failed to create parking zone' });
    }
});

// PUT /api/parking/zones/:id - Update parking zone
router.put('/zones/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rate, capacity } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (rate !== undefined) updates.rate = rate;
        if (capacity !== undefined) updates.capacity = capacity;

        const { data, error } = await supabase
            .from('parking_zones')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Parking zone updated', zone: data });
    } catch (error) {
        console.error('Error updating parking zone:', error);
        res.status(500).json({ error: 'Failed to update parking zone' });
    }
});

// DELETE /api/parking/zones/:id - Delete parking zone
router.delete('/zones/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('parking_zones')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Parking zone deleted' });
    } catch (error) {
        console.error('Error deleting parking zone:', error);
        res.status(500).json({ error: 'Failed to delete parking zone' });
    }
});

module.exports = router;
