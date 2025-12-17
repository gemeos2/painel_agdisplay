import React from 'react'
import { Plus, Droplets } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

export function WaterTracker({ current = 0, goal = 2500, onAdd }) {
    const percentage = Math.min((current / goal) * 100, 100)

    return (
        <div className="bg-gradient-to-br from-blue-950/90 to-blue-900/80 border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden">
            {/* Background bubbles effect */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Droplets size={80} className="text-blue-400" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-blue-100 font-medium flex items-center gap-2">
                            <Droplets size={16} className="text-blue-400" />
                            Hidratação
                        </h3>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white">{current}</span>
                            <span className="text-sm text-blue-200/60">/ {goal} ml</span>
                        </div>
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                        {Math.round(percentage)}%
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-4 w-full bg-blue-950/50 rounded-full overflow-hidden border border-blue-500/10">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                </div>

                {/* Controls */}
                <div className="flex gap-2 pt-2">
                    <QuickAddButton amount={200} onClick={() => onAdd(200)} />
                    <QuickAddButton amount={500} onClick={() => onAdd(500)} />
                    <QuickAddButton amount={1000} label="1L" onClick={() => onAdd(1000)} />
                </div>
            </div>
        </div>
    )
}

function QuickAddButton({ amount, label, onClick }) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className={cn(
                "flex-1 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:text-blue-100 text-blue-200 h-10 px-0",
                "transition-all active:scale-95"
            )}
        >
            <Plus size={14} className="mr-1" />
            {label || `${amount}ml`}
        </Button>
    )
}
