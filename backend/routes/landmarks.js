const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// GET /api/landmarks - Get all landmarks
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('landmarks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error fetching landmarks:', error);
        res.status(500).json({ error: 'Failed to fetch landmarks' });
    }
});

// POST /api/landmarks - Create landmark with auto-translation
router.post('/', async (req, res) => {
    try {
        const { title, description, latitude, longitude, category, sourceLang, photo_url } = req.body;

        if (!title || !description || !latitude || !longitude || !sourceLang) {
            return res.status(400).json({
                error: 'Missing required fields: title, description, latitude, longitude, sourceLang'
            });
        }

        // Translate title and description
        const titleTranslations = await translateText(title, sourceLang);
        const descTranslations = await translateText(description, sourceLang);

        const landmark = {
            title: title,
            description: description,
            title_mk: titleTranslations.mk,
            title_sq: titleTranslations.sq,
            title_en: titleTranslations.en,
            description_mk: descTranslations.mk,
            description_sq: descTranslations.sq,
            description_en: descTranslations.en,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            category: category || 'historical',
            photo_url: photo_url || null
        };

        const { data, error } = await supabase
            .from('landmarks')
            .insert([landmark])
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Landmark created', landmark: data });
    } catch (error) {
        console.error('Error creating landmark:', error);
        res.status(500).json({ error: 'Failed to create landmark', details: error.message });
    }
});

// PUT /api/landmarks/:id - Update landmark
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, latitude, longitude, category, sourceLang, photo_url } = req.body;

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

        if (latitude !== undefined) updates.latitude = parseFloat(latitude);
        if (longitude !== undefined) updates.longitude = parseFloat(longitude);
        if (category !== undefined) updates.category = category;
        if (photo_url !== undefined) updates.photo_url = photo_url;

        const { data, error } = await supabase
            .from('landmarks')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Landmark updated', landmark: data });
    } catch (error) {
        console.error('Error updating landmark:', error);
        res.status(500).json({ error: 'Failed to update landmark' });
    }
});

// DELETE /api/landmarks/:id - Delete landmark
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('landmarks')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Landmark deleted' });
    } catch (error) {
        console.error('Error deleting landmark:', error);
        res.status(500).json({ error: 'Failed to delete landmark' });
    }
});

// Helper function to translate text using MyMemory free API
async function translateText(text, sourceLang) {
    const axios = require('axios');
    
    try {
        const translations = { [sourceLang]: text };
        const targetLangs = ['sq', 'mk', 'en'].filter(lang => lang !== sourceLang);

        for (const targetLang of targetLangs) {
            try {
                const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
                const response = await axios.get(url);
                
                if (response.data && response.data.responseStatus === 200 && response.data.responseData?.translatedText) {
                    translations[targetLang] = response.data.responseData.translatedText;
                } else {
                    translations[targetLang] = text;
                }
            } catch (err) {
                console.error(`Translation to ${targetLang} failed:`, err.message);
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
