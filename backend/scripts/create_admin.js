const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
    const email = 'admin@ekicevo.gov.mk';
    const password = 'admin-password-123';

    console.log(`Creating admin user: ${email}...`);

    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'admin' }
    });

    if (authError) {
        console.error('Error creating auth user:', authError.message);
        return;
    }

    const userId = authData.user.id;
    console.log(`Auth user created! ID: ${userId}`);

    // 2. Create/Update Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'admin',
            phone: '+38970123456'
        });

    if (profileError) {
        console.error('Error creating profile:', profileError.message);
    } else {
        console.log('Admin profile created successfully!');
        console.log('-----------------------------------');
        console.log('Login Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');
    }
}

createAdmin();
