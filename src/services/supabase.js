import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const calculateEndDate = (startDate, plan, serviceType) => {
    if (!startDate) return null;
    const start = new Date(startDate);

    // TV/Display services always have 1 month duration
    if (serviceType === 'tv') {
        const result = new Date(start);
        result.setMonth(result.getMonth() + 1);
        return result.toISOString().split('T')[0];
    }

    // Extract weeks using regex for elevator services
    const weeksMatch = plan?.match(/(\d+)\s*semanas/i);
    if (weeksMatch) {
        const weeks = parseInt(weeksMatch[1]);
        const result = new Date(start);
        result.setDate(result.getDate() + (weeks * 7));
        return result.toISOString().split('T')[0];
    }

    // Fallback: default to 30 days
    const result = new Date(start);
    result.setMonth(result.getMonth() + 1);
    return result.toISOString().split('T')[0];
};

// Map DB fields to UI fields
const mapClientToUI = (client) => {
    // Determine service type first
    const serviceType = client.servico?.toLowerCase().includes('tv') ? 'tv' : 'elevator';

    // Basic mapping
    const uiClient = {
        id: client.id,
        type: serviceType,
        client: client.nome,
        plan: client.plano,
        telefone: client.telefone, // Novo campo
        startDate: client.created_at ? client.created_at.split('T')[0] : '',
        value: 'R$ -', // Not in DB
    };

    // Derived fields - pass service type to calculateEndDate
    uiClient.endDate = calculateEndDate(uiClient.startDate, client.plano, serviceType);

    return uiClient;
};



// Fetch all clients from Supabase table_clientes
export const fetchClients = async () => {
    const { data, error } = await supabase
        .from('table_clientes')
        .select('*');

    if (error) {
        throw error;
    }

    return data.map(mapClientToUI);
};
