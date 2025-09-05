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
    size: number = 10,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<Producto[]> {
    try {
      const params: any = {
        page,
        size,
        sort: "cambioPrecio,desc",
      };

      // Agregar filtros de fecha si están presentes
      if (fechaInicio) {
        params[
          "cambioPrecio.greaterThanOrEqual"
        ] = `${fechaInicio}T00:00:00.000Z`;
      }
      if (fechaFin) {
        params["cambioPrecio.lessThanOrEqual"] = `${fechaFin}T23:59:59.999Z`;
      }

      const response = await axiosInstance.get(`${API_URL}/productos`, {
        params,
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

  async getProductsCount(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<number> {
    try {
      const params: any = {
        page: 0,
        size: 1,
        sort: "cambioPrecio,desc",
      };

      // Agregar filtros de fecha si están presentes
      if (fechaInicio) {
        params[
          "cambioPrecio.greaterThanOrEqual"
        ] = `${fechaInicio}T00:00:00.000Z`;
      }
      if (fechaFin) {
        params["cambioPrecio.lessThanOrEqual"] = `${fechaFin}T23:59:59.999Z`;
      }

      // Intentar obtener el count desde el endpoint específico con filtros
      try {
        const countResponse = await axiosInstance.get(
          `${API_URL}/productos/count`,
          {
            params: {
              ...(fechaInicio && {
                "cambioPrecio.greaterThanOrEqual": `${fechaInicio}T00:00:00.000Z`,
              }),
              ...(fechaFin && {
                "cambioPrecio.lessThanOrEqual": `${fechaFin}T23:59:59.999Z`,
              }),
            },
          }
        );
        return countResponse.data;
      } catch (countError) {
        console.log(
          "Count endpoint failed, trying fallback method:",
          countError
        );

        // Si falla el endpoint de count, usar el método de fallback con filtros
        const response = await axiosInstance.get(`${API_URL}/productos`, {
          params,
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
      }
    } catch (error) {
      console.error("Error fetching products count:", error);
      return 100; // Valor por defecto
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

  // Funciones para Suppliers (usando la nueva estructura)
  async getSuppliers(page: number = 0, size: number = 20): Promise<Supplier[]> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors`, {
        params: {
          page,
          size,
          sort: "id,asc",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  async getSupplier(id: number): Promise<Supplier> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching supplier:", error);
      throw error;
    }
  },

  async createSupplier(supplierData: Omit<Supplier, "id">): Promise<Supplier> {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/proveedors`,
        supplierData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating supplier:", error);
      throw error;
    }
  },

  async updateSupplier(
    id: number,
    supplierData: Partial<Supplier>
  ): Promise<Supplier> {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/proveedors/${id}`,
        supplierData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  },

  async deleteSupplier(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${API_URL}/proveedors/${id}`);
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  },

  async getSuppliersCount(): Promise<number> {
    try {
      const response = await axiosInstance.get(`${API_URL}/proveedors/count`);
      return response.data;
    } catch (error) {
      console.error("Error fetching suppliers count:", error);
      throw error;
    }
  },
};
