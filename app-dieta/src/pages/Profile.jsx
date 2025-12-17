import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Ruler, Weight, Calendar, Pencil, Check, Palette, LogOut, Bell } from 'lucide-react'
import { cn, urlBase64ToUint8Array } from '../lib/utils'
import { supabase } from '../services/supabase'
import { useTheme } from '../contexts/ThemeContext' // Import Theme Hook


export default function Profile() {
    const [isEditing, setIsEditing] = useState(false)
    const [profile, setProfile] = useState(null)
    const [editedProfile, setEditedProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isLoadingNotif, setIsLoadingNotif] = useState(false)
    const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        fetchProfile()
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

                // Send immediate welcome notification
                await registration.showNotification('Notificações Ativadas! 🎉', {
                    body: 'Agora você receberá alertas sobre sua dieta e treinos.',
                    icon: '/icon.svg'
                })

                setIsNotificationsEnabled(true)
            }
        } catch (error) {
            console.error('Error toggling notifications:', error)
            alert('Erro ao alterar notificações: ' + error.message)
        } finally {
            setIsLoadingNotif(false)
        }
    }

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (error) throw error
            setProfile(data)
            setEditedProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editedProfile.full_name,
                    age: editedProfile.age,
                    height: editedProfile.height,
                    weight: editedProfile.weight,
                    goal: editedProfile.goal
                })
                .eq('id', user.id)

            if (error) throw error

            // Trigger notification if goal changed
            if (profile.goal !== editedProfile.goal) {
                await supabase.from('notifications').insert({
                    user_id: user.id,
                    type: 'goal',
                    title: 'Novo Objetivo!',
                    message: `Seu objetivo foi atualizado para: ${editedProfile.goal || 'Novo objetivo'}.`,
                    read: false
                })
            }

            // Trigger notification if weight changed
            if (profile.weight !== editedProfile.weight) {
                await supabase.from('notifications').insert({
                    user_id: user.id,
                    type: 'weight',
                    title: 'Novo Peso!',
                    message: `Seu peso foi atualizado para: ${editedProfile.weight}kg.`,
                    read: false
                })
            }

            setProfile(editedProfile)
            setIsEditing(false)
            alert('Perfil atualizado com sucesso!')
        } catch (error) {
            console.error('Error updating profile:', error)
            alert('Erro ao salvar perfil')
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setEditedProfile(profile)
        setIsEditing(false)
    }

    const handlePasswordChange = async () => {
        const newPassword = prompt('Digite sua nova senha (mínimo 6 caracteres):')
        if (!newPassword || newPassword.length < 6) {
            if (newPassword) alert('A senha deve ter pelo menos 6 caracteres.')
            return
        }

        try {
            setSaving(true)
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error

            const { data: { user } } = await supabase.auth.getUser()

            // Trigger notification
            await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'system',
                title: 'Senha Alterada',
                message: 'Sua senha de acesso foi alterada com sucesso.',
                read: false
            })

            alert('Senha alterada com sucesso!')
        } catch (error) {
            console.error('Error changing password:', error)
            alert('Erro ao alterar senha.')
        } finally {
            setSaving(false)
        }
    }

    const themes = [
        { id: 'original', name: 'Original', color: 'bg-slate-900' },
        { id: 'orange', name: 'Laranja', color: 'bg-orange-500' },
        { id: 'pink', name: 'Rosa', color: 'bg-pink-500' },
        { id: 'green', name: 'Verde', color: 'bg-green-600' },
    ]

    const handleFieldChange = (field, value) => {
        setEditedProfile(prev => ({
            ...prev,
            [field]: value === '' ? null : parseFloat(value) || value
        }))
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Perfil não encontrado</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 pb-24">
            <header className="flex flex-col items-center justify-center pt-8 pb-4">
                <div className="relative">
                    <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 p-1 shadow-2xl relative group">
                        <div className="h-full w-full rounded-full bg-card flex items-center justify-center overflow-hidden border-4 border-background relative">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                    {profile.full_name?.charAt(0) || 'U'}
                                </span>
                            )}

                            {/* Edit Overlay for Avatar */}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                    <Pencil className="text-white drop-shadow-md" size={24} />
                                </div>
                            )}
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-background" />
                    )}
                </div>

                <div className="text-center mt-4 space-y-1 relative">
                    <div className="flex items-center justify-center gap-2 relative">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedProfile?.full_name || ''}
                                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                                className="text-2xl font-bold text-center bg-transparent border-b-2 border-primary/30 focus:border-primary outline-none px-2"
                                placeholder="Seu nome"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold">{profile.full_name || 'Usuário'}</h1>
                        )}
                        {isEditing && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-primary/10 p-1.5 rounded-full text-primary"
                            >
                                <Pencil size={14} />
                            </motion.div>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">{profile.email}</p>

                    {isEditing ? (
                        <div className="space-y-2 pt-2 w-full max-w-xs mx-auto">
                            <label className="text-xs font-medium text-muted-foreground">Seu objetivo</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange('goal', 'Perder peso')}
                                    className={`p-2 rounded-lg border-2 transition-all text-sm ${editedProfile?.goal === 'Perder peso'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    🔥 Perder peso
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange('goal', 'Ganhar massa')}
                                    className={`p-2 rounded-lg border-2 transition-all text-sm ${editedProfile?.goal === 'Ganhar massa'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    💪 Ganhar massa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleFieldChange('goal', 'Manter saúde')}
                                    className={`p-2 rounded-lg border-2 transition-all text-sm ${editedProfile?.goal === 'Manter saúde'
                                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                                        : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    ✨ Manter saúde
                                </button>
                            </div>
                        </div>
                    ) : (
                        <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mt-2">
                            {profile.goal || 'Sem objetivo definido'}
                        </span>
                    )}
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard
                    icon={<Calendar className="text-blue-500" size={20} />}
                    label="Idade"
                    value={profile.age ? `${profile.age} anos` : '-'}
                    isEditing={isEditing}
                    editValue={editedProfile?.age}
                    onChange={handleFieldChange}
                    field="age"
                />
                <StatCard
                    icon={<Ruler className="text-indigo-500" size={20} />}
                    label="Altura"
                    value={profile.height ? `${profile.height}cm` : '-'}
                    isEditing={isEditing}
                    editValue={editedProfile?.height}
                    onChange={handleFieldChange}
                    field="height"
                />
                <StatCard
                    icon={<Weight className="text-rose-500" size={20} />}
                    label="Peso"
                    value={profile.weight ? `${profile.weight}kg` : '-'}
                    isEditing={isEditing}
                    editValue={editedProfile?.weight}
                    onChange={handleFieldChange}
                    field="weight"
                />
            </div>

            {/* Additional Info / Actions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold px-1">Configurações</h3>
                <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                    <ActionRow
                        label={isEditing ? "Salvar Alterações" : "Editar Perfil"}
                        icon={isEditing ? <Check size={16} className="text-green-500" /> : <Pencil size={16} className="text-muted-foreground" />}
                        onClick={isEditing ? handleSave : () => setIsEditing(true)}
                        highlight={isEditing}
                        disabled={saving}
                    />
                    <ActionRow label="Alterar Senha" onClick={handlePasswordChange} disabled={saving || isEditing} />

                </div>

                <h3 className="text-lg font-semibold px-1 mt-6">Notificações</h3>
                <div className="bg-card border border-border rounded-xl divide-y divide-border/50">
                    <div
                        onClick={toggleNotifications}
                        className="p-4 flex items-center justify-between hover:bg-muted/5 cursor-pointer transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium">Notificações Push</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn("text-xs font-medium px-2 py-1 rounded-full", isNotificationsEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                {isLoadingNotif ? '...' : (isNotificationsEnabled ? 'Ativado' : 'Desativado')}
                            </span>
                            <Bell size={16} className={isNotificationsEnabled ? "text-primary" : "text-muted-foreground/50"} />
                        </div>
                    </div>
                </div>

                {/* Theme Section */}
                <h3 className="text-lg font-semibold px-1 mt-6">Aparência</h3>
                <div className="bg-card border border-border rounded-xl p-4 space-y-4">
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
                                <span className="text-sm font-medium">{t.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 text-red-500 font-medium bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-colors mt-8 flex items-center justify-center gap-2"
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value, isEditing, editValue, onChange, field }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
                "bg-card border border-border/50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm relative overflow-hidden transition-all",
                isEditing && "border-primary/50 bg-primary/5 cursor-pointer hover:bg-primary/10 ring-2 ring-primary/20"
            )}
        >
            {isEditing && (
                <div className="absolute bottom-1 right-1 text-primary/50">
                    <Pencil size={10} />
                </div>
            )}
            <div className="p-2 bg-background rounded-full shadow-inner">
                {icon}
            </div>
            <div className="text-center w-full">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
                {isEditing ? (
                    <input
                        type="number"
                        step="1"
                        value={editValue || ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        className="w-full text-center font-bold bg-transparent border-b border-primary/30 focus:border-primary outline-none mt-1"
                        placeholder={value}
                    />
                ) : (
                    <p className="font-bold text-foreground">{value}</p>
                )}
            </div>
        </motion.div>
    )
}

function ActionRow({ label, value, icon, onClick, highlight }) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "p-4 flex items-center justify-between hover:bg-muted/5 cursor-pointer transition-colors",
                highlight && "bg-green-500/5 hover:bg-green-500/10"
            )}
        >
            <span className={cn("text-sm font-medium", highlight && "text-green-600")}>{label}</span>
            {value ? (
                <span className="text-xs text-muted-foreground">{value}</span>
            ) : icon ? (
                icon
            ) : (
                <User size={16} className="text-muted-foreground/50" />
            )}
        </div>
    )
}
