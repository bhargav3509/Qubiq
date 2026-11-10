const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey && supabaseUrl !== 'your-supabase-project-url') {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn('⚠️  Supabase not configured. File storage will be skipped.');
}

module.exports = supabase;

