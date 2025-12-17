import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Scale, Trophy, Utensils, Target, Info, BellRing } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { urlBase64ToUint8Array } from '../../lib/utils'

export default function Notifications() {
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [isSupportingPush, setIsSupportingPush] = useState(false)
    const [isSubscribing, setIsSubscribing] = useState(false)

    useEffect(() => {
        fetchNotifications()
        checkSubscription()
    }, [])

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications not supported')
            setIsSupportingPush(false)
            return
        }
        setIsSupportingPush(true)

        try {
            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()
            setIsSubscribed(!!subscription)
        } catch (e) {
            console.error('Error checking subscription:', e)
        }
    }


    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setNotifications(data || [])

            const unreadIds = data?.filter(n => !n.read).map(n => n.id)

            if (unreadIds?.length > 0) {
                await supabase
                    .from('notifications')
                    .update({ read: true })
                    .in('id', unreadIds)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            // Fallback for demo if table doesn't exist yet
            setNotifications([
                { id: 1, type: 'rank', title: 'Novo Ranking!', message: 'Parabéns! Você alcançou o nível Ouro.', created_at: new Date().toISOString(), read: false },
                { id: 2, type: 'weight', title: 'Peso Atualizado', message: 'Você registrou 78kg. Continue assim!', created_at: new Date(Date.now() - 86400000).toISOString(), read: true },
                { id: 3, type: 'diet', title: 'Nova Dieta', message: 'Nutri Giovani atualizou seu plano alimentar.', created_at: new Date(Date.now() - 172800000).toISOString(), read: true },
            ])
        } finally {
            setLoading(false)
        }
    }

    const subscribeToNotifications = async () => {
        if (isSubscribing) return
        setIsSubscribing(true)
        console.log('Starting subscription process...')

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Usuário não identificado. Faça login novamente.')
                return
            }

            if (!('serviceWorker' in navigator)) {
                alert('Seu navegador não suporta Service Workers.')
                return
            }

            console.log('Waiting for Service Worker ready...')
            const registration = await navigator.serviceWorker.ready
            console.log('Service Worker ready:', registration)

            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
            if (!vapidPublicKey) {
                throw new Error('VITE_VAPID_PUBLIC_KEY não encontrada no .env')
            }

            console.log('Requesting permission...')
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
            })
            console.log('Subscription created:', subscription)

            // Converter chaves para base64 padrão
            const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))))
            const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))

            console.log('Saving to Supabase...')
            // Save directly to Supabase
            const { error } = await supabase
                .from('push_subscriptions')
                .upsert({
                    user_id: user.id,
                    endpoint: subscription.endpoint,
                    p256dh,
                    auth
                }, { onConflict: 'endpoint' })

            if (error) {
                console.error('Supabase error:', error)
                if (error.code === '42P01') {
                    throw new Error('Tabela "push_subscriptions" não existe. Você executou o SQL?')
                }
                throw error
            }

            setIsSubscribed(true)
            alert('Notificações ativadas com sucesso!')
        } catch (error) {
            console.error('Error subscribing:', error)
            alert(`Erro ao ativar: ${error.message}`)
        } finally {
            setIsSubscribing(false)
        }
    }

    const getIcon = (type) => {
        switch (type) {
            case 'weight': return <Scale className="text-blue-500" size={20} />
            case 'rank': return <Trophy className="text-yellow-500" size={20} />
            case 'diet': return <Utensils className="text-green-500" size={20} />
            case 'goal': return <Target className="text-red-500" size={20} />
            default: return <Info className="text-gray-500" size={20} />
        }
    }

    return (
        <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-background z-50 overflow-y-auto no-scrollbar"
        >
            <div className="p-4 space-y-6 max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Bell className="fill-current" size={20} />
                        Notificações
                    </h1>
                </div>

                {/* Subscription CTA */}
                {isSupportingPush && !isSubscribed && (
                    <div
                        onClick={subscribeToNotifications}
                        className={`bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4 cursor-pointer active:scale-95 transition-transform ${isSubscribing ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <div className="bg-primary text-primary-foreground p-3 rounded-full">
                            <BellRing size={20} className={isSubscribing ? "animate-spin" : ""} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-primary">
                                {isSubscribing ? 'Ativando...' : 'Ativar Notificações'}
                            </h3>
                            <p className="text-xs text-primary/80">
                                {isSubscribing ? 'Aguarde um momento.' : 'Receba alertas sobre sua dieta e treinos.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-muted-foreground">Carregando...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            <Bell size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Nenhuma notificação nova</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`bg-card border ${notif.read ? 'border-border' : 'border-primary/50 bg-primary/5'} rounded-2xl p-4 flex gap-4 transition-colors`}
                            >
                                <div className="mt-1 bg-card p-2 rounded-full border border-border h-fit">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="space-y-1 flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-semibold ${!notif.read && 'text-foreground'}`}>{notif.title}</h3>
                                        <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(notif.created_at), "dd/MM", { locale: ptBR })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    )
}
