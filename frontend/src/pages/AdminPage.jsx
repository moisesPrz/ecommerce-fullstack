// ARCHIVO: frontend/src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingBag, DollarSign, Edit, Trash2, Upload, Plus, X } from 'lucide-react';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';

const estadoColor = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  completado: 'bg-green-100 text-green-700'
};

const rolColor = {
  cliente: 'bg-slate-100 text-slate-600',
  vendedor: 'bg-blue-100 text-blue-600',
  administrador: 'bg-purple-100 text-purple-600'
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
  </div>
);

export default function AdminPage() {
  const user = JSON.parse(localStorage.getItem('usuario') || '{}');
  const [tab, setTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
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
        const res = await api.get('/admin/dashboard', config);
        setDashboard(res.data);
      } else if (tab === 'usuarios') {
        const res = await api.get('/admin/usuarios', config);
        setUsuarios(res.data);
      } else if (tab === 'pedidos') {
        const res = await api.get('/admin/pedidos', config);
        setPedidos(res.data);
      } else if (tab === 'productos') {
        const res = await api.get('/productos', config);
        setProductos(res.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  const cambiarRol = async (id, rol) => {
    try {
      await api.put(`/admin/usuarios/${id}/rol`, { rol }, config);
      cargarDatos();
    } catch { alert('Error al cambiar rol'); }
  };

  const cambiarEstadoPedido = async (id, estado) => {
    try {
      await api.put(`/admin/pedidos/${id}/estado`, { estado }, config);
      cargarDatos();
    } catch { alert('Error al actualizar estado'); }
  };

  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(formProducto).forEach(([k, v]) => formData.append(k, v));
    if (archivoImagen) formData.append('imagen', archivoImagen);
    try {
      if (modoEdicion) {
        await api.put(`/productos/${modoEdicion}`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/productos', formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
      }
      setFormProducto({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1 });
      setArchivoImagen(null); setModoEdicion(null); setMostrarForm(false);
      cargarDatos();
    } catch { alert('Error al guardar producto'); }
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`, config);
      cargarDatos();
    } catch { alert('No se puede eliminar'); }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'usuarios', label: '👥 Usuarios' },
    { id: 'productos', label: '📦 Productos' },
    { id: 'pedidos', label: '🛍️ Pedidos' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold">Panel Administrador</h1>
            <p className="text-slate-400 text-sm">Hola, {user?.nombre}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                {t.label}
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
            {/* DASHBOARD */}
            {tab === 'dashboard' && dashboard && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumen General</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <StatCard icon={Users} label="Total Usuarios" value={dashboard.estadisticas.totalUsuarios} color="bg-blue-500" />
                  <StatCard icon={Package} label="Total Productos" value={dashboard.estadisticas.totalProductos} color="bg-orange-500" />
                  <StatCard icon={ShoppingBag} label="Total Pedidos" value={dashboard.estadisticas.totalPedidos} color="bg-purple-500" />
                  <StatCard icon={DollarSign} label="Total Ventas" value={`$${dashboard.estadisticas.totalVentas}`} color="bg-green-500" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Usuarios recientes */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-800 mb-4">Últimos Usuarios</h3>
                    <div className="space-y-3">
                      {dashboard.usuariosRecientes?.map(u => (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                            {u.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{u.nombre}</p>
                            <p className="text-xs text-slate-400 truncate">{u.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rolColor[u.rol]}`}>{u.rol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Pedidos recientes */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h3 className="font-bold text-slate-800 mb-4">Últimos Pedidos</h3>
                    <div className="space-y-3">
                      {dashboard.pedidosRecientes?.map(p => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-800">Pedido #{p.id}</p>
                            <p className="text-xs text-slate-400">{p.Usuario?.nombre}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">${Number(p.total).toFixed(2)}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoColor[p.estado]}`}>{p.estado}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* USUARIOS */}
            {tab === 'usuarios' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Gestión de Usuarios</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                      <tr>
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Rol actual</th>
                        <th className="p-4">Cambiar rol</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usuarios.map(u => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold">
                                {u.nombre?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm text-slate-800">{u.nombre}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-slate-500">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${rolColor[u.rol]}`}>{u.rol}</span>
                          </td>
                          <td className="p-4">
                            <select value={u.rol} onChange={e => cambiarRol(u.id, e.target.value)}
                              className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                              <option value="cliente">Cliente</option>
                              <option value="vendedor">Vendedor</option>
                              <option value="administrador">Administrador</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PRODUCTOS */}
            {tab === 'productos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Todos los Productos</h2>
                  <button onClick={() => { setMostrarForm(!mostrarForm); setModoEdicion(null); }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-all">
                    {mostrarForm ? <X size={16} /> : <Plus size={16} />}
                    {mostrarForm ? 'Cancelar' : 'Nuevo producto'}
                  </button>
                </div>

                {mostrarForm && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                    <form onSubmit={handleSubmitProducto} className="grid grid-cols-2 gap-4">
                      <input placeholder="Nombre" value={formProducto.nombre} onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })}
                        className="col-span-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                      <input type="number" placeholder="Precio" value={formProducto.precio} onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })}
                        className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" required />
                      <input type="number" placeholder="Stock" value={formProducto.stock} onChange={e => setFormProducto({ ...formProducto, stock: e.target.value })}
                        className="p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" />
                      <select value={formProducto.id_categoria} onChange={e => setFormProducto({ ...formProducto, id_categoria: e.target.value })}
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
                      <textarea placeholder="Descripción" value={formProducto.descripcion} onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                        className="col-span-2 p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-300" rows="2" />
                      <button type="submit" className="col-span-2 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-700 transition-all">
                        {modoEdicion ? 'Actualizar' : 'Guardar Producto'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                      <tr><th className="p-4">Imagen</th><th className="p-4">Producto</th><th className="p-4">Precio</th><th className="p-4">Stock</th><th className="p-4">Acciones</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productos.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-4"><img src={p.imagen_url} alt="" className="w-12 h-12 object-cover rounded-lg bg-slate-100" /></td>
                          <td className="p-4"><p className="font-medium text-sm text-slate-800">{p.nombre}</p></td>
                          <td className="p-4 font-bold text-sm">${Number(p.precio).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            <button onClick={() => eliminarProducto(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PEDIDOS */}
            {tab === 'pedidos' && (
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Todos los Pedidos</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                      <tr><th className="p-4">Pedido</th><th className="p-4">Cliente</th><th className="p-4">Total</th><th className="p-4">Estado</th><th className="p-4">Cambiar</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pedidos.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-sm">#{p.id}</td>
                          <td className="p-4">
                            <p className="text-sm font-medium text-slate-800">{p.Usuario?.nombre}</p>
                            <p className="text-xs text-slate-400">{p.Usuario?.email}</p>
                          </td>
                          <td className="p-4 font-bold text-sm">${Number(p.total).toFixed(2)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoColor[p.estado]}`}>{p.estado}</span>
                          </td>
                          <td className="p-4">
                            <select value={p.estado} onChange={e => cambiarEstadoPedido(p.id, e.target.value)}
                              className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-300">
                              <option value="pendiente">Pendiente</option>
                              <option value="procesando">Procesando</option>
                              <option value="enviado">Enviado</option>
                              <option value="entregado">Entregado</option>
                              <option value="cancelado">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
