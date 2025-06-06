
CREATE TABLE IF NOT EXISTS most_sold_products (
    id_produto UUID PRIMARY KEY,
    nome TEXT,
    categoria TEXT,
    total_vendido INT
);