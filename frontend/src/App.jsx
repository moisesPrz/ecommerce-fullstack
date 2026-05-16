import React, { useState, useEffect } from 'react';
import api from './config/api'; // <--- IMPORTAMOS DESDE CONFIG
import { AlertCircle, CheckCircle } from 'lucide-react';

import Navbar from './components/Navbar';
import ProductFilters from './components/ProductFilters';
import PaginaCatalogo from './pages/CatalogPage';
import PaginaLogin from './pages/LoginPage';
import PaginaRegistro from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import OrdersPage from './pages/OrdersPage';
import PaymentPage from './pages/PaymentPage';
import VendedorPage from './pages/VendedorPage';
export default function App() {
  const [vistaActual, setVistaActual] = useState('catalogo');
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mensajeFlash, setMensajeFlash] = useState(null);
  const [usuario, setUsuario] = useState(() => {
    const savedUser = localStorage.getItem('usuario');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const cargarProductosBackend = async (filtros = {}) => {
    try {
      const params = new URLSearchParams(filtros).toString();
      // USAMOS API
      const respuesta = await api.get(`/productos?${params}`);
      setProductos(respuesta.data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  useEffect(() => { cargarProductosBackend(); }, []);

  const mostrarNotificacion = (texto) => { setMensajeFlash(texto); setTimeout(() => setMensajeFlash(null), 3000); };
  const manejarLogin = (datosUsuario, tokenRecibido) => {
    setUsuario(datosUsuario); setToken(tokenRecibido);
    localStorage.setItem('token', tokenRecibido); localStorage.setItem('usuario', JSON.stringify(datosUsuario));
    setVistaActual('catalogo'); mostrarNotificacion(`¡Bienvenido, ${datosUsuario.nombre}! 👋`);
  };
  const manejarLogout = () => {
    setUsuario(null); setToken(null); setCarrito([]);
    localStorage.removeItem('token'); localStorage.removeItem('usuario');
    setVistaActual('catalogo'); mostrarNotificacion("Sesión cerrada.");
  };
  const agregarAlCarrito = (producto) => {
    setCarrito(prev => {
        const existe = prev.find(item => item.id === producto.id);
        if (existe) { mostrarNotificacion(`+1 unidad: ${producto.nombre}`); return prev.map(item => item.id === producto.id ? { ...item, cantidad: Math.min(item.stock, item.cantidad + 1) } : item); }
        mostrarNotificacion(`Agregado: ${producto.nombre}`); return [...prev, { ...producto, cantidad: 1 }];
    });
  };
  const eliminarDelCarrito = (id) => { setCarrito(prev => prev.filter(item => item.id !== id)); mostrarNotificacion("Eliminado 🗑️"); };
  const actualizarCantidad = (id, cambio) => { setCarrito(prev => prev.map(item => { if (item.id === id) { const n = item.cantidad + cambio; if (n > 0 && n <= item.stock) return { ...item, cantidad: n }; } return item; })); };

  // --- FLUJO DE PAGO ---
  const irAPagar = () => {
    if (carrito.length === 0) return alert("Carrito vacío");
    if (!token) { alert("Inicia sesión."); setVistaActual('login'); return; }
    setVistaActual('pago');
  };

  const finalizarPedido = async (paymentId) => {
    try {
      const itemsParaBackend = carrito.map(p => ({ id: p.id, quantity: p.cantidad, precio: p.precio }));
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // USAMOS API
      const res = await api.post('/pedidos', { items: itemsParaBackend, paymentId }, config);
      await cargarProductosBackend();
      alert(`¡PAGO EXITOSO! 💳✅\nPedido #${res.data.pedidoId}`);
      setCarrito([]); setVistaActual('pedidos');
    } catch (error) { console.error(error); alert("Error guardando el pedido."); }
  };

  // --- ADMIN ---
  const agregarProducto = async (nuevo) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // USAMOS API
      await api.post('/productos', nuevo, config);
      await cargarProductosBackend(); mostrarNotificacion("Creado ✅");
    } catch (error) { alert("Error al crear"); }
  };
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar?")) return;
    try { const config = { headers: { Authorization: `Bearer ${token}` } }; await api.delete(`/productos/${id}`, config); await cargarProductosBackend(); mostrarNotificacion("Eliminado 🗑️"); } catch (error) { alert("Error al eliminar."); }
  };
  const editarProducto = async (id, datos) => {
    try { const config = { headers: { Authorization: `Bearer ${token}` } }; await api.put(`/productos/${id}`, datos, config); await cargarProductosBackend(); mostrarNotificacion("Actualizado ✨"); } catch (error) { alert("Error al actualizar"); }
  };

  const renderizarVista = () => {
    switch(vistaActual) {
      case 'catalogo': return <div className="max-w-6xl mx-auto p-4"><ProductFilters onFiltrar={cargarProductosBackend} /><PaginaCatalogo productos={productos} agregarAlCarrito={agregarAlCarrito} /></div>;
      case 'login': return <PaginaLogin onLogin={manejarLogin} alIrARegistro={() => setVistaActual('registro')} />;
      case 'registro': return <PaginaRegistro onRegistro={manejarLogin} alIrALogin={() => setVistaActual('login')} />;
      case 'pedidos': return <OrdersPage />;
      case 'carrito': if (!usuario) return <PaginaLogin onLogin={manejarLogin} alIrARegistro={() => setVistaActual('registro')} />; return <CartPage carrito={carrito} onEliminar={eliminarDelCarrito} onActualizarCantidad={actualizarCantidad} onComprar={irAPagar} />;
      case 'pago': return <PaymentPage carrito={carrito} token={token} onCompraExitosa={finalizarPedido} />;
      case 'vendedor':
         if (!usuario || usuario.rol !== 'vendedor') return <div className="p-10 text-center">Acceso Denegado</div>;
          return <VendedorPage />;
      case 'admin':
          if (!usuario || usuario.rol !== 'administrador') return <div className="p-10 text-center">Acceso Denegado</div>;
         return <AdminPage />;
      case 'admin': if (!usuario || usuario.rol !== 'administrador') return <div className="p-10 text-center">Acceso Denegado</div>; return <AdminPage productos={productos} onAgregar={agregarProducto} onEliminar={eliminarProducto} onEditar={editarProducto} />;
      default: return <PaginaCatalogo productos={productos} agregarAlCarrito={agregarAlCarrito} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800 relative">
      <Navbar usuario={usuario} vistaActual={vistaActual} onNavegar={setVistaActual} onCerrarSesion={manejarLogout} carritoCantidad={carrito.length} />
      <main>{renderizarVista()}</main>
      {mensajeFlash && <div className="fixed bottom-5 right-5 z-50 animate-bounce"><div className="bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3"><CheckCircle className="h-5 w-5 text-green-400" /><span className="font-medium">{mensajeFlash}</span></div></div>}
    </div>
  );
}