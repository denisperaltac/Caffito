import axiosInstance, { API_URL } from "../config/axiosConfig";

export interface FlujoCaja {
  id: number;
  ingresoEfectivo: number;
  pendiente: number;
  egreso: number | null;
  motivo: string | null;
  fechaHora: string;
  diferencia: number;
  cajaId: number;
  tipoPagoId: number;
  tipoPagoNombre: string;
}

export interface Caja {
  id: number;
  inicio: number;
  cierre: number | null;
  enproceso: boolean;
  fecha: string;
  fechaCierre: string | null;
  ingreso: number;
  egreso: number;
  userId: number;
  userLogin: string;
  puntoDeVentaId: number;
  puntoDeVentaNombre: string;
  flujoCajas: FlujoCaja[];
}

export interface CierreCajaItem {
  ingresoEfectivo: number;
  tipoPagoNombre: string;
  tipoPagoId: number;
}

interface GetCajasParams {
  page?: number;
  size?: number;
  sort?: string;
}

export const cajaService = {
  getCajas: async (params: GetCajasParams = {}): Promise<Caja[]> => {
    try {
      const { page, size, sort = "id,desc" } = params;
      const response = await axiosInstance.get<Caja[]>(`${API_URL}/cajas`, {
        params: {
          page,
          size,
          sort,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener cajas:", error);
      throw error;
    }
  },

  getCajasCount: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get<number>(
        `${API_URL}/cajas/count`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener el conteo de cajas:", error);
      throw error;
    }
  },

  getCurrentCaja: async (): Promise<Caja | null> => {
    try {
      const response = await axiosInstance.get<Caja>(
        `${API_URL}/cajas/current`
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener la caja actual:", error);
      throw error;
    }
  },

  openCaja: async (inicio: number): Promise<Caja> => {
    try {
      const response = await axiosInstance.post<Caja>(
        `${API_URL}/cajas/iniciar`,
        inicio.toString(),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error al abrir la caja:", error);
      throw error;
    }
  },

  closeCaja: async (items: CierreCajaItem[]): Promise<Caja> => {
    try {
      const response = await axiosInstance.post<Caja>(
        `${API_URL}/cajas/cerrar`,
        items
      );
      return response.data;
    } catch (error) {
      console.error("Error al cerrar la caja:", error);
      throw error;
    }
  },

  updateCaja: async (caja: Caja): Promise<Caja> => {
    try {
      const response = await axiosInstance.put<Caja>(`${API_URL}/cajas`, caja);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar la caja:", error);
      throw error;
    }
  },

  getTiposPago: async (): Promise<{ id: number; nombre: string }[]> => {
    try {
      const response = await axiosInstance.get<
        { id: number; nombre: string }[]
      >(`${API_URL}/tipo-pagos`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener tipos de pago:", error);
      throw error;
    }
  },

  updateFlujoCaja: async (flujoCaja: FlujoCaja): Promise<FlujoCaja> => {
    try {
      console.log("Sending to API:", flujoCaja);
      const response = await axiosInstance.put<FlujoCaja>(
        `${API_URL}/flujo-cajas`,
        flujoCaja
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar flujo de caja:", error);
      throw error;
    }
  },
};
