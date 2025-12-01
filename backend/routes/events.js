const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET /api/events - Get all events
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// POST /api/events - Create event with auto-translation
router.post('/', async (req, res) => {
    try {
        const { title, description, date, type, sourceLang, is_holiday } = req.body;

        if (!title || !date || !sourceLang) {
            return res.status(400).json({ error: 'Missing required fields: title, date, sourceLang' });
        }

        // Translate title and description
        const titleTranslations = await translateText(title, sourceLang);
        const descTranslations = description ? await translateText(description, sourceLang) : { mk: '', sq: '', en: '' };

        const event = {
            title: title,
            title_mk: titleTranslations.mk,
            title_sq: titleTranslations.sq,
            title_en: titleTranslations.en,
            description: description || '',
            description_mk: descTranslations.mk,
            description_sq: descTranslations.sq,
            description_en: descTranslations.en,
            date: date,
            type: type || 'event',
            is_holiday: is_holiday || false
        };

        const { data, error } = await supabase
            .from('events')
            .insert([event])
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Event created', event: data });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event', details: error.message });
    }
});

// PUT /api/events/:id - Update event
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, date, type, sourceLang, is_holiday } = req.body;

        const updates = {};

        if (title && sourceLang) {
            const titleTranslations = await translateText(title, sourceLang);
            updates.title = title;
            updates.title_mk = titleTranslations.mk;
            updates.title_sq = titleTranslations.sq;
            updates.title_en = titleTranslations.en;
        }

        if (description && sourceLang) {
            const descTranslations = await translateText(description, sourceLang);
            updates.description = description;
            updates.description_mk = descTranslations.mk;
            updates.description_sq = descTranslations.sq;
            updates.description_en = descTranslations.en;
        }

        if (date !== undefined) updates.date = date;
        if (type !== undefined) updates.type = type;
        if (is_holiday !== undefined) updates.is_holiday = is_holiday;

        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Event updated', event: data });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

// DELETE /api/events/:id - Delete event
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Event deleted' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Helper function to translate text using MyMemory free API
async function translateText(text, sourceLang) {
    try {
        const langCodes = {
            sq: 'sq',
            mk: 'mk',
            en: 'en'
        };

        const translations = { [sourceLang]: text };
        const targetLangs = ['sq', 'mk', 'en'].filter(lang => lang !== sourceLang);

        for (const targetLang of targetLangs) {
            try {
                const response = await fetch(
                    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langCodes[sourceLang]}|${langCodes[targetLang]}`
                );
                const data = await response.json();
                
                if (data.responseStatus === 200 && data.responseData?.translatedText) {
                    translations[targetLang] = data.responseData.translatedText;
                } else {
                    translations[targetLang] = text;
                }
            } catch (err) {
                console.error(`Translation to ${targetLang} failed:`, err);
                translations[targetLang] = text;
            }
        }

        return translations;
    } catch (error) {
        console.error('Translation error:', error);
        return { mk: text, sq: text, en: text };
    }
}

module.exports = router;
