// ARCHIVO: frontend/src/pages/CartPage.jsx
import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Shield, Truck } from 'lucide-react';

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(precio);

const CartPage = ({ carrito, onEliminar, onActualizarCantidad, onComprar }) => {
  const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);

  if (carrito.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(11,29,58,0.06)' }}>
          <ShoppingBag size={40} style={{ color: '#0B1D3A' }} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Tu carrito está vacío
        </h2>
        <p className="text-slate-500 mb-8">Explora nuestro catálogo y agrega productos que te interesen.</p>
        <button className="btn-primary px-8 py-3.5" onClick={() => window.history.back()}>
          Ver productos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold mb-1" style={{ color: '#C9A84C' }}>RESUMEN</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Mi Carrito
        </h1>
        <p className="text-slate-500 mt-1">{totalItems} producto{totalItems !== 1 ? 's' : ''} seleccionado{totalItems !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── LISTA DE ITEMS ── */}
        <div className="flex-1 space-y-4">
          {carrito.map((item, i) => (
            <div key={item.id} className="card p-5 flex gap-4 animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s`, borderRadius: '20px' }}>
              {/* Imagen */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0"
                style={{ background: '#F8F9FC' }}>
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: '#0B1D3A' }}>
                  {item.nombre}
                </h3>
                <p className="text-xs mb-3" style={{ color: '#8A9BB5' }}>
                  {item.id_categoria === 1 ? 'Tecnología' : item.id_categoria === 2 ? 'Audio' :
                   item.id_categoria === 3 ? 'Periféricos' : 'Mobiliario'}
                </p>

                <div className="flex items-center justify-between">
                  {/* Controles cantidad */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => onActualizarCantidad(item.id, -1)}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-slate-50"
                      style={{ borderColor: '#DDE3EE' }}>
                      <Minus size={13} style={{ color: '#0B1D3A' }} />
                    </button>
                    <span className="w-8 text-center font-bold text-sm" style={{ color: '#0B1D3A' }}>
                      {item.cantidad}
                    </span>
                    <button onClick={() => onActualizarCantidad(item.id, 1)}
                      disabled={item.cantidad >= item.stock}
                      className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-slate-50 disabled:opacity-40"
                      style={{ borderColor: '#DDE3EE' }}>
                      <Plus size={13} style={{ color: '#0B1D3A' }} />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-bold text-base" style={{ color: '#0B1D3A' }}>
                      {formatPrecio(item.precio * item.cantidad)}
                    </p>
                    <button onClick={() => onEliminar(item.id)}
                      className="p-2 rounded-xl hover:bg-red-50 transition-colors text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── RESUMEN DE PAGO ── */}
        <div className="lg:w-96 shrink-0">
          <div className="card p-6 sticky top-24" style={{ borderRadius: '20px' }}>
            <h2 className="font-bold text-lg mb-5" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Resumen del pedido
            </h2>

            {/* Items */}
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

            {/* Divider */}
            <div className="gold-divider mb-5" />

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="font-bold text-base" style={{ color: '#0B1D3A' }}>Total</span>
              <span className="text-2xl font-bold" style={{ color: '#0B1D3A' }}>
                {formatPrecio(total)}
              </span>
            </div>

            <button onClick={onComprar} className="btn-gold w-full py-4 text-base font-bold">
              Proceder al pago <ArrowRight size={18} />
            </button>

            {/* Garantías */}
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
};

export default CartPage;
