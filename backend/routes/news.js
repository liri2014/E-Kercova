const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
        const { title, description, type, sourceLang, start_date, end_date, photo_urls } = req.body;

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
            end_date: end_date,
            photo_urls: photo_urls || []
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
                    translations[targetLang] = text; // Fallback to original
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
