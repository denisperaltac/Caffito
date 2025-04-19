import {
  Stock,
  StockMovement,
  Product,
  Label,
  Supplier,
  Category,
  Brand,
  Tax,
} from "../../types/inventory";

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Producto 1",
    description: "Descripción del producto 1",
    price: 100,
    cost: 50,
    stock: 50,
    barcode: "123456789",
    categoryId: "1",
    brandId: "1",
    supplierId: "1",
    taxId: "1",
    active: true,
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "Proveedor 1",
    contact: "Juan Pérez",
    phone: "123456789",
    email: "proveedor1@email.com",
    address: "Calle 123",
    taxId: "123456789",
    active: true,
  },
];

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Categoría 1",
    description: "Descripción de categoría 1",
    active: true,
  },
];

const mockBrands: Brand[] = [
  {
    id: "1",
    name: "Marca A",
    description: "Descripción de Marca A",
    active: true,
  },
  {
    id: "2",
    name: "Marca B",
    description: "Descripción de Marca B",
    active: true,
  },
  {
    id: "3",
    name: "Marca C",
    description: "Descripción de Marca C",
    active: false,
  },
];

const mockTaxes: Tax[] = [
  {
    id: "1",
    name: "IVA",
    percentage: 21,
    description: "Impuesto al Valor Agregado",
    active: true,
  },
  {
    id: "2",
    name: "IIBB",
    percentage: 3,
    description: "Impuesto sobre los Ingresos Brutos",
    active: true,
  },
];

export const inventoryService = {
  // Stock Management
  async getStock(): Promise<Stock[]> {
    // Mock implementation
    return [];
  },

  async updateStock(stock: Partial<Stock>): Promise<Stock> {
    // Mock implementation
    return {} as Stock;
  },

  // Stock Movements
  async getStockMovements(): Promise<StockMovement[]> {
    // Mock implementation
    return [];
  },

  async createStockMovement(
    movement: Omit<StockMovement, "id">
  ): Promise<StockMovement> {
    // Mock implementation
    return {} as StockMovement;
  },

  // Products
  async getProducts(): Promise<Product[]> {
    return mockProducts;
  },

  async getProductById(id: string): Promise<Product | null> {
    return mockProducts.find((p) => p.id === id) || null;
  },

  async createProduct(product: Omit<Product, "id">): Promise<Product> {
    const newProduct = {
      id: Math.random().toString(36).substr(2, 9),
      ...product,
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(
    id: string,
    product: Partial<Product>
  ): Promise<Product | null> {
    const index = mockProducts.findIndex((p) => p.id === id);
    if (index === -1) return null;
    mockProducts[index] = { ...mockProducts[index], ...product };
    return mockProducts[index];
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return mockSuppliers;
  },

  async createSupplier(supplier: Omit<Supplier, "id">): Promise<Supplier> {
    const newSupplier = {
      id: Math.random().toString(36).substr(2, 9),
      ...supplier,
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },

  async updateSupplier(
    id: string,
    supplierData: Partial<Supplier>
  ): Promise<Supplier> {
    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Supplier not found");
    const updatedSupplier = { ...mockSuppliers[index], ...supplierData };
    mockSuppliers[index] = updatedSupplier;
    return updatedSupplier;
  },

  async deleteSupplier(id: string): Promise<void> {
    const index = mockSuppliers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error("Supplier not found");
    mockSuppliers.splice(index, 1);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return mockCategories;
  },

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const newCategory = {
      id: Math.random().toString(36).substr(2, 9),
      ...category,
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  async updateCategory(
    id: string,
    categoryData: Partial<Category>
  ): Promise<Category> {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    const updatedCategory = { ...mockCategories[index], ...categoryData };
    mockCategories[index] = updatedCategory;
    return updatedCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    mockCategories.splice(index, 1);
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    return mockBrands;
  },

  createBrand: async (brand: Omit<Brand, "id">): Promise<Brand> => {
    const newBrand: Brand = {
      ...brand,
      id: String(mockBrands.length + 1),
    };
    mockBrands.push(newBrand);
    return newBrand;
  },

  updateBrand: async (
    id: string,
    brandData: Partial<Brand>
  ): Promise<Brand> => {
    const index = mockBrands.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Brand not found");

    const updatedBrand = {
      ...mockBrands[index],
      ...brandData,
    };
    mockBrands[index] = updatedBrand;
    return updatedBrand;
  },

  deleteBrand: async (id: string): Promise<void> => {
    const index = mockBrands.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Brand not found");
    mockBrands.splice(index, 1);
  },

  // Taxes
  async getTaxes(): Promise<Tax[]> {
    return mockTaxes;
  },

  async createTax(tax: Omit<Tax, "id">): Promise<Tax> {
    const newTax = {
      id: Math.random().toString(36).substr(2, 9),
      ...tax,
    };
    mockTaxes.push(newTax);
    return newTax;
  },

  async updateTax(id: string, taxData: Partial<Tax>): Promise<Tax> {
    const index = mockTaxes.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tax not found");
    const updatedTax = { ...mockTaxes[index], ...taxData };
    mockTaxes[index] = updatedTax;
    return updatedTax;
  },

  async deleteTax(id: string): Promise<void> {
    const index = mockTaxes.findIndex((t) => t.id === id);
    if (index === -1) throw new Error("Tax not found");
    mockTaxes.splice(index, 1);
  },

  // Label management
  async getLabels(): Promise<Label[]> {
    // Mock data
    return [
      {
        id: "1",
        name: "Oferta",
        description: "Productos en oferta",
        color: "#FF0000",
        products: ["1", "2"],
      },
      {
        id: "2",
        name: "Nuevo",
        description: "Productos nuevos",
        color: "#00FF00",
        products: ["3", "4"],
      },
    ];
  },

  async createLabel(label: Omit<Label, "id">): Promise<Label> {
    // Mock implementation
    return {
      id: Math.random().toString(36).substr(2, 9),
      ...label,
    };
  },

  async updateLabel(id: string, labelData: Partial<Label>): Promise<Label> {
    // Mock implementation
    return {
      id,
      name: labelData.name || "",
      description: labelData.description || "",
      color: labelData.color || "#000000",
      products: labelData.products || [],
    };
  },

  async deleteLabel(id: string): Promise<void> {
    // Mock implementation
    console.log(`Deleting label with id: ${id}`);
  },
};
