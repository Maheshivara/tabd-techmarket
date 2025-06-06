import { fa, faker } from "@faker-js/faker";
import * as fcsv from "fast-csv";
import * as path from "path";
import * as fs from "fs";
import {
  ICassandraProductByCategory,
  ICassandraProductBySold,
  IMongoProduct,
  IProduct,
  IProductCategory,
} from "./interfaces/product";
import { IClient, IMongoClient } from "./interfaces/client";
import {
  ICassandraOrderByEmail,
  ICassandraOrderByExpense,
  ICassandraOrderByStatus,
  IMongoOrder,
  IOrder,
  IOrderHistory,
  IOrderItem,
  IOrderStatus,
} from "./interfaces/order";
import {
  ICassandraPaymentByType,
  IPayment,
  IPaymentHistory,
  IPaymentStatus,
  PaymentType,
} from "./interfaces/payment";
import { Double, EJSON, EJSONOptions, ObjectId } from "bson";
import { create } from "domain";

function replacer(key: string, value: any) {
  return value;
}

function generateSeedData() {
  const categoryCodes: string[] = [];
  const productCategories: IProductCategory[] = faker.helpers.uniqueArray(
    () => {
      const id = faker.string.uuid();
      const name = faker.commerce.department();
      let code: string;
      do {
        code = faker.string.alpha({ length: 3 }).toUpperCase();
      } while (categoryCodes.includes(code));
      categoryCodes.push(code);
      return {
        id,
        name,
        code,
      };
    },
    50
  );

  const products: IProduct[] = [];
  for (const category of productCategories) {
    faker.helpers
      .uniqueArray(() => {
        const id = faker.string.uuid();
        const name = faker.commerce.productName();
        const price = parseFloat(
          faker.commerce.price({ min: 10, max: 1000, dec: 2 })
        );
        const stock = faker.number.int({ min: 0, max: 100 });
        return {
          id,
          name,
          price,
          stock,
          categoryId: category.id,
        };
      }, 100)
      .forEach((product) => products.push(product));
  }

  const clients: IClient[] = faker.helpers.uniqueArray(() => {
    const id = faker.string.uuid();
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const phone = faker.helpers.replaceSymbols("###########");
    const cpf = faker.helpers.replaceSymbols("###########");
    return {
      id,
      name,
      cpf,
      email,
      phone,
      createdAt: faker.date.past(),
    };
  }, 20000);

  const orders: IOrder[] = [];
  const orderItems: IOrderItem[] = [];
  for (const client of clients) {
    faker.helpers
      .uniqueArray(() => {
        const id = faker.string.uuid();
        const availableProducts = faker.helpers
          .shuffle(products)
          .slice(0, faker.number.int({ min: 1, max: 5 }));
        const items = availableProducts.map((product) => ({
          productId: product.id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: product.price,
        }));
        items.forEach((item) => {
          orderItems.push({
            orderId: id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          });
        });
        const totalAmount = parseFloat(
          items
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)
        );
        return {
          id,
          clientId: client.id,
          totalAmount,
        };
      }, 2)
      .forEach((order) => orders.push(order));
  }
  const orderStatuses: IOrderStatus[] = [
    { id: faker.string.uuid(), name: "PENDENTE" },
    { id: faker.string.uuid(), name: "PROCESSANDO" },
    { id: faker.string.uuid(), name: "ENVIADO" },
    { id: faker.string.uuid(), name: "ENTREGUE" },
    { id: faker.string.uuid(), name: "CANCELADO" },
  ];

  const orderHistories: IOrderHistory[] = [];
  for (const order of orders) {
    orderHistories.push({
      orderId: order.id,
      statusId: faker.helpers.arrayElement(orderStatuses).id,
      createdAt: faker.date.past(),
    });
  }

  const payments: IPayment[] = [];
  for (const order of orders) {
    faker.helpers
      .uniqueArray(() => {
        const id = faker.string.uuid();
        return {
          id,
          orderId: order.id,
          createdAt: faker.date.past(),
        };
      }, 2)
      .forEach((payment) => payments.push(payment));
  }

  const paymentStatuses = [
    { id: faker.string.uuid(), name: "PENDENTE" },
    { id: faker.string.uuid(), name: "COMPLETO" },
    { id: faker.string.uuid(), name: "FALHO" },
  ];

  const paymentHistory: IPaymentHistory[] = [];
  for (const payment of payments) {
    paymentHistory.push({
      paymentId: payment.id,
      statusId: faker.helpers.arrayElement(paymentStatuses).id,
      type: faker.helpers.arrayElement(Object.values(PaymentType)),
      createdAt: faker.date.past(),
    });
  }

  const basePath = path.resolve(__dirname, "../../seed");
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  createPostgresSeeds(
    basePath,
    products,
    productCategories,
    clients,
    orders,
    orderItems,
    orderHistories,
    orderStatuses,
    payments,
    paymentHistory,
    paymentStatuses
  );
  createMongoSeeds(basePath);
  createCassandraSeeds(
    basePath,
    products,
    productCategories,
    clients,
    orders,
    orderItems,
    orderHistories,
    orderStatuses,
    payments,
    paymentHistory,
    paymentStatuses
  );
  console.log("Seed data generation completed.");
}

function createPostgresSeeds(
  basePath: string,
  products: IProduct[],
  productCategories: IProductCategory[],
  clients: IClient[],
  orders: IOrder[],
  orderItems: IOrderItem[],
  orderHistories: IOrderHistory[],
  orderStatuses: IOrderStatus[],
  payments: IPayment[],
  paymentHistory: IPaymentHistory[],
  paymentStatuses: IPaymentStatus[]
) {
  const csvOptions = {
    headers: true,
    delimiter: ",",
    quote: '"',
    escape: '"',
    transform: (row: any) => {
      const transformed: any = {};
      for (const key in row) {
        if (row[key] instanceof Date) {
          transformed[key] = row[key].toISOString();
        } else {
          transformed[key] = row[key];
        }
      }
      return transformed;
    },
  };
  const seedsPath = path.join(basePath, "postgres");
  if (!fs.existsSync(seedsPath)) {
    fs.mkdirSync(seedsPath, { recursive: true });
  }

  fcsv.writeToPath(path.join(seedsPath, "products.csv"), products, csvOptions);

  fcsv.writeToPath(
    path.join(seedsPath, "product_categories.csv"),
    productCategories,
    csvOptions
  );
  fcsv.writeToPath(path.join(seedsPath, "clients.csv"), clients, csvOptions);

  fcsv.writeToPath(path.join(seedsPath, "orders.csv"), orders, csvOptions);

  fcsv.writeToPath(
    path.join(seedsPath, "order_items.csv"),
    orderItems,
    csvOptions
  );

  fcsv.writeToPath(
    path.join(seedsPath, "order_histories.csv"),
    orderHistories,
    csvOptions
  );

  fcsv.writeToPath(
    path.join(seedsPath, "order_statuses.csv"),
    orderStatuses,
    csvOptions
  );

  fcsv.writeToPath(path.join(seedsPath, "payments.csv"), payments, csvOptions);

  fcsv.writeToPath(
    path.join(seedsPath, "payment_histories.csv"),
    paymentHistory,
    csvOptions
  );

  fcsv.writeToPath(
    path.join(seedsPath, "payment_statuses.csv"),
    paymentStatuses,
    csvOptions
  );

  console.log("PostgreSQL data generated successfully!");
}

function createCassandraSeeds(
  basePath: string,
  products: IProduct[],
  productCategories: IProductCategory[],
  clients: IClient[],
  orders: IOrder[],
  orderItems: IOrderItem[],
  orderHistories: IOrderHistory[],
  orderStatuses: IOrderStatus[],
  payments: IPayment[],
  paymentHistory: IPaymentHistory[],
  paymentStatuses: IPaymentStatus[]
) {
  const seedsPath = path.join(basePath, "cassandra");
  if (!fs.existsSync(seedsPath)) {
    fs.mkdirSync(seedsPath, { recursive: true });
  }
  const productByCategory: ICassandraProductByCategory[] = [];
  for (const category of productCategories) {
    products
      .filter((product) => product.categoryId === category.id)
      .forEach((product) => {
        productByCategory.push({
          categoria: category.name,
          produto_id: product.id,
          nome: product.name,
          preco: product.price,
          estoque: product.stock,
        });
      });
  }
  const productBySold: ICassandraProductBySold[] = [];
  for (const product of products) {
    const totalSold = orderItems
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (totalSold > 0) {
      productBySold.push({
        produto_id: product.id,
        nome: product.name,
        categoria:
          productCategories.find((cat) => cat.id === product.categoryId)
            ?.name || "",
        total_vendido: totalSold,
      });
    }
  }
  const cassandraOrdersByEmail: ICassandraOrderByEmail[] = [];
  for (const order of orders) {
    const orderStatus = orderStatuses.find((s) => {
      return (
        s.id === orderHistories.find((h) => h.orderId === order.id)?.statusId
      );
    });
    if (!orderStatus) {
      console.error(`Status not found for order ${order.id}`);
      continue;
    }
    const client = clients.find((c) => c.id === order.clientId);
    if (client) {
      cassandraOrdersByEmail.push({
        email: client.email,
        data: new Date(),
        id_pedido: order.id,
        status: orderStatus.name,
        valor_total: order.totalAmount,
      });
    }
  }
  const cassandraOrdersByStatus: ICassandraOrderByStatus[] = [];
  for (const order of orders) {
    const client = clients.find((c) => c.id === order.clientId);
    const orderStatus = orderStatuses.find((s) => {
      return (
        s.id === orderHistories.find((h) => h.orderId === order.id)?.statusId
      );
    });
    if (!orderStatus) {
      console.error(`Status not found for order ${order.id}`);
      continue;
    }
    if (client) {
      cassandraOrdersByStatus.push({
        id_cliente: client.id,
        status: orderStatus.name,
        data: faker.date.past(),
        id_pedido: order.id,
        valor_total: order.totalAmount,
      });
    }
  }
  const clientByExpense: ICassandraOrderByExpense[] = [];
  for (const client of clients) {
    const totalSpent = orders
      .filter((order) => order.clientId === client.id)
      .reduce((sum, order) => sum + order.totalAmount, 0);
    if (totalSpent > 0) {
      const date = faker.date.past();
      const ano_mes = `${date.getFullYear()}_${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      clientByExpense.push({
        id_cliente: client.id,
        valor_total: totalSpent,
        ano_mes,
        data: date,
      });
    }
  }

  const paymentsByType: ICassandraPaymentByType[] = [];
  for (const payment of payments) {
    const order = orders.find((o) => o.id === payment.orderId);
    if (!order) {
      console.error(`Order not found for payment ${payment.id}`);
      continue;
    }
    const paymentType = paymentHistory.find(
      (ph) => ph.paymentId === payment.id
    )?.type;
    if (!paymentType) {
      console.error(`Payment type not found for payment ${payment.id}`);
      continue;
    }
    const status = paymentStatuses.find(
      (s) =>
        s.id ===
        paymentHistory.find((ph) => ph.paymentId === payment.id)?.statusId
    );
    if (!status) {
      console.error(`Status not found for payment ${payment.id}`);
      continue;
    }
    paymentsByType.push({
      id_pedido: order.id,
      id_pagamento: payment.id,
      tipo_pagamento: paymentType,
      status: status.name,
      data: payment.createdAt,
      ano_mes: `${payment.createdAt.getFullYear()}_${String(
        payment.createdAt.getMonth() + 1
      ).padStart(2, "0")}`,
    });
  }
  let fileIndex = 7;
  let createStatements = [];
  for (const product of productByCategory) {
    createStatements.push(
      `INSERT INTO product_by_category (categoria, id_produto, nome, preco, estoque) VALUES ('${product.categoria}', ${product.produto_id}, '${product.nome}', ${product.preco}, ${product.estoque});`
    );
  }
  let fileLabel = String(fileIndex).padStart(5, "0");
  fs.writeFileSync(
    path.join(seedsPath, `${fileLabel}_insert_product_by_category.up.cql`),
    createCassandraTransaction(createStatements)
  );

  fileIndex++;
  createStatements = [];
  for (const product of productBySold) {
    createStatements.push(
      `INSERT INTO most_sold_products (id_produto, nome, categoria, total_vendido) VALUES (${product.produto_id}, '${product.nome}', '${product.categoria}', ${product.total_vendido});`
    );
  }
  fileLabel = String(fileIndex).padStart(5, "0");
  fs.writeFileSync(
    path.join(seedsPath, `${fileLabel}_insert_most_sold_products.up.cql`),
    createCassandraTransaction(createStatements)
  );

  fileIndex++;
  createStatements = [];
  for (const order of cassandraOrdersByEmail) {
    createStatements.push(
      `INSERT INTO client_order_by_email (email, data_pedido, id_pedido, status, valor_total) VALUES ('${
        order.email
      }', '${order.data.toISOString()}', ${order.id_pedido}, '${
        order.status
      }', ${order.valor_total});`
    );
  }
  fileLabel = String(fileIndex).padStart(5, "0");
  fs.writeFileSync(
    path.join(seedsPath, `${fileLabel}_insert_client_order_by_email.up.cql`),
    createCassandraTransaction(createStatements)
  );

  fileIndex++;
  createStatements = [];
  for (const order of cassandraOrdersByStatus) {
    createStatements.push(
      `INSERT INTO client_order_by_status (id_cliente, status, data_pedido, id_pedido, valor_total) VALUES (${
        order.id_cliente
      }, '${order.status}', '${order.data.toISOString()}', ${
        order.id_pedido
      }, ${order.valor_total});`
    );
  }
  fileLabel = String(fileIndex).padStart(5, "0");
  fs.writeFileSync(
    path.join(seedsPath, `${fileLabel}_insert_client_order_by_status.up.cql`),
    createCassandraTransaction(createStatements)
  );

  fileIndex++;
  createStatements = [];
  for (const client of clientByExpense) {
    createStatements.push(
      `INSERT INTO client_expense_by_period (id_cliente, valor_total, ano_mes, data_pedido) VALUES (${
        client.id_cliente
      }, ${client.valor_total}, '${
        client.ano_mes
      }', '${client.data.toISOString()}');`
    );
  }
  fileLabel = String(fileIndex).padStart(5, "0");
  fs.writeFileSync(
    path.join(seedsPath, `${fileLabel}_insert_client_expense_by_period.up.cql`),
    createCassandraTransaction(createStatements)
  );

  fileIndex++;
  createStatements = [];
  for (const payment of paymentsByType) {
    createStatements.push(
      `INSERT INTO payment_by_type (id_pedido, id_pagamento, tipo, status, data_pagamento, ano_mes) VALUES (${
        payment.id_pedido
      }, ${payment.id_pagamento}, '${payment.tipo_pagamento}', '${
        payment.status
      }', '${payment.data.toISOString()}', '${payment.ano_mes}');`
    );
  }
  fileLabel = String(fileIndex).padStart(5, "0");
  fs.writeFileSync(
    path.join(seedsPath, `${fileLabel}_insert_payment_by_type.up.cql`),
    createCassandraTransaction(createStatements)
  );
  console.log("Cassandra data generated successfully!");
}

function createCassandraTransaction(statements: string[]) {
  const transaction = [...statements].join("\n");
  return transaction;
}

function createMongoSeeds(basePath: string) {
  const seedPath = path.join(basePath, "mongo");
  if (!fs.existsSync(seedPath)) {
    fs.mkdirSync(seedPath, { recursive: true });
  }

  const mongoProducts: IMongoProduct[] = faker.helpers.uniqueArray(() => {
    const id = new ObjectId();
    const nome = faker.commerce.productName();
    const preco = new Double(
      parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 }))
    );
    const estoque = faker.number.int({ min: 0, max: 100 });
    const categoria = faker.helpers.arrayElement([
      { _id: new ObjectId(), nome: "Eletrônicos" },
      { _id: new ObjectId(), nome: "Roupas" },
      { _id: new ObjectId(), nome: "Alimentos" },
      { _id: new ObjectId(), nome: "Móveis" },
      { _id: new ObjectId(), nome: "Brinquedos" },
    ]);
    return {
      _id: id,
      nome,
      preco,
      estoque,
      categoria: {
        _id: categoria._id,
        nome: categoria.nome,
      },
    };
  }, 5000);

  const mongoClients: IMongoClient[] = faker.helpers.uniqueArray(() => {
    const id = new ObjectId();
    const nome = faker.person.fullName();
    const cpf = faker.helpers.replaceSymbols("###########");
    const email = faker.internet.email();
    const phone = faker.helpers.replaceSymbols("###########");
    return {
      _id: id,
      nome,
      cpf,
      email,
      phone,
      created_at: faker.date.past(),
    };
  }, 20000);

  const mongoOrders: IMongoOrder[] = faker.helpers.uniqueArray(() => {
    const id = new ObjectId();
    const cliente_id_fk = faker.helpers.arrayElement(mongoClients)._id;
    const items = faker.helpers.uniqueArray(() => {
      return {
        product_id_fk: faker.helpers.arrayElement(mongoProducts)._id,
        quantidade: faker.number.int({ min: 1, max: 5 }),
        preco_unitario: new Double(
          parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 }))
        ),
      };
    }, 5);
    const total = new Double(
      items.reduce(
        (sum, item) =>
          sum + parseFloat(item.preco_unitario.toString()) * item.quantidade,
        0
      )
    );
    const pagamento = [
      {
        _id: new ObjectId(),
        tipo: faker.helpers.arrayElement(Object.values(PaymentType)),
        status: [
          {
            _id: new ObjectId(),
            nome: "PENDENTE",
            created_at: faker.date.past(),
          },
        ],
        created_at: faker.date.past(),
      },
    ];
    const status = [
      {
        _id: new ObjectId(),
        nome: "PENDENTE",
        created_at: faker.date.past(),
      },
    ];
    return {
      _id: id,
      cliente_id_fk,
      total,
      items,
      pagamento,
      status,
      created_at: faker.date.past(),
    };
  }, 30000);
  const seedOptions: EJSONOptions = {
    relaxed: false,
  };
  fs.writeFileSync(
    path.join(seedPath, "00002_insert_products.up.json"),
    EJSON.stringify(
      [{ insert: "produto", documents: mongoProducts }],
      replacer,
      2,
      seedOptions
    )
  );
  fs.writeFileSync(
    path.join(seedPath, "00003_insert_clients.up.json"),
    EJSON.stringify(
      [{ insert: "cliente", documents: mongoClients }],
      replacer,
      2,
      seedOptions
    )
  );

  const chunkSize = 5000;
  for (let i = 0; i < mongoOrders.length; i += chunkSize) {
    const chunk = mongoOrders.slice(i, i + chunkSize);
    const fileIndex = String(i / chunkSize + 4).padStart(5, "0");
    fs.writeFileSync(
      path.join(seedPath, `${fileIndex}_insert_orders.up.json`),
      EJSON.stringify(
        [{ insert: "pedido", documents: chunk }],
        replacer,
        2,
        seedOptions
      )
    );
  }
  console.log("MongoDB data generated successfully!");
}

generateSeedData();
