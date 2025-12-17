-- Script to ADD SUBSTITUTES to standard diets and RE-POPULATE specialized diets

DO $$
DECLARE
    muscle_diet_id UUID := '22222222-2222-2222-2222-222222222222';
    health_diet_id UUID := '33333333-3333-3333-3333-333333333333';
    
    target_diet RECORD;
    source_diet_id UUID;
    new_meal_id UUID;
    meal_record RECORD;
BEGIN
    -------------------------------------------------------------------------
    -- 1. UPDATE SUBSTITUTES FOR "GANHO DE MASSA" (MUSCLE GAIN)
    -------------------------------------------------------------------------
    RAISE NOTICE 'Updating substitutes for Muscle Gain...';

    -- Café da Manhã
    UPDATE meal_ingredients SET substitute_name = 'Ovos Cozidos', substitute_amount = '4 un'
    WHERE name = 'Ovos Mexidos' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Granola sem açúcar', substitute_amount = '60g'
    WHERE name = 'Aveia' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Maçã', substitute_amount = '1 un'
    WHERE name = 'Banana' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id AND name = 'Café da Manhã');

    UPDATE meal_ingredients SET substitute_name = 'Mix de Castanhas', substitute_amount = '20g'
    WHERE name = 'Pasta de Amendoim' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    -- Lanche da Manhã
    UPDATE meal_ingredients SET substitute_name = 'Albumina', substitute_amount = '40g'
    WHERE name = 'Whey Protein' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Banana da Terra', substitute_amount = '100g'
    WHERE name = 'Batata Doce' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    -- Almoço
    UPDATE meal_ingredients SET substitute_name = 'Patinho Moído', substitute_amount = '200g'
    WHERE name = 'Frango Grelhado' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Macarrão', substitute_amount = '150g'
    WHERE name = 'Arroz Branco' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Lentilha', substitute_amount = '100g'
    WHERE name = 'Feijão' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    -- Lanche Pré-Treino
    UPDATE meal_ingredients SET substitute_name = 'Rap10 Integral', substitute_amount = '1 un'
    WHERE name = 'Pão Integral' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Frango Desfiado', substitute_amount = '100g'
    WHERE name = 'Atum' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    -- Jantar (names might vary slightly, using LIKE for safety)
    UPDATE meal_ingredients SET substitute_name = 'Arroz Branco', substitute_amount = '150g'
    WHERE name = 'Macarrão Integral' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    -- Ceia
    UPDATE meal_ingredients SET substitute_name = 'Whey Protein', substitute_amount = '30g'
    WHERE name = 'Iogurte Grego' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = muscle_diet_id);

    -------------------------------------------------------------------------
    -- 2. UPDATE SUBSTITUTES FOR "MANTER SAÚDE" (HEALTH MAINTENANCE)
    -------------------------------------------------------------------------
    RAISE NOTICE 'Updating substitutes for Health Maintenance...';

    -- Café da Manhã
    UPDATE meal_ingredients SET substitute_name = 'Ovos Mexidos', substitute_amount = '2 un'
    WHERE name = 'Ovos Cozidos' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = health_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Tapioca', substitute_amount = '1 un'
    WHERE name = 'Pão Integral' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = health_diet_id);

    -- Lanche
    UPDATE meal_ingredients SET substitute_name = 'Iogurte', substitute_amount = '170g'
    WHERE name = 'Fruta' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = health_diet_id);

    -- Almoço
    UPDATE meal_ingredients SET substitute_name = 'Batata Inglesa', substitute_amount = '120g'
    WHERE name LIKE 'Arroz%' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = health_diet_id);

    UPDATE meal_ingredients SET substitute_name = 'Grão de Bico', substitute_amount = '80g'
    WHERE name = 'Feijão' AND diet_meal_id IN (SELECT id FROM diet_meals WHERE diet_template_id = health_diet_id);


    -------------------------------------------------------------------------
    -- 3. RE-POPULATE SPECIALIZED DIETS
    -------------------------------------------------------------------------
    RAISE NOTICE 'Clearing and re-populating specialized diets...';

    -- Identify derived diets (all except the 3 standard ones)
    FOR target_diet IN 
        SELECT * FROM diet_templates 
        WHERE id NOT IN (
            '11111111-1111-1111-1111-111111111111', 
            '22222222-2222-2222-2222-222222222222', 
            '33333333-3333-3333-3333-333333333333'
        )
    LOOP
        -- DELETE existing meals for this derived diet to ensure clean slate
        DELETE FROM diet_meals WHERE diet_template_id = target_diet.id;

        -- Determine source
        IF target_diet.goal = 'Perder peso' THEN
            source_diet_id := '11111111-1111-1111-1111-111111111111';
        ELSIF target_diet.goal = 'Ganhar massa' THEN
            source_diet_id := '22222222-2222-2222-2222-222222222222';
        ELSIF target_diet.goal = 'Manter saúde' THEN
            source_diet_id := '33333333-3333-3333-3333-333333333333';
        ELSE
            CONTINUE;
        END IF;

        -- Copy everything again (movies + ingredients with new substitutes)
        FOR meal_record IN 
             SELECT * FROM diet_meals WHERE diet_template_id = source_diet_id ORDER BY meal_order
        LOOP
            INSERT INTO diet_meals (diet_template_id, name, time, calories, meal_order)
            VALUES (target_diet.id, meal_record.name, meal_record.time, meal_record.calories, meal_record.meal_order)
            RETURNING id INTO new_meal_id;

            INSERT INTO meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
            SELECT new_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order
            FROM meal_ingredients
            WHERE diet_meal_id = meal_record.id;
        END LOOP;
        
    END LOOP;

    RAISE NOTICE 'Done!';
END $$;
