import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";

export interface CuentaCorriente {
  id: number;
  fechaHora: string;
  detalle: string;
  debe: number;
  haber: number;
  saldo: number;
  clienteId: number;
}

export interface SaldoResponse {
  saldo: number;
}

export interface PagoRequest {
  clienteId: number;
  haber: number;
  debe: number;
  fechaHora: string | null;
}

export const cuentaCorrienteService = {
  // Obtener movimientos de cuenta corriente de un cliente
  getMovimientos: async (
    clienteId: number,
    page: number = 0,
    size: number = 8
  ) => {
    const response = await axiosInstance.get<CuentaCorriente[]>(
      `${API_URL}/cuenta-corrientes`,
      {
        params: {
          page,
          size,
          "clienteId.equals": clienteId,
          sort: "id,desc",
        },
      }
    );
    return response;
  },

  // Obtener saldo de un cliente
  getSaldo: async (clienteId: number) => {
    const response = await axiosInstance.get<SaldoResponse>(
      `${API_URL}/cuenta-corrientes/${clienteId}/saldo`
    );
    return response.data;
  },

  // Registrar un pago de cuenta corriente
  registrarPago: async (pagoData: PagoRequest, tipoPagoId: number) => {
    const response = await axiosInstance.post(
      `${API_URL}/cuenta-corrientes/pago/${tipoPagoId}`,
      pagoData
    );
    return response.data;
  },

  // Obtener tipos de pago disponibles
  getTiposPago: async () => {
    const response = await axiosInstance.get(`${API_URL}/tipo-pagos`);
    // Filtrar solo los tipos de pago que queremos (1,2,3,5 como en erpweb)
    const tiposFiltrados = response.data.filter((tipo: any) =>
      [1, 2, 3, 5].includes(tipo.id)
    );
    return tiposFiltrados;
  },
};
