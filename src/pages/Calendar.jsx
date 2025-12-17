import React, { useRef, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getPlanColor } from '../data/mockData';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { fetchClients } from '../services/supabase';

const CalendarPage = () => {
    const calendarRef = useRef(null);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedContractId, setSelectedContractId] = useState(null);
    const [sidebarSearch, setSidebarSearch] = useState('');

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

    const getFilteredContracts = () => {
        let filteredContracts = contracts;

        // Filter by tab
        if (activeTab === 'elevator') {
            filteredContracts = filteredContracts.filter(c => c.type === 'elevator');
        } else if (activeTab === 'tv') {
            filteredContracts = filteredContracts.filter(c => c.type === 'tv');
        }

        // Filter by sidebar search if present
        if (sidebarSearch) {
            filteredContracts = filteredContracts.filter(c => c.client.toLowerCase().includes(sidebarSearch.toLowerCase()));
        }

        return filteredContracts;
    };

    const getEvents = () => {
        const contracts = getFilteredContracts();
        const events = [];

        contracts.forEach(c => {
            const isSelected = selectedContractId === c.id;
            const isDimmed = selectedContractId && !isSelected;
            const baseColor = getPlanColor(c.plan);

            const commonProps = {
                borderColor: 'transparent',
                textColor: 'white',
                extendedProps: { ...c }
            };

            // 1. Start Marker
            events.push({
                ...commonProps,
                id: `${c.id}-start`,
                title: `▶ Início: ${c.client}`,
                start: c.startDate,
                allDay: true,
                backgroundColor: baseColor,
                classNames: isDimmed ? ['dimmed-event'] : [],
                display: 'block'
            });

            // 2. End Marker
            events.push({
                ...commonProps,
                id: `${c.id}-end`,
                title: `⏹ Fim: ${c.client}`,
                start: c.endDate,
                allDay: true,
                backgroundColor: baseColor,
                classNames: isDimmed ? ['dimmed-event'] : [],
                display: 'block'
            });

            // 3. Full Span (Only if selected)
            if (isSelected) {
                events.push({
                    ...commonProps,
                    id: `${c.id}-span`,
                    title: `[${c.plan}] ${c.client}`,
                    start: c.startDate,
                    end: c.endDate,
                    backgroundColor: baseColor,
                    classNames: ['highlight-event'],
                    display: 'block',
                });
            }
        });

        return events;
    };

    const handleEventClick = (info) => {
        const contract = info.event.extendedProps;
        if (contract.type) { // Ensure it's a contract event
            if (contract.id === selectedContractId) {
                setSelectedContractId(null);
            } else {
                setSelectedContractId(contract.id);
                // Optional: Scroll to event date logic could go here
                if (calendarRef.current) {
                    calendarRef.current.getApi().gotoDate(contract.startDate);
                }
            }
        }
    };

    const handleSidebarClick = (contract) => {
        setSelectedContractId(contract.id);
        if (calendarRef.current) {
            calendarRef.current.getApi().gotoDate(contract.startDate);
        }
    };

    const tabs = [
        { id: 'all', label: 'Todos' },
        { id: 'elevator', label: 'Elevadores' },
        { id: 'tv', label: 'TVs' }
    ];

    const contractsList = getFilteredContracts();

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
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="calendar-header" style={{ marginBottom: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <style>{`
                    @media (max-width: 768px) {
                        .calendar-header {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: var(--space-4);
                        }
                    }
                `}</style>
                <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Calendário</h1>

                <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--color-bg-sidebar)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSelectedContractId(null); }}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: activeTab === tab.id ? 'var(--color-bg-surface)' : 'transparent',
                                color: activeTab === tab.id ? 'white' : 'var(--color-text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                fontSize: '0.875rem'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="calendar-container" style={{ display: 'flex', gap: 'var(--space-6)', height: 'calc(100vh - 180px)', flexDirection: 'row' }}>
                <style>{`
                    @media (max-width: 768px) {
                        .calendar-container {
                            flex-direction: column !important;
                            height: auto !important;
                        }
                        .calendar-sidebar {
                            width: 100% !important;
                            height: 300px !important;
                            margin-bottom: var(--space-4);
                        }
                        .calendar-view {
                            height: 500px !important;
                        }
                    }
                `}</style>
                {/* Sidebar List */}
                <div className="card calendar-sidebar" style={{ width: '280px', display: 'flex', flexDirection: 'column', padding: 'var(--space-4)', gap: 'var(--space-4)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Filtrar lista..."
                            value={sidebarSearch}
                            onChange={(e) => setSidebarSearch(e.target.value)}
                            className="input"
                            style={{ paddingLeft: '32px', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingRight: '4px' }}>
                        {contractsList.map(c => (
                            <div
                                key={c.id}
                                onClick={() => handleSidebarClick(c)}
                                style={{
                                    padding: '10px',
                                    borderRadius: 'var(--radius-md)',
                                    backgroundColor: selectedContractId === c.id ? 'var(--color-bg-surface)' : 'transparent',
                                    border: selectedContractId === c.id ? `1px solid ${getPlanColor(c.plan)}` : '1px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getPlanColor(c.plan) }}></div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)' }}>{c.client}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{c.plan}</p>
                                    </div>
                                </div>
                                {selectedContractId === c.id && <ChevronRight size={16} color="var(--color-primary)" />}
                            </div>
                        ))}
                        {contractsList.length === 0 && (
                            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '20px' }}>Nenhum contrato.</p>
                        )}
                    </div>
                </div>

                {/* Calendar Area */}
                <div className="card calendar-view" style={{ flex: 1, padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-card)', overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                    <style>{`
            .fc {
                --fc-border-color: var(--color-border);
                --fc-button-bg-color: var(--color-bg-surface);
                --fc-button-border-color: var(--color-border);
                --fc-button-hover-bg-color: var(--color-primary);
                --fc-button-hover-border-color: var(--color-primary);
                --fc-button-active-bg-color: var(--color-primary);
                --fc-text-color: var(--color-text-main);
                --fc-today-bg-color: rgba(249, 115, 22, 0.1);
                font-size: 0.75rem; /* Make text smaller */
            }
            .fc-toolbar-title {
                font-size: 1rem !important;
            }
            .fc-button {
                padding: 4px 8px !important;
                font-size: 0.75rem !important;
            }
            .fc-col-header-cell {
                background-color: var(--color-bg-surface);
                padding: 8px 0;
            }
            .fc-daygrid-day-number {
                color: var(--color-text-muted);
            }
            .fc tfoot, .fc th, .fc td {
                border-color: var(--color-border) !important;
            }
            /* Days from other months */
            .fc-day-other {
                opacity: 0.3;
                background-color: rgba(255, 255, 255, 0.05) !important;
            }
            .fc-day-other .fc-daygrid-day-number {
                color: var(--color-text-muted);
                opacity: 0.7;
            }
            /* Custom Classes */
            .dimmed-event {
                opacity: 0.2 !important;
                transition: opacity 0.3s ease;
            }
            .highlight-event {
                box-shadow: 0 0 10px rgba(0,0,0,0.5);
                z-index: 1000 !important;
                opacity: 0.9 !important;
            }
            .fc-event {
                cursor: pointer;
                transition: all 0.2s;
                border-radius: 4px;
            }
            @media (max-width: 500px) {
                .fc-header-toolbar {
                    flex-direction: column;
                    gap: 8px;
                }
                .fc-toolbar-chunk {
                    display: flex;
                    justify-content: center;
                }
            }
            `}</style>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next',
                            center: 'title',
                            right: 'today'
                        }}
                        events={getEvents()}
                        height="100%"
                        locale="pt-br"
                        firstDay={0}
                        eventClick={handleEventClick}
                        dateClick={() => setSelectedContractId(null)}
                        dayMaxEvents={2}
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
