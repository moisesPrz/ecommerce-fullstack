// src/pages/VendedorPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, X, Upload, Trash2, Edit, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { SkeletonDashboard, SkeletonTableRows, ErrorMessage, EmptyState } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

const estadoColor = {
  pendiente: 'bg-yellow-100 text-yellow-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado: 'bg-purple-100 text-purple-700',
  entregado: 'bg-green-100 text-green-700',
  cancelado: 'bg-red-100 text-red-700',
  completado: 'bg-green-100 text-green-700',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
    </div>
    <p className="text-2xl font-bold" style={{ color: '#0B1D3A' }}>{value}</p>
  </div>
);

export default function VendedorPage() {
  useSEO({ title: 'Panel Vendedor', url: '/vendedor' });

  const { usuario } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('dashboard');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const LIMITE = 10;
  const [paginaProductos, setPaginaProductos] = useState(1);
  const [totalPaginasProductos, setTotalPaginasProductos] = useState(1);
  const [paginaPedidos, setPaginaPedidos] = useState(1);
  const [totalPaginasPedidos, setTotalPaginasPedidos] = useState(1);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: '' });
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    api.get('/categorias').then(res => {
      setCategorias(res.data);
      if (res.data.length > 0) {
        setFormProducto(prev => ({ ...prev, id_categoria: res.data[0].id }));
      }
    }).catch(() => {});
  }, []);

  const cargar = useCallback(async (pg = 1) => {
    setCargando(true);
    setError(null);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/vendedor/dashboard');
        setDashboard(res.data);
      } else if (tab === 'productos') {
        const res = await api.get(`/vendedor/productos?pagina=${pg}&limite=${LIMITE}`);
        setProductos(res.data.productos || res.data);
        setTotalPaginasProductos(res.data.totalPaginas || 1);
        setPaginaProductos(pg);
      } else if (tab === 'pedidos') {
        const res = await api.get(`/vendedor/pedidos?pagina=${pg}&limite=${LIMITE}`);
        setPedidos(res.data.pedidos || res.data);
        setTotalPaginasPedidos(res.data.totalPaginas || 1);
        setPaginaPedidos(pg);
      }
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [tab]);

  useEffect(() => { cargar(1); }, [cargar]);

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(formProducto).forEach(([k, v]) => formData.append(k, v));
      if (imagen) formData.append('imagen', imagen);
      if (modoEdicion) {
        await api.put(`/productos/${modoEdicion}`, formData);
        toast.exito('Producto actualizado');
      } else {
        await api.post('/productos', formData);
        toast.exito('Producto creado');
      }
      setFormProducto({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: categorias[0]?.id || '' });
      setImagen(null); setModoEdicion(null); setMostrarForm(false);
      cargar(modoEdicion ? paginaProductos : 1);
    } catch { toast.error('Error al guardar producto'); }
  };

  const editarProducto = (p) => {
    setFormProducto({ nombre: p.nombre, precio: p.precio, stock: p.stock, descripcion: p.descripcion || '', id_categoria: p.id_categoria });
    setModoEdicion(p.id);
    setMostrarForm(true);
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.exito('Producto eliminado');
      cargar(1);
    } catch { toast.error('No se puede eliminar'); }
  };

  const [expandidoPedido, setExpandidoPedido] = useState(null);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(`/vendedor/pedidos/${id}/estado`, { estado });
      toast.exito('Estado actualizado');
      cargar(paginaPedidos);
    } catch { toast.error('Error al actualizar'); }
  };

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'productos', label: '📦 Mis Productos' },
    { id: 'pedidos', label: '🛍️ Pedidos' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FC' }}>
      {/* Header */}
      <div className="text-white px-6 py-4" style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Panel Vendedor</h1>
            <p className="text-blue-300 text-sm">Hola, {usuario?.nombre}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cargando ? (tab === 'dashboard' ? <SkeletonDashboard /> : <SkeletonTableRows />) :
         error ? <ErrorMessage mensaje={error} onReintentar={cargar} /> : (
          <>
            {/* DASHBOARD */}
            {tab === 'dashboard' && dashboard && (
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                  Mi Tienda
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={Package} label="Mis Productos" value={dashboard.totalProductos || 0} color="bg-blue-500" />
                  <StatCard icon={ShoppingBag} label="Pedidos" value={dashboard.totalPedidos || 0} color="bg-purple-500" />
                  <StatCard icon={DollarSign} label="Ventas" value={`$${dashboard.totalVentas || '0.00'}`} color="bg-green-500" />
                  <StatCard icon={TrendingUp} label="Este mes" value={dashboard.pedidosMes || 0} color="bg-orange-500" />
                </div>
              </div>
            )}

            {/* MIS PRODUCTOS */}
            {tab === 'productos' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                    Mis Productos
                  </h2>
                  <button onClick={() => { setMostrarForm(!mostrarForm); setModoEdicion(null); setFormProducto({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1 }); }}
                    className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                    {mostrarForm ? <X size={16} /> : <Plus size={16} />}
                    {mostrarForm ? 'Cancelar' : 'Nuevo producto'}
                  </button>
                </div>

                {mostrarForm && (
                  <form onSubmit={guardarProducto} className="card p-6 mb-6 grid grid-cols-2 gap-4">
                    <h3 className="col-span-2 font-bold" style={{ color: '#0B1D3A' }}>
                      {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                    <input placeholder="Nombre del producto" value={formProducto.nombre}
                      onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })}
                      className="col-span-2 input-field" required />
                    <input type="number" placeholder="Precio" value={formProducto.precio}
                      onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })}
                      className="input-field" required />
                    <input type="number" placeholder="Stock" value={formProducto.stock}
                      onChange={e => setFormProducto({ ...formProducto, stock: e.target.value })}
                      className="input-field" />
                    <select value={formProducto.id_categoria}
                      onChange={e => setFormProducto({ ...formProducto, id_categoria: e.target.value })}
                      className="input-field bg-white">
                      <option value="">Sin categoría</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
                    </select>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center relative cursor-pointer hover:bg-slate-50">
                      <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Upload size={16} />
                        <span className="text-xs">{imagen ? imagen.name : 'Subir imagen'}</span>
                      </div>
                    </div>
                    <textarea placeholder="Descripción" value={formProducto.descripcion}
                      onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                      className="col-span-2 input-field" rows="2" />
                    <button type="submit" className="col-span-2 btn-primary py-3">
                      {modoEdicion ? 'Actualizar Producto' : 'Guardar Producto'}
                    </button>
                  </form>
                )}

                {productos.length === 0 ? (
                  <EmptyState icono="📦" titulo="Sin productos aún"
                    descripcion="Agrega tu primer producto para empezar a vender."
                    accion={<button onClick={() => setMostrarForm(true)} className="btn-primary px-6 py-2.5">Agregar producto</button>} />
                ) : (
                  <div className="card overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-4">Producto</th>
                          <th className="p-4">Precio</th>
                          <th className="p-4">Stock</th>
                          <th className="p-4">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {productos.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: '#F8F9FC' }}>
                                  {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}
                                </div>
                                <span className="font-medium text-sm" style={{ color: '#0B1D3A' }}>{p.nombre}</span>
                              </div>
                            </td>
                            <td className="p-4 font-bold text-sm">{formatPrecio(p.precio)}</td>
                            <td className="p-4">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                p.stock === 0 ? 'bg-red-100 text-red-600' :
                                p.stock <= 5  ? 'bg-amber-100 text-amber-700' :
                                'bg-green-100 text-green-600'
                              }`}>
                                {p.stock === 0 ? 'Sin stock' : p.stock <= 5 ? `⚠️ ${p.stock} uds` : `${p.stock} uds`}
                              </span>
                            </td>
                            <td className="p-4 flex gap-2">
                              <button onClick={() => editarProducto(p)}
                                className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Edit size={16} />
                              </button>
                              <button onClick={() => eliminarProducto(p.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Paginación productos */}
                {totalPaginasProductos > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-slate-500">Página {paginaProductos} de {totalPaginasProductos}</p>
                    <div className="flex gap-2">
                      <button onClick={() => cargar(paginaProductos - 1)} disabled={paginaProductos === 1}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => cargar(paginaProductos + 1)} disabled={paginaProductos === totalPaginasProductos}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PEDIDOS */}
            {tab === 'pedidos' && (
              <div>
                <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>MIS VENTAS</p>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                      Pedidos Recibidos
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} con tus productos</p>
                </div>

                {pedidos.length === 0 ? (
                  <EmptyState icono="🛍️" titulo="Sin pedidos aún" descripcion="Cuando alguien compre tus productos, aparecerán aquí." />
                ) : (
                  <div className="card overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-4">Pedido</th>
                          <th className="p-4 hidden md:table-cell">Cliente</th>
                          <th className="p-4">Subtotal</th>
                          <th className="p-4" onClick={e => e.stopPropagation()}>Estado</th>
                          <th className="p-4" onClick={e => e.stopPropagation()}>Cambiar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pedidos.map(p => (
                          <>
                            <tr key={p.id}
                              className="hover:bg-slate-50 cursor-pointer"
                              onClick={() => setExpandidoPedido(expandidoPedido === p.id ? null : p.id)}>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {expandidoPedido === p.id
                                    ? <ChevronUp size={14} className="text-slate-400 shrink-0" />
                                    : <ChevronDown size={14} className="text-slate-400 shrink-0" />}
                                  <div>
                                    <p className="font-bold text-sm" style={{ color: '#0B1D3A' }}>#{p.id}</p>
                                    <p className="text-xs text-slate-400">
                                      {p.Productos?.length || 0} producto{p.Productos?.length !== 1 ? 's' : ''} tuyos
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 hidden md:table-cell">
                                <p className="text-sm font-medium" style={{ color: '#0B1D3A' }}>{p.Usuario?.nombre}</p>
                                <p className="text-xs text-slate-400">{p.Usuario?.email}</p>
                              </td>
                              <td className="p-4 font-bold text-sm" style={{ color: '#0B1D3A' }}>
                                {formatPrecio(p.subtotal)}
                              </td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoColor[p.estado]}`}>
                                  {p.estado}
                                </span>
                              </td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <select value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)}
                                  className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none">
                                  {['pendiente','procesando','enviado','entregado','cancelado'].map(est => (
                                    <option key={est} value={est}>{est}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>

                            {/* Fila expandible — solo los productos del vendedor */}
                            {expandidoPedido === p.id && (
                              <tr key={`${p.id}-det`}>
                                <td colSpan={5} className="px-6 pb-4 pt-0 bg-slate-50">
                                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <p className="text-xs font-bold text-slate-500 uppercase px-4 py-2 bg-white border-b border-slate-100">
                                      Tus productos en este pedido
                                    </p>
                                    {p.Productos?.map(prod => (
                                      <div key={prod.id} className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-50 last:border-0">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: '#F8F9FC' }}>
                                          {prod.imagen_url
                                            ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                                        </div>
                                        <p className="flex-1 text-sm font-medium text-slate-700 truncate">{prod.nombre}</p>
                                        <p className="text-xs text-slate-400 shrink-0">
                                          ×{prod.DetallePedido?.cantidad}
                                        </p>
                                        <p className="text-sm font-bold shrink-0" style={{ color: '#0B1D3A' }}>
                                          {formatPrecio(
                                            parseFloat(prod.DetallePedido?.precio_unitario || 0) *
                                            (prod.DetallePedido?.cantidad || 0)
                                          )}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Paginación pedidos */}
                {totalPaginasPedidos > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-slate-500">Página {paginaPedidos} de {totalPaginasPedidos}</p>
                    <div className="flex gap-2">
                      <button onClick={() => cargar(paginaPedidos - 1)} disabled={paginaPedidos === 1}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                        <ChevronLeft size={16} />
                      </button>
                      <button onClick={() => cargar(paginaPedidos + 1)} disabled={paginaPedidos === totalPaginasPedidos}
                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors">
                        <ChevronRight size={16} />
                      </button>
                    </div>
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
