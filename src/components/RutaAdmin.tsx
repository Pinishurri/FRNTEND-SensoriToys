import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import SesionService from '../services/sesion.service';

interface RutaAdminProps {
  children: ReactNode;
}

const RutaAdmin = ({ children }: RutaAdminProps) =>
  SesionService.esAdmin() ? children : <Navigate to="/login" replace />;

export default RutaAdmin;
