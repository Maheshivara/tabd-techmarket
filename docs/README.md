# Alunos

- José Bezerra Pinheiro Neto
- Luis Gabriel da Costa Silva

# Migrações

Para realizar a configuração e inserção de dados foi possível verificar o tempo (em segundos) para a inserção dos dados solicitados:

- 20000 clientes
- 5000 produtos
- 30000 pedidos
- 60000 ~ 150000 itens de pedidos (de 2 a 5 para cada pedido)
- 30000 pagamentos

É possível verificar uma representação visual dos esquemas usados para o Postgres [aqui](./postgres/schema.png) e para o Mongo [aqui](./mongo/schema.png), infelizmente não encontramos uma ferramenta para representação visual do esquema do Cassandra.

| ID  | Postgres | Mongo | Cassandra |
| :-: | :------: | :---: | :-------: |
|  1  |  11.98   | 4.15  |  584.40   |
|  2  |  13.75   | 3.79  |  582.19   |
|  3  |  12.63   | 4.02  |  597.64   |
|  4  |  11.58   | 4.12  |  583.56   |
|  5  |  12.82   | 3.57  |  582.72   |

Podemos facilmente verificar que a absência de um método de inserção em `batch` no Cassandra afeta consideravelmente o tempo necessário para popular o banco.

O mongo, mesmo sendo configurado para usar `validators` se mostrou ser o mais performático dos 3 quando se tratando de inserção de dados.

# Queries

Abaixo se encontra as queries realizadas bem como o tempo de 5 execuções (em milissegundos) para os 3 bancos de dados.

## Postgres

### Q1

```sql
SELECT c.id, c.nome, p.id, p.total FROM cliente AS c JOIN pedido AS p ON c.id = p.cliente_id_fk JOIN pedido_historico AS ph ON p.id = ph.pedido_id_fk WHERE c.email = 'Thelma64@hotmail.com' ORDER BY ph.created_at DESC LIMIT 3;
```

| ID  | Tempo |
| --- | ----- |
| 1   | 108   |
| 2   | 280   |
| 3   | 162   |
| 4   | 227   |
| 5   | 61    |

### Q2

```sql
SELECT p.id, p.nome, p.preco FROM produto AS p JOIN categoria_produto AS c ON p.categoria_id_fk = c.id WHERE c.id = 'fdd68e00-79e7-4112-87e0-38b37a0cd838' ORDER BY p.preco;
```

| ID  | Tempo |
| --- | ----- |
| 1   | 278   |
| 2   | 241   |
| 3   | 93    |
| 4   | 165   |
| 5   | 250   |

### Q3

```sql
SELECT ph.pedido_id_fk AS pedido_id FROM pedido_historico AS ph JOIN pedido AS p ON ph.pedido_id_fk = p.id JOIN cliente AS c ON p.cliente_id_fk = c.id WHERE c.id = '7936bc18-36c7-4f19-b712-30164eb36b0c' AND ph.status_id_fk ='b5ad5afb-22b4-4c2f-b81e-4930584e6842';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 297   |
| 2   | 316   |
| 3   | 86    |
| 4   | 53    |
| 5   | 130   |

### Q4

```sql
SELECT p.id, p.nome, SUM(ip.quantidade) AS venda_total FROM produto AS p JOIN item_pedido AS ip ON p.id = ip.produto_id_fk GROUP BY p.id, p.nome ORDER BY venda_total DESC LIMIT 5;
```

| ID  | Tempo |
| --- | ----- |
| 1   | 175   |
| 2   | 87    |
| 3   | 300   |
| 4   | 362   |
| 5   | 150   |

### Q5

```sql
SELECT p.id, ph.created_at, ph.tipo FROM pagamento AS p JOIN pagamento_historico AS ph ON p.id = ph.pagamento_id_fk WHERE ph.tipo = 'PIX' AND ph.created_at >= '2025-05-01' AND ph.created_at <= '2025-05-31';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 300   |
| 2   | 100   |
| 3   | 221   |
| 4   | 265   |
| 5   | 156   |

### Q6

```sql
SELECT SUM(pe.total) AS total_gasto FROM pagamento AS p JOIN pedido AS pe ON p.pedido_id_fk = pe.id JOIN pagamento_historico AS ph ON p.id = ph.pagamento_id_fk WHERE pe.cliente_id_fk = '529206c3-fb3a-4d4b-8b1f-ae5b70b2131a' AND ph.created_at >= '2025-02-01' AND ph.created_at <= '2025-05-31';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 255   |
| 2   | 350   |
| 3   | 355   |
| 4   | 140   |
| 5   | 120   |

## Mongo

### Q1

```js
const email = "Gaston.Renner@hotmail.com";
const cliente = db.cliente.findOne({ email });
db.pedido
  .find({ cliente_id_fk: cliente._id })
  .sort({ created_at: -1 })
  .limit(3)
  .toArray();
```

| ID  | Tempo |
| --- | ----- |
| 1   | 349   |
| 2   | 468   |
| 3   | 422   |
| 4   | 456   |
| 5   | 424   |

### Q2

```js
const nomeCategoria = "Alimentos";
db.produto
  .find({ "categoria.nome": nomeCategoria })
  .sort({ preco: 1 })
  .toArray();
```

| ID  | Tempo |
| --- | ----- |
| 1   | 806   |
| 2   | 898   |
| 3   | 817   |
| 4   | 672   |
| 5   | 623   |

### Q3

```js
const clienteId = ObjectId("684372018ec0c7356ffb4ee1");
db.pedido
  .find({
    cliente_id_fk: clienteId,
    "status.nome": "ENTREGUE",
  })
  .toArray();
```

| ID  | Tempo |
| --- | ----- |
| 1   | 389   |
| 2   | 385   |
| 3   | 345   |
| 4   | 332   |
| 5   | 298   |

### Q4

```js
db.pedido
  .aggregate([
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product_id_fk",
        quantidade_total: { $sum: "$items.quantidade" },
      },
    },
    { $sort: { quantidade_total: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "produto",
        localField: "_id",
        foreignField: "_id",
        as: "produto",
      },
    },
    { $unwind: "$produto" },
    {
      $project: {
        _id: 0,
        produto: "$produto.nome",
        quantidade_total: 1,
      },
    },
  ])
  .toArray();
```

| ID  | Tempo |
| --- | ----- |
| 1   | 529   |
| 2   | 516   |
| 3   | 508   |
| 4   | 730   |
| 5   | 692   |

### Q5

```js
const init = new Date("2025-05-01");
const end = new Date("2025-06-01");
db.pedido
  .aggregate([
    { $unwind: "$pagamento" },
    {
      $match: {
        "pagamento.tipo": "PIX",
        "pagamento.status.created_at": { $gte: init, $lte: end },
      },
    },
    {
      $project: {
        _id: 0,
        pagamento: 1,
        pedido_id: "$_id",
      },
    },
  ])
  .toArray();
```

| ID  | Tempo |
| --- | ----- |
| 1   | 928   |
| 2   | 683   |
| 3   | 726   |
| 4   | 1003  |
| 5   | 964   |

### Q6

```js
const clienteId = ObjectId("684372018ec0c7356ffb5ef5");
const inicio = new Date("2025-03-01");
const fim = new Date("2025-06-01");

db.pedido
  .aggregate([
    {
      $match: {
        cliente_id_fk: clienteId,
        created_at: { $gte: inicio, $lte: fim },
      },
    },
    {
      $group: {
        _id: clienteId,
        totalGasto: { $sum: "$total" },
      },
    },
  ])
  .toArray();
```

| ID  | Tempo |
| --- | ----- |
| 1   | 444   |
| 2   | 442   |
| 3   | 549   |
| 4   | 350   |
| 5   | 617   |

## Cassandra

### Q1

```sql
SELECT id_pedido, data_pedido, status, valor_total
FROM client_order_by_email
WHERE email = 'Roslyn59@yahoo.com'
LIMIT 3;
```

| ID  | Tempo |
| --- | ----- |
| 1   | 295   |
| 2   | 185   |
| 3   | 40    |
| 4   | 297   |
| 5   | 47    |

### Q2

```sql
SELECT id_produto, nome, preco, estoque
FROM product_by_category
WHERE categoria = 'Clothing';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 311   |
| 2   | 323   |
| 3   | 338   |
| 4   | 305   |
| 5   | 203   |

### Q3

```sql
SELECT id_pedido, data_pedido, valor_total
FROM client_order_by_status
WHERE id_cliente = bd2d7728-a737-43ce-bad2-f2e01ece5c4d
  AND status = 'ENTREGUE';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 275   |
| 2   | 119   |
| 3   | 56    |
| 4   | 187   |
| 5   | 182   |

### Q4

```sql
SELECT * FROM most_sold_products;
```

| ID  | Tempo |
| --- | ----- |
| 1   | 105   |
| 2   | 154   |
| 3   | 226   |
| 4   | 300   |
| 5   | 367   |

### Q5

```sql
SELECT data_pagamento, id_pagamento, id_pedido, valor
FROM payment_by_type
WHERE tipo = 'BOLETO' AND ano_mes = '2025_05';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 244   |
| 2   | 62    |
| 3   | 242   |
| 4   | 174   |
| 5   | 347   |

### Q6

```sql
SELECT data_pedido, valor_total
FROM client_expense_by_period
WHERE id_cliente = b667d469-fc57-46e4-baeb-70c17998ed1e
  AND ano_mes = '2024_12';
```

| ID  | Tempo |
| --- | ----- |
| 1   | 96    |
| 2   | 225   |
| 3   | 23    |
| 4   | 96    |
| 5   | 197   |

## Comparativo

Comparando as médias de tempos (em ms) temos:

|  Q  | Postgres | Mongo | Cassandra |
| :-: | :------: | :---: | :-------: |
|  1  |  167.6   | 423.8 |   172.8   |
|  2  |  205.4   | 763.2 |   296.0   |
|  3  |  176.4   | 349.8 |   163.8   |
|  4  |  214.8   | 595.0 |   230.4   |
|  5  |  208.4   | 860.8 |   213.8   |
|  6  |  244.0   | 480.4 |   127.4   |

## Conclusão

Por meio desses resultados é possível concluir que claramente o Cassandra possui mais desempenho quando se tratando de recuperar dados (principalmente pelo seu esquema ser orientado a consulta), seguido pelo Postgres, provavelmente em função de que o esquema que utilizamos no Mongo foi mais próximo de um banco de dados relacional do que orientado a consultas.

É importante destacar que embora haja grande diferença do desempenho entre os bancos seja na escrita ou leitura, cada um deles possui um propósito diferente e deve ser escolhido conforme a necessidade do projeto, vale ressaltar que não se faz necessário se limitar a apenas um banco de dados, podendo facilmente usar vários estilos de representação de dados no mesmo projeto.
