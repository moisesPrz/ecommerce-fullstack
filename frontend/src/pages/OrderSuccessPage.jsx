// src/pages/OrderSuccessPage.jsx
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

export default function OrderSuccessPage() {
  useSEO({ title: 'Pedido confirmado' });

  const { state } = useLocation();
  const total = state?.total;
  const items = state?.items || [];

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">

        {/* Ícono animado */}
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(34,197,94,0.1)', border: '3px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle size={56} className="text-green-500" />
        </div>

        {/* Título */}
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}
        >
          ¡Pago exitoso!
        </h1>
        <p className="text-slate-500 mb-4">
          Tu pedido fue confirmado y registrado correctamente.
        </p>

        {/* Total pagado */}
        {total && (
          <div
            className="inline-block px-6 py-3 rounded-2xl mb-6"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}
          >
            <p className="text-xs text-slate-500 mb-1">Total pagado</p>
            <p className="text-2xl font-bold" style={{ color: '#C9A84C' }}>{formatPrecio(total)}</p>
          </div>
        )}

        {/* Resumen de ítems */}
        {items.length > 0 && (
          <div className="card p-4 mb-6 text-left" style={{ borderRadius: '16px' }}>
            <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Productos</p>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 truncate max-w-[200px]">
                    {item.nombre} <span className="text-slate-400">×{item.cantidad}</span>
                  </span>
                  <span className="font-medium shrink-0 ml-2" style={{ color: '#0B1D3A' }}>
                    {formatPrecio(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/mis-pedidos"
            className="btn-primary px-6 py-3 flex items-center gap-2 justify-center"
          >
            <Package size={18} /> Ver mis pedidos
          </Link>
          <Link
            to="/"
            className="px-6 py-3 flex items-center gap-2 justify-center rounded-xl font-semibold text-sm transition-all hover:bg-slate-50"
            style={{ border: '2px solid #DDE3EE', color: '#0B1D3A' }}
          >
            <ShoppingBag size={18} /> Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
