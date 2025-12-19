import React, { useState } from 'react';
import { X, User, Phone, Layers, PlayCircle, Loader2, Mail, CreditCard, FileText } from 'lucide-react';
import { elevatorPlans, tvPlans } from '../data/mockData';
import { insertClient, uploadDocument } from '../services/supabase';

const CreateContractModal = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        servico: 'Elevador',
        plano: '2 Semanas',
        email: '',
        cpf: '',
        telefone: '',
        documento_url: ''
    });

    const [selectedFile, setSelectedFile] = useState(null);

    if (!isOpen) return null;

    const handleServiceChange = (e) => {
        const servico = e.target.value;
        const defaultPlano = servico === 'Elevador' ? '2 Semanas' : 'Start';
        setFormData({ ...formData, servico, plano: defaultPlano });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let documento_url = null;
            if (selectedFile) {
                documento_url = await uploadDocument(selectedFile);
            }

            await insertClient({ ...formData, documento_url });
            window.dispatchEvent(new CustomEvent('clientStatusUpdated'));
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                nome: '',
                servico: 'Elevador',
                plano: '2 Semanas',
                email: '',
                cpf: '',
                telefone: '',
                documento_url: ''
            });
            setSelectedFile(null);
        } catch (error) {
            console.error('Error creating contract:', error);
            alert('Erro ao criar contrato: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const plans = formData.servico === 'Elevador'
        ? elevatorPlans.filter(p => p !== 'Todos')
        : tvPlans.filter(p => p !== 'Todos');

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
                position: 'relative'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Novo Contrato</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                            <User size={16} /> Nome do Cliente
                        </label>
                        <input
                            required
                            type="text"
                            className="input"
                            placeholder="Ex: Coca-Cola"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                                <Layers size={16} /> Serviço
                            </label>
                            <select
                                className="input"
                                value={formData.servico}
                                onChange={handleServiceChange}
                            >
                                <option value="Elevador">Elevador</option>
                                <option value="TV/Display">TV/Display</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                                <PlayCircle size={16} /> Plano
                            </label>
                            <select
                                className="input"
                                value={formData.plano}
                                onChange={e => setFormData({ ...formData, plano: e.target.value })}
                            >
                                {plans.map(plan => (
                                    <option key={plan} value={plan}>{plan}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                            <Mail size={16} /> E-mail
                        </label>
                        <input
                            type="email"
                            className="input"
                            placeholder="Ex: cliente@email.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                            <CreditCard size={16} /> CPF
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: 000.000.000-00"
                            value={formData.cpf}
                            onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                            <Phone size={16} /> Telefone
                        </label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Ex: (11) 99999-9999"
                            value={formData.telefone}
                            onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>
                            <FileText size={16} /> Arquivo do Documento (Contrato/PDF)
                        </label>
                        <div style={{
                            border: '2px dashed var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            backgroundColor: selectedFile ? 'rgba(249, 115, 22, 0.05)' : 'transparent',
                            transition: 'all 0.2s'
                        }} onClick={() => document.getElementById('file-upload').click()}>
                            <input
                                id="file-upload"
                                type="file"
                                style={{ display: 'none' }}
                                onChange={e => setSelectedFile(e.target.files[0])}
                            />
                            {selectedFile ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <FileText size={20} color="var(--color-primary)" />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>{selectedFile.name}</span>
                                </div>
                            ) : (
                                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    <p>Clique para selecionar o arquivo</p>
                                    <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>PDF, Imagem ou Documento</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                        <button
                            type="button"
                            className="btn"
                            style={{ flex: 1, backgroundColor: 'var(--color-bg-surface)' }}
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ flex: 2 }}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Criar Contrato'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContractModal;
