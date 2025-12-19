-- Proteção Extra: Blindar as outras tabelas que apareceram no print

-- 1. Tabela de Automações
ALTER TABLE "automacoes_clientes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas usuários logados podem ver automacoes"
ON "automacoes_clientes" FOR ALL TO authenticated USING (true);

-- 2. Tabela de Documentos
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apenas usuários logados podem ver documentos"
ON "documents" FOR ALL TO authenticated USING (true);

-- Nota: Como essas tabelas não são usadas no site público, 
-- travar o acesso apenas para quem tem login é a opção mais segura.
