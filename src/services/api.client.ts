import axios from 'axios';
import SesionService from './sesion.service';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8089/api/v1';

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

export const obtenerMensajeErrorDetallado = (error: unknown, mensajePorDefecto: string): string => {
  if (!axios.isAxiosError<{ error?: string }>(error)) {
    return mensajePorDefecto;
  }
  if (!error.response) {
    return 'Sin conexión con el servidor. Verifica que el gateway y ms_productos estén en ejecución.';
  }
  const { status, data } = error.response;
  if (status === 401 || status === 403) {
    return 'Tu sesión venció o no tienes permisos de administrador. Vuelve a iniciar sesión.';
  }
  if (status === 400 && data?.error) {
    return data.error;
  }
  return `${mensajePorDefecto} (código HTTP ${status})`;
};

export default apiClient;
