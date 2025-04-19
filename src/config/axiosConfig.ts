import axios from "axios";
import { authService } from "../services/authService";

const axiosInstance = axios.create({
  baseURL: "https://test.caffito.com.ar",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  },
  timeout: 10000,
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Error en la petición:", error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en la respuesta:", error);
    if (error.response?.status === 401) {
      authService.logout();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const API_URL = "https://test.caffito.com.ar/api";
export default axiosInstance;
