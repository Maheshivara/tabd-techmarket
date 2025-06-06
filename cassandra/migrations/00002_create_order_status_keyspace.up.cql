CREATE TABLE IF NOT EXISTS client_order_by_status (
    id_cliente UUID,
    status TEXT,
    data_pedido TIMESTAMP,
    id_pedido UUID,
    valor_total DECIMAL,
    PRIMARY KEY ((id_cliente, status), data_pedido)
) WITH CLUSTERING ORDER BY (data_pedido DESC);