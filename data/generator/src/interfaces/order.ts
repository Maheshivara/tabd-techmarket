import { ObjectId, Double } from "bson";
import { IMongoPayment } from "./payment";

export interface IOrder {
  id: string;
  clientId: string;
  totalAmount: number;
}

export interface IOrderItem {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface IOrderHistory {
  orderId: string;
  statusId: string;
  createdAt: Date;
}

export interface IOrderStatus {
  id: string;
  name: string;
}

export interface IMongoOrder {
  _id: ObjectId;
  cliente_id_fk: ObjectId;
  total: Double;
  items: IMongoOrderItem[];
  pagamento: IMongoPayment[];
  status: IMongoOrderStatus[];
  created_at: Date;
}

export interface IMongoOrderItem {
  product_id_fk: ObjectId;
  quantidade: number;
  preco_unitario: Double;
}

export interface IMongoOrderStatus {
  _id: ObjectId;
  nome: string;
  created_at: Date;
}

export interface ICassandraOrderByEmail {
  email: string;
  data: Date;
  id_pedido: string;
  status: string;
  valor_total: number;
}

export interface ICassandraOrderByStatus {
  id_cliente: string;
  status: string;
  data: Date;
  id_pedido: string;
  valor_total: number;
}

export interface ICassandraOrderByExpense {
  id_cliente: string;
  ano_mes: string;
  data: Date;
  valor_total: number;
}
