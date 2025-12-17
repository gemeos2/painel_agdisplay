import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { Home, Users, User, LogOut } from 'lucide-react'
import { cn } from '../lib/utils'

export default function AdminLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>

            {/* Admin Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border px-6 py-4 flex justify-between items-center shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.3)]">
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) => cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <Home size={24} strokeWidth={2.5} />
                    <span className="text-[10px] font-medium">Início</span>
                </NavLink>

                <NavLink
                    to="/admin/clients"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <Users size={24} strokeWidth={2.5} />
                    <span className="text-[10px] font-medium">Alunos</span>
                </NavLink>

                <NavLink
                    to="/admin/profile"
                    className={({ isActive }) => cn(
                        "flex flex-col items-center gap-1 transition-all duration-300",
                        isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <User size={24} strokeWidth={2.5} />
                    <span className="text-[10px] font-medium">Perfil</span>
                </NavLink>
            </nav>
        </div>
    )
}
