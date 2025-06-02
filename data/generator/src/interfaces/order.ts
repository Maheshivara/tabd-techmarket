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
