-- Insert Meals for "Ganho de Massa"
INSERT INTO public.diet_meals (diet_template_id, name, time, calories, meal_order) VALUES
('22222222-2222-2222-2222-222222222222', 'Café da Manhã', '07:00', 600, 1),
('22222222-2222-2222-2222-222222222222', 'Lanche da Manhã', '10:00', 300, 2),
('22222222-2222-2222-2222-222222222222', 'Almoço', '13:00', 800, 3),
('22222222-2222-2222-2222-222222222222', 'Lanche Pré-Treino', '16:00', 400, 4),
('22222222-2222-2222-2222-222222222222', 'Jantar', '20:00', 700, 5),
('22222222-2222-2222-2222-222222222222', 'Ceia', '22:00', 200, 6);

-- Ganho de Massa - Café da Manhã
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Ovos Mexidos', '4 un', 1 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Aveia', '60g', 2 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Banana', '1 un', 3 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Pasta de Amendoim', '20g', 4 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

-- Ganho de Massa - Lanche da Manhã
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Whey Protein', '40g', 1 FROM public.diet_meals WHERE name = 'Lanche da Manhã' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Batata Doce', '100g', 2 FROM public.diet_meals WHERE name = 'Lanche da Manhã' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

-- Ganho de Massa - Almoço
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Frango Grelhado', '200g', 1 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Arroz Branco', '150g', 2 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Feijão', '100g', 3 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Salada', 'À vontade', 4 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

-- Ganho de Massa - Lanche Pré-Treino
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Pão Integral', '2 fatias', 1 FROM public.diet_meals WHERE name = 'Lanche Pré-Treino' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Atum', '1 lata', 2 FROM public.diet_meals WHERE name = 'Lanche Pré-Treino' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Banana', '1 un', 3 FROM public.diet_meals WHERE name = 'Lanche Pré-Treino' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

-- Ganho de Massa - Jantar
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Carne Vermelha', '200g', 'Frango', '200g', 1 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Macarrão Integral', '150g', 2 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Legumes', 'À vontade', 3 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

-- Ganho de Massa - Ceia
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Iogurte Grego', '200g', 1 FROM public.diet_meals WHERE name = 'Ceia' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Granola', '30g', 2 FROM public.diet_meals WHERE name = 'Ceia' AND diet_template_id = '22222222-2222-2222-2222-222222222222';

-- Insert Meals for "Manter Saúde"
INSERT INTO public.diet_meals (diet_template_id, name, time, calories, meal_order) VALUES
('33333333-3333-3333-3333-333333333333', 'Café da Manhã', '08:00', 400, 1),
('33333333-3333-3333-3333-333333333333', 'Lanche da Manhã', '10:30', 150, 2),
('33333333-3333-3333-3333-333333333333', 'Almoço', '12:30', 600, 3),
('33333333-3333-3333-3333-333333333333', 'Lanche da Tarde', '16:00', 200, 4),
('33333333-3333-3333-3333-333333333333', 'Jantar', '19:30', 500, 5);

-- Manter Saúde - Café da Manhã
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Ovos Cozidos', '2 un', 1 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Pão Integral', '2 fatias', 2 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Café com Leite', '200ml', 3 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

-- Manter Saúde - Lanche da Manhã
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Fruta', '1 un', 1 FROM public.diet_meals WHERE name = 'Lanche da Manhã' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Castanhas', '20g', 2 FROM public.diet_meals WHERE name = 'Lanche da Manhã' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

-- Manter Saúde - Almoço
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Frango', '150g', 'Peixe', '150g', 1 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Arroz Integral', '120g', 2 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Feijão', '80g', 3 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Salada', 'À vontade', 4 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

-- Manter Saúde - Lanche da Tarde
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Iogurte Natural', '150g', 1 FROM public.diet_meals WHERE name = 'Lanche da Tarde' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Granola', '20g', 2 FROM public.diet_meals WHERE name = 'Lanche da Tarde' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

-- Manter Saúde - Jantar
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Proteína (Frango/Peixe)', '150g', 1 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Batata', '100g', 'Mandioca', '100g', 2 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '33333333-3333-3333-3333-333333333333';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Legumes', 'À vontade', 3 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '33333333-3333-3333-3333-333333333333';
