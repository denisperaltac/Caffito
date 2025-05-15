import axiosInstance from "../config/axiosConfig";
import { API_URL } from "../constants/api";

interface BaseSummaryData {
  fechaInicio: string;
  fechaFin: string;
}

interface CategoryData {
  categoriaId: number;
  categoriaNombre: string;
  total: number;
}

interface MonthData {
  mes: number;
  anio: number;
  total: number;
}

interface WeekData {
  semana: number;
  mes: number;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  total: number;
}

export interface IncomeSummaryData extends BaseSummaryData {
  totalIngresos: number;
  ingresosPorCategoria: CategoryData[];
  ingresosPorMes: MonthData[];
  ingresosPorSemana: WeekData[];
  ingresosPorCategoriaProducto: CategoryData[];
}

export interface ExpenseSummaryData extends BaseSummaryData {
  totalGastos: number;
  gastosPorCategoria: CategoryData[];
  gastosPorMes: MonthData[];
  gastosPorSemana: WeekData[];
}

export const statisticsService = {
  getIncomeSummary: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<IncomeSummaryData> => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/ingresos/summary?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching income summary:", error);
      throw error;
    }
  },

  getExpenseSummary: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<ExpenseSummaryData> => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/gastos/summary?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching expense summary:", error);
      throw error;
    }
  },
};
