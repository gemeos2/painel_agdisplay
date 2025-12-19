
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://aelkqmecebyuegliogpp.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbGtxbWNjZWIueXVlZ2xpb2dwcCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY1MjE1MTg1LCJleHAiOjIwODA3OTExODV9.Kqwkd77ItY_jymZi3qjtMm4eM3_6YDUWjx5af_UHgUg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('table_clientes')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else if (data && data.length > 0) {
        console.log('Column names:', Object.keys(data[0]));
    } else {
        console.log('No data found, cannot infer columns.');
    }
}

checkColumns();
