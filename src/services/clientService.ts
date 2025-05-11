import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";
import { toast } from "react-hot-toast";

export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  numeroDocumento: string;
  tipoDocumentoNombre: string | null;
  mayorista: boolean | null;
  empleado: boolean | null;
  activo: boolean;
  email: string;
  telefono: string;
  direccion: string;
  createdAt: string;
  updatedAt: string;
  tipoDocumentoId?: number;
}

export interface GetClientesParams {
  page?: number;
  size?: number;
  sort?: string;
  "nombre.contains"?: string;
  "apellido.contains"?: string;
  numeroDocumento?: string;
  tipoDocumentoId?: number;
  mayorista?: boolean;
  empleado?: boolean;
  activo?: boolean;
}

export const clientService = {
  getClientes: async (params: GetClientesParams = {}): Promise<Cliente[]> => {
    try {
      const { page = 0, size = 10, ...rest } = params;
      const response = await axiosInstance.get<Cliente[]>(
        `${API_URL}/clientes`,
        {
          params: {
            page,
            size,
            ...rest,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener los clientes:", error);
      throw error;
    }
  },

  getCountClientes: async (
    params: Omit<GetClientesParams, "page" | "size"> = {}
  ): Promise<number> => {
    try {
      const response = await axiosInstance.get<number>(
        `${API_URL}/clientes/count`,
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el count de clientes:", error);
      throw error;
    }
  },

  getCliente: async (id: number): Promise<Cliente> => {
    try {
      const response = await axiosInstance.get(`${API_URL}/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener el cliente:", error);
      throw error;
    }
  },

  createCliente: async (cliente: Partial<Cliente>): Promise<Cliente> => {
    const promise = axiosInstance.post(`${API_URL}/clientes`, cliente);

    toast.promise(promise, {
      loading: "Creando cliente...",
      success: "Cliente creado exitosamente",
      error: "Error al crear el cliente",
    });

    try {
      const response = await promise;
      return response.data;
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      throw error;
    }
  },

  updateCliente: async (cliente: Partial<Cliente>): Promise<Cliente> => {
    try {
      const response = await toast.promise(
        axiosInstance.put(`${API_URL}/clientes`, cliente),
        {
          loading: "Actualizando cliente...",
          success: "Cliente actualizado exitosamente",
          error: "Error al actualizar el cliente",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      throw error;
    }
  },

  deactiveCliente: async (cliente: Partial<Cliente>): Promise<Cliente> => {
    const promise = axiosInstance.put(`${API_URL}/clientes`, {
      ...cliente,
      activo: false,
    });

    toast.promise(promise, {
      loading: "Desactivando cliente...",
      success: "Cliente desactivado exitosamente",
      error: "Error al desactivar el cliente",
    });

    try {
      const response = await promise;
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      throw error;
    }
  },
};
