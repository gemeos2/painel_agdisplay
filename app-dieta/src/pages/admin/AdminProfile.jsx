import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Palette } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'

export default function AdminProfile() {
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const themes = [
        { id: 'original', name: 'Original', color: 'bg-slate-900' },
        { id: 'orange', name: 'Laranja', color: 'bg-orange-500' },
        { id: 'pink', name: 'Rosa', color: 'bg-pink-500' },
        { id: 'green', name: 'Verde', color: 'bg-green-600' },
    ]

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Perfil do Nutricionista</h1>

            {/* Theme Section */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <h2 className="flex items-center gap-2 font-semibold">
                    <Palette size={20} />
                    Aparência do App
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                                "flex items-center gap-2 p-3 rounded-lg border transition-all",
                                theme === t.id
                                    ? "border-primary bg-primary/10 ring-1 ring-primary" // Active state
                                    : "border-border hover:bg-muted"
                            )}
                        >
                            <div className={cn("w-4 h-4 rounded-full", t.color)} />
                            <span className="text-sm">{t.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 p-4 bg-card border border-destructive/50 text-destructive rounded-xl hover:bg-destructive/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    )
}
