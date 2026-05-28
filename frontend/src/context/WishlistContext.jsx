import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const guardado = localStorage.getItem('wishlist');
      return guardado ? JSON.parse(guardado) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    const handler = () => setWishlist([]);
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, []);

  const estaEnWishlist = (id) => wishlist.some((p) => p.id === id);

  const toggleWishlist = (producto) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === producto.id)
        ? prev.filter((p) => p.id !== producto.id)
        : [...prev, producto]
    );
  };

  const limpiarWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider value={{ wishlist, estaEnWishlist, toggleWishlist, limpiarWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
