-- 1. Ativa a segurança a nível de linha (RLS)
ALTER TABLE "table_clientes" ENABLE ROW LEVEL SECURITY;

-- 2. Remove políticas antigas (se existirem) para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura publica" ON "table_clientes";
DROP POLICY IF EXISTS "Public access" ON "table_clientes";

-- 3. Cria a nova política BLINDADA
-- Só permite SELECT (leitura) se o usuário estiver logado (authenticated)
CREATE POLICY "Apenas usuários logados podem ver clientes"
ON "table_clientes"
FOR SELECT
TO authenticated
USING (true);

-- 4. (Opcional) Política para permitir Insert/Update/Delete apenas para usuários logados
CREATE POLICY "Usuários logados podem modificar clientes"
ON "table_clientes"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
