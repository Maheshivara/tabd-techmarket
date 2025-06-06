CREATE TABLE IF NOT EXISTS product_by_category (
    categoria TEXT,
    preco DECIMAL,
    id_produto UUID,
    nome TEXT,
    estoque INT,
    PRIMARY KEY (categoria, preco, id_produto)
) WITH CLUSTERING ORDER BY (preco ASC);
