export interface IBrand {
  id: string;
  name: string;
  logo: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}
