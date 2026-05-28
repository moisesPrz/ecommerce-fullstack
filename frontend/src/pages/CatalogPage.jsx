// src/pages/CatalogPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Tag, TrendingUp, Shield, Truck, Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { SkeletonCard, ErrorMessage, EmptyState } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(precio);

// ── PRODUCT CARD ──────────────────────────────────────────
const ProductCard = ({ producto, categoriaNombre }) => {
  const { agregar } = useCart();
  const { estaEnWishlist, toggleWishlist } = useWishlist();
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const enWishlist = estaEnWishlist(producto.id);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (producto.stock === 0) return;
    agregar(producto);
    toast.exito(`${producto.nombre} agregado al carrito`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!estaAutenticado) {
      toast.error('Inicia sesión para guardar favoritos');
      navigate('/login');
      return;
    }
    toggleWishlist(producto);
    toast.exito(enWishlist ? 'Eliminado de favoritos' : 'Añadido a favoritos');
  };

  return (
    <Link to={`/producto/${producto.id}`} className="card group block" style={{ borderRadius: '20px' }}>
      <div className="relative overflow-hidden" style={{ height: '220px', background: '#F8F9FC', borderRadius: '20px 20px 0 0' }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Sin stock</span>
          </div>
        )}
        {/* Wishlist button */}
        <button onClick={handleWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all z-10"
          style={{ background: 'white' }}>
          <Heart size={15} className={enWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
        </button>
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(11,29,58,0.7), transparent)' }}>
          <button onClick={handleAgregar} disabled={producto.stock === 0}
            className="btn-gold text-sm px-5 py-2.5 disabled:opacity-50 flex items-center gap-2">
            <ShoppingCart size={15} /> Agregar al carrito
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs font-medium mb-1" style={{ color: '#8A9BB5' }}>{categoriaNombre}</p>
        <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors"
          style={{ color: '#0B1D3A', minHeight: '40px' }}>
          {producto.nombre}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={11} className={s <= Math.round(producto.calificacion_prom || 0) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
          ))}
        </div>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold" style={{ color: '#0B1D3A' }}>{formatPrecio(producto.precio)}</p>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${producto.stock > 5 ? 'bg-green-400' : producto.stock > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-500">
              {producto.stock > 5 ? 'Disponible' : producto.stock > 0 ? `${producto.stock} left` : 'Agotado'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};


const ordenOpciones = [
  { value: 'reciente', label: 'Más recientes' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre A-Z' },
];

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
export default function CatalogPage() {
  useSEO({
    title: 'Catálogo',
    description: 'Explora el catálogo de TechMarket: laptops, celulares, accesorios y más tecnología al mejor precio con envío a toda Colombia.',
    url: '/',
  });

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const LIMITE = 12;

  // Categorías desde la API
  const [categorias, setCategorias] = useState([]);
  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data)).catch(() => {});
  }, []);

  const getCategoriaLabel = (id) => {
    const cat = categorias.find(c => c.id === id);
    return cat ? `${cat.icono} ${cat.nombre}` : '';
  };

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaDebounced, setBusquedaDebounced] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [orden, setOrden] = useState('reciente');
  const [soloDisponible, setSoloDisponible] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Debounce de 300ms sobre la búsqueda — infraestructura para live-search
  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 300);
    return () => clearTimeout(t);
  }, [busqueda]);

  const cargarProductos = useCallback(async (filtros = {}, pg = 1) => {
    setCargando(true);
    setError(null);
    try {
      const params = new URLSearchParams({ ...filtros, pagina: pg, limite: LIMITE }).toString();
      const res = await api.get(`/productos?${params}`);
      if (res.data.productos) {
        setProductos(res.data.productos);
        setTotal(res.data.total);
        setTotalPaginas(res.data.totalPaginas || 1);
      } else {
        setProductos(res.data);
        setTotal(res.data.length);
        setTotalPaginas(1);
      }
      setPagina(pg);
    } catch {
      setError('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarProductos(); }, [cargarProductos]);

  const construirFiltros = () => {
    const filtros = {};
    if (busqueda.trim()) filtros.busqueda = busqueda.trim();
    if (categoriaActiva) filtros.categoria = categoriaActiva;
    if (precioMin) filtros.precioMin = precioMin;
    if (precioMax) filtros.precioMax = precioMax;
    if (orden !== 'reciente') filtros.orden = orden;
    if (soloDisponible) filtros.disponible = 'true';
    return filtros;
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    cargarProductos(construirFiltros(), 1);
  };

  const handleCategoria = (id) => {
    setCategoriaActiva(id);
    const filtros = construirFiltros();
    if (id) filtros.categoria = id;
    else delete filtros.categoria;
    cargarProductos(filtros, 1);
  };

  const handleOrden = (value) => {
    setOrden(value);
    const filtros = construirFiltros();
    filtros.orden = value;
    cargarProductos(filtros, 1);
  };

  const handlePagina = (nueva) => {
    cargarProductos(construirFiltros(), nueva);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiar = () => {
    setBusqueda('');
    setCategoriaActiva('');
    setPrecioMin('');
    setPrecioMax('');
    setOrden('reciente');
    setSoloDisponible(false);
    cargarProductos({}, 1);
  };

  const hayFiltrosActivos = busqueda || categoriaActiva || precioMin || precioMax || soloDisponible;

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #1E3A5F 55%, #2563EB 100%)' }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-sm font-semibold"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
              <TrendingUp size={14} /> Marketplace #1 en Colombia
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Tecnología de <span style={{ color: '#C9A84C' }}>primera</span>,<br />a tu alcance
            </h1>
            <p className="text-blue-200 text-lg mb-6">
              Los mejores productos con garantía, envío seguro y los precios más competitivos.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, label: 'Compra 100% segura' },
                { icon: Truck, label: 'Envío a todo Colombia' },
                { icon: Tag, label: 'Mejores precios' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-blue-200 text-sm">
                  <Icon size={16} style={{ color: '#C9A84C' }} /> {label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="gold-divider" />
      </section>

      {/* FILTROS */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          {/* Barra principal */}
          <form onSubmit={handleBuscar} className="flex gap-2 mb-3">
            <div className="relative flex-1 max-w-lg">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Buscar productos..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="input-field pl-10 py-2.5" />
              {busqueda && (
                <button type="button" onClick={limpiar}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary px-5 py-2.5">Buscar</button>
            <button type="button" onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium flex items-center gap-2 transition-all ${
                mostrarFiltros ? 'border-navy text-navy bg-navy/5' : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
              style={mostrarFiltros ? { borderColor: '#0B1D3A', color: '#0B1D3A' } : {}}>
              <SlidersHorizontal size={15} /> Filtros
              {hayFiltrosActivos && <span className="w-2 h-2 rounded-full bg-amber-400" />}
            </button>
          </form>

          {/* Categorías dinámicas */}
          <div className="flex gap-2 flex-wrap mb-2">
            {[{ id: '', nombre: 'Todos', icono: '' }, ...categorias].map(cat => (
              <button key={cat.id} onClick={() => handleCategoria(String(cat.id))}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
                style={categoriaActiva === String(cat.id)
                  ? { background: '#0B1D3A', color: 'white' }
                  : { background: '#EEF1F6', color: '#3D5278' }}>
                {cat.icono} {cat.nombre}
              </button>
            ))}
          </div>

          {/* Filtros avanzados */}
          {mostrarFiltros && (
            <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Precio mínimo</label>
                <input type="number" placeholder="$0" value={precioMin}
                  onChange={e => setPrecioMin(e.target.value)}
                  className="input-field py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Precio máximo</label>
                <input type="number" placeholder="$9999" value={precioMax}
                  onChange={e => setPrecioMax(e.target.value)}
                  className="input-field py-2 text-sm" min="0" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ordenar por</label>
                <select value={orden} onChange={e => handleOrden(e.target.value)}
                  className="input-field py-2 text-sm bg-white">
                  {ordenOpciones.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={soloDisponible}
                    onChange={e => setSoloDisponible(e.target.checked)}
                    className="w-4 h-4 accent-navy rounded" />
                  <span className="text-xs font-semibold text-slate-600">Solo disponibles</span>
                </label>
                <div className="flex gap-2">
                  <button onClick={() => cargarProductos(construirFiltros())}
                    className="btn-primary py-2 text-xs flex-1">Aplicar</button>
                  {hayFiltrosActivos && (
                    <button onClick={limpiar}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg">
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CATÁLOGO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>NUESTRO CATÁLOGO</p>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Productos destacados
            </h2>
          </div>
          {!cargando && (
            <p className="text-sm text-slate-500">{total} productos</p>
          )}
        </div>

        {cargando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorMessage mensaje={error} onReintentar={() => cargarProductos()} />
        ) : productos.length === 0 ? (
          <EmptyState icono="🔍" titulo="Sin resultados"
            descripcion="No encontramos productos con esos filtros."
            accion={<button onClick={limpiar} className="btn-primary px-6 py-2.5">Ver todos</button>} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((producto, i) => (
                <div key={producto.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard producto={producto} categoriaNombre={getCategoriaLabel(producto.id_categoria)} />
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePagina(pagina - 1)}
                  disabled={pagina === 1}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-40"
                  style={{ borderColor: '#DDE3EE' }}
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPaginas || Math.abs(p - pagina) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => handlePagina(p)}
                        className="w-10 h-10 rounded-xl text-sm font-semibold transition-all"
                        style={p === pagina
                          ? { background: '#0B1D3A', color: 'white' }
                          : { border: '1px solid #DDE3EE', color: '#0B1D3A' }}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => handlePagina(pagina + 1)}
                  disabled={pagina === totalPaginas}
                  className="w-10 h-10 rounded-xl border flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-40"
                  style={{ borderColor: '#DDE3EE' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl p-10 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
          <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            ¿Quieres vender en TechMarket?
          </h3>
          <p className="text-blue-200 mb-6 max-w-md mx-auto">
            Únete a nuestra red de vendedores y llega a miles de compradores.
          </p>
          <a href="/registro" className="btn-gold px-8 py-3 inline-flex items-center gap-2">
            Empezar a vender →
          </a>
        </div>
      </section>
    </div>
  );
}
