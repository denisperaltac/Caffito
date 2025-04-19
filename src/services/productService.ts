import { PaginatedResponse, Producto } from "../types/configuration";
import axiosInstance, { API_URL } from "../config/axiosConfig";

interface GetProductosParams {
  page?: number;
  size?: number;
  nombre?: string;
  categoriaId?: string;
}

export const productService = {
  // Obtener todos los productos
  getProductos: async (
    params: GetProductosParams = {}
  ): Promise<Producto[]> => {
    try {
      const { page = 0, size = 10, nombre, categoriaId } = params;
      const response = await axiosInstance.get<Producto[]>("/api/productos", {
        params: {
          page,
          size,
          "nombre.contains": nombre,
          categoriaId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener productos:", error);
      throw error;
    }
  },

  // Obtener el count de productos
  getCountProductos: async (
    params: Omit<GetProductosParams, "page" | "size"> = {}
  ): Promise<number> => {
    try {
      const { nombre, categoriaId } = params;
      const response = await axiosInstance.get<number>("/api/productos/count", {
        params: {
          "nombre.contains": nombre,
          categoriaId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener el count de productos:", error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getProductoById: async (id: string): Promise<Producto> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo producto
  createProducto: async (producto: Omit<Producto, "id">): Promise<Producto> => {
    try {
      const response = await axiosInstance.post(
        `${API_URL}/productos`,
        producto
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  },

  // Actualizar un producto existente
  updateProducto: async (
    id: string,
    producto: Partial<Producto>,
    cantidad: number,
    peso?: number
  ): Promise<Producto> => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/productos/actualizastock?cantidad=${cantidad}&peso=${
          peso || 0
        }&puntoDeVentaId=1`,
        producto
      );
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar producto ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un producto
  deleteProducto: async (id: string): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_URL}/productos/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },

  // Obtener productos por categoría
  getProductosByCategoria: async (categoriaId: string): Promise<Producto[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/productos/categoria/${categoriaId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error al obtener productos de categoría ${categoriaId}:`,
        error
      );
      throw error;
    }
  },

  // Obtener productos por proveedor
  getProductosByProveedor: async (proveedorId: string): Promise<Producto[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/productos/proveedor/${proveedorId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error al obtener productos de proveedor ${proveedorId}:`,
        error
      );
      throw error;
    }
  },

  // Obtener productos con stock bajo
  getProductosStockBajo: async (minimo: number): Promise<Producto[]> => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/productos/stock-bajo`,
        {
          params: { minimo },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener productos con stock bajo:", error);
      throw error;
    }
  },
};
