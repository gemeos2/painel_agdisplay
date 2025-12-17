import { supabase } from './supabase'

/**
 * Get all available diet templates
 */
export async function getAllDietTemplates() {
    try {
        const { data, error } = await supabase
            .from('diet_templates')
            .select('*')
            .order('name')

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error fetching diet templates:', error)
        return []
    }
}

/**
 * Get diets by category and subcategory
 */
export async function getDietsByCategory(category, subcategory) {
    try {
        const { data, error } = await supabase
            .from('diet_templates')
            .select('*')
            .eq('category', category)
            .eq('subcategory', subcategory)
            .order('goal')

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error fetching diets by category:', error)
        return []
    }
}

/**
 * Get user's assigned diet with all meals and ingredients
 */
export async function getUserAssignedDiet(userId) {
    try {
        // Get user's assigned diet ID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('assigned_diet_id')
            .eq('id', userId)
            .single()

        if (profileError) throw profileError
        if (!profile?.assigned_diet_id) return null

        // Get diet template
        const { data: diet, error: dietError } = await supabase
            .from('diet_templates')
            .select('*')
            .eq('id', profile.assigned_diet_id)
            .single()

        if (dietError) throw dietError

        // Get meals for this diet
        const { data: meals, error: mealsError } = await supabase
            .from('diet_meals')
            .select('*')
            .eq('diet_template_id', profile.assigned_diet_id)
            .order('meal_order')

        if (mealsError) throw mealsError

        // Get ingredients for each meal
        const mealsWithIngredients = await Promise.all(
            meals.map(async (meal) => {
                const { data: ingredients, error: ingredientsError } = await supabase
                    .from('meal_ingredients')
                    .select('*')
                    .eq('diet_meal_id', meal.id)
                    .order('ingredient_order')

                if (ingredientsError) throw ingredientsError

                // Format ingredients to match MealItem component structure
                const formattedIngredients = ingredients.map(ing => ({
                    name: ing.name,
                    amount: ing.amount,
                    substitutes: ing.substitute_name ? [{
                        name: ing.substitute_name,
                        amount: ing.substitute_amount
                    }] : []
                }))

                return {
                    id: meal.id,
                    name: meal.name,
                    time: meal.time,
                    calories: meal.calories,
                    completed: false,
                    ingredients: formattedIngredients
                }
            })
        )

        return {
            diet,
            meals: mealsWithIngredients
        }
    } catch (error) {
        console.error('Error fetching user assigned diet:', error)
        return null
    }
}

/**
 * Assign a diet to a user
 */
export async function assignDietToUser(userId, dietTemplateId) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ assigned_diet_id: dietTemplateId })
            .eq('id', userId)

        if (error) throw error

        // Trigger notification
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'diet',
            title: 'Nova Dieta',
            message: 'O nutricionista atualizou seu plano alimentar.',
            read: false
        })

        return { success: true }
    } catch (error) {
        console.error('Error assigning diet:', error)
        return { success: false, error }
    }
}

/**
 * Get all users/students (for admin)
 */
export async function getAllStudents() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name')

        if (error) {
            console.error('Supabase error:', error)
            throw error
        }

        console.log('Students fetched:', data)
        return data || []
    } catch (error) {
        console.error('Error fetching students:', error)
        return []
    }
}

/**
 * Get student details by ID
 */
export async function getStudentById(studentId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .single()

        if (error) {
            console.error('Supabase error:', error)
            throw error
        }

        console.log('Student fetched:', data)
        return data
    } catch (error) {
        console.error('Error fetching student:', error)
        return null
    }
}

/**
 * Update student goal
 */
export async function updateStudentGoal(userId, newGoal) {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({ goal: newGoal })
            .eq('id', userId)

        if (error) throw error

        // Trigger notification
        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'goal',
            title: 'Novo Objetivo!',
            message: `Seu objetivo foi atualizado para: ${newGoal}.`,
            read: false
        })

        return { success: true }
    } catch (error) {
        console.error('Error updating student goal:', error)
        return { success: false, error }
    }
}
