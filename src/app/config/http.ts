import axios from "axios";
import { authService } from "../../features/auth/services/authService";

axios.defaults.baseURL = "http://localhost:3001";

axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
