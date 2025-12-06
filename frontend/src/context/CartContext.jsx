import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    // Inicializamos el carrito leyendo de localStorage (para no perder datos al recargar)
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('shopping-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            return [];
        }
    });

    // Cada vez que el carrito cambie, lo guardamos en localStorage
    useEffect(() => {
        localStorage.setItem('shopping-cart', JSON.stringify(cart));
    }, [cart]);

    // Función: Agregar producto
    const addToCart = (product) => {
        setCart(prevCart => {
            // Revisar si el producto ya está en el carrito
            const existingItem = prevCart.find(item => item.id === product.id);

            if (existingItem) {
                // Si existe, aumentamos la cantidad
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            // Si no existe, lo agregamos con cantidad 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Función: Eliminar producto
    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // Función: Vaciar carrito (ej: al comprar)
    const clearCart = () => setCart([]);

    // Cálculo del Total ($)
    const total = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.quantity), 0);

    // Cantidad total de items (para el numerito en el icono del carrito)
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            clearCart, 
            total,
            itemsCount 
        }}>
            {children}
        </CartContext.Provider>
    );
};