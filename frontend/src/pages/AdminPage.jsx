// src/pages/AdminPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Users, Package, ShoppingBag, DollarSign, Trash2, Plus, X, Upload, Tag, Edit2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { SkeletonDashboard, SkeletonTableRows, ErrorMessage, RolBadge } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

const estadoColor = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado:    'bg-purple-100 text-purple-700',
  entregado:  'bg-green-100 text-green-700',
  cancelado:  'bg-red-100 text-red-700',
  completado: 'bg-green-100 text-green-700',
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <div className={`p-2 rounded-lg ${color}`}><Icon size={18} className="text-white" /></div>
    </div>
    <p className="text-2xl font-bold" style={{ color: '#0B1D3A' }}>{value ?? '—'}</p>
  </div>
);

export default function AdminPage() {
  useSEO({ title: 'Panel Admin', url: '/admin' });

  const { usuario } = useAuth();
  const toast = useToast();

  const [tab, setTab] = useState('dashboard');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Datos por sección
  const [dashboard, setDashboard] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Formulario productos
  const [mostrarForm, setMostrarForm] = useState(false);
  const [formProducto, setFormProducto] = useState({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: '' });
  const [imagen, setImagen] = useState(null);

  // Formulario categorías
  const [formCategoria, setFormCategoria] = useState({ nombre: '', descripcion: '', icono: '📦' });
  const [editandoCategoria, setEditandoCategoria] = useState(null);
  const [mostrarFormCat, setMostrarFormCat] = useState(false);

  // Cargar categorías siempre (las necesita el formulario de productos)
  const cargarCategorias = useCallback(async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch { /* silencioso */ }
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      if (tab === 'dashboard') {
        const res = await api.get('/admin/dashboard');
        setDashboard(res.data);
      } else if (tab === 'usuarios') {
        const res = await api.get('/admin/usuarios');
        setUsuarios(res.data.usuarios || []);
      } else if (tab === 'productos') {
        const res = await api.get('/productos?limite=100');
        setProductos(res.data.productos || res.data);
      } else if (tab === 'pedidos') {
        const res = await api.get('/admin/pedidos');
        setPedidos(res.data.pedidos || []);
      }
    } catch {
      setError('Error al cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [tab]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Usuarios ──────────────────────────────────────────────
  const [busquedaUsuario, setBusquedaUsuario] = useState('');

  const cambiarRol = async (id, rol) => {
    if (id === usuario?.id) { toast.error('No puedes cambiar tu propio rol'); return; }
    try {
      await api.put(`/admin/usuarios/${id}/rol`, { rol });
      toast.exito('Rol actualizado');
      cargar();
    } catch { toast.error('Error al cambiar rol'); }
  };

  // ── Pedidos ───────────────────────────────────────────────
  const [filtroPedidos, setFiltroPedidos] = useState('todos');
  const [expandidoPedido, setExpandidoPedido] = useState(null);

  const cambiarEstado = async (id, estado) => {
    try {
      await api.put(`/admin/pedidos/${id}/estado`, { estado });
      toast.exito('Estado actualizado');
      cargar();
    } catch { toast.error('Error al actualizar estado'); }
  };

  // ── Productos ─────────────────────────────────────────────
  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/productos/${id}`);
      toast.exito('Producto eliminado');
      cargar();
    } catch { toast.error('No se puede eliminar (puede tener ventas asociadas)'); }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    if (!formProducto.nombre || !formProducto.precio) {
      toast.error('Nombre y precio son obligatorios');
      return;
    }
    try {
      const fd = new FormData();
      Object.entries(formProducto).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      if (imagen) fd.append('imagen', imagen);
      await api.post('/productos', fd);
      toast.exito('Producto creado');
      setFormProducto({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: categorias[0]?.id || '' });
      setImagen(null);
      setMostrarForm(false);
      cargar();
    } catch { toast.error('Error al guardar producto'); }
  };

  // ── Categorías ────────────────────────────────────────────
  const abrirFormCategoria = (cat = null) => {
    if (cat) {
      setEditandoCategoria(cat.id);
      setFormCategoria({ nombre: cat.nombre, descripcion: cat.descripcion || '', icono: cat.icono || '📦' });
    } else {
      setEditandoCategoria(null);
      setFormCategoria({ nombre: '', descripcion: '', icono: '📦' });
    }
    setMostrarFormCat(true);
  };

  const guardarCategoria = async (e) => {
    e.preventDefault();
    if (!formCategoria.nombre.trim()) { toast.error('El nombre es obligatorio'); return; }
    try {
      if (editandoCategoria) {
        await api.put(`/categorias/${editandoCategoria}`, formCategoria);
        toast.exito('Categoría actualizada');
      } else {
        await api.post('/categorias', formCategoria);
        toast.exito('Categoría creada');
      }
      setMostrarFormCat(false);
      setEditandoCategoria(null);
      setFormCategoria({ nombre: '', descripcion: '', icono: '📦' });
      cargarCategorias();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar categoría');
    }
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categorias/${id}`);
      toast.exito('Categoría eliminada');
      cargarCategorias();
    } catch { toast.error('No se puede eliminar (puede tener productos asociados)'); }
  };

  const tabs = [
    { id: 'dashboard',   label: '📊 Dashboard' },
    { id: 'usuarios',    label: '👥 Usuarios' },
    { id: 'productos',   label: '📦 Productos' },
    { id: 'categorias',  label: '🏷️ Categorías' },
    { id: 'pedidos',     label: '🛍️ Pedidos' },
  ];

  const iconosDisponibles = ['📦', '💻', '🎧', '🖱️', '🪑', '📱', '⌨️', '🖥️', '📷', '🎮', '🔌', '💡'];

  return (
    <div className="min-h-screen" style={{ background: '#F8F9FC' }}>

      {/* Header */}
      <div className="text-white px-6 py-5" style={{ background: '#0B1D3A' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Panel Administrador
            </h1>
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

        {/* ── DASHBOARD ─────────────────────────────────── */}
        {tab === 'dashboard' && (
          cargando ? <SkeletonDashboard /> :
          error    ? <ErrorMessage mensaje={error} onReintentar={cargar} /> :
          dashboard && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                Resumen General
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={Users}      label="Usuarios"  value={dashboard.estadisticas?.totalUsuarios}  color="bg-blue-500" />
                <StatCard icon={Package}    label="Productos" value={dashboard.estadisticas?.totalProductos} color="bg-orange-500" />
                <StatCard icon={ShoppingBag} label="Pedidos"  value={dashboard.estadisticas?.totalPedidos}   color="bg-purple-500" />
                <StatCard icon={DollarSign} label="Ventas"    value={formatPrecio(dashboard.estadisticas?.totalVentas || 0)} color="bg-green-500" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-5">
                  <h3 className="font-bold mb-4" style={{ color: '#0B1D3A' }}>Últimos Usuarios</h3>
                  <div className="space-y-3">
                    {dashboard.usuariosRecientes?.map(u => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: '#0B1D3A' }}>
                          {u.nombre?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#0B1D3A' }}>{u.nombre}</p>
                          <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                        <RolBadge rol={u.rol} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <h3 className="font-bold mb-4" style={{ color: '#0B1D3A' }}>Últimos Pedidos</h3>
                  <div className="space-y-3">
                    {dashboard.pedidosRecientes?.map(p => (
                      <div key={p.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#0B1D3A' }}>Pedido #{p.id}</p>
                          <p className="text-xs text-slate-400">{p.Usuario?.nombre}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: '#0B1D3A' }}>{formatPrecio(p.total)}</p>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${estadoColor[p.estado]}`}>
                            {p.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── USUARIOS ──────────────────────────────────── */}
        {tab === 'usuarios' && (
          cargando ? <SkeletonTableRows /> :
          error    ? <ErrorMessage mensaje={error} onReintentar={cargar} /> : (() => {
            const q = busquedaUsuario.toLowerCase();
            const usuariosFiltrados = q
              ? usuarios.filter(u => u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
              : usuarios;
            const porRol = { cliente: 0, vendedor: 0, administrador: 0 };
            usuarios.forEach(u => { if (porRol[u.rol] !== undefined) porRol[u.rol]++; });

            return (
              <div>
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>GESTIÓN</p>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                      Usuarios
                    </h2>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[['cliente','Cliente','bg-slate-100 text-slate-600'],['vendedor','Vendedor','bg-blue-100 text-blue-700'],['administrador','Admin','bg-amber-100 text-amber-700']].map(([rol, label, cls]) => (
                      <span key={rol} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cls}`}>
                        {label}: {porRol[rol]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Búsqueda */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={busquedaUsuario}
                    onChange={e => setBusquedaUsuario(e.target.value)}
                    className="input-field max-w-sm"
                  />
                </div>

                <div className="card overflow-hidden">
                  {usuariosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Users size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No se encontraron usuarios</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-4">Usuario</th>
                          <th className="p-4 hidden sm:table-cell">Email</th>
                          <th className="p-4">Rol actual</th>
                          <th className="p-4">Cambiar rol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usuariosFiltrados.map(u => {
                          const esMismo = u.id === usuario?.id;
                          return (
                            <tr key={u.id} className={`hover:bg-slate-50 ${esMismo ? 'bg-amber-50/40' : ''}`}>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                                    style={{ background: '#0B1D3A' }}>
                                    {u.nombre?.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate max-w-[120px]" style={{ color: '#0B1D3A' }}>
                                      {u.nombre}
                                    </p>
                                    {esMismo && <p className="text-[10px] text-amber-600 font-semibold">Tú</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-slate-500 hidden sm:table-cell">{u.email}</td>
                              <td className="p-4"><RolBadge rol={u.rol} /></td>
                              <td className="p-4">
                                {esMismo ? (
                                  <span className="text-xs text-slate-400 italic">—</span>
                                ) : (
                                  <select value={u.rol} onChange={e => cambiarRol(u.id, e.target.value)}
                                    className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none">
                                    <option value="cliente">Cliente</option>
                                    <option value="vendedor">Vendedor</option>
                                    <option value="administrador">Administrador</option>
                                  </select>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })()
        )}

        {/* ── PRODUCTOS ─────────────────────────────────── */}
        {tab === 'productos' && (
          cargando ? <SkeletonTableRows /> :
          error    ? <ErrorMessage mensaje={error} onReintentar={cargar} /> : (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                  Todos los Productos
                </h2>
                <button onClick={() => setMostrarForm(!mostrarForm)}
                  className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                  {mostrarForm ? <X size={16} /> : <Plus size={16} />}
                  {mostrarForm ? 'Cancelar' : 'Nuevo producto'}
                </button>
              </div>

              {mostrarForm && (
                <form onSubmit={guardarProducto} className="card p-6 mb-6" style={{ borderRadius: '20px' }}>
                  <h3 className="font-bold text-lg mb-4" style={{ color: '#0B1D3A' }}>Nuevo Producto</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="Nombre del producto *" value={formProducto.nombre}
                      onChange={e => setFormProducto({ ...formProducto, nombre: e.target.value })}
                      className="sm:col-span-2 input-field" required />
                    <input type="number" placeholder="Precio *" min="0" step="0.01" value={formProducto.precio}
                      onChange={e => setFormProducto({ ...formProducto, precio: e.target.value })}
                      className="input-field" required />
                    <input type="number" placeholder="Stock" min="0" value={formProducto.stock}
                      onChange={e => setFormProducto({ ...formProducto, stock: e.target.value })}
                      className="input-field" />
                    <select value={formProducto.id_categoria}
                      onChange={e => setFormProducto({ ...formProducto, id_categoria: e.target.value })}
                      className="input-field bg-white">
                      <option value="">Sin categoría</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
                    </select>
                    <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center relative cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                      <input type="file" accept="image/*" onChange={e => setImagen(e.target.files[0])}
                        className="absolute inset-0 opacity-0 cursor-pointer" />
                      <Upload size={16} className="text-slate-400 shrink-0" />
                      <span className="text-xs text-slate-500 truncate">
                        {imagen ? imagen.name : 'Subir imagen (opcional)'}
                      </span>
                    </label>
                    <textarea placeholder="Descripción (opcional)" value={formProducto.descripcion}
                      onChange={e => setFormProducto({ ...formProducto, descripcion: e.target.value })}
                      className="sm:col-span-2 input-field resize-none" rows="2" />
                    <button type="submit" className="sm:col-span-2 btn-primary py-3 font-semibold">
                      Guardar Producto
                    </button>
                  </div>
                </form>
              )}

              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                    <tr>
                      <th className="p-4">Producto</th>
                      <th className="p-4 hidden md:table-cell">Precio</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productos.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: '#F8F9FC' }}>
                              {p.imagen_url
                                ? <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" loading="lazy" />
                                : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate max-w-[160px]" style={{ color: '#0B1D3A' }}>{p.nombre}</p>
                              <p className="text-xs text-slate-400 md:hidden">{formatPrecio(p.precio)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-sm hidden md:table-cell">{formatPrecio(p.precio)}</td>
                        <td className="p-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            p.stock === 0 ? 'bg-red-100 text-red-600' :
                            p.stock <= 5 ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => eliminarProducto(p.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {productos.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Package size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No hay productos aún</p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* ── CATEGORÍAS ────────────────────────────────── */}
        {tab === 'categorias' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                  Categorías
                </h2>
                <p className="text-sm text-slate-500 mt-1">{categorias.length} categoría{categorias.length !== 1 ? 's' : ''} registrada{categorias.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => abrirFormCategoria()}
                className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
                <Plus size={16} /> Nueva categoría
              </button>
            </div>

            {/* Formulario crear/editar categoría */}
            {mostrarFormCat && (
              <form onSubmit={guardarCategoria} className="card p-6 mb-6" style={{ borderRadius: '20px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg" style={{ color: '#0B1D3A' }}>
                    {editandoCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                  <button type="button" onClick={() => setMostrarFormCat(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Nombre *" value={formCategoria.nombre}
                    onChange={e => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                    className="input-field" required />
                  <input placeholder="Descripción (opcional)" value={formCategoria.descripcion}
                    onChange={e => setFormCategoria({ ...formCategoria, descripcion: e.target.value })}
                    className="input-field" />
                  <div className="sm:col-span-2">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Ícono</p>
                    <div className="flex flex-wrap gap-2">
                      {iconosDisponibles.map(ic => (
                        <button key={ic} type="button" onClick={() => setFormCategoria({ ...formCategoria, icono: ic })}
                          className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                            formCategoria.icono === ic
                              ? 'ring-2 ring-offset-1 scale-110'
                              : 'hover:bg-slate-50'
                          }`}
                          style={formCategoria.icono === ic ? { ringColor: '#0B1D3A', background: '#EEF1F6' } : {}}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="sm:col-span-2 btn-primary py-3 font-semibold">
                    {editandoCategoria ? 'Actualizar categoría' : 'Crear categoría'}
                  </button>
                </div>
              </form>
            )}

            {/* Grid de categorías */}
            {categorias.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Tag size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm mb-4">No hay categorías aún. Crea la primera para organizar tus productos.</p>
                <button onClick={() => abrirFormCategoria()} className="btn-primary px-6 py-2.5 text-sm">
                  Crear primera categoría
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map(cat => (
                  <div key={cat.id} className="card p-5 flex items-center gap-4" style={{ borderRadius: '16px' }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: '#EEF1F6' }}>
                      {cat.icono || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#0B1D3A' }}>{cat.nombre}</p>
                      {cat.descripcion && (
                        <p className="text-xs text-slate-400 truncate">{cat.descripcion}</p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => abrirFormCategoria(cat)}
                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => eliminarCategoria(cat.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PEDIDOS ───────────────────────────────────── */}
        {tab === 'pedidos' && (
          cargando ? <SkeletonTableRows filas={6} /> :
          error    ? <ErrorMessage mensaje={error} onReintentar={cargar} /> : (() => {
            const ESTADOS = ['todos','pendiente','procesando','enviado','entregado','cancelado'];
            const pedidosFiltrados = filtroPedidos === 'todos'
              ? pedidos
              : pedidos.filter(p => p.estado === filtroPedidos);

            return (
              <div>
                {/* Encabezado */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                  <div>
                    <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>GESTIÓN</p>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                      Todos los Pedidos
                    </h2>
                  </div>
                  <p className="text-sm text-slate-500">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} en total</p>
                </div>

                {/* Filtros por estado */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {ESTADOS.map(est => {
                    const count = est === 'todos' ? pedidos.length : pedidos.filter(p => p.estado === est).length;
                    return (
                      <button key={est} onClick={() => setFiltroPedidos(est)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={filtroPedidos === est
                          ? { background: '#0B1D3A', color: 'white' }
                          : { background: '#EEF1F6', color: '#3D5278' }}>
                        {est.charAt(0).toUpperCase() + est.slice(1)}
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          filtroPedidos === est ? 'bg-white/20' : 'bg-white'
                        }`} style={filtroPedidos === est ? { color: 'white' } : { color: '#0B1D3A' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Tabla */}
                <div className="card overflow-hidden">
                  {pedidosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No hay pedidos con este estado</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500">
                        <tr>
                          <th className="p-4">Pedido</th>
                          <th className="p-4 hidden md:table-cell">Cliente</th>
                          <th className="p-4 hidden sm:table-cell">Fecha</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Estado</th>
                          <th className="p-4">Cambiar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pedidosFiltrados.map(p => (
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
                                      {p.Productos?.length || 0} producto{p.Productos?.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 hidden md:table-cell">
                                <p className="text-sm font-medium" style={{ color: '#0B1D3A' }}>{p.Usuario?.nombre}</p>
                                <p className="text-xs text-slate-400">{p.Usuario?.email}</p>
                              </td>
                              <td className="p-4 hidden sm:table-cell">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar size={12} />
                                  {new Date(p.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                              </td>
                              <td className="p-4 font-bold text-sm" style={{ color: '#0B1D3A' }}>
                                {formatPrecio(p.total)}
                              </td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoColor[p.estado]}`}>
                                  {p.estado}
                                </span>
                              </td>
                              <td className="p-4" onClick={e => e.stopPropagation()}>
                                <select value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)}
                                  className="text-xs border border-slate-200 rounded-lg p-1.5 bg-white focus:outline-none focus:ring-1"
                                  style={{ '--tw-ring-color': '#0B1D3A' }}>
                                  {['pendiente','procesando','enviado','entregado','cancelado'].map(e => (
                                    <option key={e} value={e}>{e}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>

                            {/* Fila expandible con productos */}
                            {expandidoPedido === p.id && (
                              <tr key={`${p.id}-det`}>
                                <td colSpan={6} className="px-6 pb-4 pt-0 bg-slate-50">
                                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <p className="text-xs font-bold text-slate-500 uppercase px-4 py-2 bg-white border-b border-slate-100">
                                      Productos del pedido
                                    </p>
                                    {p.Productos?.length > 0 ? p.Productos.map(prod => (
                                      <div key={prod.id} className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-50 last:border-0">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: '#F8F9FC' }}>
                                          {prod.imagen_url
                                            ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                                        </div>
                                        <p className="flex-1 text-sm font-medium text-slate-700 truncate">{prod.nombre}</p>
                                        <p className="text-xs text-slate-400 shrink-0">
                                          x{prod.DetallePedido?.cantidad}
                                        </p>
                                        <p className="text-sm font-bold shrink-0" style={{ color: '#0B1D3A' }}>
                                          {formatPrecio(prod.DetallePedido?.precio_unitario * prod.DetallePedido?.cantidad)}
                                        </p>
                                      </div>
                                    )) : (
                                      <p className="text-xs text-slate-400 px-4 py-3">Sin detalle disponible</p>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            );
          })()
        )}

      </div>
    </div>
  );
}
