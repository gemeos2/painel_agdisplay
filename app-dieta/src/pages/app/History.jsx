import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '../../services/supabase'
import { History, Scale, Target, Shield, Utensils, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export default function HistoryPage() {
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Fetch generic notifications as history
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setEvents(data || [])
        } catch (error) {
            console.error('Error fetching history:', error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'weight': return <Scale className="text-rose-500" size={20} />
            case 'goal': return <Target className="text-green-500" size={20} />
            case 'diet': return <Utensils className="text-orange-500" size={20} />
            case 'system': return <Shield className="text-blue-500" size={20} />
            case 'rank': return <Award className="text-yellow-500" size={20} />
            default: return <History className="text-muted-foreground" size={20} />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 pb-24">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <History />
                Histórico
            </h1>

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="text-center text-muted-foreground py-10">
                        Nenhum registro encontrado.
                    </div>
                ) : (
                    events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-card border border-border rounded-xl p-4 flex gap-4 items-start"
                        >
                            <div className="bg-muted/50 p-2 rounded-full mt-1">
                                {getIcon(event.type)}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm">{event.title}</h3>
                                <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                                    {event.message}
                                </p>
                                <span className="text-[10px] text-muted-foreground/60 mt-2 block capitalize">
                                    {format(new Date(event.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
