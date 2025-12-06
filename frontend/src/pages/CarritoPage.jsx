import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axiosConfig';

const CarritoPage = () => {
    const { cart, removeFromCart, clearCart, total } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Función para procesar la compra
    const handleCheckout = async () => {
        if (!user) {
            alert("Debes iniciar sesión para comprar");
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // Enviamos el carrito al backend
            // El backend usa el token para saber qué usuario está comprando
            await api.post('/pedidos', { items: cart });
            
            // Usamos alert temporalmente, en un proyecto real sería un modal
            alert('¡Compra realizada con éxito! 🚀');
            clearCart(); // Vaciamos el carrito
            navigate('/productos'); 
        } catch (error) {
            console.error(error);
            alert('Error al procesar la compra');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <span className="text-6xl">🛒</span>
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Tu carrito está vacío</h2>
                    <p className="text-gray-600 mb-6">Parece que aún no has agregado productos.</p>
                    <button 
                        onClick={() => navigate('/productos')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Volver al Catálogo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Tu Carrito de Compras</h1>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Lista de Productos */}
                    <div className="p-6 space-y-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        {item.imagen_url ? (
                                            <img src={item.imagen_url} alt={item.nombre} className="h-full w-full object-cover rounded-lg" />
                                        ) : (
                                            <span className="text-2xl">📦</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{item.nombre}</h3>
                                        <p className="text-sm text-gray-500">{item.categoria}</p>
                                        <div className="text-blue-600 font-medium mt-1">
                                            ${item.precio} x {item.quantity} un.
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-xl font-bold text-gray-800">
                                        ${(item.precio * item.quantity).toFixed(2)}
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                                        title="Eliminar producto"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Resumen y Botón de Pago */}
                    <div className="bg-gray-50 p-8 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-xl text-gray-600">Total a Pagar:</span>
                            <span className="text-4xl font-bold text-blue-600">${total.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 justify-end">
                            <button 
                                onClick={() => navigate('/productos')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-white transition"
                            >
                                Seguir Comprando
                            </button>
                            <button 
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Procesando...' : 'Confirmar Compra ✅'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarritoPage;