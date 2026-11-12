import apiClient from './api.client';

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: Categoria | null;
  edad?: string;
  imagenUrl?: string;
  activo?: boolean;
}

export type ProductoPayload = Omit<Producto, 'id'>;

const resource = '/productos';

export const ProductoService = {
  async listar(): Promise<Producto[]> {
    const { data } = await apiClient.get<Producto[]>(resource);
    return Array.isArray(data) ? data : [];
  },

  async listarTodos(): Promise<Producto[]> {
    const { data } = await apiClient.get<Producto[]>(`${resource}/todos`);
    return Array.isArray(data) ? data : [];
  },

  async obtener(id: number): Promise<Producto> {
    const { data } = await apiClient.get<Producto>(`${resource}/${id}`);
    return data;
  },

  async crear(producto: ProductoPayload): Promise<Producto> {
    const { data } = await apiClient.post<Producto>(resource, producto);
    return data;
  },

  async actualizar(id: number, producto: ProductoPayload): Promise<Producto> {
    const { data } = await apiClient.put<Producto>(`${resource}/${id}`, producto);
    return data;
  },

  async eliminar(id: number): Promise<void> {
    await apiClient.delete(`${resource}/${id}`);
  }
};

export default ProductoService;
