-- Adicionar política para permitir que usuários vejam todos os perfis
-- (necessário para o admin listar alunos)

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Criar nova política permitindo que todos vejam todos os perfis
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

-- Nota: Se quiser restringir apenas para admins, você precisaria adicionar
-- uma coluna 'is_admin' na tabela profiles e usar:
-- CREATE POLICY "Admins can view all profiles" ON public.profiles
--     FOR SELECT USING (
--         auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true)
--     );
