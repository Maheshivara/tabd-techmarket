export enum PaymentType {
  CARTAO = 'CARTAO',
  PIX = 'PIX',
  BOLETO = 'BOLETO',
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