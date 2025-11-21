const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/translate
// Body: { text: string, sourceLang: 'sq' | 'mk', targetLangs: ['sq', 'mk', 'en'] }
router.post('/', async (req, res) => {
    try {
        const { text, sourceLang } = req.body;

        if (!text || !sourceLang) {
            return res.status(400).json({ error: 'Missing text or sourceLang' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const langMap = {
            sq: 'Albanian',
            mk: 'Macedonian',
            en: 'English'
        };

        const sourceLanguage = langMap[sourceLang];
        const targetLanguages = ['sq', 'mk', 'en'].filter(lang => lang !== sourceLang);

        const prompt = `You are a professional translator. Translate the following ${sourceLanguage} text into ${targetLanguages.map(l => langMap[l]).join(' and ')}.

Source text (${sourceLanguage}):
${text}

Provide the translations in the following JSON format:
{
  "sq": "Albanian translation here",
  "mk": "Macedonian translation here",
  "en": "English translation here"
}

Important: 
- Keep the same tone and style
- Preserve any formatting
- Return ONLY the JSON object, no additional text`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse translation response');
        }

        const translations = JSON.parse(jsonMatch[0]);

        // Ensure source language is included
        translations[sourceLang] = text;

        res.json({ translations });
    } catch (error) {
        console.error('Translation error:', error);
        res.status(500).json({ error: 'Translation failed', details: error.message });
    }
});

module.exports = router;
