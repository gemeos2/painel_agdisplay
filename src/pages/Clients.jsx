import React, { useState, useEffect } from 'react';
import { Search, Users, MoreVertical, Calendar, CheckCircle, Clock, XCircle, Loader2, Plus } from 'lucide-react';
import { useNewClientsCount } from '../hooks/useNewClientsCount';
import { getPlanColor, getStatusStyle } from '../data/mockData';
import ContractModal from '../components/ContractModal';
import CreateContractModal from '../components/CreateContractModal';
import { fetchClients, updateClientStatus } from '../services/supabase';

const Clients = () => {
    const [activeTab, setActiveTab] = useState('ativo'); // 'ativo', 'agendado', 'finalizado'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { count: scheduledClientsCount } = useNewClientsCount();

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

    // Handle client activation via n8n and DB update
    const handleActivate = async (clientId) => {
        try {
            const clientData = contracts.find(c => c.id === clientId);
            const webhookUrl = 'https://n8n.triusbot.site/webhook/cliente-aceito';

            // 1. Trigger n8n Webhook
            console.log('Disparando webhook de ativação n8n...');

            // Non-blocking fetch for n8n
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors',
                body: JSON.stringify({
                    event: 'client_activated',
                    clientId: clientId,
                    clientName: clientData?.client,
                    email: clientData?.email_contrato,
                    phoneNumber: clientData?.telefone,
                    cpf: clientData?.cpf,
                    plan: clientData?.plan
                })
            }).catch(e => console.error('Erro ao chamar webhook n8n:', e));

            // 2. Update DB status to 'ativo'
            await updateClientStatus(clientId, 'ativo');

            // 3. Refresh UI
            loadClients();
        } catch (error) {
            console.error('Erro ao ativar cliente:', error);
            alert('Erro ao ativar cliente. Verifique o console.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    const tabs = [
        { id: 'ativo', label: 'Ativos', icon: CheckCircle },
        { id: 'agendado', label: 'Agendados', icon: Clock },
        { id: 'finalizado', label: 'Finalizados', icon: XCircle },
    ];

    const filteredContracts = contracts.filter(contract => {
        const statusMatches = contract.status?.toLowerCase() === activeTab;
        const searchMatches = contract.client?.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatches && searchMatches;
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Clientes</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Gerencie seus clientes por status de contrato.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <Plus size={20} />
                    Novo contrato
                </button>
            </div>

            {/* Tabs & Search */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
                flexWrap: 'wrap',
                gap: 'var(--space-4)'
            }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--color-bg-sidebar)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    background: isActive ? 'var(--color-bg-surface)' : 'transparent',
                                    color: isActive ? 'white' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Icon size={16} />
                                {tab.label}
                                {tab.id === 'agendado' && scheduledClientsCount > 0 && (
                                    <span style={{
                                        marginLeft: '8px',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        height: '18px',
                                        minWidth: '18px',
                                        padding: '0 5px',
                                        borderRadius: '999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {scheduledClientsCount}
                                    </span>
                                )}
                            </button>
                        )
                    })}
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

            {/* Clients Grid */}
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
                                        <Users size={20} color={getPlanColor(contract.plan)} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{contract.client}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                            {contract.type === 'elevator' ? 'Elevador' : 'TV/Display'} • {contract.plan}
                                        </span>
                                    </div>
                                </div>
                                <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <Calendar size={16} />
                                    <span>{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</span>
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

                                {activeTab === 'agendado' && (
                                    <div style={{
                                        display: 'flex',
                                        gap: 'var(--space-2)',
                                        marginTop: 'var(--space-3)',
                                        paddingTop: 'var(--space-3)',
                                        borderTop: '1px solid var(--color-border)'
                                    }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActivate(contract.id);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: 'none',
                                                background: 'var(--color-primary)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.875rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-primary-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-primary)'}
                                        >
                                            <CheckCircle size={16} />
                                            Ativar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <ContractModal
                isOpen={!!selectedContract}
                onClose={() => setSelectedContract(null)}
                contract={selectedContract}
            />

            <CreateContractModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadClients}
            />
        </div>
    );
};

export default Clients;
