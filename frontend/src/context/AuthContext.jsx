// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Restaurar sesión al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('usuario');
    if (token && userData) {
      try {
        setUsuario(JSON.parse(userData));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setCargando(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // Limpiar datos del usuario anterior antes de cargar el nuevo
    window.dispatchEvent(new CustomEvent('auth:logout'));
    const res = await api.post('/auth/login', { email, password });
    const { token, usuario } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
    return usuario;
  }, []);

  const registro = useCallback(async (datos) => {
    window.dispatchEvent(new CustomEvent('auth:logout'));
    const res = await api.post('/auth/register', datos);
    const { token, usuario } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    setUsuario(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }, []);

  const esAdmin = usuario?.rol === 'administrador';
  const esVendedor = ['vendedor', 'administrador'].includes(usuario?.rol);
  const estaAutenticado = !!usuario;

  return (
    <AuthContext.Provider value={{
      usuario, cargando, login, registro, logout,
      esAdmin, esVendedor, estaAutenticado
    }}>
      {children}
    </AuthContext.Provider>
  );
};
