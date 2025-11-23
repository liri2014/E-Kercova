const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../supabaseClient');
require('dotenv').config();

// Configure Multer for memory storage (files are uploaded directly to Supabase Storage)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/reports
 * Accepts up to 5 photos (field name: photos) and report data.
 * Uploads each photo to Supabase Storage and stores report in database.
 */
router.post('/', upload.array('photos', 5), async (req, res) => {
    try {
        const files = req.files; // array of uploaded files
        const { user_id, lat, lng, description } = req.body;

        // Basic validation
        if (!files || files.length === 0 || !user_id) {
            return res.status(400).json({ error: 'Missing files or user_id' });
        }

        // 1️⃣ Upload all photos to Supabase Storage and collect public URLs
        const photoUrls = [];
        for (const file of files) {
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('app-uploads')
                .upload(fileName, file.buffer, { contentType: file.mimetype });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase
                .storage
                .from('app-uploads')
                .getPublicUrl(fileName);
            photoUrls.push(publicUrl);
        }

        // 2️⃣ Prepare report data without AI analysis
        const analysis = {
            photos: photoUrls,
            title: 'Report',
            category: 'Other',
            description: description,
            severity: 'Low',
        };

        // 3️⃣ Insert report into Supabase database
        const { data: report, error: dbError } = await supabase
            .from('reports')
            .insert({
                user_id,
                title: 'New Report',
                category: 'Other',
                description: description,
                photo_url: photoUrls[0], // primary photo
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                status: 'pending',
                ai_analysis_json: analysis,
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return res.json(report);
    } catch (err) {
        console.error('Report Error:', err);
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;
