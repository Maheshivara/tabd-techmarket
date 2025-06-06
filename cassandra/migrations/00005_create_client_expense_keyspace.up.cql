CREATE TABLE IF NOT EXISTS client_expense_by_period (
    id_cliente UUID,
    ano_mes TEXT,
    data_pedido TIMESTAMP,
    valor_total DECIMAL,
    PRIMARY KEY ((id_cliente, ano_mes), data_pedido)
) WITH CLUSTERING ORDER BY (data_pedido DESC);
