import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, Scale, Ruler, Calendar, User, Target, ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { getStudentById, getAllDietTemplates, assignDietToUser, getDietsByCategory, updateStudentGoal } from '../../services/dietService'
import DietsList from '../../components/DietsList'
import { Pencil } from 'lucide-react'

// Diet categories structure
const DIET_CATEGORIES = [
    {
        id: 'normal',
        name: 'Dietas Normais',
        subcategories: [
            { id: 'standard', name: 'Padrão', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] }
        ]
    },
    {
        id: 'restrictions',
        name: 'Restrições Alimentares',
        subcategories: [
            { id: 'lactose', name: 'Intolerante a Lactose', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] },
            { id: 'gluten', name: 'Intolerante a Glúten', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] },
            { id: 'vegetarian', name: 'Vegetariano', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] },
            { id: 'vegan', name: 'Vegano', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] }
        ]
    },
    {
        id: 'health',
        name: 'Condições de Saúde',
        subcategories: [
            { id: 'diabetes', name: 'Diabético', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] },
            { id: 'hypertension', name: 'Hipertensão', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] },
            { id: 'cholesterol', name: 'Colesterol Alto', goals: ['Perder peso', 'Ganhar massa', 'Manter saúde'] }
        ]
    }
]

export default function AdminClientDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [student, setStudent] = useState(null)
    const [dietTemplates, setDietTemplates] = useState([])
    const [selectedDietId, setSelectedDietId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Accordion states
    const [openCategory, setOpenCategory] = useState(null)
    const [openSubcategory, setOpenSubcategory] = useState(null)

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            const [studentData, templates] = await Promise.all([
                getStudentById(id),
                getAllDietTemplates()
            ])

            setStudent(studentData)
            setDietTemplates(templates)
            setSelectedDietId(studentData?.assigned_diet_id || null)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveDiet = async () => {
        if (!selectedDietId) {
            alert('Selecione uma dieta')
            return
        }

        setSaving(true)
        try {
            const result = await assignDietToUser(id, selectedDietId)
            if (result.success) {
                alert('Dieta atribuída com sucesso!')
                loadData()
            } else {
                alert('Erro ao atribuir dieta')
            }
        } catch (error) {
            console.error('Error assigning diet:', error)
            alert('Erro ao atribuir dieta')
        } finally {
            setSaving(false)
        }
    }



    const toggleCategory = (categoryId) => {
        setOpenCategory(openCategory === categoryId ? null : categoryId)
        setOpenSubcategory(null)
    }

    const toggleSubcategory = (subcategoryId) => {
        setOpenSubcategory(openSubcategory === subcategoryId ? null : subcategoryId)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Carregando...</div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-muted-foreground">Aluno não encontrado</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/clients')}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Detalhes do Aluno</h1>
                    <p className="text-sm text-muted-foreground">Gerencie a dieta do aluno</p>
                </div>
            </div>

            {/* Student Info Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="text-primary" size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{student.full_name || 'Sem nome'}</h2>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <StatCard
                        icon={<Calendar className="text-blue-500" size={20} />}
                        label="Idade"
                        value={student.age ? `${student.age} anos` : 'Não informado'}
                    />
                    <StatCard
                        icon={<Ruler className="text-indigo-500" size={20} />}
                        label="Altura"
                        value={student.height ? `${student.height}cm` : 'Não informado'}
                    />
                    <StatCard
                        icon={<Scale className="text-rose-500" size={20} />}
                        label="Peso"
                        value={student.weight ? `${student.weight}kg` : 'Não informado'}
                    />
                    <StatCard
                        icon={<Target className="text-green-500" size={20} />}
                        label="Objetivo"
                        value={student.goal || 'Não informado'}
                    />
                </div>
            </div>

            {/* Diet Assignment Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <h3 className="text-lg font-semibold">Atribuir Dieta</h3>

                {/* Current Diet */}
                {student.assigned_diet_id && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-1">Dieta Atual</p>
                        <p className="font-semibold text-primary">
                            {dietTemplates.find(d => d.id === student.assigned_diet_id)?.name || 'Dieta atribuída'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {dietTemplates.find(d => d.id === student.assigned_diet_id)?.description || ''}
                        </p>
                    </div>
                )}

                {/* Diet Categories Accordion */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Selecionar Nova Dieta</label>

                    {DIET_CATEGORIES.map(category => (
                        <div key={category.id} className="border border-border rounded-lg overflow-hidden">
                            {/* Category Header */}
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                                <span className="font-semibold">{category.name}</span>
                                <ChevronDown
                                    className={`transition-transform ${openCategory === category.id ? 'rotate-180' : ''}`}
                                    size={20}
                                />
                            </button>

                            {/* Subcategories */}
                            <AnimatePresence>
                                {openCategory === category.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        {category.subcategories.map(subcategory => (
                                            <div key={subcategory.id} className="border-t border-border">
                                                {/* Subcategory Header */}
                                                <button
                                                    onClick={() => toggleSubcategory(subcategory.id)}
                                                    className="w-full p-3 pl-8 flex items-center justify-between hover:bg-muted/30 transition-colors"
                                                >
                                                    <span className="text-sm font-medium">{subcategory.name}</span>
                                                    <ChevronDown
                                                        className={`transition-transform ${openSubcategory === subcategory.id ? 'rotate-180' : ''}`}
                                                        size={18}
                                                    />
                                                </button>

                                                {/* Diets List */}
                                                <AnimatePresence>
                                                    {openSubcategory === subcategory.id && (
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: 'auto' }}
                                                            exit={{ height: 0 }}
                                                            className="overflow-hidden bg-background"
                                                        >
                                                            <DietsList
                                                                category={category.id}
                                                                subcategory={subcategory.id}
                                                                selectedDietId={selectedDietId}
                                                                onSelectDiet={setSelectedDietId}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Save Button */}
                <Button
                    onClick={handleSaveDiet}
                    disabled={saving || !selectedDietId || selectedDietId === student.assigned_diet_id}
                    className="w-full"
                >
                    {saving ? 'Salvando...' : 'Salvar Dieta'}
                </Button>
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }) {
    return (
        <div className="bg-muted/30 border border-border/50 p-4 rounded-xl flex flex-col items-center gap-2">
            <div className="p-2 bg-background rounded-full">
                {icon}
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium uppercase">{label}</p>
                <p className="font-bold text-sm">{value}</p>
            </div>
        </div>
    )
}
