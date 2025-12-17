-- 1. Add rank system fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_days integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_rank text DEFAULT 'BRONZE',
ADD COLUMN IF NOT EXISTS last_completed_date date;

-- 2. Create meal_completions table to track daily progress
CREATE TABLE IF NOT EXISTS public.meal_completions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    meal_id uuid NOT NULL,
    completed_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, date, meal_id)
);

-- 3. Enable RLS for meal_completions
ALTER TABLE public.meal_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own meal completions" ON public.meal_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal completions" ON public.meal_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal completions" ON public.meal_completions
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Function to calculate rank based on completed days
CREATE OR REPLACE FUNCTION get_rank_from_days(days integer)
RETURNS text AS $$
BEGIN
    CASE
        WHEN days < 15 THEN RETURN 'BRONZE';
        WHEN days < 30 THEN RETURN 'PRATA';
        WHEN days < 45 THEN RETURN 'OURO';
        WHEN days < 60 THEN RETURN 'PLATINA';
        WHEN days < 75 THEN RETURN 'DIAMANTE';
        WHEN days < 90 THEN RETURN 'GRÃO-MESTRE';
        WHEN days < 105 THEN RETURN 'LENDÁRIO';
        WHEN days < 120 THEN RETURN 'SUPREMO';
        WHEN days < 135 THEN RETURN 'ASCENDENTE';
        ELSE RETURN 'IMORTAL';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_meal_completions_user_date 
    ON public.meal_completions(user_id, date);
