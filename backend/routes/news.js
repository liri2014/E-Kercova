const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const axios = require('axios');

// GET /api/news - Get all news
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// POST /api/news - Create news with auto-translation
router.post('/', async (req, res) => {
    try {
        const { title, description, type, sourceLang, start_date, end_date } = req.body;

        if (!title || !description || !sourceLang) {
            return res.status(400).json({ error: 'Missing required fields: title, description, sourceLang' });
        }

        // Translate title and description
        const titleTranslations = await translateText(title, sourceLang);
        const descTranslations = await translateText(description, sourceLang);

        const newsItem = {
            title: title,
            description: description,
            title_mk: titleTranslations.mk,
            title_sq: titleTranslations.sq,
            title_en: titleTranslations.en,
            description_mk: descTranslations.mk,
            description_sq: descTranslations.sq,
            description_en: descTranslations.en,
            type: type || 'news',
            start_date: start_date || new Date().toISOString(),
            end_date: end_date
        };

        const { data, error } = await supabase
            .from('news')
            .insert([newsItem])
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'News created', news: data });
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news', details: error.message });
    }
});

// PUT /api/news/:id - Update news
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, type, sourceLang, start_date, end_date } = req.body;

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

        if (type !== undefined) updates.type = type;
        if (start_date !== undefined) updates.start_date = start_date;
        if (end_date !== undefined) updates.end_date = end_date;

        const { data, error } = await supabase
            .from('news')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'News updated', news: data });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

// DELETE /api/news/:id - Delete news
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'News deleted' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

// Helper function to translate text
async function translateText(text, sourceLang) {
    try {
        const response = await axios.post('http://localhost:3000/api/translate', {
            text,
            sourceLang
        });
        return response.data.translations;
    } catch (error) {
        console.error('Translation error:', error);
        // Fallback: return same text for all languages
        return { mk: text, sq: text, en: text };
    }
}

module.exports = router;
