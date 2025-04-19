import axiosInstance, { API_URL } from "../config/axiosConfig";

interface LoginResponse {
  id_token: string;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        `${API_URL}/authenticate`,
        credentials
      );
      return response.data;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("id_token");
    sessionStorage.removeItem("id_token");
  },

  getToken: (): string | null => {
    return (
      localStorage.getItem("id_token") || sessionStorage.getItem("id_token")
    );
  },

  setToken: (token: string, rememberMe: boolean = false) => {
    if (rememberMe) {
      localStorage.setItem("id_token", token);
    } else {
      sessionStorage.setItem("id_token", token);
    }
  },

  isAuthenticated: (): boolean => {
    return !!(
      localStorage.getItem("id_token") || sessionStorage.getItem("id_token")
    );
  },
};
