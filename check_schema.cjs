const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    const { data, error } = await supabase
        .from('reports')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Reports columns:', data.length > 0 ? Object.keys(data[0]) : 'Table empty, cannot infer columns');
    }
}

checkSchema();
