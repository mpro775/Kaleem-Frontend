import type { Product } from "./Product";

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  [key: string]: string; // دعم أي بيانات مستقبلية
}
export interface OrderProduct {
  productId: string;
    product?: string | Product;
  name: string;
  quantity: number;
  price: number;
    image?: string;
}
export interface Order {
  _id: string;
  merchantId: string;
  sessionId: string;
  customer: CustomerInfo;
  products: OrderProduct[];
  status: 'pending' | 'paid' | 'canceled';
  createdAt: string;
  updatedAt: string;
}
export interface Lead {
  _id: string;
  merchantId: string;
  sessionId: string;
  data: CustomerInfo;
  source?: string;
  createdAt: string;
  updatedAt: string;
}
