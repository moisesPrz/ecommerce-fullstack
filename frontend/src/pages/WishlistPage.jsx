import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/layout/Layout';
import { EmptyState } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

const WishlistCard = ({ producto }) => {
  const { toggleWishlist } = useWishlist();
  const { agregar } = useCart();
  const toast = useToast();

  const handleAgregar = () => {
    if (producto.stock === 0) return;
    agregar(producto);
    toast.exito(`${producto.nombre} agregado al carrito`);
  };

  const handleEliminar = () => {
    toggleWishlist(producto);
    toast.exito('Eliminado de favoritos');
  };

  return (
    <div className="card group flex flex-col" style={{ borderRadius: '20px' }}>
      {/* Imagen */}
      <Link to={`/producto/${producto.id}`}
        className="relative overflow-hidden block"
        style={{ height: '200px', background: '#F8F9FC', borderRadius: '20px 20px 0 0' }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
        )}
        {producto.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">Sin stock</span>
          </div>
        )}
        {/* Botón eliminar de favoritos */}
        <button onClick={(e) => { e.preventDefault(); handleEliminar(); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:bg-red-50 transition-colors z-10">
          <Trash2 size={14} className="text-red-400" />
        </button>
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/producto/${producto.id}`}>
          <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2 hover:text-blue-700 transition-colors"
            style={{ color: '#0B1D3A', minHeight: '40px' }}>
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex items-center justify-between mb-4 mt-auto">
          <p className="text-xl font-bold" style={{ color: '#0B1D3A' }}>{formatPrecio(producto.precio)}</p>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${producto.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-500">{producto.stock > 0 ? 'Disponible' : 'Agotado'}</span>
          </div>
        </div>

        <button onClick={handleAgregar} disabled={producto.stock === 0}
          className="btn-gold w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <ShoppingCart size={15} />
          {producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
};

export default function WishlistPage() {
  useSEO({ title: 'Mis Favoritos', url: '/favoritos' });

  const { wishlist, limpiarWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Encabezado */}
      <div className="mb-8">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft size={15} /> Volver
        </button>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>LISTA DE DESEOS</p>
            <h1 className="text-3xl font-bold flex items-center gap-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Mis Favoritos
              {wishlist.length > 0 && (
                <span className="text-base font-medium text-slate-400">({wishlist.length})</span>
              )}
            </h1>
          </div>
          {wishlist.length > 0 && (
            <button onClick={limpiarWishlist}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all border border-red-100">
              <Trash2 size={14} /> Vaciar lista
            </button>
          )}
        </div>
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          icono={<Heart size={48} className="text-slate-200 mx-auto mb-3" />}
          titulo="Tu lista de favoritos está vacía"
          descripcion="Guarda productos que te interesen para comprarlos después."
          accion={
            <Link to="/" className="btn-primary px-6 py-2.5 inline-block">
              Explorar productos
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((producto) => (
            <WishlistCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </div>
  );
}
