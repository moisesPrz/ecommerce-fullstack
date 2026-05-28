// ── Skeleton primitivo ────────────────────────────────────
const Sk = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
);

// Product card skeleton — usada en CatalogPage
export const SkeletonCard = () => (
  <div className="card overflow-hidden" style={{ borderRadius: '20px' }}>
    <Sk className="w-full" style={{ height: '220px', borderRadius: '20px 20px 0 0' }} />
    <div className="p-4 space-y-3">
      <Sk className="h-4 w-3/4" />
      <Sk className="h-3 w-1/2" />
      <div className="flex items-center justify-between pt-1">
        <Sk className="h-5 w-20" />
        <Sk className="h-8 w-28 rounded-full" />
      </div>
    </div>
  </div>
);

// Dashboard stat cards + recent lists skeleton — Admin & Vendedor
export const SkeletonDashboard = () => (
  <div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <Sk className="h-3 w-20" />
            <Sk className="h-8 w-8 rounded-lg" />
          </div>
          <Sk className="h-7 w-28 mt-1" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[0, 1].map(i => (
        <div key={i} className="card p-5 animate-pulse">
          <Sk className="h-4 w-36 mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <Sk className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-3 w-3/4" />
                  <Sk className="h-2.5 w-1/2" />
                </div>
                <Sk className="h-5 w-16 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Table rows skeleton — Admin & Vendedor tables
export const SkeletonTableRows = ({ filas = 5 }) => (
  <div className="card overflow-hidden animate-pulse">
    {[...Array(filas)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0">
        <Sk className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Sk className="h-3 w-2/5" />
          <Sk className="h-2.5 w-1/3" />
        </div>
        <Sk className="h-5 w-20 rounded-full shrink-0 hidden sm:block" />
        <Sk className="h-7 w-24 rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

// Order card skeleton — OrdersPage
export const SkeletonPedidoCard = () => (
  <div className="card p-5 animate-pulse" style={{ borderRadius: '16px' }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Sk className="w-10 h-10 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Sk className="h-3 w-24" />
          <Sk className="h-2.5 w-16" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Sk className="h-6 w-20 rounded-full" />
        <Sk className="h-4 w-16 hidden sm:block" />
        <Sk className="w-4 h-4 rounded" />
      </div>
    </div>
  </div>
);

// Product detail skeleton — ProductDetailPage
export const SkeletonDetalle = () => (
  <div className="animate-pulse max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <Sk className="w-full rounded-2xl" style={{ height: '420px' }} />
      <div className="space-y-4">
        <Sk className="h-3 w-32" />
        <Sk className="h-8 w-3/4" />
        <Sk className="h-6 w-1/2" />
        <div className="flex items-center gap-2">
          <Sk className="h-4 w-28" />
          <Sk className="h-3 w-12" />
        </div>
        <Sk className="h-4 w-full" />
        <Sk className="h-4 w-5/6" />
        <Sk className="h-4 w-4/6" />
        <div className="flex items-center gap-3 pt-2">
          <Sk className="h-11 w-28 rounded-xl" />
          <Sk className="h-11 flex-1 rounded-xl" />
          <Sk className="h-11 w-11 rounded-xl" />
        </div>
        <Sk className="h-11 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

// src/components/ui/Toast.jsx
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const iconos = {
  success: <CheckCircle size={18} className="text-green-400" />,
  error: <XCircle size={18} className="text-red-400" />,
  info: <Info size={18} className="text-blue-400" />,
};

export const ToastContainer = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
    {toasts.map(toast => (
      <div key={toast.id}
        className="flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-fade-up"
        style={{ background: '#0B1D3A', minWidth: '260px' }}>
        {iconos[toast.tipo]}
        <span>{toast.mensaje}</span>
      </div>
    ))}
  </div>
);

// src/components/ui/LoadingSpinner.jsx
export const LoadingSpinner = ({ texto = 'Cargando...' }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: '#0B1D3A', borderTopColor: 'transparent' }} />
    <p className="text-sm text-slate-500 font-medium">{texto}</p>
  </div>
);

// src/components/ui/ErrorMessage.jsx
export const ErrorMessage = ({ mensaje, onReintentar }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: 'rgba(239,68,68,0.1)' }}>
      <XCircle size={32} className="text-red-500" />
    </div>
    <div className="text-center">
      <h3 className="font-bold text-slate-800 mb-1">Algo salió mal</h3>
      <p className="text-sm text-slate-500">{mensaje}</p>
    </div>
    {onReintentar && (
      <button onClick={onReintentar} className="btn-primary px-6 py-2 text-sm">
        Reintentar
      </button>
    )}
  </div>
);

// src/components/ui/EmptyState.jsx
export const EmptyState = ({ icono = '📦', titulo, descripcion, accion }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
    <p className="text-5xl">{icono}</p>
    <div>
      <h3 className="font-bold text-xl text-slate-800 mb-1"
        style={{ fontFamily: "'Playfair Display', serif" }}>{titulo}</h3>
      {descripcion && <p className="text-slate-500 text-sm">{descripcion}</p>}
    </div>
    {accion}
  </div>
);

// Componente de Badge de rol
export const RolBadge = ({ rol }) => {
  const colores = {
    administrador: 'bg-purple-100 text-purple-700',
    vendedor: 'bg-blue-100 text-blue-700',
    cliente: 'bg-slate-100 text-slate-600',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colores[rol] || colores.cliente}`}>
      {rol}
    </span>
  );
};
