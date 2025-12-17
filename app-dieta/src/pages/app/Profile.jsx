import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, LogOut, Receipt, Palette, Target, Bell } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useTheme } from '../../contexts/ThemeContext'
import { cn, urlBase64ToUint8Array } from '../../lib/utils'
import { updateStudentGoal, getStudentById } from '../../services/dietService'

export default function Profile() {
    const navigate = useNavigate()
    const { theme, setTheme } = useTheme()
    const [userGoal, setUserGoal] = useState('')
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
    const [isLoadingNotif, setIsLoadingNotif] = useState(false)

    useEffect(() => {
        loadUserGoal()
        checkSubscription()
    }, [])

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsNotificationsEnabled(!!subscription)
    }

    const toggleNotifications = async () => {
        setIsLoadingNotif(true)
        try {
            if (!('serviceWorker' in navigator)) {
                alert('Seu navegador não suporta notificações.')
                return
            }

            const registration = await navigator.serviceWorker.ready
            const subscription = await registration.pushManager.getSubscription()

            if (subscription) {
                // Unsubscribe
                await subscription.unsubscribe()

                // Remove from Supabase
                const { error } = await supabase
                    .from('push_subscriptions')
                    .delete()
                    .eq('endpoint', subscription.endpoint)

                if (error) console.error('Error removing from DB:', error)

                setIsNotificationsEnabled(false)
            } else {
                // Subscribe
                const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
                const newSubscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                })

                const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('p256dh'))))
                const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(newSubscription.getKey('auth'))))

                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    await supabase.from('push_subscriptions').upsert({
                        user_id: user.id,
                        endpoint: newSubscription.endpoint,
                        p256dh,
                        auth
                    }, { onConflict: 'endpoint' })
                }

                setIsNotificationsEnabled(true)
            }
        } catch (error) {
            console.error('Error toggling notifications:', error)
            alert('Erro ao alterar notificações: ' + error.message)
        } finally {
            setIsLoadingNotif(false)
        }
    }

    const loadUserGoal = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const profile = await getStudentById(user.id)
            if (profile) setUserGoal(profile.goal || '')
        }
    }

    const handleEditGoal = async () => {
        const newGoal = prompt('Qual é seu novo objetivo? (ex: Perder peso, Ganhar massa)', userGoal)
        if (!newGoal || newGoal === userGoal) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const result = await updateStudentGoal(user.id, newGoal)
        if (result.success) {
            setUserGoal(newGoal)
            alert('Objetivo atualizado com sucesso!')
        } else {
            alert('Erro ao atualizar objetivo')
        }
    }

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
            <h1 className="text-2xl font-bold">Perfil</h1>

            {/* Theme Section */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <h2 className="flex items-center gap-2 font-semibold">
                    <Palette size={20} />
                    Aparência
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
                    onClick={handleEditGoal}
                    className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                >
                    <Target size={20} className="text-green-500" />
                    <div className="flex flex-col items-start">
                        <span>Meu Objetivo</span>
                        <span className="text-xs text-muted-foreground">{userGoal || 'Definir'}</span>
                    </div>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                    <Users size={20} />
                    <span>Dados Pessoais</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors">
                    <Receipt size={20} />
                    <span>Assinatura</span>
                </button>

                <button
                    onClick={toggleNotifications}
                    className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <Bell size={20} className={isNotificationsEnabled ? "text-primary" : "text-muted-foreground"} />
                        <span>Notificações</span>
                    </div>
                    <span className={cn("text-xs font-medium px-2 py-1 rounded-full", isNotificationsEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        {isLoadingNotif ? '...' : (isNotificationsEnabled ? 'Ativado' : 'Desativado')}
                    </span>
                </button>

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
