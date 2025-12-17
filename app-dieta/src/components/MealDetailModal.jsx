import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Flame } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

export function MealDetailModal({ meal, isOpen, onClose, onToggle }) {
    if (!isOpen || !meal) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[59]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-0 right-0 bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[60] bg-card border border-border md:rounded-xl rounded-t-3xl shadow-2xl p-6 md:w-full md:max-w-md max-h-[85vh] overflow-y-auto"
                    >
                        <div className="absolute top-4 right-4">
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-primary font-medium text-sm">
                                    <Clock className="h-4 w-4" />
                                    <span>{meal.time}</span>
                                </div>
                                <h2 className="text-2xl font-bold leading-tight">{meal.name}</h2>
                                <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                                    <Flame className="h-4 w-4" />
                                    <span>{meal.calories} kcal</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-semibold border-b border-border pb-2">Ingredientes</h3>
                                <ul className="space-y-3">
                                    {meal.ingredients?.map((ing, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm">
                                            <span>{ing.name}</span>
                                            <span className="font-medium text-muted-foreground">{ing.amount}</span>
                                        </li>
                                    )) || <p className="text-muted-foreground italic">Sem detalhes.</p>}
                                </ul>
                            </div>

                            <div className="pt-4">
                                <Button
                                    className={cn("w-full h-12 text-base font-semibold", meal.completed && "bg-muted text-muted-foreground hover:bg-muted/80")}
                                    onClick={() => {
                                        onToggle(meal.id)
                                        onClose()
                                    }}
                                >
                                    {meal.completed ? 'Desmarcar Refeição' : 'Concluir Refeição'}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}
