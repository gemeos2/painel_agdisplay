import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy } from 'lucide-react'
import { Button } from './ui/Button'

export default function RankUpModal({ isOpen, onClose, rankInfo }) {
    if (!rankInfo) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="bg-gradient-to-br from-card to-card/80 border-2 border-primary rounded-3xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto relative overflow-hidden">
                            {/* Decorative background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
                            >
                                <X size={24} />
                            </button>

                            {/* Content */}
                            <div className="relative z-10 text-center space-y-6">
                                {/* Trophy animation */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: 'spring', damping: 10 }}
                                    className="flex justify-center"
                                >
                                    <div className="relative">
                                        <Trophy size={80} className="text-primary drop-shadow-lg" />
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: [0, 1.2, 1] }}
                                            transition={{ delay: 0.4, duration: 0.5 }}
                                            className="absolute -top-2 -right-2 text-4xl"
                                        >
                                            {rankInfo.emoji}
                                        </motion.div>
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <div>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-3xl font-bold mb-2"
                                        style={{ color: rankInfo.color }}
                                    >
                                        {rankInfo.name}
                                    </motion.h2>
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-muted-foreground"
                                    >
                                        Nova patente desbloqueada!
                                    </motion.p>
                                </div>

                                {/* Message */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-foreground/80 text-sm"
                                >
                                    Parabéns! Você completou {rankInfo.min} dias de dieta e alcançou a patente <strong>{rankInfo.name}</strong>!
                                </motion.p>

                                {/* Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button onClick={onClose} className="w-full">
                                        Continuar
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
