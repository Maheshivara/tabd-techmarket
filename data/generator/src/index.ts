import { faker } from "@faker-js/faker";
import * as fcsv from "fast-csv";
import * as path from "path";
import * as fs from "fs";
import { IProduct, IProductCategory } from "./interfaces/product";
import { IClient } from "./interfaces/client";
import {
  IOrder,
  IOrderHistory,
  IOrderItem,
  IOrderStatus,
} from "./interfaces/order";
import { IPayment, IPaymentHistory, PaymentType } from "./interfaces/payment";

function generateSeedData() {
  const productCategories: IProductCategory[] = faker.helpers.uniqueArray(
    () => {
      const id = faker.string.uuid();
      const name = faker.commerce.department();
      const code = faker.string.alpha({ length: 3 }).toUpperCase();
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
  const basePath = path.resolve(__dirname, "../../seed");

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  fcsv.writeToPath(path.join(basePath, "products.csv"), products, csvOptions);

  fcsv.writeToPath(
    path.join(basePath, "product_categories.csv"),
    productCategories,
    csvOptions
  );
  fcsv.writeToPath(path.join(basePath, "clients.csv"), clients, csvOptions);

  fcsv.writeToPath(path.join(basePath, "orders.csv"), orders, csvOptions);

  fcsv.writeToPath(
    path.join(basePath, "order_items.csv"),
    orderItems,
    csvOptions
  );

  fcsv.writeToPath(
    path.join(basePath, "order_histories.csv"),
    orderHistories,
    csvOptions
  );

  fcsv.writeToPath(
    path.join(basePath, "order_statuses.csv"),
    orderStatuses,
    csvOptions
  );

  fcsv.writeToPath(path.join(basePath, "payments.csv"), payments, csvOptions);

  fcsv.writeToPath(
    path.join(basePath, "payment_histories.csv"),
    paymentHistory,
    csvOptions
  );

  fcsv.writeToPath(
    path.join(basePath, "payment_statuses.csv"),
    paymentStatuses,
    csvOptions
  );

  console.log("Seed data generated successfully!");
}

generateSeedData();
