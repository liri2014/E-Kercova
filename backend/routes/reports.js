const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../supabaseClient');
require('dotenv').config();

// Allowed file types for photo uploads
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only images are allowed.`), false);
    }
};

// Configure Multer with validation
const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5 // Max 5 files
    }
});

// Multer error handler
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files. Maximum is 5 photos.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};

/**
 * POST /api/reports
 * Accepts up to 5 photos (field name: photos) and report data.
 * Uploads each photo to Supabase Storage and stores report in database.
 */
router.post('/', upload.array('photos', 5), handleMulterError, async (req, res) => {
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
