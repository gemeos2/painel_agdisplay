
import React, { useState, useEffect } from 'react';
import { getPlanColor, getPlanPrice } from '../data/mockData';
import { Users, Clock, CheckCircle, TrendingUp, DollarSign, XCircle, Loader2 } from 'lucide-react';
import { fetchClients } from '../services/supabase';

const Dashboard = () => {
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

    // Calculate status based on dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const contractsWithCalculatedStatus = contracts.map(contract => {
        const startDate = new Date(contract.startDate);
        const endDate = new Date(contract.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        let calculatedStatus;
        if (startDate > today) {
            calculatedStatus = 'Agendado';
        } else if (endDate < today) {
            calculatedStatus = 'Finalizado';
        } else {
            calculatedStatus = 'Ativo';
        }

        return { ...contract, calculatedStatus };
    });

    const allContracts = contractsWithCalculatedStatus;

    // Calculate metrics
    const activeContracts = allContracts.filter(c => c.calculatedStatus === 'Ativo');
    const scheduledContracts = allContracts.filter(c => c.calculatedStatus === 'Agendado');
    const finishedContracts = allContracts.filter(c => c.calculatedStatus === 'Finalizado');

    const activeCount = activeContracts.length;
    const scheduledCount = scheduledContracts.length;
    const finishedCount = finishedContracts.length;
    const totalDeep = activeCount + scheduledCount; // Active + Scheduled only

    // Calculate monthly revenue
    // Include: Active contracts + Scheduled contracts starting this month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const revenueContracts = allContracts.filter(c => {
        if (c.calculatedStatus === 'Ativo') return true;
        if (c.calculatedStatus === 'Agendado') {
            const startDate = new Date(c.startDate);
            return startDate <= lastDayOfMonth;
        }
        return false;
    });

    const totalValue = revenueContracts.reduce((sum, contract) => {
        return sum + getPlanPrice(contract.plan);
    }, 0);

    // Separate by type for charts
    const elevatorContracts = allContracts.filter(c => c.type === 'elevator');
    const tvContracts = allContracts.filter(c => c.type === 'tv');

    // --- Statistics Calculations ---

    // State for Timeline Chart
    const [selectedMonthIndex, setSelectedMonthIndex] = React.useState(currentMonth);
    const [selectedYear, setSelectedYear] = React.useState(currentYear);
    const [tooltipStr, setTooltipStr] = React.useState(null); // { x, y, day, count }
    const [hoveredService, setHoveredService] = React.useState(null);
    const [activePlanTab, setActivePlanTab] = React.useState('elevator'); // 'elevator' | 'tv'

    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const handlePrevMonth = () => {
        if (selectedMonthIndex === 0) {
            setSelectedMonthIndex(11);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonthIndex(selectedMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonthIndex === 11) {
            setSelectedMonthIndex(0);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonthIndex(selectedMonthIndex + 1);
        }
    };

    // Calculate Daily New Contracts for Selected Month
    const getDailyStats = () => {
        const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
        const data = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const currentObj = new Date(selectedYear, selectedMonthIndex, day);
            currentObj.setHours(0, 0, 0, 0);

            // Count NEW contracts starting on this specific day
            const activeCount = allContracts.filter(c => {
                const [startY, startM, startD] = c.startDate.split('-').map(Number);
                const start = new Date(startY, startM - 1, startD);
                return currentObj.getTime() === start.getTime();
            }).length;

            data.push({ day, count: activeCount });
        }
        return data;
    };

    const dailyStats = getDailyStats();
    // Normalize data for SVG
    const maxDaily = Math.max(...dailyStats.map(d => d.count), 1); // Avoid div/0
    const chartHeight = 150;

    const points = dailyStats.map((d, i) => {
        const x = (i / (dailyStats.length - 1)) * 1000; // Use 1000 units for width precision
        const y = chartHeight - ((d.count / maxDaily) * chartHeight * 0.8) - 10; // *0.8 to keep padding
        return [x, y];
    });

    // Build Path String
    let pathD = `M ${points[0][0]},${chartHeight} L ${points[0][0]},${points[0][1]}`; // Start bottom-left

    // Smooth Curve Logic (Cubic Bezier)
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        // Control points for simple easing
        const cp1x = p0[0] + (p1[0] - p0[0]) / 2;
        const cp1y = p0[1];
        const cp2x = p0[0] + (p1[0] - p0[0]) / 2;
        const cp2y = p1[1];

        pathD += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p1[0]},${p1[1]}`;
    }

    pathD += ` L ${points[points.length - 1][0]},${chartHeight} Z`; // Close path to bottom-right


    // 2. Service Distribution
    const totalCount = allContracts.length || 1;
    const elevatorPercentage = (elevatorContracts.length / totalCount) * 100;

    // 3. Top Plans
    const getSortedPlans = (contracts) => {
        const counts = {};
        contracts.forEach(c => counts[c.plan] = (counts[c.plan] || 0) + 1);
        return Object.entries(counts)
            .map(([plan, count]) => ({ plan, count }))
            .sort((a, b) => b.count - a.count);
    };
    const elevatorPlans = getSortedPlans(elevatorContracts);
    const tvPlans = getSortedPlans(tvContracts);

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

    const cards = [
        {
            title: 'Contratos Ativos',
            value: activeCount,
            icon: CheckCircle,
            color: '#10b981',
            bg: 'rgba(16, 185, 129, 0.1)'
        },
        {
            title: 'Agendados',
            value: scheduledCount,
            icon: Clock,
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.1)'
        },
        {
            title: 'Finalizados',
            value: finishedCount,
            icon: XCircle,
            color: '#94a3b8',
            bg: 'rgba(148, 163, 184, 0.1)'
        },
        {
            title: 'Total Geral',
            value: totalDeep,
            icon: Users,
            color: '#fb923c', // Orange for Total
            bg: 'rgba(251, 146, 60, 0.1)'
        }
    ];

    return (
        <div>
            {/* Header with Monthly Value */}
            {/* Header with Monthly Value */}
            <div className="dashboard-header">
                <style>{`
                    .dashboard-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: var(--space-8);
                        gap: var(--space-4);
                    }
                    .monthly-card-custom {
                        padding: var(--space-4);
                        display: flex;
                        align-items: center;
                        gap: var(--space-4);
                        min-width: 280px;
                        background-color: rgba(249, 115, 22, 0.05); /* Orange tint */
                        border: 1px solid rgba(249, 115, 22, 0.2);
                    }
                    @media (max-width: 768px) {
                        .dashboard-header {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        .monthly-card-custom {
                            width: 100%;
                            min-width: unset;
                        }
                    }
                `}</style>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-2)', fontWeight: 700 }}>Visão Geral</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Visão geral da sua carteira de contratos.</p>
                </div>

                <div className="card monthly-card-custom">
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(249, 115, 22, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f97316' // Orange 500
                    }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>Valor Mensal (Est.)</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f97316', lineHeight: 1 }}>
                            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
                {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <div key={index} className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: card.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: card.color,
                                flexShrink: 0
                            }}>
                                <Icon size={24} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.title}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1 }}>{card.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Statistics Section */}
            <div style={{ marginTop: 'var(--space-8)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-6)' }}>Estatísticas</h2>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)' }}>

                    {/* 1. Monthly Hiring History (Wave Timeline) */}
                    <div className="card" style={{ width: '100%' }}> {/* Full width */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Linha do Tempo de Contratos</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '4px' }}>&lt;</button>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem', minWidth: '120px', textAlign: 'center' }}>
                                    {monthNames[selectedMonthIndex]} {selectedYear}
                                </span>
                                <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--color-text-main)', cursor: 'pointer', padding: '4px' }}>&gt;</button>
                            </div>
                        </div>

                        <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'visible' }}
                            onMouseLeave={() => setTooltipStr(null)}>
                            {maxDaily === 0 ? (
                                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                    Sem dados para este período.
                                </div>
                            ) : (
                                <>
                                    <svg viewBox={`0 0 1000 ${chartHeight}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                        {/* Gradient Definition */}
                                        <defs>
                                            <linearGradient id="waveGradient" x1="0" x2="0" y1="0" y2="1">
                                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.05" />
                                            </linearGradient>
                                        </defs>

                                        {/* Grid Lines (Horizontal) */}
                                        {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
                                            <line
                                                key={i}
                                                x1="0" y1={chartHeight * ratio}
                                                x2="1000" y2={chartHeight * ratio}
                                                stroke="var(--color-border)"
                                                strokeDasharray="4"
                                                strokeWidth="1"
                                            />
                                        ))}

                                        {/* The Wave Path */}
                                        <path
                                            d={pathD}
                                            fill="url(#waveGradient)"
                                            stroke="var(--color-primary)"
                                            strokeWidth="3"
                                            vectorEffect="non-scaling-stroke"
                                        />

                                        {/* Data Points and Interaction Areas */}
                                        {points.map((p, i) => {
                                            const dayData = dailyStats[i];
                                            return (
                                                <g key={i}>
                                                    {/* Visible Dot - Show only if there is at least 1 contract */}
                                                    {dayData.count > 0 && (
                                                        <circle
                                                            cx={p[0]} cy={p[1]}
                                                            r="4"
                                                            fill="white"
                                                            stroke="var(--color-primary)"
                                                            strokeWidth="2"
                                                            style={{ transition: 'r 0.2s', cursor: 'pointer' }}
                                                        />
                                                    )}

                                                    {/* Invisible Hit Area for Tooltip (Larger) */}
                                                    <circle
                                                        cx={p[0]} cy={p[1]}
                                                        r="10"
                                                        fill="transparent"
                                                        style={{ cursor: 'pointer' }}
                                                        onMouseEnter={(e) => {
                                                            const rect = e.target.getBoundingClientRect();
                                                            setTooltipStr({
                                                                x: rect.left + rect.width / 2, // Centered horizontally
                                                                y: rect.top - 10, // Above the dot
                                                                day: dayData.day,
                                                                count: dayData.count
                                                            });
                                                        }}
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>

                                    {/* Tooltip Element */}
                                    {tooltipStr && (
                                        <div style={{
                                            position: 'fixed',
                                            top: tooltipStr.y,
                                            left: tooltipStr.x,
                                            transform: 'translate(-50%, -100%)',
                                            backgroundColor: 'var(--color-bg-sidebar)',
                                            color: 'var(--color-text-main)',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            boxShadow: 'var(--shadow-lg)',
                                            border: '1px solid var(--color-border)',
                                            fontSize: '0.875rem',
                                            pointerEvents: 'none',
                                            zIndex: 9999, // High z-index to stay on top
                                            whiteSpace: 'nowrap'
                                        }}>
                                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>Dia {tooltipStr.day}</div>
                                            <div style={{ color: 'var(--color-text-muted)' }}>{tooltipStr.count} contratos</div>
                                            {/* Little triangle arrow */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-5px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '5px solid transparent',
                                                borderRight: '5px solid transparent',
                                                borderTop: '5px solid var(--color-border)'
                                            }}></div>
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '-4px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                width: 0,
                                                height: 0,
                                                borderLeft: '5px solid transparent',
                                                borderRight: '5px solid transparent',
                                                borderTop: '5px solid var(--color-bg-sidebar)'
                                            }}></div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* X-Axis Labels */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', color: 'var(--color-text-muted)', fontSize: '0.75rem', padding: '0 10px' }}>
                            <span>Dia 1</span>
                            <span>Dia 15</span>
                            <span>Dia {new Date(selectedYear, selectedMonthIndex + 1, 0).getDate()}</span>
                        </div>
                    </div>

                    {/* 2. Service Distribution (Pie Chart with CSS) */}
                    <div className="card stat-card-fixed" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', alignSelf: 'flex-start' }}>Distribuição de Serviços</h3>
                        <div style={{
                            width: '180px',
                            height: '180px',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg viewBox="0 0 180 180" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                {/* Background circle for gaps */}
                                <circle
                                    cx="90" cy="90" r="70"
                                    fill="none"
                                    stroke="var(--color-bg-card)"
                                    strokeWidth="24"
                                />
                                {/* Circle for Elevators */}
                                <circle
                                    cx="90" cy="90" r="70"
                                    fill="none"
                                    stroke="var(--color-primary)"
                                    strokeWidth={hoveredService === 'elevator' ? 28 : 24}
                                    strokeDasharray={`${elevatorPercentage - 1} ${100 - elevatorPercentage + 1}`}
                                    pathLength="100"
                                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: hoveredService === 'tv' ? 0.3 : 1 }}
                                    onMouseEnter={() => setHoveredService('elevator')}
                                    onMouseLeave={() => setHoveredService(null)}
                                />
                                {/* Circle for TVs */}
                                <circle
                                    cx="90" cy="90" r="70"
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth={hoveredService === 'tv' ? 28 : 24}
                                    strokeDasharray={`${100 - elevatorPercentage - 1} ${elevatorPercentage + 1}`}
                                    strokeDashoffset={-elevatorPercentage}
                                    pathLength="100"
                                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', opacity: hoveredService === 'elevator' ? 0.3 : 1 }}
                                    onMouseEnter={() => setHoveredService('tv')}
                                    onMouseLeave={() => setHoveredService(null)}
                                />
                            </svg>
                            {/* Center Text */}
                            <div style={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                                    {hoveredService === 'elevator' ? `${elevatorPercentage.toFixed(0)}%` :
                                        hoveredService === 'tv' ? `${(100 - elevatorPercentage).toFixed(0)}%` :
                                            totalCount}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                    {hoveredService === 'elevator' ? 'Elevadores' :
                                        hoveredService === 'tv' ? 'TVs' :
                                            'Contratos'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '2px', background: 'var(--color-primary)' }}></div>
                                <span style={{ fontSize: '0.875rem' }}>Elevadores ({elevatorContracts.length})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: 12, height: 12, borderRadius: '2px', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '0.875rem' }}>TVs ({tvContracts.length})</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Top Plans (Horizontal Bars) */}
                    <div className="card stat-card-fixed" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Planos Mais Pedidos</h3>
                        </div>

                        {/* Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
                            <button
                                onClick={() => setActivePlanTab('elevator')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activePlanTab === 'elevator' ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    color: activePlanTab === 'elevator' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                    fontWeight: activePlanTab === 'elevator' ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Elevadores
                            </button>
                            <button
                                onClick={() => setActivePlanTab('tv')}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: activePlanTab === 'tv' ? '2px solid #3b82f6' : '2px solid transparent',
                                    color: activePlanTab === 'tv' ? '#3b82f6' : 'var(--color-text-muted)',
                                    fontWeight: activePlanTab === 'tv' ? 600 : 400,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                TV & Display
                            </button>
                        </div>

                        {/* List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1, overflowY: 'auto' }}>
                            {(activePlanTab === 'elevator' ? elevatorPlans : tvPlans).map((item, index) => {
                                const list = activePlanTab === 'elevator' ? elevatorPlans : tvPlans;
                                const maxCount = list.length > 0 ? list[0].count : 1;
                                return (
                                    <div key={index}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                                            <span style={{ color: 'var(--color-text-main)' }}>{item.plan}</span>
                                            <span style={{ color: 'var(--color-text-muted)' }}>{item.count}</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: 'var(--color-bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${(item.count / maxCount) * 100}%`,
                                                height: '100%',
                                                background: activePlanTab === 'elevator' ? 'var(--color-primary)' : '#3b82f6',
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {(activePlanTab === 'elevator' ? elevatorPlans : tvPlans).length === 0 && (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '20px' }}>
                                    Nenhum plano encontrado.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Yearly Overview (Monthly Counts) - New Chart */}
                    <div className="card stat-card-grow">
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Desempenho Mensal ({selectedYear})</h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '20px' }}>
                            {(() => {
                                // Calculate monthly data relative to selectedYear
                                const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
                                    const monthStart = new Date(selectedYear, i, 1);
                                    const monthEnd = new Date(selectedYear, i + 1, 0);
                                    monthStart.setHours(0, 0, 0, 0);
                                    monthEnd.setHours(23, 59, 59, 999);

                                    // Count contracts started in this month
                                    const count = allContracts.filter(c => {
                                        const [startY, startM, startD] = c.startDate.split('-').map(Number);
                                        const start = new Date(startY, startM - 1, startD);
                                        return start >= monthStart && start <= monthEnd;
                                    }).length;

                                    return { month: monthNames[i].substring(0, 3), count };
                                });

                                const maxMonthCount = Math.max(...monthlyCounts.map(m => m.count), 1);

                                return monthlyCounts.map((data, index) => (
                                    <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                        {/* Tooltip-like value on top if non-zero */}
                                        <div style={{
                                            marginBottom: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: 'var(--color-text-muted)',
                                            opacity: data.count > 0 ? 1 : 0
                                        }}>
                                            {data.count}
                                        </div>
                                        {/* Bar */}
                                        <div style={{
                                            width: '60%',
                                            maxWidth: '30px',
                                            height: `${(data.count / maxMonthCount) * 120}px`, // Max height 120px
                                            minHeight: '4px', // Always show a tiny line
                                            borderRadius: '4px 4px 0 0',
                                            backgroundColor: data.count > 0 ? 'var(--color-primary)' : 'var(--color-bg-surface)',
                                            transition: 'height 0.3s ease'
                                        }}></div>
                                        {/* Label */}
                                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {data.month}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
