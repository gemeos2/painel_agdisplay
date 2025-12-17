import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { supabase } from '../services/supabase'

export default function Login() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState(null)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrorMessage(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Check if admin (Mock check for now, or based on email)
            if (email === 'admin@dieta.com') {
                navigate('/admin')
            } else {
                navigate('/app')
            }
        } catch (error) {
            console.error("Erro ao entrar:", error)

            // Tratamento específico de erro para feedback melhor
            if (error.message.includes("Invalid login credentials")) {
                setErrorMessage("E-mail não encontrado ou senha incorreta. Revise seus dados.")
            } else if (error.message.includes("Email not confirmed")) {
                setErrorMessage("Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.")
            } else {
                // Mostra o erro real para podermos debugar
                setErrorMessage(`Erro desconhecido: ${error.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen items-center justify-center p-6 bg-background text-foreground max-w-md mx-auto relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-10%] left-[-20%] w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-20%] w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full z-10 space-y-8"
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                        <UtensilsCrossed className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">AppDieta</h1>
                        <p className="text-muted-foreground mt-2">Seu app de dieta.</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="email"
                            placeholder="Seu e-mail"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            type="password"
                            placeholder="Sua senha"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {errorMessage && (
                        <div className="text-red-500 text-sm font-medium text-center">
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                            Esqueceu a senha?
                        </Link>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <Link to="/register" className="text-primary font-medium hover:underline">
                        Cadastre-se
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}
