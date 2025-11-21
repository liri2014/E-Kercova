const express = require('express');
const router = express.Router();
const axios = require('axios');
const supabase = require('../supabaseClient');

// GET /api/holidays/:year
// Fetch North Macedonia holidays from public API
router.get('/:year', async (req, res) => {
    try {
        const { year } = req.params;
        const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/MK`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching holidays:', error);
        res.status(500).json({ error: 'Failed to fetch holidays' });
    }
});

// POST /api/holidays/import
// Import holidays as events into database
// Body: { year: number }
router.post('/import', async (req, res) => {
    try {
        const { year } = req.body;

        if (!year) {
            return res.status(400).json({ error: 'Year is required' });
        }

        // Fetch holidays from API
        const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/MK`);
        const holidays = response.data;

        // Transform holidays into events
        const events = holidays.map(holiday => ({
            title: holiday.name,
            title_mk: holiday.localName,
            title_sq: holiday.name, // Will need translation
            title_en: holiday.name,
            description: `National holiday in North Macedonia`,
            description_mk: `Национален празник во Северна Македонија`,
            description_sq: `Festë kombëtare në Maqedoninë e Veriut`,
            description_en: `National holiday in North Macedonia`,
            date: holiday.date,
            type: 'holiday',
            is_holiday: true
        }));

        // Insert events into database
        const { data, error } = await supabase
            .from('events')
            .insert(events)
            .select();

        if (error) {
            throw error;
        }

        res.json({
            message: `Successfully imported ${events.length} holidays for ${year}`,
            events: data
        });
    } catch (error) {
        console.error('Error importing holidays:', error);
        res.status(500).json({ error: 'Failed to import holidays', details: error.message });
    }
});

module.exports = router;
