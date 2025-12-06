import React, { useState, useEffect } from 'react';
import api from '../config/api'; // Importamos la configuración
import { Package, Calendar, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';

const OrdersPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoExpandido, setPedidoExpandido] = useState(null);

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Usamos api.get
        const res = await api.get('/pedidos/mis-pedidos', config);
        setPedidos(res.data);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarPedidos();
  }, []);

  const toggleDetalles = (id) => setPedidoExpandido(pedidoExpandido === id ? null : id);

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando historial...</div>;
  if (pedidos.length === 0) return <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400"><Package className="h-16 w-16 mb-4" /><h2 className="text-xl font-bold">No tienes pedidos</h2></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3"><ShoppingBag /> Mis Pedidos</h2>
      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
            <div className="p-4 bg-slate-50 flex items-center justify-between cursor-pointer" onClick={() => toggleDetalles(pedido.id)}>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Package className="h-6 w-6" /></div>
                <div><p className="font-bold text-slate-800">Pedido #{pedido.id}</p><div className="flex items-center gap-1 text-xs text-slate-500"><Calendar className="h-3 w-3" />{new Date(pedido.createdAt).toLocaleDateString()}</div></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right"><p className="text-sm text-slate-500">Total</p><p className="font-bold text-slate-900">${Number(pedido.total).toFixed(2)}</p></div>
                {pedidoExpandido === pedido.id ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
              </div>
            </div>
            {pedidoExpandido === pedido.id && (
              <div className="p-4 border-t border-slate-100 bg-white">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Productos</h4>
                <ul className="space-y-3">
                  {pedido.Productos && pedido.Productos.map((prod) => (
                    <li key={prod.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3"><img src={prod.imagen_url} alt="" className="h-10 w-10 object-cover rounded bg-gray-100" /><div><p className="font-medium text-slate-700">{prod.nombre}</p><p className="text-slate-400">Cant: {prod.DetallePedido.cantidad}</p></div></div>
                      <p className="font-bold text-slate-600">${Number(prod.DetallePedido.precio_unitario).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;