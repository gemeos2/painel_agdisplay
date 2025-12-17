import React, { useState } from 'react';
import { useNewClientsCount } from '../hooks/useNewClientsCount';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, ArrowUpFromLine, MonitorPlay, Calendar, Settings, Users, Menu, X, LogOut } from 'lucide-react';
import '../index.css';
import logo from '../assets/LOGO-AG-DISPLAY-2.png';

const MainLayout = () => {
    const { user, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirect happens automatically due to ProtectedRoute
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/clients', label: 'Clientes', icon: <Users size={20} /> },
        { path: '/elevators', label: 'Elevadores', icon: <ArrowUpFromLine size={20} /> },
        { path: '/tvs', label: 'TVs & Displays', icon: <MonitorPlay size={20} /> },
        { path: '/calendar', label: 'Calendário', icon: <Calendar size={20} /> },
    ];

    return (
        <div className="app-layout">
            {/* Mobile Overlay */}
            <div
                className={`overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            ></div>

            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ marginBottom: 'var(--space-8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <img src={logo} alt="AdMgmt Logo" style={{ height: '60px' }} />
                    </div>
                    {/* Close button for mobile */}
                    <button className="menu-toggle" onClick={closeSidebar} style={{ color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1 }}>
                    {navItems.map((item) => {
                        const isClientsItem = item.label === 'Clientes';
                        const { count: newClientsCount } = isClientsItem ? useNewClientsCount() : { count: 0 };

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar} // Close on nav click (mobile UX)
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-3)',
                                    padding: 'var(--space-3)',
                                    borderRadius: 'var(--radius-md)',
                                    color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                    backgroundColor: isActive ? 'var(--color-bg-surface)' : 'transparent',
                                    fontWeight: isActive ? 600 : 400,
                                    transition: 'all 0.2s',
                                    borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                                    position: 'relative'
                                })}
                            >
                                {item.icon}
                                {item.label}
                                {isClientsItem && newClientsCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        right: 'var(--space-3)',
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        height: '18px',
                                        minWidth: '18px',
                                        padding: '0 5px',
                                        borderRadius: '999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold'
                                    }}>
                                        {newClientsCount}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div style={{ paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-muted)', cursor: 'pointer' }} onClick={handleSignOut}>
                        <LogOut size={20} />
                        <span>Sair</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="main-header">
                    <style>{`
                        .main-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: var(--space-8);
                        }
                        @media (max-width: 768px) {
                            .main-header {
                                position: fixed;
                                top: 0;
                                left: 0;
                                right: 0;
                                z-index: 10;
                                background-color: var(--color-bg-app);
                                height: 70px; /* Explicit height for calculation */
                                padding: 0 var(--space-4); /* Horizontal padding */
                                margin: 0; /* Reset margins */
                                border-bottom: 1px solid var(--color-border);
                                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
                                width: 100%;
                            }
                        }
                    `}</style>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <button className="menu-toggle" onClick={toggleSidebar}>
                            <Menu size={24} />
                        </button>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Bem-vindo</h2>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <span className="admin-text" style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{user?.email}</span>
                        <style>{`
                            @media (max-width: 768px) {
                                .admin-text { display: none; }
                            }
                        `}</style>
                        <div style={{ width: 40, height: 40, background: 'var(--color-bg-surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{user?.email?.charAt(0).toUpperCase()}</span>
                        </div>
                    </div>

                </header>

                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
