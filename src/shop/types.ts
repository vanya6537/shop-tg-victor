export type CurrencyCode = 'USD' | 'VND';

export type ProductCategory = 'massage' | 'helmet';

export interface ShopProduct {
  id: string;
  category: ProductCategory;
  price: number; // in minor units? we will store as major (e.g. 19.99)
  currency: CurrencyCode;
  accent: string; // css-like hex
  emoji: string;
  nameKey: string;
  shortDescKey: string;
  detailsKey: string;
  featuresKeys: string[];
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartState {
  lines: CartLine[];
}
