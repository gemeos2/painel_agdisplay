-- Adiciona a coluna 'cpf' à tabela 'table_clientes'
ALTER TABLE "table_clientes" ADD COLUMN IF NOT EXISTS "cpf" text;
