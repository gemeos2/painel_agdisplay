-- Adiciona a coluna 'email' à tabela 'table_clientes' se ela não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'table_clientes' AND COLUMN_NAME = 'email') THEN
        ALTER TABLE "table_clientes" ADD COLUMN "email" text;
    END IF;
END $$;
