import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";

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
    try {
      const response = await axiosInstance.post(`${API_URL}/clientes`, cliente);
      return response.data;
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      throw error;
    }
  },

  updateCliente: async (
    id: number,
    cliente: Partial<Cliente>
  ): Promise<Cliente> => {
    try {
      const response = await axiosInstance.put(
        `${API_URL}/clientes/${id}`,
        cliente
      );
      return response.data;
    } catch (error) {
      console.error("Error al actualizar el cliente:", error);
      throw error;
    }
  },

  deleteCliente: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${API_URL}/clientes/${id}`);
    } catch (error) {
      console.error("Error al eliminar el cliente:", error);
      throw error;
    }
  },
};
