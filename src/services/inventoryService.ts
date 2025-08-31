import {
  Stock,
  StockMovement,
  Producto,
  Supplier,
  Category,
  Brand,
  Tax,
  Proveedor,
} from "../types/inventory";
import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";

// Mock data for demonstration
const mockProducts: Producto[] = [
  {
    id: 1,
    nombre: "Producto 1",
    descripcion: "Descripción del producto 1",
    codigoReferencia: "REF001",
    cantidad: 10,
    stockMin: 5,
    stockMax: 20,
    categoriaId: {
      id: 1,
      nombre: "Categoría 1",
    },
    marcaId: {
      id: 1,
      nombre: "Marca 1",
    },
    productoProveedors: [],
    impuestoId: null,
    pesable: false,
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
    id: 1,
    nombre: "Categoría 1",
    rubroId: {
      id: 1,
      nombre: "Rubro 1",
    },
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
  async getProducts(): Promise<Producto[]> {
    return mockProducts;
  },

  async getProductsWithPriceChange(
    page: number = 0,
    size: number = 10
  ): Promise<Producto[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/productos`, {
        params: {
          page,
          size,
          sort: "cambioPrecio,desc",
        },
      });

      // La API devuelve directamente un array, no un objeto con paginación
      const products = response.data;

      // Limpiar espacios en blanco de los campos
      const cleanedProducts = products.map((product: any) => ({
        ...product,
        codigoReferencia: product.codigoReferencia?.trim() || "",
        nombre: product.nombre?.trim() || "",
        descripcion: product.descripcion?.trim() || "",
        categoriaId: {
          ...product.categoriaId,
          nombre: product.categoriaId?.nombre?.trim() || "",
        },
        marcaId: {
          ...product.marcaId,
          nombre: product.marcaId?.nombre?.trim() || "",
        },
      }));

      return cleanedProducts;
    } catch (error) {
      console.error("Error fetching products with price change:", error);
      throw error;
    }
  },

  async getProductsCount(): Promise<number> {
    try {
      // Intentar obtener el count desde el endpoint específico
      const response = await axiosInstance.get(`${API_URL}/productos/count`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products count:", error);
      // Si falla, intentar obtener desde el header X-Total-Count
      try {
        const response = await axiosInstance.get(`${API_URL}/productos`, {
          params: {
            page: 0,
            size: 1,
            sort: "cambioPrecio,desc",
          },
        });

        // Buscar en headers o usar un valor por defecto
        const totalCount =
          response.headers["x-total-count"] ||
          response.headers["X-Total-Count"] ||
          response.headers["total-count"] ||
          response.headers["Total-Count"];

        if (totalCount) {
          return parseInt(totalCount, 10);
        }

        // Si no hay header, devolver un valor por defecto
        return 100; // Valor por defecto para paginación
      } catch (fallbackError) {
        console.error("Fallback count also failed:", fallbackError);
        return 100; // Valor por defecto
      }
    }
  },

  async generateEtiquetas(
    etiquetas: Array<{ nombre: string; precio: number; codigo: string }>,
    typeExport: "PDF" | "HTML" | "XLS" = "XLS"
  ): Promise<void> {
    try {
      console.log(etiquetas);
      // Procesar códigos como lo hace erpweb
      const processedEtiquetas = etiquetas.map((etiqueta) => ({
        ...etiqueta,
        codigo:
          etiqueta.codigo.length !== 13
            ? "000000000000"
            : etiqueta.codigo.substring(0, 12),
      }));

      const response = await axiosInstance.post(
        `${API_URL}/productos/etiquetas?typeExport=${typeExport}`,
        processedEtiquetas,
        {
          responseType: "blob",
        }
      );

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Determinar extensión del archivo
      let extension = "xls";
      switch (typeExport) {
        case "PDF":
          extension = "pdf";
          break;
        case "HTML":
          extension = "html";
          break;
        case "XLS":
        default:
          extension = "xls";
          break;
      }

      link.setAttribute("download", `etiquetas.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating labels:", error);
      throw error;
    }
  },

  async getProductById(id: number): Promise<Producto | null> {
    return mockProducts.find((p) => p.id === id) || null;
  },

  async updateProduct(
    id: number,
    product: Partial<Producto>
  ): Promise<Producto | null> {
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
    try {
      const response = await axiosInstance.get(`${API_URL}/categorias`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
      throw error;
    }
  },

  async createCategory(category: Omit<Category, "id">): Promise<Category> {
    const newCategory = {
      id: Math.floor(Math.random() * 1000),
      ...category,
    };
    mockCategories.push(newCategory);
    return newCategory;
  },

  async updateCategory(
    id: number,
    categoryData: Partial<Category>
  ): Promise<Category> {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    const updatedCategory = { ...mockCategories[index], ...categoryData };
    mockCategories[index] = updatedCategory;
    return updatedCategory;
  },

  async deleteCategory(id: number): Promise<void> {
    const index = mockCategories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Category not found");
    mockCategories.splice(index, 1);
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/marcas`, {
        params: {
          size: 9999,
        },
      });
      return response.data.map((brand: any) => ({
        id: brand.id.toString(),
        name: brand.nombre.trim(),
        description: "",
        active: true,
      }));
    } catch (error) {
      console.error("Error fetching brands:", error);
      throw error;
    }
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
    try {
      const response = await axiosInstance.get(`${API_URL}/impuestos`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching taxes:", error);
      throw error;
    }
  },

  async createTax(tax: Omit<Tax, "id">): Promise<Tax> {
    const newTax = {
      id: Math.random().toString(36).substr(2, 9),
      ...tax,
    };

    return newTax;
  },
  // Proveedores
  async getProveedors(): Promise<Proveedor[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener los proveedores:", error);
      throw error;
    }
  },
};
