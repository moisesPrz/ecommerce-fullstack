// src/services/api.js
// Axios con interceptors — el token se agrega automáticamente a TODAS las peticiones

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// ── INTERCEPTOR DE REQUEST ────────────────────────────────
// Agrega el token automáticamente — nunca más pasar config manualmente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── INTERCEPTOR DE RESPONSE ───────────────────────────────
// Maneja errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado → limpiar sesión y redirigir
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
