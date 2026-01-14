const { createClient } = require('@supabase/supabase-js');

const url = "https://kwatwptxcvcvfzkyqyye.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3YXR3cHR4Y3ZjdmZ6a3lxeXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg0MDk4MTUsImV4cCI6MjAwNDA0NTgxNX0.SpsR-RhT2nB75JixhL4227ykw_LuieDzp-P-72qYv7Q";

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('agents').select('default_financial_class_id').limit(1);
    if (error) {
        console.log('ERROR:', error.message);
        if (error.message.includes('column "default_financial_class_id" does not exist')) {
            console.log('COLUMN_MISSING');
        }
    } else {
        console.log('COLUMN_EXISTS');
    }
}

check();
