export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  barcode: string;
}

export interface Sale {
  id: string;
  date: Date;
  total: number;
  items: SaleItem[];
  paymentMethod: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  lastUpdated: Date;
  location: string;
}
