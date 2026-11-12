import apiClient from './api.client';

export interface DetallePedidoPayload {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoPayload {
  usuarioId: number;
  detalles: DetallePedidoPayload[];
}

export interface Pedido {
  id: number;
  usuarioId: number;
  fechaCreacion: string;
  total: number;
  detalles: (DetallePedidoPayload & { id: number })[];
}

const resource = '/pedidos';

export const PedidoService = {
  async listar(): Promise<Pedido[]> {
    const { data } = await apiClient.get<Pedido[]>(resource);
    return Array.isArray(data) ? data : [];
  },
  async listarPorUsuario(usuarioId: number): Promise<Pedido[]> {
    const { data } = await apiClient.get<Pedido[]>(`${resource}/usuario/${usuarioId}`);
    return Array.isArray(data) ? data : [];
  },
  async crear(payload: PedidoPayload): Promise<Pedido> {
    const { data } = await apiClient.post<Pedido>(resource, payload);
    return data;
  }

};

export default PedidoService;
