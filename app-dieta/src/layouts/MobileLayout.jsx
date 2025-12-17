import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Calendar, User, MessageCircle } from 'lucide-react'
import { cn } from '../lib/utils'

export default function MobileLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground max-w-md mx-auto border-x border-border/50 shadow-2xl relative">
            <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border max-w-md mx-auto">
                <ul className="flex justify-around items-center h-16 px-4">
                    <NavItem to="/app" end icon={<Home size={24} />} label="Hoje" />
                    <NavItem to="/app/history" icon={<Calendar size={24} />} label="Histórico" />
                    <NavItem to="/app/chat" icon={<MessageCircle size={24} />} label="Chat" />
                    <NavItem to="/app/profile" icon={<User size={24} />} label="Perfil" />
                </ul>
            </nav>
        </div>
    )
}

function NavItem({ to, icon, label, end }) {
    return (
        <li>
            <NavLink
                to={to}
                end={end}
                className={({ isActive }) => cn(
                    "flex flex-col items-center justify-center space-y-1 text-muted-foreground transition-colors w-16",
                    isActive && "text-primary"
                )}
            >
                <span className="text-xl">{icon}</span>
                <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
        </li>
    )
}
