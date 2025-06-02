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
