import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreVertical, Calendar, User, Loader2, XCircle } from 'lucide-react';
import { getPlanColor, elevatorPlans, getStatusStyle } from '../data/mockData';
import ContractModal from '../components/ContractModal';
import { fetchClients } from '../services/supabase';

const Elevators = () => {
    const [selectedPlan, setSelectedPlan] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async () => {
        try {
            setLoading(true);
            const data = await fetchClients();
            setContracts(data);
        } catch (err) {
            console.error('Error fetching clients:', err);
            setError('Falha ao carregar clientes.');
        } finally {
            setLoading(false);
        }
    };

    // Get approved clients from localStorage
    const getApprovalStatus = () => {
        const stored = localStorage.getItem('clientApprovals');
        return stored ? JSON.parse(stored) : { approved: {}, rejected: [] };
    };

    // Check if 24 hours have passed since acceptance
    const has24HoursPassed = (acceptedAt) => {
        if (!acceptedAt) return false;
        const acceptedTime = new Date(acceptedAt).getTime();
        const currentTime = new Date().getTime();
        const hoursPassed = (currentTime - acceptedTime) / (1000 * 60 * 60);
        return hoursPassed >= 24;
    };

    // Calculate status based on dates (same logic as Dashboard and Clients)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contractsWithCalculatedStatus = contracts.map(contract => {
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let status;
        if (startDate > today) {
            status = 'Agendado';
        } else if (endDate < today) {
            status = 'Finalizado';
        } else {
            status = 'Ativo';
        }

        return { ...contract, status };
    });

    const approvalStatus = getApprovalStatus();

    const filteredContracts = contractsWithCalculatedStatus.filter(contract => {
        const matchesType = contract.type === 'elevator';

        // Only show approved clients
        const isApproved = approvalStatus.approved[contract.id];
        if (!isApproved) return false;

        // Filter by Plan
        const matchesPlan = selectedPlan === 'Todos' || contract.plan === selectedPlan;
        const matchesSearch = contract.client.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesPlan && matchesSearch;
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger)' }}>
                <h2>Ocorreu um erro</h2>
                <p>{error}</p>
                <button onClick={loadClients}>Tentar novamente</button>
            </div>
        );
    }

    return (
        <div>
            <style>{`
                .filter-mobile-toggle {
                    display: none;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: var(--color-bg-sidebar);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    font-size: 0.875rem;
                    color: var(--color-text-main);
                    border: 1px solid var(--color-border);
                }
                .filter-list {
                    display: flex;
                    gap: var(--space-2);
                    background: var(--color-bg-sidebar);
                    padding: 4px;
                    border-radius: var(--radius-md);
                }
                @media (max-width: 768px) {
                    .filter-mobile-toggle {
                        display: flex;
                        justify-content: space-between;
                        width: 140px; /* Fixed width for consistency */
                    }
                    .filter-list {
                        display: none;
                        flex-direction: column;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        z-index: 20;
                        margin-top: 4px;
                        width: 200px;
                        box-shadow: var(--shadow-lg);
                        border: 1px solid var(--color-border);
                    }
                    .filter-list.open {
                        display: flex;
                    }
                    .filter-container {
                        position: relative;
                    }
                }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Elevadores</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Planos por duração (2, 4, 12, 24 semanas).</p>
                </div>
                <button className="btn btn-primary" onClick={() => alert('Feature: Adicionar novo contrato')}>
                    <Plus size={20} />
                    Novo Contrato
                </button>
            </div>

            {/* Filters & Search */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
                gap: 'var(--space-4)'
            }}>
                <div className="filter-container">
                    {/* Mobile Toggle */}
                    <div className="filter-mobile-toggle" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <span style={{ fontWeight: 500 }}>{selectedPlan}</span>
                        <Filter size={16} color="var(--color-primary)" />
                    </div>

                    {/* Desktop/Open List */}
                    <div className={`filter-list ${isFilterOpen ? 'open' : ''}`}>
                        {elevatorPlans.map(plan => (
                            <button
                                key={plan}
                                onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsFilterOpen(false);
                                }}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    background: selectedPlan === plan ? 'var(--color-bg-surface)' : 'transparent',
                                    color: selectedPlan === plan ? 'white' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    fontSize: '0.875rem',
                                    textAlign: 'left',
                                    width: '100%' // Full width in dropdown
                                }}
                            >
                                {plan}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        className="input"
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Contracts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
                {filteredContracts.map(contract => {
                    const statusStyle = getStatusStyle(contract.status);
                    return (
                        <div
                            key={contract.id}
                            className="card"
                            style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onClick={() => setSelectedContract(contract)}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '4px',
                                height: '100%',
                                backgroundColor: getPlanColor(contract.plan)
                            }}></div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <User size={20} color={getPlanColor(contract.plan)} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{contract.client}</h3>
                                        <span style={{ fontSize: '0.8rem', color: getPlanColor(contract.plan), fontWeight: 500 }}>{contract.plan}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <Calendar size={16} />
                                    <span>{contract.startDate} - {contract.endDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        background: statusStyle.background,
                                        color: statusStyle.color,
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}>
                                        {contract.status.toUpperCase()}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{contract.value}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
                {filteredContracts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                        Nenhum contrato encontrado.
                    </div>
                )}
            </div>

            <ContractModal
                isOpen={!!selectedContract}
                onClose={() => setSelectedContract(null)}
                contract={selectedContract}
            />
        </div>
    );
};

export default Elevators;
