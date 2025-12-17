-- Add category and subcategory fields to diet_templates
ALTER TABLE public.diet_templates 
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS subcategory text;

-- Update existing diets to be in "Padrão" category
UPDATE public.diet_templates 
SET category = 'normal', subcategory = 'standard'
WHERE category IS NULL;

-- Now let's add more diet variations
-- For simplicity, I'll create a few key diets for each important subcategory

-- LACTOSE INTOLERANT DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('44444444-4444-4444-4444-444444444444', 'Perda de Gordura - Sem Lactose', 'Dieta com déficit calórico, sem lactose', 'Perder peso', 1250, 'restrictions', 'lactose'),
('55555555-5555-5555-5555-555555555555', 'Ganho de Massa - Sem Lactose', 'Dieta com superávit calórico, sem lactose', 'Ganhar massa', 3000, 'restrictions', 'lactose'),
('66666666-6666-6666-6666-666666666666', 'Manter Saúde - Sem Lactose', 'Dieta equilibrada sem lactose', 'Manter saúde', 1850, 'restrictions', 'lactose')
ON CONFLICT (id) DO NOTHING;

-- DIABETIC DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('77777777-7777-7777-7777-777777777777', 'Perda de Gordura - Diabético', 'Dieta com baixo índice glicêmico', 'Perder peso', 1250, 'health', 'diabetes'),
('88888888-8888-8888-8888-888888888888', 'Ganho de Massa - Diabético', 'Dieta com controle glicêmico', 'Ganhar massa', 3000, 'health', 'diabetes'),
('99999999-9999-9999-9999-999999999999', 'Manter Saúde - Diabético', 'Dieta equilibrada para diabéticos', 'Manter saúde', 1850, 'health', 'diabetes')
ON CONFLICT (id) DO NOTHING;

-- VEGETARIAN DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Perda de Gordura - Vegetariano', 'Dieta vegetariana com déficit calórico', 'Perder peso', 1250, 'restrictions', 'vegetarian'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ganho de Massa - Vegetariano', 'Dieta vegetariana com superávit calórico', 'Ganhar massa', 3000, 'restrictions', 'vegetarian'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Manter Saúde - Vegetariano', 'Dieta vegetariana equilibrada', 'Manter saúde', 1850, 'restrictions', 'vegetarian')
ON CONFLICT (id) DO NOTHING;

-- GLUTEN FREE DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Perda de Gordura - Sem Glúten', 'Dieta sem glúten com déficit calórico', 'Perder peso', 1250, 'restrictions', 'gluten'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ganho de Massa - Sem Glúten', 'Dieta sem glúten com superávit calórico', 'Ganhar massa', 3000, 'restrictions', 'gluten'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Manter Saúde - Sem Glúten', 'Dieta sem glúten equilibrada', 'Manter saúde', 1850, 'restrictions', 'gluten')
ON CONFLICT (id) DO NOTHING;

-- VEGAN DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('10101010-1010-1010-1010-101010101010', 'Perda de Gordura - Vegano', 'Dieta vegana com déficit calórico', 'Perder peso', 1250, 'restrictions', 'vegan'),
('20202020-2020-2020-2020-202020202020', 'Ganho de Massa - Vegano', 'Dieta vegana com superávit calórico', 'Ganhar massa', 3000, 'restrictions', 'vegan'),
('30303030-3030-3030-3030-303030303030', 'Manter Saúde - Vegano', 'Dieta vegana equilibrada', 'Manter saúde', 1850, 'restrictions', 'vegan')
ON CONFLICT (id) DO NOTHING;

-- HYPERTENSION DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('40404040-4040-4040-4040-404040404040', 'Perda de Gordura - Hipertensão', 'Dieta com baixo sódio', 'Perder peso', 1250, 'health', 'hypertension'),
('50505050-5050-5050-5050-505050505050', 'Ganho de Massa - Hipertensão', 'Dieta com controle de sódio', 'Ganhar massa', 3000, 'health', 'hypertension'),
('60606060-6060-6060-6060-606060606060', 'Manter Saúde - Hipertensão', 'Dieta equilibrada com baixo sódio', 'Manter saúde', 1850, 'health', 'hypertension')
ON CONFLICT (id) DO NOTHING;

-- CHOLESTEROL DIETS
INSERT INTO public.diet_templates (id, name, description, goal, total_calories, category, subcategory) VALUES
('70707070-7070-7070-7070-707070707070', 'Perda de Gordura - Colesterol', 'Dieta com baixo colesterol', 'Perder peso', 1250, 'health', 'cholesterol'),
('80808080-8080-8080-8080-808080808080', 'Ganho de Massa - Colesterol', 'Dieta com controle de colesterol', 'Ganhar massa', 3000, 'health', 'cholesterol'),
('90909090-9090-9090-9090-909090909090', 'Manter Saúde - Colesterol', 'Dieta equilibrada com baixo colesterol', 'Manter saúde', 1850, 'health', 'cholesterol')
ON CONFLICT (id) DO NOTHING;
