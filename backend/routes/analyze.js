const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
    try {
        const { image, prompt } = req.body; // Expecting base64 image or text description

        if (!image && !prompt) {
            return res.status(400).json({ error: 'Image or prompt required' });
        }

        // For this example, we assume we are using a model that supports vision if image is provided
        // Or just text if only prompt.
        // Adjust model name as needed (e.g. gemini-1.5-flash)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        let result;
        if (image) {
            // If image is base64, we need to format it for Gemini
            // image should be { inlineData: { data: "base64string", mimeType: "image/jpeg" } }
            // or just the base64 string and we wrap it.
            // Let's assume the frontend sends the raw base64 string for 'data' and 'mimeType'
            const imagePart = {
                inlineData: {
                    data: image.data,
                    mimeType: image.mimeType
                }
            };
            const promptText = prompt || "Analyze this image for city issues.";
            result = await model.generateContent([promptText, imagePart]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();

        // Try to parse JSON if the prompt asked for JSON
        try {
            // Clean up markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleanText);
            res.json(json);
        } catch (e) {
            res.json({ text });
        }

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

module.exports = router;
