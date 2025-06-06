import { ObjectId } from "bson";

export interface IClient {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface IMongoClient {
  _id: ObjectId;
  nome: string;
  cpf: string;
  email: string;
  phone: string;
  created_at: Date;
}
