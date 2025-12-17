import { supabase } from '../services/supabase'
import { getRankInfo, didRankUp } from '../utils/rankSystem'

/**
 * Mark a meal as completed for today
 */
export async function toggleMealCompletion(userId, mealId, isCompleted) {
    const today = new Date().toISOString().split('T')[0]

    try {
        if (isCompleted) {
            // Mark as completed
            const { error } = await supabase
                .from('meal_completions')
                .insert({
                    user_id: userId,
                    date: today,
                    meal_id: mealId
                })

            if (error && error.code !== '23505') throw error // Ignore duplicate errors
        } else {
            // Unmark
            const { error } = await supabase
                .from('meal_completions')
                .delete()
                .eq('user_id', userId)
                .eq('date', today)
                .eq('meal_id', mealId)

            if (error) throw error
        }

        return { success: true }
    } catch (error) {
        console.error('Error toggling meal completion:', error)
        return { success: false, error }
    }
}

/**
 * Check if all meals are completed for today and update rank if needed
 */
export async function checkDayCompletion(userId, totalMeals) {
    const today = new Date().toISOString().split('T')[0]

    try {
        // Get today's completions
        const { data: completions, error: fetchError } = await supabase
            .from('meal_completions')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)

        if (fetchError) throw fetchError

        // Check if all meals are completed
        if (completions.length === totalMeals) {
            // Get current profile data
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('completed_days, last_completed_date')
                .eq('id', userId)
                .single()

            if (profileError) throw profileError

            // Only increment if this is a new day
            if (profile.last_completed_date !== today) {
                const oldDays = profile.completed_days || 0
                const newDays = oldDays + 1
                const newRank = getRankInfo(newDays).current.name

                // Update profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        completed_days: newDays,
                        current_rank: newRank,
                        last_completed_date: today
                    })
                    .eq('id', userId)

                if (updateError) throw updateError

                // Check if ranked up
                const rankedUp = didRankUp(oldDays, newDays)

                if (rankedUp) {
                    await supabase.from('notifications').insert({
                        user_id: userId,
                        type: 'rank',
                        title: 'Novo Ranking!',
                        message: `Parabéns! Você alcançou o nível ${getRankInfo(newDays).current.name}.`,
                        read: false
                    })
                }

                return {
                    dayCompleted: true,
                    rankedUp,
                    newRank: rankedUp ? getRankInfo(newDays).current : null,
                    completedDays: newDays
                }
            }
        }

        return { dayCompleted: false }
    } catch (error) {
        console.error('Error checking day completion:', error)
        return { dayCompleted: false, error }
    }
}

/**
 * Get user's rank progress
 */
export async function getUserRankProgress(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('completed_days, current_rank')
            .eq('id', userId)
            .single()

        if (error) throw error

        const completedDays = data?.completed_days || 0
        const rankInfo = getRankInfo(completedDays)

        return {
            completedDays,
            currentRank: data?.current_rank || 'BRONZE',
            rankInfo,
            progressInRank: rankInfo.progressInRank,
            progressPercentage: (rankInfo.progressInRank / 15) * 100
        }
    } catch (error) {
        console.error('Error fetching rank progress:', error)
        return null
    }
}

/**
 * Get today's meal completions
 */
export async function getTodayCompletions(userId) {
    const today = new Date().toISOString().split('T')[0]

    try {
        const { data, error } = await supabase
            .from('meal_completions')
            .select('meal_id')
            .eq('user_id', userId)
            .eq('date', today)

        if (error) throw error

        return data.map(c => c.meal_id)
    } catch (error) {
        console.error('Error fetching today completions:', error)
        return []
    }
}
