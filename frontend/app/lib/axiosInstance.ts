import axios from "axios";
import { useAuthStore } from "../store/authStore";

const axiosSelf = axios.create({ baseURL: "http://localhost:5000/api",
  withCredentials: true, });

axiosSelf.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosSelf.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // אם זה כבר retry, אל תנסה שוב
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await useAuthStore.getState().refreshToken();
      if (newToken) {
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return axiosSelf(originalRequest);
      }
      // אם refresh נכשל, כבר התרחש logout → רק reject
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);


export default axiosSelf;