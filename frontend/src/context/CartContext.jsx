// src/context/CartContext.jsx
import { createContext, useState, useContext, useCallback, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
};

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem('carrito');
      return guardado ? JSON.parse(guardado) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    const handler = () => setCarrito([]);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const agregar = useCallback((producto) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.id === producto.id);
      if (existe) {
        return prev.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: Math.min(item.stock, item.cantidad + 1) }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  }, []);

  const eliminar = useCallback((id) => {
    setCarrito(prev => prev.filter(item => item.id !== id));
  }, []);

  const actualizarCantidad = useCallback((id, cambio) => {
    setCarrito(prev => prev.map(item => {
      if (item.id !== id) return item;
      const nueva = item.cantidad + cambio;
      if (nueva < 1 || nueva > item.stock) return item;
      return { ...item, cantidad: nueva };
    }));
  }, []);

  const vaciar = useCallback(() => setCarrito([]), []);

  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const cantidadItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider value={{
      carrito, total, cantidadItems,
      agregar, eliminar, actualizarCantidad, vaciar
    }}>
      {children}
    </CartContext.Provider>
  );
};
