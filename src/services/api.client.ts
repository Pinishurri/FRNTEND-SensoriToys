import axios from 'axios';
import SesionService from './sesion.service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8089/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use((config) => {
  const token = SesionService.obtenerToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && SesionService.obtenerToken()) {
      SesionService.cerrar();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const obtenerMensajeError = (error: unknown, mensajePorDefecto: string): string => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error ?? mensajePorDefecto;
  }
  return mensajePorDefecto;
};

export default apiClient;
