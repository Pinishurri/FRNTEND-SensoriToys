export type RolSesion = 'ADMIN' | 'CLIENTE';

export interface Sesion {
  token: string;
  id: number;
  nombre: string;
  email: string;
  rol: RolSesion;
}

const SESION_KEY = 'sesion';

const leerSesion = (): Sesion | null => {
  try {
    const guardada = localStorage.getItem(SESION_KEY);
    return guardada ? (JSON.parse(guardada) as Sesion) : null;
  } catch {
    return null;
  }
};

export const SesionService = {
  obtener(): Sesion | null {
    return leerSesion();
  },

  obtenerToken(): string | null {
    return leerSesion()?.token ?? null;
  },

  esAdmin(): boolean {
    return leerSesion()?.rol === 'ADMIN';
  },

  estaAutenticado(): boolean {
    return leerSesion() !== null;
  },

  iniciar(sesion: Sesion): void {
    localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
  },

  cerrar(): void {
    localStorage.removeItem(SESION_KEY);
  }
};

export default SesionService;
