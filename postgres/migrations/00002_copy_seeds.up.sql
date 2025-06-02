COPY categoria_produto(id, nome, codigo)
FROM '/migrations/seed/product_categories.csv'
DELIMITER ','
CSV HEADER;

COPY produto(id, nome, preco, estoque, categoria_id_fk)
FROM '/migrations/seed/products.csv'
DELIMITER ','
CSV HEADER;

COPY cliente(id, nome, cpf, email, phone, created_at)
FROM '/migrations/seed/clients.csv'
DELIMITER ','
CSV HEADER;

COPY pedido(id, cliente_id_fk, total)
FROM '/migrations/seed/orders.csv'
DELIMITER ','
CSV HEADER;

COPY item_pedido(pedido_id_fk, produto_id_fk, quantidade, preco_unitario)
FROM '/migrations/seed/order_items.csv'
DELIMITER ','
CSV HEADER;

COPY status_pedido(id, nome)
FROM '/migrations/seed/order_statuses.csv'
DELIMITER ','
CSV HEADER;

COPY pedido_historico(pedido_id_fk, status_id_fk, created_at)
FROM '/migrations/seed/order_histories.csv'
DELIMITER ','
CSV HEADER;

COPY pagamento(id, pedido_id_fk, created_at)
FROM '/migrations/seed/payments.csv'
DELIMITER ','
CSV HEADER;

COPY status_pagamento(id, nome)
FROM '/migrations/seed/payment_statuses.csv'
DELIMITER ','
CSV HEADER;

COPY pagamento_historico(pagamento_id_fk, status_pagamento_id_fk, tipo, created_at)
FROM '/migrations/seed/payment_histories.csv'
DELIMITER ','
CSV HEADER;