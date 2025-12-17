import React, { useState, useEffect } from 'react';
import { Search, Users, MoreVertical, Calendar, CheckCircle, Clock, XCircle, Loader2, Check, X } from 'lucide-react';
import { getPlanColor, getStatusStyle } from '../data/mockData';
import ContractModal from '../components/ContractModal';
import { fetchClients } from '../services/supabase';

const Clients = () => {
    const [activeTab, setActiveTab] = useState('ativo'); // 'ativo', 'agendado', 'finalizado'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContract, setSelectedContract] = useState(null);
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

    // Get approved/rejected clients from localStorage
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

    const approvalStatus = getApprovalStatus();

    // Calculate status based on dates (same logic as Dashboard)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contractsWithCalculatedStatus = contracts.map(contract => {
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let status;

        // Check if client is approved
        const acceptedAt = approvalStatus.approved[contract.id];

        if (acceptedAt) {
            // If approved but less than 24h, status is Agendado
            if (!has24HoursPassed(acceptedAt)) {
                status = 'Agendado';
            } else {
                // After 24h, calculate status based on dates
                if (startDate > today) {
                    status = 'Agendado';
                } else if (endDate < today) {
                    status = 'Finalizado';
                } else {
                    status = 'Ativo';
                }
            }
        } else {
            // Not approved yet - status is Pendente
            status = 'Pendente';
        }

        return { ...contract, status };
    });

    // Filter based on tab and search
    const filteredContracts = contractsWithCalculatedStatus.filter(contract => {
        const isApproved = approvalStatus.approved[contract.id];
        const isRejected = approvalStatus.rejected.includes(contract.id);

        // In "Novos clientes" tab, show only unapproved and non-rejected clients
        if (activeTab === 'todos') {
            if (isApproved || isRejected) return false;
            const searchMatches = contract.client.toLowerCase().includes(searchTerm.toLowerCase());
            return searchMatches;
        }

        // In other tabs (Ativos, Agendados, Finalizados), show only approved clients
        if (isApproved) {
            const statusMatches = contract.status.toLowerCase() === activeTab;
            const searchMatches = contract.client.toLowerCase().includes(searchTerm.toLowerCase());
            return statusMatches && searchMatches;
        }

        return false;
    });

    // Handle client approval
    const handleApprove = async (clientId) => {
        const approvals = getApprovalStatus();
        if (!approvals.approved[clientId]) {
            approvals.approved[clientId] = new Date().toISOString();
            localStorage.setItem('clientApprovals', JSON.stringify(approvals));
            window.dispatchEvent(new Event('clientApprovalsUpdated')); // Notify other components
            loadClients(); // Refresh to update UI

            // Trigger n8n Webhook
            try {
                const clientData = contracts.find(c => c.id === clientId);
                const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

                if (!webhookUrl) {
                    console.warn('VITE_N8N_WEBHOOK_URL não configurada no .env ou Vercel');
                    // alert('Atenção: URL do Webhook não configurada!');
                }

                if (webhookUrl && clientData) {
                    console.log('Tentando disparar webhook para:', webhookUrl);
                    console.log('Payload:', {
                        event: 'client_approved',
                        clientId: clientId,
                        clientName: clientData.client,
                        phoneNumber: clientData.telefone,
                        plan: clientData.plan,
                    });

                    const response = await fetch(webhookUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            event: 'client_approved',
                            clientId: clientId,
                            clientName: clientData.client,
                            phoneNumber: clientData.telefone,
                            plan: clientData.plan,
                            value: clientData.value,
                            contractData: clientData
                        })
                    });

                    if (response.ok) {
                        console.log('Webhook n8n disparado com sucesso');
                    } else {
                        console.error('Erro na resposta do n8n:', response.statusText);
                        alert('Erro ao enviar dados para o n8n: ' + response.statusText);
                    }
                }
            } catch (error) {
                console.error('Erro ao disparar webhook n8n:', error);
                alert('Erro de conexão com o n8n. Verifique o console.');
            }
        }
    };

    // Handle client rejection
    const handleReject = (clientId) => {
        const approvals = getApprovalStatus();
        if (!approvals.rejected.includes(clientId)) {
            approvals.rejected.push(clientId);
            localStorage.setItem('clientApprovals', JSON.stringify(approvals));
            window.dispatchEvent(new Event('clientApprovalsUpdated')); // Notify other components
            loadClients(); // Refresh to update UI
        }
    };

    // Helper for date formatting using our consistent style
    const formatDate = (dateString) => {
        // Re-use logic or simple split
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Calculate count of new clients
    const newClientsCount = contractsWithCalculatedStatus.filter(contract => {
        const isApproved = approvalStatus.approved[contract.id];
        const isRejected = approvalStatus.rejected.includes(contract.id);
        return !isApproved && !isRejected;
    }).length;

    const tabs = [
        { id: 'ativo', label: 'Ativos', icon: CheckCircle },
        { id: 'agendado', label: 'Agendados', icon: Clock },
        { id: 'finalizado', label: 'Finalizados', icon: XCircle },
        { id: 'todos', label: 'Novos clientes', icon: Users },
    ];

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
                        const isTodosTab = tab.id === 'todos';

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: 'none',
                                    background: isActive
                                        ? (isTodosTab ? '#ef4444' : 'var(--color-bg-surface)')
                                        : (isTodosTab ? 'rgba(239, 68, 68, 0.2)' : 'transparent'),
                                    color: isTodosTab
                                        ? (isActive ? 'white' : '#ef4444')
                                        : (isActive ? 'white' : 'var(--color-text-muted)'),
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
                                {isTodosTab && newClientsCount > 0 && (
                                    <span style={{
                                        background: isActive ? 'var(--color-primary)' : 'rgba(239, 68, 68, 0.15)',
                                        color: isActive ? 'white' : '#ef4444',
                                        fontSize: '0.7rem',
                                        padding: '0 6px',
                                        borderRadius: '999px',
                                        minWidth: '18px',
                                        height: '18px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        marginLeft: 'auto'
                                    }}>
                                        {newClientsCount}
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

            {/* Clients/Contracts Grid */}
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

                                {/* Accept/Reject Buttons - Only show in Todos tab */}
                                {activeTab === 'todos' && (
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
                                                handleApprove(contract.id);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: 'none',
                                                background: '#10b981',
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
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                                        >
                                            <Check size={16} />
                                            Aceitar
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReject(contract.id);
                                            }}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                borderRadius: 'var(--radius-sm)',
                                                border: 'none',
                                                background: '#ef4444',
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
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                        >
                                            <X size={16} />
                                            Negar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {filteredContracts.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                        Nenhum cliente encontrado nesta categoria.
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

export default Clients;
