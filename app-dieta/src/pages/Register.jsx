import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { supabase } from '../services/supabase'

export default function Register() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        goal: ''
    })

    const [showSuccess, setShowSuccess] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert("As senhas não coincidem")
            return
        }
        if (!formData.goal) {
            alert("Por favor, selecione seu objetivo")
            return
        }

        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        goal: formData.goal,
                    },
                },
            })

            if (error) throw error
            setShowSuccess(true)
        } catch (error) {
            console.error("Erro ao cadastrar:", error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (showSuccess) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-background text-foreground max-w-md mx-auto relative overflow-hidden text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <UserPlus className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Verifique seu e-mail</h2>
                        <p className="text-muted-foreground">
                            Enviamos um link de confirmação para <strong>{formData.email}</strong>.
                            <br />
                            Clique nele para ativar sua conta e entrar.
                        </p>
                    </div>
                    <Button onClick={() => navigate('/')} className="w-full">
                        Voltar para Login
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-background text-foreground max-w-md mx-auto relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full z-10 space-y-8"
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                        <UserPlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold tracking-tight">Crie sua conta</h1>
                        <p className="text-muted-foreground mt-2">Comece sua jornada hoje.</p>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-3">
                        <Input
                            name="fullName"
                            type="text"
                            placeholder="Nome completo"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        <Input
                            name="email"
                            type="email"
                            placeholder="Seu e-mail"
                            required
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <Input
                            name="password"
                            type="password"
                            placeholder="Senha"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <Input
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirmar senha"
                            required
                            minLength={6}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />

                        {/* Goal Selection */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-muted-foreground">Qual é o seu objetivo?</label>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, goal: 'Perder peso' })}
                                    className={`p-3 rounded-lg border-2 transition-all ${formData.goal === 'Perder peso'
                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    🔥 Perder peso
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, goal: 'Ganhar massa' })}
                                    className={`p-3 rounded-lg border-2 transition-all ${formData.goal === 'Ganhar massa'
                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    💪 Ganhar massa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, goal: 'Manter saúde' })}
                                    className={`p-3 rounded-lg border-2 transition-all ${formData.goal === 'Manter saúde'
                                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                                            : 'border-border hover:border-primary/50'
                                        }`}
                                >
                                    ✨ Manter saúde
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Cadastrar'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Já tem uma conta?{' '}
                    <Link to="/" className="text-primary font-medium hover:underline">
                        Faça login
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
