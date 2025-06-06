import { ObjectId } from "bson";

export enum PaymentType {
  CARTAO = "CARTAO",
  PIX = "PIX",
  BOLETO = "BOLETO",
}

export interface IPayment {
  id: string;
  orderId: string;
  createdAt: Date;
}

export interface IPaymentHistory {
  paymentId: string;
  statusId: string;
  type: PaymentType;
  createdAt: Date;
}

export interface IPaymentStatus {
  id: string;
  name: string;
}

export interface IMongoPayment {
  _id: ObjectId;
  tipo: PaymentType;
  status: IMongoPaymentStatus[];
  created_at: Date;
}

export interface IMongoPaymentStatus {
  _id: ObjectId;
  nome: string;
  created_at: Date;
}

export interface ICassandraPaymentByType {
  id_pedido: string;
  id_pagamento: string;
  tipo_pagamento: PaymentType;
  status: string;
  data: Date;
  ano_mes: string;
}
