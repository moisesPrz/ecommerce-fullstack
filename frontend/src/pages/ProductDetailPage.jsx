// src/pages/ProductDetailPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart, Star, ArrowLeft, Package, Shield, Truck,
  Plus, Minus, MessageSquare, CheckCircle, RefreshCw, Heart,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { SkeletonDetalle, ErrorMessage } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(precio);


// ── Estrellas ─────────────────────────────────────────────
const Estrellas = ({ valor, size = 16, interactivo = false, onSeleccionar }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => interactivo && onSeleccionar?.(s)}
        className={interactivo ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        tabIndex={interactivo ? 0 : -1}
      >
        <Star
          size={size}
          className={s <= valor ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}
        />
      </button>
    ))}
  </div>
);

// ── Tarjeta de reseña ─────────────────────────────────────
const TarjetaResena = ({ resena }) => (
  <div className="card p-5" style={{ borderRadius: '16px' }}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}
        >
          {resena.Usuario?.nombre?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#0B1D3A' }}>{resena.Usuario?.nombre}</p>
          <p className="text-xs text-slate-400">
            {new Date(resena.createdAt).toLocaleDateString('es-CO', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
      </div>
      <Estrellas valor={resena.calificacion} size={13} />
    </div>
    {resena.comentario && (
      <p className="text-sm text-slate-600 leading-relaxed">{resena.comentario}</p>
    )}
  </div>
);

// ── Tarjeta producto relacionado ──────────────────────────
const TarjetaRelacionado = ({ producto }) => (
  <Link
    to={`/producto/${producto.id}`}
    className="card group block"
    style={{ borderRadius: '20px' }}
  >
    <div className="overflow-hidden" style={{ height: '160px', background: '#F8F9FC', borderRadius: '20px 20px 0 0' }}>
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ color: '#0B1D3A' }}>
        {producto.nombre}
      </h3>
      <p className="font-bold text-sm" style={{ color: '#0B1D3A' }}>{formatPrecio(producto.precio)}</p>
    </div>
  </Link>
);

// ── Página principal ──────────────────────────────────────
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { agregar } = useCart();
  const { estaEnWishlist, toggleWishlist } = useWishlist();
  const { estaAutenticado } = useAuth();
  const toast = useToast();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [relacionados, setRelacionados] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useSEO({
    title: producto?.nombre,
    description: producto?.descripcion
      ? `${producto.descripcion.slice(0, 140)}…`
      : producto?.nombre
        ? `Compra ${producto.nombre} en TechMarket al mejor precio con envío a Colombia.`
        : undefined,
    image: producto?.imagen_url || undefined,
    url: `/producto/${id}`,
    type: 'product',
    precio: producto?.precio,
  });

  useEffect(() => {
    api.get('/categorias').then(res => setCategorias(res.data)).catch(() => {});
  }, []);

  const getCategoriaLabel = (id) => {
    const cat = categorias.find(c => c.id === id);
    return cat ? `${cat.icono} ${cat.nombre}` : '';
  };

  const [resenas, setResenas] = useState([]);
  const [promedioRating, setPromedioRating] = useState(0);
  const [totalResenas, setTotalResenas] = useState(0);
  const [miRating, setMiRating] = useState(0);
  const [miComentario, setMiComentario] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [yaResenado, setYaResenado] = useState(false);

  const cargarResenas = useCallback(async () => {
    try {
      const res = await api.get(`/resenas/producto/${id}`);
      setResenas(res.data.resenas || []);
      setPromedioRating(res.data.promedio || 0);
      setTotalResenas(res.data.total || 0);
    } catch { /* silencioso */ }
  }, [id]);

  const cargarProducto = useCallback(async () => {
    setCargando(true);
    setError(null);
    setCantidad(1);
    try {
      const res = await api.get(`/productos/${id}`);
      setProducto(res.data);

      if (res.data.id_categoria) {
        const rel = await api.get(`/productos?categoria=${res.data.id_categoria}&limite=4`);
        setRelacionados(
          (rel.data.productos || []).filter((p) => p.id !== res.data.id).slice(0, 3)
        );
      }
    } catch {
      setError('Producto no encontrado');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarProducto();
    cargarResenas();
  }, [cargarProducto, cargarResenas]);

  const handleAgregar = () => {
    if (!producto || producto.stock === 0) return;
    for (let i = 0; i < cantidad; i++) agregar(producto);
    toast.exito(`${producto.nombre} agregado al carrito`);
  };

  const handleEnviarResena = async (e) => {
    e.preventDefault();
    if (!estaAutenticado) {
      navigate('/login', { state: { from: { pathname: `/producto/${id}` } } });
      return;
    }
    if (!miRating) {
      toast.error('Selecciona una calificación antes de publicar');
      return;
    }
    setEnviandoResena(true);
    try {
      await api.post('/resenas', {
        id_producto: parseInt(id),
        calificacion: miRating,
        comentario: miComentario.trim() || undefined,
      });
      toast.exito('¡Reseña publicada con éxito!');
      setYaResenado(true);
      setMiRating(0);
      setMiComentario('');
      cargarResenas();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al publicar reseña');
    } finally {
      setEnviandoResena(false);
    }
  };

  if (cargando) {
    return <SkeletonDetalle />;
  }

  if (error || !producto) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <ErrorMessage mensaje={error || 'Producto no encontrado'} onReintentar={cargarProducto} />
        <button onClick={() => navigate('/')} className="btn-primary mt-4 px-6 py-2.5">
          Volver al catálogo
        </button>
      </div>
    );
  }

  const stockInfo =
    producto.stock === 0
      ? { label: 'Agotado', color: 'text-red-500', bg: 'bg-red-50', dot: 'bg-red-400' }
      : producto.stock <= 5
      ? { label: `Solo ${producto.stock} disponibles`, color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-400' }
      : { label: 'En stock', color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-400' };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Volver
      </button>

      {/* ── Producto principal ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">

        {/* Imagen */}
        <div
          className="rounded-3xl overflow-hidden flex items-center justify-center"
          style={{ background: '#F8F9FC', aspectRatio: '1 / 1', maxHeight: '520px' }}
        >
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-8xl">📦</div>
          )}
        </div>

        {/* Detalles */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase mb-2 tracking-wider" style={{ color: '#C9A84C' }}>
            {getCategoriaLabel(producto.id_categoria) || 'General'}
          </p>

          <h1
            className="text-3xl sm:text-4xl font-bold mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}
          >
            {producto.nombre}
          </h1>

          {/* Rating resumen */}
          {totalResenas > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <Estrellas valor={Math.round(promedioRating)} size={18} />
              <span className="font-semibold text-sm" style={{ color: '#0B1D3A' }}>
                {promedioRating}
              </span>
              <span className="text-sm text-slate-400">({totalResenas} reseña{totalResenas !== 1 ? 's' : ''})</span>
            </div>
          )}

          {/* Precio */}
          <p className="text-4xl font-bold mb-5" style={{ color: '#0B1D3A' }}>
            {formatPrecio(producto.precio)}
          </p>

          {/* Stock badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 w-fit ${stockInfo.bg}`}>
            <div className={`w-2 h-2 rounded-full ${stockInfo.dot}`} />
            <span className={`text-sm font-medium ${stockInfo.color}`}>{stockInfo.label}</span>
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <p className="text-slate-600 text-sm leading-relaxed mb-6">{producto.descripcion}</p>
          )}

          {/* Selector de cantidad */}
          {producto.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold" style={{ color: '#0B1D3A' }}>Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center hover:bg-slate-50 transition-all"
                  style={{ borderColor: '#DDE3EE' }}
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-lg" style={{ color: '#0B1D3A' }}>
                  {cantidad}
                </span>
                <button
                  onClick={() => setCantidad((c) => Math.min(producto.stock, c + 1))}
                  disabled={cantidad >= producto.stock}
                  className="w-9 h-9 rounded-xl border flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-40"
                  style={{ borderColor: '#DDE3EE' }}
                >
                  <Plus size={14} />
                </button>
              </div>
              <span className="text-sm text-slate-400">
                Subtotal: <strong style={{ color: '#0B1D3A' }}>{formatPrecio(producto.precio * cantidad)}</strong>
              </span>
            </div>
          )}

          {/* Botón agregar + wishlist */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={handleAgregar}
              disabled={producto.stock === 0}
              className="btn-gold py-4 text-base font-bold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed flex-1"
            >
              <ShoppingCart size={20} />
              {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
            <button
              onClick={() => {
                if (!estaAutenticado) {
                  toast.error('Inicia sesión para guardar favoritos');
                  navigate('/login');
                  return;
                }
                const enWishlist = estaEnWishlist(producto.id);
                toggleWishlist(producto);
                toast.exito(enWishlist ? 'Eliminado de favoritos' : 'Añadido a favoritos');
              }}
              className="w-14 flex items-center justify-center rounded-2xl border-2 transition-all"
              style={estaEnWishlist(producto.id)
                ? { borderColor: '#ef4444', background: '#fef2f2' }
                : { borderColor: '#DDE3EE', background: 'white' }}
            >
              <Heart
                size={22}
                className={estaEnWishlist(producto.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}
              />
            </button>
          </div>

          {/* Garantías */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Shield, label: 'Pago 100% seguro' },
              { icon: Truck, label: 'Envío a Colombia' },
              { icon: Package, label: 'Garantía incluida' },
              { icon: RefreshCw, label: 'Devoluciones 30 días' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                <Icon size={14} style={{ color: '#C9A84C' }} /> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sección de reseñas ─────────────────────────── */}
      <section className="mb-14">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#C9A84C' }}>
            OPINIONES
          </p>
          <h2
            className="text-2xl font-bold"
            style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}
          >
            Reseñas del producto
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumen de rating */}
          <div className="card p-6 text-center h-fit" style={{ borderRadius: '20px' }}>
            <p className="text-6xl font-bold mb-3" style={{ color: '#0B1D3A' }}>
              {promedioRating || '—'}
            </p>
            <Estrellas valor={Math.round(promedioRating)} size={22} />
            <p className="text-sm text-slate-500 mt-2">
              {totalResenas > 0 ? `${totalResenas} reseña${totalResenas !== 1 ? 's' : ''}` : 'Sin reseñas aún'}
            </p>
          </div>

          {/* Formulario + lista */}
          <div className="lg:col-span-2 space-y-4">

            {/* Formulario nueva reseña */}
            {!yaResenado && (
              <div
                className="card p-5"
                style={{ borderRadius: '16px', border: '2px dashed #DDE3EE' }}
              >
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2" style={{ color: '#0B1D3A' }}>
                  <MessageSquare size={15} /> Deja tu reseña
                </h3>
                <form onSubmit={handleEnviarResena} className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Tu calificación *</p>
                    <Estrellas valor={miRating} size={28} interactivo onSeleccionar={setMiRating} />
                  </div>
                  <textarea
                    value={miComentario}
                    onChange={(e) => setMiComentario(e.target.value)}
                    placeholder="Cuéntanos tu experiencia (opcional)..."
                    className="input-field text-sm resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={enviandoResena || !miRating}
                      className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60"
                    >
                      {enviandoResena ? 'Publicando...' : 'Publicar reseña'}
                    </button>
                    {!estaAutenticado && (
                      <p className="text-xs text-slate-400">
                        Debes{' '}
                        <Link to="/login" className="underline" style={{ color: '#0B1D3A' }}>
                          iniciar sesión
                        </Link>{' '}
                        para reseñar
                      </p>
                    )}
                  </div>
                </form>
              </div>
            )}

            {yaResenado && (
              <div
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <p className="text-sm text-green-700 font-medium">¡Gracias! Tu reseña fue publicada.</p>
              </div>
            )}

            {/* Lista de reseñas */}
            {resenas.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sé el primero en dejar una reseña</p>
              </div>
            ) : (
              resenas.map((r) => <TarjetaResena key={r.id} resena={r} />)
            )}
          </div>
        </div>
      </section>

      {/* ── Productos relacionados ─────────────────────── */}
      {relacionados.length > 0 && (
        <section>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#C9A84C' }}>
              TAMBIÉN TE PUEDE GUSTAR
            </p>
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}
            >
              Productos relacionados
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relacionados.map((p) => (
              <TarjetaRelacionado key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
