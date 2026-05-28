// src/routes/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Spinner de carga
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#0B1D3A', borderTopColor: 'transparent' }} />
      <p className="text-sm text-slate-500 font-medium">Cargando...</p>
    </div>
  </div>
);

// Ruta que requiere autenticación
export const PrivateRoute = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Spinner />;

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Ruta que requiere rol administrador
export const AdminRoute = ({ children }) => {
  const { estaAutenticado, esAdmin, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Spinner />;

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!esAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-5xl mb-4">🚫</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
          <p className="text-slate-500">No tienes permisos de administrador.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Ruta que requiere rol vendedor
export const VendedorRoute = ({ children }) => {
  const { estaAutenticado, esVendedor, cargando } = useAuth();
  const location = useLocation();

  if (cargando) return <Spinner />;

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!esVendedor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-5xl mb-4">🚫</p>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Denegado</h2>
          <p className="text-slate-500">Necesitas una cuenta de vendedor.</p>
        </div>
      </div>
    );
  }

  return children;
};

// Ruta pública — redirige si ya está autenticado (login/registro)
export const PublicRoute = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth();

  if (cargando) return <Spinner />;

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
};
