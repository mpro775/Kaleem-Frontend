export interface ProductResponse {
  _id: string;
  merchantId: string;
  originalUrl: string;
  platform?: string;
  name: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  category?: string;
  lowQuantity?: string;
  specsBlock?: string[];
  keywords?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface SetupConfig {
  storeType: "traditional" | "ecommerce";
  provider?: "zid" | "salla" | "shopify" | "custom";
  apiUrl?: string;
  accessToken?: string;
  hasApi: boolean;
}
export const ProductSource = {
  MANUAL: 'manual',
  API:    'api',
  SCRAPER:'scraper',
} as const;
export type ProductView = {
  id: string;
  title: string;
  price: number;
  isActive?: boolean;
};
export type ProductSource = typeof ProductSource[keyof typeof ProductSource];
// types/Product.ts
export interface Product {
  _id: string;
  merchantId: string;
  originalUrl: string;
  platform?: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  images: string[];
  category: string;
  lowQuantity?: string;
  specsBlock: string[];
     redirectUrl: string; 
  lastFetchedAt?: string;
  lastFullScrapedAt?: string;
  errorState?: string;
  source: 'manual' | 'api' | 'scraper';
  sourceUrl?: string;
  externalId?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  lastSync?: string;
  syncStatus?: 'ok' | 'error' | 'pending';
  offers?: string[];
  keywords: string[];
  uniqueKey?: string;
}

export interface CreateProductDto {
  // الحقول الأساسية
    id?: string;

  originalUrl?: string;    // يُنشأ يدوياً في handleAdd
  merchantId?: string;     // من الـ context
  source?: ProductSource;  // دائمًا 'manual' عند الإضافة اليدوية

  // الحقول الاختيارية فقط
  name?: string;
  description?: string;
  price?: number;
  isAvailable?: boolean;
  category?: string;
  specsBlock?: string[];
  keywords?: string[];
images?: string[]; // مصفوفة من الروابط
  lastFetchedAt?: string;       // أو Date
  lastFullScrapedAt?: string;   // أو Date
}
