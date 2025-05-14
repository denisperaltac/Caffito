import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";
import { Gasto, GetGastosParams } from "../types/expenses";
import { toast } from "react-hot-toast";

export type { Gasto };

export const expensesService = {
  getGastos: async (params: GetGastosParams = {}): Promise<Gasto[]> => {
    try {
      const { page = 0, size = 10, ...rest } = params;
      const response = await axiosInstance.get<Gasto[]>(`${API_URL}/gastos`, {
        params: {
          page,
          size,
          ...rest,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener los gastos:", error);
      throw error;
    }
  },

  getCountGastos: async (
    params: Omit<GetGastosParams, "page" | "size"> = {}
  ): Promise<number> => {
    try {
      const response = await axiosInstance.get<number>(
        `${API_URL}/gastos/count`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el count de gastos:", error);
      throw error;
    }
  },

  getGasto: async (id: number): Promise<Gasto> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/gastos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener el gasto:", error);
      throw error;
    }
  },

  createGasto: async (gasto: Partial<Gasto>): Promise<Gasto> => {
    const promise = axiosInstance.post(`${API_URL}/gastos`, gasto);

    toast.promise(promise, {
      loading: "Creando gasto...",
      success: "Gasto creado exitosamente",
      error: "Error al crear el gasto",
    });

    try {
      const response = await promise;
      return response.data;
    } catch (error) {
      console.error("Error al crear el gasto:", error);
      throw error;
    }
  },

  updateGasto: async (gasto: Partial<Gasto>): Promise<Gasto> => {
    try {
      const response = await toast.promise(
        axiosInstance.put(`${API_URL}/gastos`, gasto),
        {
          loading: "Actualizando gasto...",
          success: "Gasto actualizado exitosamente",
          error: "Error al actualizar el gasto",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el gasto:", error);
      throw error;
    }
  },

  deleteGasto: async (id: number): Promise<void> => {
    try {
      await toast.promise(axiosInstance.delete(`${API_URL}/gastos/${id}`), {
        loading: "Eliminando gasto...",
        success: "Gasto eliminado exitosamente",
        error: "Error al eliminar el gasto",
      });
    } catch (error) {
      console.error("Error al eliminar el gasto:", error);
      throw error;
    }
  },

  getGastosProveedor: async (): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/gasto-proveedors`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener los gastos por proveedor:", error);
      throw error;
    }
  },

  getGastosCategory: async (): Promise<any[]> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/gasto-categories`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener los gastos por categoría:", error);
      throw error;
    }
  },
};
