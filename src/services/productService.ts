import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";
import { Producto, ProductoOptional } from "../types/inventory";

interface GetProductosParams {
  page?: number;
  size?: number;
  nombre?: string;
  categoriaId?: string;
  codigoReferencia?: string;
}

export interface ProductsResponse {
  content: Producto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const productService = {
  // Obtener todos los productos
  getProductos: async (
    params: GetProductosParams = {}
  ): Promise<Producto[]> => {
    try {
      const {
        page = 0,
        size = 10,
        nombre,
        categoriaId,
        codigoReferencia,
      } = params;
      const response = await axiosInstance.get<Producto[]>(
        `${API_URL}/productos`,
        {
          params: {
            page,
            size,
            "nombre.contains": nombre,
            categoriaId,
            "codigoReferencia.contains": codigoReferencia,
          },
        }
      );
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
      const { nombre, categoriaId, codigoReferencia } = params;
      const response = await axiosInstance.get<number>(
        `${API_URL}/productos/count`,
        {
          params: {
            "nombre.contains": nombre,
            categoriaId,
            "codigoReferencia.contains": codigoReferencia,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el count de productos:", error);
      throw error;
    }
  },

  // Obtener un producto por ID
  getProductoById: async (id: number): Promise<Producto> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/productos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener producto ${id}:`, error);
      throw error;
    }
  },

  // Crear un nuevo producto
  createProduct: async (
    producto: ProductoOptional
  ): Promise<ProductoOptional> => {
    try {
      const payload = {
        ...producto,
        borrado: false,
      };

      const response = await axiosInstance.post(
        `${API_URL}/productos`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error al crear producto:", error);
      throw error;
    }
  },

  // Actualizar un producto existente
  updateProducto: async (
    id: number,
    producto: Partial<ProductoOptional>,
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
  deleteProduct: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_URL}/productos/${id}`);
    } catch (error) {
      console.error(`Error al eliminar producto ${id}:`, error);
      throw error;
    }
  },

  // Obtener productos por categoría
  getProductosByCategoria: async (categoriaId: number): Promise<Producto[]> => {
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
