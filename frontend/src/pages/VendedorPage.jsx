// ARCHIVO: frontend/src/pages/VendedorPage.jsx
import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, AlertTriangle, ChevronDown, Plus, Edit, Trash2, Upload, X } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const estadoColor = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700'
};

// ─── TARJETA DE ESTADÍSTICA ─────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

// ─── PANEL PRINCIPAL ─────────────────────────────────────
export default function VendedorPage() {
  const user = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Form nuevo producto
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1 });
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const categorias = [
    { id: 1, nombre: 'Tecnología' }, { id: 2, nombre: 'Audio' },
    { id: 3, nombre: 'Periféricos' }, { id: 4, nombre: 'Mobiliario' }
  ];

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { cargarDatos(); }, [tab]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/vendedor/dashboard', config);
        setDashboard(res.data);
      } else if (tab === 'productos') {
        const res = await api.get('/vendedor/productos', config);
        setProductos(res.data);
      } else if (tab === 'pedidos') {
        const res = await api.get('/vendedor/pedidos', config);
        setPedidos(res.data);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(formProducto).forEach(([k, v]) => formData.append(k, v));
    if (archivoImagen) formData.append('imagen', archivoImagen);

    try {
      if (modoEdicion) {
        await api.put(`/productos/${modoEdicion}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/productos', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }
      setFormProducto({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1 });
      setArchivoImagen(null);
      setModoEdicion(null);
      setMostrarForm(false);
      cargarDatos();
    } catch (error) {
      alert('Error al guardar el producto');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`, config);
      cargarDatos();
    } catch {
      alert('No se puede eliminar, tiene ventas asociadas');
    }
  };

  const cargarEdicion = (p) => {
    setFormProducto({ nombre: p.nombre, precio: p.precio, stock: p.stock, descripcion: p.descripcion || '', id_categoria: p.id_categoria || 1 });
    setModoEdicion(p.id);
    setMostrarForm(true);
  };

  const cambiarEstado = async (pedidoId, estado) => {
    try {
      await api.put(`/vendedor/pedidos/${pedidoId}/estado`, { estado }, config);
      cargarDatos();
    } catch {
      alert('Error al actualizar estado');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Panel Vendedor</h1>
            <p className="text-slate-400 text-sm">Hola, {user?.nombre}</p>
          </div>
          <div className="flex gap-2">
            {['dashboard', 'productos', 'pedidos'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                {t === 'dashboard' ? '📊 Dashboard' : t === 'productos' ? '📦 Productos' : '🛍️ Pedidos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {cargando ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
          </div>
        ) : (
          <>
            {/* ─── DASHBOARD ─── */}
            {tab === 'dashboard' && dashboard && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumen de tu tienda</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard icon={Package} label="Mis Productos" value={dashboard.estadisticas.totalProductos} color="bg-blue-500" />
                  <StatCard icon={ShoppingBag} label="Pedidos Recibidos" value={dashboard.estadisticas.totalPedidos} color="bg-purple-500" />
                  <StatCard icon={DollarSign} label="Total Ventas" value={`$${dashboard.estadisticas.totalVentas}`} color="bg-green-500" />
                  <StatCard icon={AlertTriangle} label="Sin Stock" value={dashboard.estadisticas.sinStock} color="bg-red-500" />
                </div>

                {/* Últimas ventas */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-800 mb-4">Últimas ventas</h3>
                  {dashboard.ultimasVentas?.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-8">Aún no tienes ventas</p>
                  ) : (
                    <div className="space-y-3">
                      {dashboard.ultimasVentas?.map((venta, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <img src={venta.Producto?.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-800">{venta.Producto?.nombre}</p>
                            <p className="text-xs text-slate-500">x{venta.cantidad} unidades</p>
                          </div>
                          <p className="font-bold text-green-600">${(venta.precio_unitario * venta.cantidad).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── PRODUCTOS ─── */}
            {tab === 'productos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Mis Productos</h2>
                  <button onClick={() => { setMostrarForm(!mostrarForm); setModoEdicion(null); setFormProducto({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1 }); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
                    {mostrarForm ? <X size={16} /> : <Plus size={16} />}
                    {mostrarForm ? 'Cancelar' : 'Nuevo producto'}
                  </button>
                </div>

                {/* Formulario */}
                {mostrarForm && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <form onSubmit={handleSubmitProducto} className="grid grid-cols-2 gap-4">
                      <input placeholder="Nombre del producto" value={formProducto.nombre}
                        onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })}
                        className="col-span-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                      <input type="number" placeholder="Precio" value={formProducto.precio}
                        onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })}
                        className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                      <input type="number" placeholder="Stock" value={formProducto.stock}
                        onChange={e => setFormProducto({ ...formProducto, stock: e.target.value })}
                        className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                      <select value={formProducto.id_categoria}
                        onChange={e => setFormProducto({ ...formProducto, id_categoria: e.target.value })}
                        className="p-3 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-3 text-center relative hover:bg-slate-50 cursor-pointer">
                        <input type="file" onChange={e => setArchivoImagen(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        <div className="flex items-center justify-center gap-2 text-slate-500">
                          <Upload size={16} />
                          <span className="text-xs">{archivoImagen ? archivoImagen.name : 'Subir imagen'}</span>
                        </div>
                      </div>
                      <textarea placeholder="Descripción" value={formProducto.descripcion}
                        onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                        className="col-span-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" rows="2" />
                      <button type="submit" className="col-span-2 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-all">
                        {modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Tabla de productos */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-4">Imagen</th>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productos.length === 0 ? (
                        <tr><td colSpan="5" className="p-8 text-center text-slate-400">No tienes productos aún</td></tr>
                      ) : productos.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <img src={p.imagen_url} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-100" />
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-800">{p.nombre}</p>
                            <p className="text-xs text-slate-400 truncate max-w-xs">{p.descripcion}</p>
                          </td>
                          <td className="p-4 font-bold text-slate-800">${Number(p.precio).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`badge px-2 py-1 rounded-full text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button onClick={() => cargarEdicion(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleEliminar(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── PEDIDOS ─── */}
            {tab === 'pedidos' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Pedidos Recibidos</h2>
                {pedidos.length === 0 ? (
                  <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-slate-100">
                    <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Aún no has recibido pedidos</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidos.map(pedido => (
                      <div key={pedido.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-slate-800">Pedido #{pedido.id}</p>
                            <p className="text-xs text-slate-400">{new Date(pedido.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoColor[pedido.estado]}`}>
                              {pedido.estado}
                            </span>
                            <select
                              value={pedido.estado}
                              onChange={e => cambiarEstado(pedido.id, e.target.value)}
                              className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="procesando">Procesando</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 mb-3">
                          Cliente: <span className="font-medium text-slate-700">{pedido.cliente?.nombre}</span> — {pedido.cliente?.email}
                        </div>
                        <div className="space-y-2">
                          {pedido.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                              <img src={item.imagen} alt="" className="w-8 h-8 rounded object-cover bg-gray-200" />
                              <span className="text-sm flex-1">{item.producto}</span>
                              <span className="text-xs text-slate-500">x{item.cantidad}</span>
                              <span className="text-sm font-bold">${(item.precio * item.cantidad).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end mt-3 pt-3 border-t border-slate-100">
                          <p className="font-bold text-slate-800">Subtotal: ${pedido.subtotal?.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
