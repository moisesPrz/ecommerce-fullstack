import { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../api/axiosConfig'; // Dejamos la ruta simple sin extensión
import { useAuth } from '../context/AuthContext'; // Dejamos la ruta simple sin extensión
import { useCart } from '../context/CartContext'; // Dejamos la ruta simple sin extensión
import { useNavigate } from 'react-router-dom';

// Configuración global de la API de Gemini
const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=`;
const API_KEY = ""; // La clave se proporciona en tiempo de ejecución por el entorno.

/**
 * Función para llamar a la API de Gemini con reintentos (Exponential Backoff).
 * @param {string} prompt El mensaje del usuario.
 * @param {string} systemInstruction La instrucción de rol para el modelo.
 */
const fetchGeminiContent = async (prompt, systemInstruction) => {
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
    };

    const maxRetries = 3;
    let delay = 1000; // 1 segundo de inicio

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 || !response.ok) {
                // Si es un error de tasa limitada (429) o un error de servidor
                throw new Error(`API Error: ${response.statusText}`);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar una justificación.";
            return text;

        } catch (error) {
            if (i < maxRetries - 1) {
                console.warn(`Gemini API falló. Reintentando en ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Duplicar el retraso (Backoff)
            } else {
                throw new Error("Fallo la conexión con Gemini después de varios reintentos.");
            }
        }
    }
};


const ProductosPage = () => {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null); 
    const [searchTerm, setSearchTerm] = useState('');

    const { user, logout } = useAuth();
    const { addToCart, itemsCount } = useCart();
    const navigate = useNavigate();

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return productos;
        return productos.filter(p => 
            p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [productos, searchTerm]);


    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const res = await api.get('/productos');
                setProductos(res.data);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Componente Modal de Detalle (Actualizado con IA)
    const ProductModal = useCallback(({ product, onClose }) => {
        const [geminiLoading, setGeminiLoading] = useState(false);
        const [geminiResponse, setGeminiResponse] = useState('');

        const fetchRecommendation = async () => {
            setGeminiLoading(true);
            setGeminiResponse('');

            const systemPrompt = "Actúa como un experto en productos, amigable y peculiar. Genera una única frase corta (máximo 20 palabras) y divertida, justificando por qué el usuario debería comprar este producto.";
            const userQuery = `Producto: ${product.nombre}. Categoría: ${product.categoria}. Precio: ${parseFloat(product.precio).toFixed(2)}. Dame una razón de compra.`;

            try {
                const response = await fetchGeminiContent(userQuery, systemPrompt);
                setGeminiResponse(response);
            } catch (e) {
                setGeminiResponse("Gemini falló al cargar la recomendación.");
            } finally {
                setGeminiLoading(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 scale-100" onClick={e => e.stopPropagation()}>
                    <div className="p-8">
                        <h3 className="text-3xl font-extrabold text-gray-800 mb-4 border-b pb-2">{product.nombre}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                 <img src={product.imagen_url || 'https://via.placeholder.com/250x250?text=Sin+Imagen'} alt={product.nombre} className="max-h-full max-w-full object-contain rounded-lg" />
                            </div>
                            <div>
                                <p className="text-gray-600 mb-4">{product.descripcion}</p>
                                <div className="mb-4">
                                    <span className="text-4xl font-bold text-green-600">${parseFloat(product.precio).toFixed(2)}</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-6">Categoría: {product.categoria} | Stock: {product.stock}</p>
                                
                                {/* 🌟 FUNCIÓN GEMINI: Botón y Resultado 🌟 */}
                                <div className="border p-4 rounded-lg bg-yellow-50 border-yellow-200">
                                    <h4 className="font-bold text-sm text-yellow-800 mb-2">Justificación de Compra:</h4>
                                    
                                    {geminiLoading && <p className="text-sm text-yellow-700 animate-pulse">Generando justificación...</p>}
                                    {geminiResponse && !geminiLoading && <p className="text-gray-800 italic">{geminiResponse}</p>}
                                    
                                    {!geminiResponse && !geminiLoading && (
                                        <button 
                                            onClick={fetchRecommendation}
                                            className="mt-2 text-sm bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition shadow-md font-semibold"
                                        >
                                            Pregúntale a Gemini ✨
                                        </button>
                                    )}
                                </div>
                                {/* ----------------------------------- */}

                                <button 
                                    onClick={() => {addToCart(product); onClose();}}
                                    className="w-full bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg font-semibold mt-6"
                                >
                                    Agregar al Carrito (x1)
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 text-center border-t">
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">Cerrar</button>
                    </div>
                </div>
            </div>
        );
    }, [addToCart]); // Dependencia de useCallback para mantener la función en el modal

    if (loading) return <div className="text-center p-10 text-xl font-semibold text-gray-600">Cargando catálogo...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
            
            {/* Navbar - Usando el Layout de App.jsx */}
            <div className="container mx-auto p-4">
                <h2 className="text-4xl font-extrabold text-gray-800 mb-10 text-center">Productos Disponibles</h2>
                
                {/* Barra de Búsqueda */}
                <div className="mb-6 flex justify-center">
                    <input 
                        type="text"
                        placeholder="Buscar productos por nombre o categoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-3 border rounded-full w-full max-w-lg shadow-inner focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 text-lg">No se encontraron productos.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredProducts.map((producto) => (
                            <div 
                                key={producto.id} 
                                className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition duration-300 cursor-pointer"
                                onClick={() => setSelectedProduct(producto)}
                            >
                                {/* Imagen del Producto */}
                                <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                                    <img src={producto.imagen_url || 'https://via.placeholder.com/200x200?text=Producto'} alt={producto.nombre} className="h-full w-full object-cover" />
                                </div>
                                
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-1 line-clamp-1">{producto.nombre}</h3>
                                    <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-2">{producto.descripcion}</p>
                                    
                                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                                        <span className="text-2xl font-extrabold text-green-600">
                                            ${parseFloat(producto.precio).toFixed(2)}
                                        </span>
                                        <button 
                                            onClick={(e) => {e.stopPropagation(); addToCart(producto);}}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md font-semibold text-sm"
                                        >
                                            Añadir
                                        </button>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-400">Stock: {producto.stock}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductosPage;