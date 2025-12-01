const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Universal search endpoint
router.get('/', async (req, res) => {
    try {
        const { q, type, language = 'en', limit = 20 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }

        const searchQuery = q.toLowerCase().trim();
        const results = { news: [], events: [], reports: [] };

        // Search based on type or all
        const searchTypes = type ? [type] : ['news', 'events', 'reports'];

        // Search News
        if (searchTypes.includes('news')) {
            const titleCol = `title_${language}`;
            const descCol = `description_${language}`;
            
            const { data: news } = await supabase
                .from('news')
                .select('id, title, title_en, title_mk, title_sq, description, description_en, description_mk, description_sq, photo_urls, type, created_at')
                .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,title_en.ilike.%${searchQuery}%,title_mk.ilike.%${searchQuery}%,title_sq.ilike.%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit));

            results.news = (news || []).map(item => ({
                ...item,
                _type: 'news',
                _title: item[`title_${language}`] || item.title_en || item.title,
                _description: item[`description_${language}`] || item.description_en || item.description
            }));
        }

        // Search Events
        if (searchTypes.includes('events')) {
            const { data: events } = await supabase
                .from('events')
                .select('id, title, title_en, title_mk, title_sq, description, description_en, description_mk, description_sq, date, location, type, created_at')
                .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,title_en.ilike.%${searchQuery}%,title_mk.ilike.%${searchQuery}%,title_sq.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date', { ascending: true })
                .limit(parseInt(limit));

            results.events = (events || []).map(item => ({
                ...item,
                _type: 'event',
                _title: item[`title_${language}`] || item.title_en || item.title,
                _description: item[`description_${language}`] || item.description_en || item.description
            }));
        }

        // Search Reports
        if (searchTypes.includes('reports')) {
            const { data: reports } = await supabase
                .from('reports')
                .select('id, title, description, category, status, lat, lng, photo_urls, created_at, upvotes_count')
                .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
                .order('created_at', { ascending: false })
                .limit(parseInt(limit));

            results.reports = (reports || []).map(item => ({
                ...item,
                _type: 'report',
                _title: item.title,
                _description: item.description
            }));
        }

        // Combine and sort all results
        const combined = [
            ...results.news,
            ...results.events,
            ...results.reports
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json({
            success: true,
            query: q,
            results: {
                all: combined.slice(0, parseInt(limit)),
                news: results.news,
                events: results.events,
                reports: results.reports
            },
            counts: {
                news: results.news.length,
                events: results.events.length,
                reports: results.reports.length,
                total: combined.length
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Quick search suggestions
router.get('/suggestions', async (req, res) => {
    try {
        const { q, language = 'en' } = req.query;

        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        const searchQuery = q.toLowerCase().trim();
        const suggestions = [];

        // Get news titles
        const { data: news } = await supabase
            .from('news')
            .select(`title_${language}, title_en, title`)
            .or(`title.ilike.%${searchQuery}%,title_${language}.ilike.%${searchQuery}%`)
            .limit(3);

        (news || []).forEach(n => {
            const title = n[`title_${language}`] || n.title_en || n.title;
            if (title) suggestions.push({ text: title, type: 'news' });
        });

        // Get event titles
        const { data: events } = await supabase
            .from('events')
            .select(`title_${language}, title_en, title`)
            .or(`title.ilike.%${searchQuery}%,title_${language}.ilike.%${searchQuery}%`)
            .gte('date', new Date().toISOString().split('T')[0])
            .limit(3);

        (events || []).forEach(e => {
            const title = e[`title_${language}`] || e.title_en || e.title;
            if (title) suggestions.push({ text: title, type: 'event' });
        });

        // Get report categories that match
        const categories = ['road', 'lighting', 'garbage', 'water', 'noise', 'other'];
        categories.forEach(cat => {
            if (cat.includes(searchQuery)) {
                suggestions.push({ text: cat, type: 'category' });
            }
        });

        res.json({
            success: true,
            suggestions: suggestions.slice(0, 8)
        });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

