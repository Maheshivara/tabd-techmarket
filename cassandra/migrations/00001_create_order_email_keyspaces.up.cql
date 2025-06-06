CREATE TABLE IF NOT EXISTS client_order_by_email (
    email TEXT,
    data_pedido TIMESTAMP,
    id_pedido UUID,
    status TEXT,
    valor_total DECIMAL,
    PRIMARY KEY (email, data_pedido)
) WITH CLUSTERING ORDER BY (data_pedido DESC);
