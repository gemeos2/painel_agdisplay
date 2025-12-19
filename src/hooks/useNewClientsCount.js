import { useState, useEffect } from 'react';
import { fetchClients } from '../services/supabase';

export const useNewClientsCount = () => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const calculateCount = async () => {
        try {
            // Em um app real, idealmente o backend retornaria essa contagem
            // ou usaríamos React Query/SWR para cache.
            // Aqui vamos buscar e calcular localmente para manter consistência com o código existente.
            const clients = await fetchClients();
            const scheduledClients = clients.filter(contract => contract.status === 'agendado');
            setCount(scheduledClients.length);
        } catch (error) {
            console.error('Error calculating scheduled clients count:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        calculateCount();

        // Opcional: Escutar evento de mudança para atualizar em tempo real se necessário
        const handleUpdate = () => calculateCount();
        window.addEventListener('clientStatusUpdated', handleUpdate);
        return () => window.removeEventListener('clientStatusUpdated', handleUpdate);
    }, []);

    return { count, loading, refreshCount: calculateCount };
};
