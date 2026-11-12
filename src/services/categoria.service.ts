import apiClient from './api.client';
import type { Categoria } from './producto.service';

const resource = '/categorias';

export const CategoriaService = {
    async listar(): Promise<Categoria[]> {
        const { data } = await apiClient.get<Categoria[]>(resource);
        return Array.isArray(data) ? data : [];
    }
};

export default CategoriaService;
