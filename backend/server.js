require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Client
const supabase = require('./supabaseClient');

// Routes
const analyzeRoutes = require('./routes/analyze');
const reportRoutes = require('./routes/reports');
const parkingRoutes = require('./routes/parking');
const authRoutes = require('./routes/auth');

// Let's export the supabase client for other files to use
module.exports.supabase = supabase;

app.use('/api/analyze', analyzeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('E-Kicevo Backend is running');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
