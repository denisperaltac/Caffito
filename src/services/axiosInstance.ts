import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://test.caffito.com.ar/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
