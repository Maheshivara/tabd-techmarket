ALTER TABLE "pagamento_historico" DROP CONSTRAINT IF EXISTS "pagamento_historico_pagamento_id_fk_fkey";
ALTER TABLE "pagamento_historico" DROP CONSTRAINT IF EXISTS "pagamento_historico_status_pagamento_id_fk_fkey";
ALTER TABLE "item_pedido" DROP CONSTRAINT IF EXISTS "item_pedido_produto_id_fk_fkey";
ALTER TABLE "item_pedido" DROP CONSTRAINT IF EXISTS "item_pedido_pedido_id_fk_fkey";
ALTER TABLE "pedido_historico" DROP CONSTRAINT IF EXISTS "pedido_historico_pedido_id_fk_fkey";
ALTER TABLE "pedido_historico" DROP CONSTRAINT IF EXISTS "pedido_historico_status_id_fk_fkey";
ALTER TABLE "pagamento" DROP CONSTRAINT IF EXISTS "pagamento_pedido_id_fk_fkey";
ALTER TABLE "pedido" DROP CONSTRAINT IF EXISTS "pedido_cliente_id_fk_fkey";
ALTER TABLE "produto" DROP CONSTRAINT IF EXISTS "produto_categoria_id_fk_fkey";

DROP TABLE IF EXISTS "pagamento_historico";
DROP TABLE IF EXISTS "pagamento";
DROP TABLE IF EXISTS "status_pagamento";
DROP TABLE IF EXISTS "item_pedido";
DROP TABLE IF EXISTS "pedido_historico";
DROP TABLE IF EXISTS "pedido";
DROP TABLE IF EXISTS "status_pedido";
DROP TABLE IF EXISTS "produto";
DROP TABLE IF EXISTS "categoria_produto";
DROP TABLE IF EXISTS "cliente";

DROP TYPE IF EXISTS "tipo_pagamento";