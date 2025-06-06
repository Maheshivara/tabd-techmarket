import { ObjectId, Double } from "bson";

export interface IProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: string;
}

export interface IProductCategory {
  id: string;
  name: string;
  code: string;
}

export interface IMongoProduct {
  _id: ObjectId;
  nome: string;
  preco: Double;
  estoque: number;
  categoria: IMongoProductCategory;
}

export interface IMongoProductCategory {
  _id: ObjectId;
  nome: string;
}

export interface ICassandraProductByCategory {
  categoria: string;
  produto_id: string;
  nome: string;
  preco: number;
  estoque: number;
}

export interface ICassandraProductBySold {
  produto_id: string;
  nome: string;
  categoria: string;
  total_vendido: number;
}
