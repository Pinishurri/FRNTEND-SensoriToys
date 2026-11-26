import apiClient from './api.client';
import type { RolSesion } from './sesion.service';

export interface LoginPayload {
  email: string;
  contrasenia: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  nombre: string;
  email: string;
  rol: RolSesion;
}

export interface RegistroPayload {
  nombre: string;
  apellido?: string;
  segundoApellido?: string;
  email: string;
  contrasenia: string;
  direccionEnvio?: string;
  referenciaPago?: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  apellido?: string;
  segundoApellido?: string;
  email: string;
  direccionEnvio?: string;
  calle?: string;
  numero?: string;
  deptoOficina?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  referenciaPago?: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion?: string;
  rol: RolSesion | null;
}

export interface UsuarioActualizarPayload {
  nombre: string;
  apellido?: string;
  segundoApellido?: string;
  email: string;
  direccionEnvio?: string;
  calle?: string;
  numero?: string;
  deptoOficina?: string;
  comuna?: string;
  ciudad?: string;
  region?: string;
  referenciaPago?: string;
}

export interface CambiarContraseniaPayload {
  contraseniaActual: string;
  contraseniaNueva: string;
}

const resource = '/usuarios';

export const UsuarioService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>(`${resource}/login`, payload);
    return data;
  },

  async registrar(payload: RegistroPayload): Promise<void> {
    await apiClient.post(`${resource}/registro`, payload);
  },

  async listar(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Usuario[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async obtener(id: number): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(`${resource}/${id}`);
    return data;
  },

  async actualizar(id: number, payload: UsuarioActualizarPayload): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(`${resource}/${id}`, payload);
    return data;
  },

  async cambiarContrasenia(id: number, payload: CambiarContraseniaPayload): Promise<void> {
    await apiClient.patch(`${resource}/${id}/contrasenia`, payload);
  },

  async asignarRol(id: number, rol: RolSesion): Promise<Usuario> {
    const { data } = await apiClient.put<Usuario>(`${resource}/${id}/rol`, null, { params: { rol } });
    return data;
  },

  async desactivar(id: number): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
  },

  async activar(id: number): Promise<void> {
    await apiClient.put(`${resource}/${id}/activar`);
  }
};

export default UsuarioService;
