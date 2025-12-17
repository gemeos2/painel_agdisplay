export const elevatorPlans = ['Todos', '2 Semanas', '4 Semanas', '12 Semanas', '24 Semanas'];
export const tvPlans = ['Todos', 'Start', 'Performance', 'Pro'];

export const elevatorContracts = [
    { id: 'e1', type: 'elevator', client: 'Coca-Cola', plan: '4 Semanas', startDate: '2025-11-01', endDate: '2025-11-29', status: 'Ativo', value: 'R$ 700,00' },
    { id: 'e2', type: 'elevator', client: 'Samsung', plan: '12 Semanas', startDate: '2025-12-15', endDate: '2026-03-09', status: 'Ativo', value: 'R$ 1.800,00' },
    { id: 'e3', type: 'elevator', client: 'Localiza', plan: '2 Semanas', startDate: '2025-11-20', endDate: '2025-12-04', status: 'Finalizado', value: 'R$ 400,00' },
    { id: 'e4', type: 'elevator', client: 'Itaú', plan: '24 Semanas', startDate: '2026-01-01', endDate: '2026-06-18', status: 'Agendado', value: 'R$ 2.400,00' },
    { id: 'e5', type: 'elevator', client: 'McDonalds', plan: '4 Semanas', startDate: '2025-12-01', endDate: '2025-12-29', status: 'Ativo', value: 'R$ 700,00' },
    { id: 'e6', type: 'elevator', client: 'Nike', plan: '2 Semanas', startDate: '2026-01-15', endDate: '2026-01-29', status: 'Agendado', value: 'R$ 400,00' },
];

// TV Contracts - Monthly payment logic (Mocking active durations)
export const tvContracts = [
    { id: 't1', type: 'tv', client: 'Burger King', plan: 'Performance', startDate: '2025-11-10', endDate: '2025-12-10', status: 'Ativo', value: 'R$ 299,00/mês' },
    { id: 't2', type: 'tv', client: 'Spotify', plan: 'Pro', startDate: '2025-12-01', endDate: '2026-01-01', status: 'Ativo', value: 'R$ 399,00/mês' },
    { id: 't3', type: 'tv', client: 'Zara', plan: 'Start', startDate: '2026-01-10', endDate: '2026-02-10', status: 'Agendado', value: 'R$ 199,00/mês' },
    { id: 't4', type: 'tv', client: 'Performance', plan: 'Performance', startDate: '2026-02-01', endDate: '2026-03-01', status: 'Agendado', value: 'R$ 299,00/mês' },
    { id: 't5', type: 'tv', client: 'Amazon', plan: 'Pro', startDate: '2025-11-01', endDate: '2025-12-01', status: 'Ativo', value: 'R$ 399,00/mês' },
];

export const getPlanColor = (plan) => {
    if (!plan) return '#94a3b8';

    // Elevator Plans (Regex match for weeks)
    const weeksMatch = plan.match(/(\d+)\s*semanas/i);
    if (weeksMatch) {
        const weeks = parseInt(weeksMatch[1]);
        switch (weeks) {
            case 2: return '#eab308'; // yellow (2 semanas)
            case 4: return '#ef4444'; // red (4 semanas)
            case 12: return '#f97316'; // orange (12 semanas)
            case 24: return '#22c55e'; // green (24 semanas)
            default: return '#94a3b8';
        }
    }

    // TV Plans (Exact match)
    switch (plan) {
        case 'Start': return '#3b82f6'; // blue
        case 'Performance': return '#ef4444'; // red
        case 'Pro': return '#f97316'; // orange
        default: return '#94a3b8';
    }
};

export const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
        case 'ativo':
            return { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }; // Emerald
        case 'agendado':
            return { background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }; // Amber (Yellow-ish)
        case 'finalizado':
            return { background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' }; // Slate
        case 'pendente':
            return { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }; // Red
        default:
            return { background: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' };
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return '';
    // Assuming YYYY-MM-DD
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

export const getPlanPrice = (plan) => {
    if (!plan) return 0;

    // Elevator Plans (Regex match for weeks)
    const weeksMatch = plan.match(/(\d+)\s*semanas/i);
    if (weeksMatch) {
        const weeks = parseInt(weeksMatch[1]);
        switch (weeks) {
            case 2: return 400;
            case 4: return 700;
            case 12: return 1800;
            case 24: return 2400;
            default: return 0;
        }
    }

    // TV Plans (Exact match)
    switch (plan) {
        case 'Start': return 199;
        case 'Performance': return 299;
        case 'Pro': return 399;
        default: return 0;
    }
};
