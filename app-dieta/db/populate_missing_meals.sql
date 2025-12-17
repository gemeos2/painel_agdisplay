-- Script to populate missing meals for specialized diets
-- It copies meals and ingredients from the "Standard" templates (Fat Loss, Muscle Gain, Health)
-- into the empty specialized templates (Lactose Free, Vegan, etc.) matching by goal.

DO $$
DECLARE
    target_diet RECORD;
    source_diet_id UUID;
    new_meal_id UUID;
    meal_record RECORD;
BEGIN
    -- Loop through all diets that don't have meals yet
    FOR target_diet IN 
        SELECT d.* 
        FROM diet_templates d
        WHERE NOT EXISTS (SELECT 1 FROM diet_meals m WHERE m.diet_template_id = d.id)
    LOOP
        -- Determine source diet based on goal
        -- Using the known IDs of the standard templates
        IF target_diet.goal = 'Perder peso' THEN
            source_diet_id := '11111111-1111-1111-1111-111111111111';
        ELSIF target_diet.goal = 'Ganhar massa' THEN
            source_diet_id := '22222222-2222-2222-2222-222222222222';
        ELSIF target_diet.goal = 'Manter saúde' THEN
            source_diet_id := '33333333-3333-3333-3333-333333333333';
        ELSE
            -- Verify if goal matches simplified string or handle discrepancies
            -- The goals in add_diet_categories.sql are consistent: 'Perder peso', 'Ganhar massa', 'Manter saúde'
            RAISE NOTICE 'Skipping diet % (%) because goal % is not recognized', target_diet.name, target_diet.id, target_diet.goal;
            CONTINUE;
        END IF;

        RAISE NOTICE 'Populating diet: % (%) using source %', target_diet.name, target_diet.id, source_diet_id;

        -- Copy meals
        FOR meal_record IN 
             SELECT * FROM diet_meals WHERE diet_template_id = source_diet_id ORDER BY meal_order
        LOOP
            INSERT INTO diet_meals (diet_template_id, name, time, calories, meal_order)
            VALUES (target_diet.id, meal_record.name, meal_record.time, meal_record.calories, meal_record.meal_order)
            RETURNING id INTO new_meal_id;

            -- Copy ingredients for this meal
            INSERT INTO meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
            SELECT new_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order
            FROM meal_ingredients
            WHERE diet_meal_id = meal_record.id;
        END LOOP;
        
    END LOOP;
END $$;
