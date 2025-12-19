
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aelkqmecebyuegliogpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbGtxbWVjZWJ5dWVnbGlvZ3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMTUxODUsImV4cCI6MjA4MDc5MTE4NX0.Kqwkd77ItY_jymZi3qjtMm4eM3_6YDUWjx5af_UHgUg';

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
        // If table_clientes is empty, try inserting a dummy row via SQL if possible, or just print that it's empty.
        // Since we only have read access via anon key likely, we just report it.
        console.log('No data found, cannot infer columns from empty table.');
    }
}

checkColumns();
