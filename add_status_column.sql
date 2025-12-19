-- Adiciona a coluna 'status' à tabela 'table_clientes'
ALTER TABLE "table_clientes" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'agendado';

-- Atualiza registros existentes para 'agendado' se o status for nulo
UPDATE "table_clientes" SET "status" = 'agendado' WHERE "status" IS NULL;
