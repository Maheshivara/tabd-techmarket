export interface IClient {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
}
