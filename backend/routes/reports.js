const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../supabaseClient');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Configure Multer for memory storage (we upload directly to Supabase)
const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const file = req.file;
        const { user_id, lat, lng, description } = req.body;

        if (!file || !user_id) {
            return res.status(400).json({ error: 'Missing file or user_id' });
        }

        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}_${file.originalname}`;
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('app-uploads')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype
            });

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('app-uploads')
            .getPublicUrl(fileName);

        // 2. Analyze with Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imagePart = {
            inlineData: {
                data: file.buffer.toString('base64'),
                mimeType: file.mimetype
            }
        };

        const prompt = `
      Analyze this image for a city reporting app. 
      Identify the issue (e.g., Pothole, Trash, Broken Light, Parking Violation).
      Assess the severity (Low, Medium, High).
      Provide a short title and description.
      Return ONLY valid JSON:
      {
        "title": "Short Title",
        "category": "Category Name",
        "severity": "High/Medium/Low",
        "description": "Detailed description"
      }
    `;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        let analysis = {};
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            analysis = JSON.parse(cleanText);
        } catch (e) {
            console.error('Failed to parse Gemini JSON', e);
            analysis = { title: 'Report', category: 'General', description: 'Analysis failed' };
        }

        // 3. Save to Database
        const { data: report, error: dbError } = await supabase
            .from('reports')
            .insert({
                user_id,
                title: analysis.title || 'New Report',
                category: analysis.category || 'General',
                description: description || analysis.description,
                photo_url: publicUrl,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                status: 'pending',
                ai_analysis_json: analysis
            })
            .select()
            .single();

        if (dbError) throw dbError;

        res.json(report);

    } catch (error) {
        console.error('Report Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
