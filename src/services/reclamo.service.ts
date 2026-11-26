import apiClient from './api.client';

export type MotivoReclamo = 'PRODUCTO_DEFECTUOSO' | 'RETRASO' | 'REEMBOLSO' | 'OTRO';
export type EstadoReclamo = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';

export interface Reclamo {
  id: number;
  usuarioId: number;
  pedidoId: number | null;
  motivo: MotivoReclamo;
  descripcion: string;
  estado: EstadoReclamo;
  fechaCreacion: string;
}

export type ReclamoPayload = Omit<Reclamo, 'id' | 'estado' | 'fechaCreacion'>;

export const ETIQUETA_MOTIVO: Record<MotivoReclamo, string> = {
  PRODUCTO_DEFECTUOSO: 'Producto defectuoso',
  RETRASO: 'Retraso en la entrega',
  REEMBOLSO: 'Solicitud de reembolso',
  OTRO: 'Otro'
};

export const ETIQUETA_ESTADO: Record<EstadoReclamo, string> = {
  PENDIENTE: 'Pendiente',
  EN_REVISION: 'En revisión',
  RESUELTO: 'Resuelto'
};

const resource = '/reclamos';

export const ReclamoService = {
  async listar(): Promise<Reclamo[]> {
    const { data } = await apiClient.get<Reclamo[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async listarPorUsuario(usuarioId: number): Promise<Reclamo[]> {
    const { data } = await apiClient.get<Reclamo[]>(`${resource}/usuario/${usuarioId}`);
    return Array.isArray(data) ? data : [];
  },

  async crear(payload: ReclamoPayload): Promise<Reclamo> {
    const { data } = await apiClient.post<Reclamo>(resource, payload);
    return data;
  },

  async actualizarEstado(id: number, estado: EstadoReclamo): Promise<Reclamo> {
    const { data } = await apiClient.patch<Reclamo>(`${resource}/${id}/estado`, { estado });
    return data;
  }
};

export default ReclamoService;
