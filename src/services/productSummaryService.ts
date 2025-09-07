import axios from "axios";
import { API_URL } from "../constants/api";
import {
  ProductSummaryData,
  ProductSummaryFilters,
} from "../types/productSummary";
import { Category } from "../types/inventory";

const productSummaryService = {
  async getProductSummary(
    filters: ProductSummaryFilters
  ): Promise<ProductSummaryData> {
    try {
      const params = new URLSearchParams();
      params.append("fechaInicio", filters.fechaInicio);
      params.append("fechaFin", filters.fechaFin);

      if (filters.categoriaId) {
        params.append("categoriaId", filters.categoriaId.toString());
      }

      if (filters.orderBy) {
        params.append("orderBy", filters.orderBy);
      }

      if (filters.limit) {
        params.append("limit", filters.limit.toString());
      }

      const response = await axios.get(
        `${API_URL}/productos/summary?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching product summary:", error);
      throw error;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(`${API_URL}/categorias`, {
        params: {
          size: 9999,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

export default productSummaryService;
