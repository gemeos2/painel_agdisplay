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

            const storedApprovals = localStorage.getItem('clientApprovals');
            const approvalStatus = storedApprovals ? JSON.parse(storedApprovals) : { approved: {}, rejected: [] };

            const newClients = clients.filter(contract => {
                const isApproved = approvalStatus.approved[contract.id];
                const isRejected = approvalStatus.rejected.includes(contract.id);
                return !isApproved && !isRejected;
            });

            setCount(newClients.length);
        } catch (error) {
            console.error('Error calculating new clients count:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        calculateCount();

        // Escutar evento customizado para atualizações locais
        const handleUpdate = () => calculateCount();
        window.addEventListener('clientApprovalsUpdated', handleUpdate);

        // Escutar evento de storage para atualizações em outras abas
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('clientApprovalsUpdated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    return { count, loading, refreshCount: calculateCount };
};
