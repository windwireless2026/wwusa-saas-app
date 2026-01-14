import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clsqclvjvewyuizaxomj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsc3FjbHZqdmV3eXVpemF4b21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ0NTYwMTMsImV4cCI6MjAxOTAzMjAxM30.hL427ykw_LuieDzp-pORhT2nB75Jixh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: types, error: err1 } = await supabase.from('product_types').select('*');
    console.log('--- PRODUCT TYPES ---');
    if (err1) console.error(err1);
    else console.log(types);

    const { data: catalog, error: err2 } = await supabase.from('product_catalog').select('*').limit(5);
    console.log('--- PRODUCT CATALOG ---');
    if (err2) console.error(err2);
    else console.log(catalog);

    const { data: centers, error: err3 } = await supabase.from('cost_centers').select('*');
    console.log('--- COST CENTERS ---');
    if (err3) console.error(err3);
    else console.log(centers);
}

checkData();
