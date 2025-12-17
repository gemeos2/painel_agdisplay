// Rank system utilities

export const RANKS = [
    { name: 'BRONZE', min: 0, max: 15, color: '#CD7F32', emoji: '🥉' },
    { name: 'PRATA', min: 15, max: 30, color: '#C0C0C0', emoji: '🥈' },
    { name: 'OURO', min: 30, max: 45, color: '#FFD700', emoji: '🥇' },
    { name: 'PLATINA', min: 45, max: 60, color: '#E5E4E2', emoji: '💎' },
    { name: 'DIAMANTE', min: 60, max: 75, color: '#B9F2FF', emoji: '💠' },
    { name: 'GRÃO-MESTRE', min: 75, max: 90, color: '#FF6B6B', emoji: '👑' },
    { name: 'LENDÁRIO', min: 90, max: 105, color: '#9B59B6', emoji: '⚡' },
    { name: 'SUPREMO', min: 105, max: 120, color: '#F39C12', emoji: '🔥' },
    { name: 'ASCENDENTE', min: 120, max: 135, color: '#3498DB', emoji: '🌟' },
    { name: 'IMORTAL', min: 135, max: 150, color: '#E74C3C', emoji: '👹' },
]

/**
 * Get rank info based on completed days
 */
export function getRankInfo(completedDays) {
    const rank = RANKS.find(r => completedDays >= r.min && completedDays < r.max) || RANKS[RANKS.length - 1]
    const progressInRank = completedDays - rank.min
    const nextRankIndex = RANKS.findIndex(r => r.name === rank.name) + 1
    const nextRank = nextRankIndex < RANKS.length ? RANKS[nextRankIndex] : null

    return {
        current: rank,
        progressInRank, // 0-14
        daysToNextRank: nextRank ? (nextRank.min - completedDays) : 0,
        nextRank,
        isMaxRank: !nextRank
    }
}

/**
 * Check if user just ranked up
 */
export function didRankUp(oldDays, newDays) {
    const oldRank = getRankInfo(oldDays).current.name
    const newRank = getRankInfo(newDays).current.name
    return oldRank !== newRank
}

/**
 * Get congratulations message for rank up
 */
export function getRankUpMessage(rankName) {
    const messages = {
        'PRATA': 'Você alcançou a patente PRATA! Continue assim! 🥈',
        'OURO': 'Incrível! Você é OURO agora! 🥇',
        'PLATINA': 'Patente PLATINA desbloqueada! Você está arrasando! 💎',
        'DIAMANTE': 'DIAMANTE! Sua dedicação é brilhante! 💠',
        'GRÃO-MESTRE': 'GRÃO-MESTRE! Você é uma lenda viva! 👑',
        'LENDÁRIO': 'LENDÁRIO! Poucos chegam tão longe! ⚡',
        'SUPREMO': 'SUPREMO! Você transcendeu os limites! 🔥',
        'ASCENDENTE': 'ASCENDENTE! Você está entre os melhores! 🌟',
        'IMORTAL': 'IMORTAL! Você atingiu o ápice absoluto! 👹',
    }
    return messages[rankName] || 'Parabéns pela nova patente!'
}
