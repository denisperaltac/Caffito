export interface Stock {
  id: string;
  productId: string;
  quantity: number;
  minimum: number;
  maximum: number;
  location: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  reason: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  barcode: string;
  categoryId: string;
  brandId: string;
  supplierId: string;
  taxId: string;
  active: boolean;
}

export interface Label {
  id: string;
  name: string;
  description: string;
  color: string;
  products: string[]; // Array of product IDs
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  taxId: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string; // Optional parent category ID for hierarchical categories
  active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  description: string;
  active: boolean;
}
