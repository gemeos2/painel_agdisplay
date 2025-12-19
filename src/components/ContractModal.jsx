import React from 'react';
import { X, MessageCircle, FileText, Calendar, Wallet } from 'lucide-react';
import { getPlanColor, formatDate } from '../data/mockData';

const ContractModal = ({ isOpen, onClose, contract }) => {
    if (!isOpen || !contract) return null;

    const typeLabel = contract.type === 'elevator' ? 'Elevador' : 'TV/Display';
    const planColor = getPlanColor(contract.plan);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                width: '100%',
                maxWidth: '500px',
                padding: 'var(--space-6)',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                    <div>
                        <span style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: 'var(--color-text-muted)',
                            fontWeight: 600
                        }}>
                            {typeLabel}
                        </span>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px' }}>{contract.client}</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

                    {/* Plan Info */}
                    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', borderLeft: `4px solid ${planColor}` }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Plano Contratado</label>
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: planColor }}>{contract.plan}</span>
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <Calendar size={14} /> Início
                            </label>
                            <span style={{ fontWeight: 500 }}>{formatDate(contract.startDate)}</span>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                <Calendar size={14} /> Fim
                            </label>
                            <span style={{ fontWeight: 500 }}>{formatDate(contract.endDate)}</span>
                        </div>
                    </div>

                    <div style={{ height: '1px', background: 'var(--color-border)' }}></div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1, backgroundColor: '#25D366', color: 'white', border: 'none' }}
                            onClick={() => {
                                const chatwootUrl = `https://trius-chatwoot.dumfta.easypanel.host/app/accounts/1/contacts?q=${contract.email_contrato || contract.client}`;
                                window.open(chatwootUrl, '_blank');
                            }}
                        >
                            <MessageCircle size={20} />
                            Chatwoot
                        </button>
                        <button
                            className="btn"
                            style={{
                                flex: 1,
                                backgroundColor: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border)',
                                color: 'var(--color-text-main)',
                                opacity: contract.documento_url ? 1 : 0.5,
                                cursor: contract.documento_url ? 'pointer' : 'not-allowed'
                            }}
                            onClick={() => {
                                if (contract.documento_url) {
                                    window.open(contract.documento_url, '_blank');
                                } else {
                                    alert('Nenhum documento anexado a este contrato.');
                                }
                            }}
                        >
                            <FileText size={20} />
                            Contrato
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ContractModal;
