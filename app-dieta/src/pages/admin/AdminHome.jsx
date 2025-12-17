import React from 'react'
import { Users, Activity, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'

export default function AdminHome() {
    // Mock Stats
    const stats = [
        { label: "Total de Alunos", value: "35", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Planos Ativos", value: "28", icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Pendentes", value: "3", icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Novos este mês", value: "+5", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    ]

    return (
        <div className="p-6 space-y-8">
            <header>
                <h1 className="text-2xl font-bold">Olá, Nutri! 👋</h1>
                <p className="text-muted-foreground">Aqui está o resumo do seu dia.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
                        <div className={`h-10 w-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <span className="text-2xl font-bold block">{stat.value}</span>
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Atividade Recente</h3>
                <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                    <div className="p-4 flex gap-3 items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <p className="text-sm"><span className="font-semibold">Ana Silva</span> completou o treino de hoje.</p>
                    </div>
                    <div className="p-4 flex gap-3 items-center">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <p className="text-sm"><span className="font-semibold">Carlos</span> atualizou o peso: 78kg.</p>
                    </div>
                    <div className="p-4 flex gap-3 items-center">
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <p className="text-sm"><span className="font-semibold">Beatriz</span> enviou uma dúvida no chat.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
