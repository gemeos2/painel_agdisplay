import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ProgressRing } from '../components/ui/ProgressRing'
import { MealItem } from '../components/MealItem'
import { WaterTracker } from '../components/WaterTracker'
import RankUpModal from '../components/RankUpModal'
import { supabase } from '../services/supabase'
import { getRankInfo } from '../utils/rankSystem'
import { toggleMealCompletion, checkDayCompletion, getUserRankProgress, getTodayCompletions } from '../services/mealTracking'
import { getUserAssignedDiet } from '../services/dietService'
import { Bell } from 'lucide-react'

// Mock Data
const INITIAL_MEALS = [
    {
        id: 1,
        name: "Ovos Mexidos e Café",
        time: "08:00",
        calories: 300,
        completed: false,
        ingredients: [
            { name: "Ovos Grandes", amount: "3 un", substitutes: [{ name: "Ovos Médios", amount: "3 un" }] },
            { name: "Manteiga", amount: "10g", substitutes: [{ name: "Margarina", amount: "10g" }] },
            { name: "Café Preto", amount: "200ml" }
        ]
    },
    {
        id: 2,
        name: "Frango Grelhado com Salada",
        time: "12:30",
        calories: 450,
        completed: false,
        ingredients: [
            { name: "Peito de Frango", amount: "150g", substitutes: [{ name: "Sobrecoxa (sem pele)", amount: "150g" }] },
            { name: "Arroz Integral", amount: "100g", substitutes: [{ name: "Arroz Branco", amount: "100g" }] },
            { name: "Salada Variada", amount: "À vontade" },
            { name: "Azeite de Oliva", amount: "5ml", substitutes: [{ name: "Óleo de Soja", amount: "5ml" }] }
        ]
    },
    {
        id: 3,
        name: "Barra de Proteína",
        time: "16:00",
        calories: 150,
        completed: false,
        ingredients: [
            { name: "Barra Bold", amount: "1 un", substitutes: [{ name: "Ovo Cozido", amount: "2 un" }] }
        ]
    },
    {
        id: 4,
        name: "Whey Protein + Fruta",
        time: "19:00",
        calories: 250,
        completed: false,
        ingredients: [
            { name: "Whey Protein Concentrado", amount: "30g", substitutes: [{ name: "Proteína de Soja", amount: "30g" }] },
            { name: "Banana Prata", amount: "1 un" }
        ]
    },
    {
        id: 5,
        name: "Omelete de Claras",
        time: "22:00",
        calories: 200,
        completed: false,
        ingredients: [
            { name: "Claras de Ovo", amount: "150ml" },
            { name: "Espinafre", amount: "50g", substitutes: [{ name: "Couve", amount: "50g" }] },
            { name: "Queijo Cottage", amount: "30g", substitutes: [{ name: "Ricota", amount: "30g" }] }
        ]
    },
]

export default function Home() {
    const navigate = useNavigate()
    const [meals, setMeals] = useState([])
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
    const [loading, setLoading] = useState(true)
    const [water, setWater] = useState(0)
    const [showStickyBar, setShowStickyBar] = useState(false)
    const [expandedMealId, setExpandedMealId] = useState(null)

    // Rank system state
    const [userId, setUserId] = useState(null)
    const [rankProgress, setRankProgress] = useState(null)
    const [showRankUpModal, setShowRankUpModal] = useState(false)
    const [newRankInfo, setNewRankInfo] = useState(null)

    // Load user and rank data
    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            setUserId(user.id)

            // Check unread notifications
            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('read', false)

            setHasUnreadNotifications(count > 0)

            // Load assigned diet
            console.log('Fetching diet for user:', user.id)
            const assignedDiet = await getUserAssignedDiet(user.id)
            console.log('Assigned diet result:', assignedDiet)

            if (assignedDiet && assignedDiet.meals && assignedDiet.meals.length > 0) {
                setMeals(assignedDiet.meals)

                // Load today's completions
                const completedMealIds = await getTodayCompletions(user.id)
                setMeals(prev => prev.map(m => ({
                    ...m,
                    completed: completedMealIds.includes(String(m.id))
                })))
            } else {
                console.log('No meals found or no diet assigned')
                setMeals([])
            }

            // Load rank progress
            const progress = await getUserRankProgress(user.id)
            setRankProgress(progress)
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Realtime Subscription
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New notification received!', payload)
                    setHasUnreadNotifications(true)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [userId])

    useEffect(() => {
        const handleScroll = () => {
            setShowStickyBar(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleMealExpand = (id) => {
        setExpandedMealId(current => current === id ? null : id)
    }

    const toggleMeal = async (id) => {
        if (!userId) return

        const meal = meals.find(m => m.id === id)
        const newCompletedState = !meal.completed

        // Optimistic update
        setMeals(meals.map(m =>
            m.id === id ? { ...m, completed: newCompletedState } : m
        ))

        // Save to database
        await toggleMealCompletion(userId, String(id), newCompletedState)

        // Check if day is complete
        const updatedMeals = meals.map(m =>
            m.id === id ? { ...m, completed: newCompletedState } : m
        )
        const allCompleted = updatedMeals.every(m => m.completed)

        if (allCompleted) {
            const result = await checkDayCompletion(userId, meals.length)

            if (result.rankedUp) {
                setNewRankInfo(result.newRank)
                setShowRankUpModal(true)
            }

            // Refresh rank progress
            const progress = await getUserRankProgress(userId)
            setRankProgress(progress)
        }
    }

    const completedCount = meals.filter(m => m.completed).length
    const progress = meals.length > 0 ? (completedCount / meals.length) * 100 : 0
    const totalCalories = meals.reduce((acc, curr) => acc + curr.calories, 0)
    const consumedCalories = meals.filter(m => m.completed).reduce((acc, curr) => acc + curr.calories, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8">
            {/* Sticky Progress Bar */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border p-4 shadow-lg flex items-center justify-between"
                    >
                        <span className="text-sm font-semibold">Progresso Diário</span>
                        <div className="flex items-center gap-3 w-1/2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <span className="text-xs font-bold w-8 text-right">{Math.round(progress)}%</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-base font-bold text-foreground capitalize">
                        {format(new Date(), "dd 'de' MMMM", { locale: ptBR })}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {/* Notification Bell */}
                    <button
                        onClick={() => navigate('/app/notifications')}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors relative"
                    >
                        <Bell size={20} />
                        {hasUnreadNotifications && (
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                        )}
                    </button>

                    {/* Rank & Profile Component */}
                    <div className="flex items-center gap-3 bg-card border border-border/50 p-2 rounded-xl pr-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className="text-blue-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-medal"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>
                                </div>
                                <span className="text-sm font-bold font-mono">
                                    {rankProgress?.progressInRank || 0} <span className="text-muted-foreground">/</span> 15 dias
                                </span>
                                {rankProgress?.rankInfo?.current && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{
                                        backgroundColor: `${rankProgress.rankInfo.current.color}20`,
                                        color: rankProgress.rankInfo.current.color
                                    }}>
                                        {rankProgress.rankInfo.current.emoji} {rankProgress.rankInfo.current.name}
                                    </span>
                                )}
                            </div>
                            {/* Progress Bar */}
                            <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${rankProgress?.progressPercentage || 0}%`,
                                        backgroundColor: rankProgress?.rankInfo?.current?.color || '#3B82F6'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            G
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-primary/10 to-card border border-primary/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-2">
                        <span className="text-sm text-muted-foreground">Progresso Diário</span>
                        <div className="text-4xl font-black">{Math.round(progress)}%</div>
                        <div className="text-xs text-muted-foreground">
                            {consumedCalories} / {totalCalories} kcal
                        </div>
                    </div>
                    <ProgressRing progress={progress} size={100} strokeWidth={10} />
                </div>
            </div>

            {/* Water Tracker */}
            <WaterTracker
                current={water}
                onAdd={(amount) => setWater(prev => prev + amount)}
            />

            {/* Meals List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Refeições</h3>
                {meals.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
                        <div className="text-6xl">🍽️</div>
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Nenhuma dieta encontrada</h4>
                            <p className="text-muted-foreground text-sm">
                                Se você tem uma dieta atribuída, fale com seu nutricionista.
                            </p>
                            <p className="text-xs text-muted-foreground mt-4">
                                Debug: Verifique se a dieta possui refeições cadastradas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 pb-20">
                        {meals.map(meal => (
                            <MealItem
                                key={meal.id}
                                meal={meal}
                                onToggle={toggleMeal}
                                isExpanded={expandedMealId === meal.id}
                                onExpand={() => handleMealExpand(meal.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="h-20" /> {/* Spacer */}

            {/* Rank Up Modal */}
            <RankUpModal
                isOpen={showRankUpModal}
                onClose={() => setShowRankUpModal(false)}
                rankInfo={newRankInfo}
            />
        </div>
    )
}
