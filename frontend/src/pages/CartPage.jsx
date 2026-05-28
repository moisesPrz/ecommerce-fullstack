// src/pages/CartPage.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(precio);

export default function CartPage() {
  useSEO({ title: 'Mi Carrito', url: '/carrito' });

  const { carrito, eliminar, actualizarCantidad, total, cantidadItems } = useCart();
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const handleComprar = () => {
    if (!estaAutenticado) {
      navigate('/login', { state: { from: { pathname: '/pago' } } });
      return;
    }
    navigate('/pago');
  };

  if (carrito.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icono="🛒"
          titulo="Tu carrito está vacío"
          descripcion="Explora nuestro catálogo y agrega productos que te interesen."
          accion={
            <Link to="/" className="btn-primary px-8 py-3">
              Ver productos
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>RESUMEN</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Mi Carrito
        </h1>
        <p className="text-slate-500 mt-1">{cantidadItems} producto{cantidadItems !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Lista */}
        <div className="flex-1 space-y-4">
          {carrito.map((item, i) => (
            <div key={item.id} className="card p-5 flex gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s`, borderRadius: '20px' }}>
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0" style={{ background: '#F8F9FC' }}>
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: '#0B1D3A' }}>
                  {item.nombre}
                </h3>
                <p className="text-xs mb-3" style={{ color: '#8A9BB5' }}>
                  Unitario: {formatPrecio(item.precio)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => actualizarCantidad(item.id, -1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 transition-all"
                      style={{ borderColor: '#DDE3EE' }}>
                      <Minus size={13} style={{ color: '#0B1D3A' }} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm" style={{ color: '#0B1D3A' }}>
                      {item.cantidad}
                    </span>
                    <button onClick={() => actualizarCantidad(item.id, 1)}
                      disabled={item.cantidad >= item.stock}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center hover:bg-slate-50 transition-all disabled:opacity-40"
                      style={{ borderColor: '#DDE3EE' }}>
                      <Plus size={13} style={{ color: '#0B1D3A' }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold" style={{ color: '#0B1D3A' }}>
                      {formatPrecio(item.precio * item.cantidad)}
                    </p>
                    <button onClick={() => eliminar(item.id)}
                      className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:w-96 shrink-0">
          <div className="card p-6 sticky top-24" style={{ borderRadius: '20px' }}>
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Resumen del pedido
            </h2>
            <div className="space-y-3 mb-5">
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-500 truncate max-w-[200px]">
                    {item.nombre} <span className="text-slate-400">×{item.cantidad}</span>
                  </span>
                  <span className="font-medium shrink-0 ml-2" style={{ color: '#0B1D3A' }}>
                    {formatPrecio(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>
            <div className="gold-divider mb-5" />
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold" style={{ color: '#0B1D3A' }}>Total</span>
              <span className="text-2xl font-bold" style={{ color: '#0B1D3A' }}>{formatPrecio(total)}</span>
            </div>
            <button onClick={handleComprar} className="btn-gold w-full py-4 text-base font-bold">
              Proceder al pago <ArrowRight size={18} />
            </button>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs" style={{ color: '#8A9BB5' }}>
                <Shield size={13} style={{ color: '#C9A84C' }} /> Pago 100% seguro con Stripe
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#8A9BB5' }}>
                <Truck size={13} style={{ color: '#C9A84C' }} /> Envío a todo Colombia
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
