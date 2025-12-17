import React, { useState, useEffect } from 'react'
import { getDietsByCategory } from '../services/dietService'

export default function DietsList({ category, subcategory, selectedDietId, onSelectDiet }) {
    const [diets, setDiets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadDiets()
    }, [category, subcategory])

    const loadDiets = async () => {
        setLoading(true)
        const data = await getDietsByCategory(category, subcategory)
        setDiets(data)
        setLoading(false)
    }

    if (loading) {
        return <div className="p-3 pl-12 text-sm text-muted-foreground">Carregando...</div>
    }

    if (diets.length === 0) {
        return <div className="p-3 pl-12 text-sm text-muted-foreground">Nenhuma dieta disponível</div>
    }

    return (
        <div className="p-3 pl-12 space-y-2">
            {diets.map(diet => (
                <button
                    key={diet.id}
                    onClick={() => onSelectDiet(diet.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedDietId === diet.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                        }`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-sm">{diet.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{diet.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                                    {diet.goal}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    ~{diet.total_calories} kcal/dia
                                </span>
                            </div>
                        </div>
                        {selectedDietId === diet.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    )
}
