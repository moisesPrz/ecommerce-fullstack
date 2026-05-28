// src/components/layout/Layout.jsx
import { Outlet } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Navbar from './Navbar';
import { ToastContainer } from '../ui/index';

// Contexto global de notificaciones
import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export default function Layout() {
  const [toasts, setToasts] = useState([]);

  const mostrar = useCallback((mensaje, tipo = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const toast = {
    exito: (msg) => mostrar(msg, 'success'),
    error: (msg) => mostrar(msg, 'error'),
    info: (msg) => mostrar(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      <div className="min-h-screen flex flex-col" style={{ background: '#F8F9FC' }}>
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="py-6 border-t border-slate-100 bg-white mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-400">
              © 2025 <span className="font-semibold" style={{ color: '#0B1D3A' }}>TechMarket</span>
              {' '}— El marketplace tecnológico de Colombia 🇨🇴
            </p>
          </div>
        </footer>
        <ToastContainer toasts={toasts} />
      </div>
    </ToastContext.Provider>
  );
}
