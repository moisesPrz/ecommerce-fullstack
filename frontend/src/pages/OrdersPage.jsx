// src/pages/OrdersPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, Clock, Settings, Send, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonPedidoCard, ErrorMessage, EmptyState } from '../components/ui/index';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

const estadoColor = {
  pendiente:   'bg-yellow-100 text-yellow-700',
  procesando:  'bg-blue-100 text-blue-700',
  enviado:     'bg-purple-100 text-purple-700',
  entregado:   'bg-green-100 text-green-700',
  cancelado:   'bg-red-100 text-red-700',
  completado:  'bg-green-100 text-green-700',
};

const PASOS = [
  { key: 'pendiente',  label: 'Pendiente',  Icon: Clock },
  { key: 'procesando', label: 'Procesando', Icon: Settings },
  { key: 'enviado',    label: 'Enviado',    Icon: Send },
  { key: 'entregado',  label: 'Entregado',  Icon: CheckCircle2 },
];

const Timeline = ({ estado }) => {
  if (estado === 'cancelado') {
    return (
      <div className="flex items-center gap-2 px-1 py-3">
        <XCircle size={16} className="text-red-500 shrink-0" />
        <span className="text-sm font-medium text-red-500">Pedido cancelado</span>
      </div>
    );
  }

  const pasoActual = PASOS.findIndex(p => p.key === estado);

  return (
    <div className="flex items-center gap-0 w-full py-3 px-1 overflow-x-auto">
      {PASOS.map((paso, idx) => {
        const completado = idx < pasoActual;
        const activo     = idx === pasoActual;
        return (
          <div key={paso.key} className="flex items-center flex-1 min-w-0">
            {/* Nodo */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                completado ? 'bg-green-500' : activo ? 'bg-blue-600' : 'bg-slate-200'
              }`}>
                <paso.Icon size={14} className={completado || activo ? 'text-white' : 'text-slate-400'} />
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                completado ? 'text-green-600' : activo ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {paso.label}
              </span>
            </div>
            {/* Línea conectora (no se muestra tras el último) */}
            {idx < PASOS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                completado ? 'bg-green-400' : 'bg-slate-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const PedidoCard = ({ pedido }) => {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="card overflow-hidden" style={{ borderRadius: '16px' }}>
      <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpandido(!expandido)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(11,29,58,0.06)' }}>
            <Package size={18} style={{ color: '#0B1D3A' }} />
          </div>
          <div>
            <p className="font-bold text-sm" style={{ color: '#0B1D3A' }}>Pedido #{pedido.id}</p>
            <p className="text-xs text-slate-400">
              {pedido.Productos?.length || 0} producto{pedido.Productos?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${estadoColor[pedido.estado] || 'bg-slate-100 text-slate-600'}`}>
            {pedido.estado}
          </span>
          <p className="font-bold text-sm hidden sm:block" style={{ color: '#0B1D3A' }}>
            {formatPrecio(pedido.total)}
          </p>
          {expandido ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>

      {expandido && (
        <div className="border-t border-slate-100 p-5">
          <Timeline estado={pedido.estado} />
          <div className="border-t border-slate-100 pt-4 mt-1 space-y-3">
            {pedido.Productos?.map(prod => (
              <div key={prod.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: '#F8F9FC' }}>
                  {prod.imagen_url
                    ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{prod.nombre}</p>
                  <p className="text-xs text-slate-400">
                    Cantidad: {prod.DetallePedido?.cantidad} · {formatPrecio(prod.DetallePedido?.precio_unitario)} c/u
                  </p>
                </div>
                <p className="text-sm font-bold shrink-0" style={{ color: '#0B1D3A' }}>
                  {formatPrecio(prod.DetallePedido?.precio_unitario * prod.DetallePedido?.cantidad)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
            <span className="text-sm font-semibold text-slate-600">Total del pedido</span>
            <span className="font-bold" style={{ color: '#0B1D3A' }}>{formatPrecio(pedido.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function OrdersPage() {
  useSEO({ title: 'Mis Pedidos', url: '/pedidos' });

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await api.get('/pedidos');
      setPedidos(res.data);
    } catch (err) {
      setError('No se pudieron cargar tus pedidos.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (!estaAutenticado) { navigate('/login'); return; }
    cargar();
  }, [estaAutenticado, cargar, navigate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>HISTORIAL</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Mis Pedidos
        </h1>
      </div>

      {cargando ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonPedidoCard key={i} />)}
        </div>
      ) : error ? (
        <ErrorMessage mensaje={error} onReintentar={cargar} />
      ) : pedidos.length === 0 ? (
        <EmptyState
          icono="📦"
          titulo="Aún no tienes pedidos"
          descripcion="Cuando realices una compra, aparecerá aquí."
          accion={
            <button onClick={() => navigate('/')} className="btn-primary px-6 py-2.5">
              Ver productos
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {pedidos.map(pedido => (
            <PedidoCard key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </div>
  );
}
