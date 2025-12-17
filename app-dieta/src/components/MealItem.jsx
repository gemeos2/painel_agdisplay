import React from 'react'
import { Checkbox } from './ui/Checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Flame, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

export function MealItem({ meal, onToggle, isExpanded, onExpand }) {
    const [showSubstitutes, setShowSubstitutes] = React.useState(false)

    // Reset substitutes view when collapsed
    React.useEffect(() => {
        if (!isExpanded) setShowSubstitutes(false)
    }, [isExpanded])

    const hasSubstitutes = meal.ingredients?.some(i => i.substitutes?.length > 0)

    console.log("has sub", hasSubstitutes)

    return (
        <div className="bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300">
            {/* Header / Main Card */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer active:bg-muted/50 transition-colors"
                onClick={onExpand}
            >
                <div className="flex items-center gap-4 overflow-hidden">
                    <div className="min-w-0">
                        <h4 className={cn("font-medium truncate transition-colors", meal.completed && "text-muted-foreground line-through")}>
                            {meal.name}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Clock size={10} /> {meal.time}</span>
                            <span className="flex items-center gap-1"><Flame size={10} /> {meal.calories} kcal</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Checkbox
                        checked={meal.completed}
                        onClick={(e) => {
                            e.stopPropagation()
                            onToggle(meal.id)
                        }}
                        className="h-6 w-6 rounded-full"
                    />
                    <ChevronDown
                        size={16}
                        className={cn("text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")}
                    />
                </div>
            </div>

            {/* Expanded Details (Accordion Content) */}
            <AnimatePresence initial={false}>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-4 pb-4 pt-0 text-sm">
                            <div className="pt-4 border-t border-border/50 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                                        {showSubstitutes ? "Substitutos" : "Ingredientes"}
                                    </p>

                                    {hasSubstitutes && (
                                        <button
                                            onClick={() => setShowSubstitutes(!showSubstitutes)}
                                            className={cn(
                                                "text-xs px-2 py-1 rounded-md transition-colors flex items-center gap-1.5 font-medium border",
                                                showSubstitutes
                                                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                    : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                                            )}
                                        >
                                            {showSubstitutes ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                                                    Original
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left-right"><path d="M8 3 4 7l4 4" /><path d="M4 7h16" /><path d="m16 21 4-4-4-4" /><path d="M20 17H4" /></svg>
                                                    Substituto
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                <ul className="space-y-2">
                                    {meal.ingredients?.map((ing, idx) => {
                                        const substitute = ing.substitutes?.[0]
                                        const shouldShowSubstitute = showSubstitutes && substitute

                                        return (
                                            <li key={idx} className="flex justify-between items-center text-foreground/80">
                                                <div className="flex items-center gap-2">
                                                    {shouldShowSubstitute && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                                    )}
                                                    <span className={cn(shouldShowSubstitute && "text-green-600 font-medium")}>
                                                        {shouldShowSubstitute ? substitute.name : ing.name}
                                                    </span>
                                                </div>
                                                <span className={cn("text-muted-foreground", shouldShowSubstitute && "text-green-600/70")}>
                                                    {shouldShowSubstitute ? substitute.amount : ing.amount}
                                                </span>
                                            </li>
                                        )
                                    }) || <p className="text-muted-foreground italic">Sem ingredientes listados.</p>}
                                </ul>

                                {showSubstitutes && (
                                    <p className="text-[10px] text-green-600/80 text-center italic mt-2 bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                                        Opções para quem busca economia ou possui restrições alimentares.
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
