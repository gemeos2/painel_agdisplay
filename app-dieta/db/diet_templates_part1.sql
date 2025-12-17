-- 1. Create diet_templates table
CREATE TABLE IF NOT EXISTS public.diet_templates (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    goal text NOT NULL,
    total_calories integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. Create diet_meals table
CREATE TABLE IF NOT EXISTS public.diet_meals (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    diet_template_id uuid REFERENCES public.diet_templates(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    time text NOT NULL,
    calories integer NOT NULL,
    meal_order integer NOT NULL
);

-- 3. Create meal_ingredients table
CREATE TABLE IF NOT EXISTS public.meal_ingredients (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    diet_meal_id uuid REFERENCES public.diet_meals(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    amount text NOT NULL,
    substitute_name text,
    substitute_amount text,
    ingredient_order integer DEFAULT 0
);

-- 4. Add assigned_diet_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_diet_id uuid REFERENCES public.diet_templates(id);

-- 5. Enable RLS
ALTER TABLE public.diet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (everyone can read diets, only admins can modify)
CREATE POLICY "Anyone can view diet templates" ON public.diet_templates
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view diet meals" ON public.diet_meals
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view meal ingredients" ON public.meal_ingredients
    FOR SELECT USING (true);

-- 7. Insert Diet Templates
INSERT INTO public.diet_templates (id, name, description, goal, total_calories) VALUES
('11111111-1111-1111-1111-111111111111', 'Perda de Gordura', 'Dieta com déficit calórico, alta em proteínas', 'Perder peso', 1250),
('22222222-2222-2222-2222-222222222222', 'Ganho de Massa', 'Dieta com superávit calórico, alta em proteínas e carboidratos', 'Ganhar massa', 3000),
('33333333-3333-3333-3333-333333333333', 'Manter Saúde', 'Dieta equilibrada para manutenção', 'Manter saúde', 1850);

-- 8. Insert Meals for "Perda de Gordura"
INSERT INTO public.diet_meals (diet_template_id, name, time, calories, meal_order) VALUES
('11111111-1111-1111-1111-111111111111', 'Café da Manhã', '08:00', 300, 1),
('11111111-1111-1111-1111-111111111111', 'Almoço', '12:30', 450, 2),
('11111111-1111-1111-1111-111111111111', 'Lanche da Tarde', '16:00', 150, 3),
('11111111-1111-1111-1111-111111111111', 'Jantar', '19:00', 350, 4);

-- 9. Insert Ingredients for "Perda de Gordura" - Café da Manhã
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Ovos Mexidos', '3 un', 'Ovos Cozidos', '3 un', 1 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Café Preto', '200ml', 2 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Pão Integral', '1 fatia', 'Tapioca', '1 un', 3 FROM public.diet_meals WHERE name = 'Café da Manhã' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

-- 10. Insert Ingredients for "Perda de Gordura" - Almoço
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Peito de Frango Grelhado', '150g', 'Sobrecoxa sem pele', '150g', 1 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Arroz Integral', '100g', 'Arroz Branco', '100g', 2 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Salada Variada', 'À vontade', 3 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Azeite de Oliva', '5ml', 'Óleo de Soja', '5ml', 4 FROM public.diet_meals WHERE name = 'Almoço' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

-- 11. Insert Ingredients for "Perda de Gordura" - Lanche
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Whey Protein', '30g', 1 FROM public.diet_meals WHERE name = 'Lanche da Tarde' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Banana', '1 un', 'Maçã', '1 un', 2 FROM public.diet_meals WHERE name = 'Lanche da Tarde' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

-- 12. Insert Ingredients for "Perda de Gordura" - Jantar
INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Peixe Grelhado', '150g', 'Frango Grelhado', '150g', 1 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, substitute_name, substitute_amount, ingredient_order)
SELECT id, 'Batata Doce', '100g', 'Mandioca', '100g', 2 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO public.meal_ingredients (diet_meal_id, name, amount, ingredient_order)
SELECT id, 'Brócolis', 'À vontade', 3 FROM public.diet_meals WHERE name = 'Jantar' AND diet_template_id = '11111111-1111-1111-1111-111111111111';

-- Continue with other diets in next file...
