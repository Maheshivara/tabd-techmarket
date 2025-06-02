DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_pagamento') THEN
    CREATE TYPE "tipo_pagamento" AS ENUM (
      'CARTAO',
      'PIX',
      'BOLETO'
    );
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS "cliente" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "cpf" varchar(11) UNIQUE NOT NULL,
  "nome" varchar(50) NOT NULL,
  "email" varchar(255) NOT NULL,
  "phone" varchar(11) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE IF NOT EXISTS "categoria_produto" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(20),
  "codigo" varchar(4) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "produto" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(100) NOT NULL,
  "preco" float NOT NULL,
  "categoria_id_fk" uuid NOT NULL,
  "estoque" int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "status_pedido" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "pedido" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "cliente_id_fk" uuid NOT NULL,
  "total" float NOT NULL
);

CREATE TABLE IF NOT EXISTS "pedido_historico" (
  "pedido_id_fk" uuid NOT NULL,
  "status_id_fk" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY ("pedido_id_fk", "status_id_fk")
);

CREATE TABLE IF NOT EXISTS "item_pedido" (
  "produto_id_fk" uuid NOT NULL,
  "pedido_id_fk" uuid NOT NULL,
  "quantidade" int NOT NULL DEFAULT 1,
  "preco_unitario" float NOT NULL,
  PRIMARY KEY ("produto_id_fk", "pedido_id_fk")
);

CREATE TABLE IF NOT EXISTS "status_pagamento" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "nome" varchar(20) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "pagamento" (
  "id" uuid PRIMARY KEY NOT NULL DEFAULT (gen_random_uuid()),
  "pedido_id_fk" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE IF NOT EXISTS "pagamento_historico" (
  "pagamento_id_fk" uuid NOT NULL,
  "status_pagamento_id_fk" uuid NOT NULL,
  "tipo" tipo_pagamento NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY ("pagamento_id_fk", "status_pagamento_id_fk")
);

ALTER TABLE "produto" ADD FOREIGN KEY ("categoria_id_fk") REFERENCES "categoria_produto" ("id");
ALTER TABLE "pedido" ADD FOREIGN KEY ("cliente_id_fk") REFERENCES "cliente" ("id");
ALTER TABLE "pedido_historico" ADD FOREIGN KEY ("pedido_id_fk") REFERENCES "pedido" ("id");
ALTER TABLE "pedido_historico" ADD FOREIGN KEY ("status_id_fk") REFERENCES "status_pedido" ("id");
ALTER TABLE "item_pedido" ADD FOREIGN KEY ("produto_id_fk") REFERENCES "produto" ("id");
ALTER TABLE "item_pedido" ADD FOREIGN KEY ("pedido_id_fk") REFERENCES "pedido" ("id");
ALTER TABLE "pagamento" ADD FOREIGN KEY ("pedido_id_fk") REFERENCES "pedido" ("id");
ALTER TABLE "pagamento_historico" ADD FOREIGN KEY ("pagamento_id_fk") REFERENCES "pagamento" ("id");
ALTER TABLE "pagamento_historico" ADD FOREIGN KEY ("status_pagamento_id_fk") REFERENCES "status_pagamento" ("id");
