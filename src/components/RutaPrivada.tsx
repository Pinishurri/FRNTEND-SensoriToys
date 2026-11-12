import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import SesionService from '../services/sesion.service';

interface RutaPrivadaProps {
  children: ReactNode;
}

const RutaPrivada = ({ children }: RutaPrivadaProps) => {
  const location = useLocation();

  return SesionService.estaAutenticado() ? (
    children
  ) : (
    <Navigate to="/login" replace state={{ desde: location.pathname }} />
  );
};

export default RutaPrivada;
