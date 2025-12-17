import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const DebugSupabase = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const testFetch = async () => {
            try {
                setLoading(true);
                const { data: result, error: err } = await supabase
                    .from('table_clientes')
                    .select('*');

                if (err) {
                    setError(err);
                } else {
                    setData(result);
                }
            } catch (e) {
                setError(e);
            } finally {
                setLoading(false);
            }
        };

        testFetch();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Debug Supabase Connection</h1>

            {loading && <p>Loading...</p>}

            {error && (
                <div style={{ background: '#fee', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                    <h2>Error:</h2>
                    <pre>{JSON.stringify(error, null, 2)}</pre>
                </div>
            )}

            {data && (
                <div style={{ background: '#efe', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                    <h2>Success! Data received:</h2>
                    <p><strong>Total records:</strong> {data.length}</p>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default DebugSupabase;
