// src/pages/PaymentPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, Lock, ArrowLeft, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const formatPrecio = (v) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(v);

const CARD_STYLE = {
  style: {
    base: {
      fontSize: '15px',
      color: '#0B1D3A',
      fontFamily: "'DM Sans', sans-serif",
      '::placeholder': { color: '#94A3B8' },
    },
    invalid: { color: '#EF4444' },
  },
};

// ── Formulario de pago ────────────────────────────────────
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { carrito, total, vaciar } = useCart();
  const { estaAutenticado } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [procesando, setProcesando] = useState(false);
  const [cardError, setCardError] = useState('');

  useEffect(() => {
    if (!estaAutenticado || carrito.length === 0) navigate('/');
  }, [estaAutenticado, carrito, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcesando(true);
    setCardError('');

    try {
      // 1. Crear PaymentIntent en el backend
      const items = carrito.map(p => ({ id: p.id, quantity: p.cantidad, precio: p.precio }));
      const { data } = await api.post('/pagos/create-payment-intent', { items });

      // 2. Confirmar pago con Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        { payment_method: { card: elements.getElement(CardElement) } }
      );

      if (stripeError) {
        setCardError(stripeError.message);
        setProcesando(false);
        return;
      }

      // 3. Guardar pedido en backend
      await api.post('/pedidos', { items, paymentId: paymentIntent.id });

      // 4. Limpiar carrito y redirigir a página de éxito
      const resumenItems = carrito.map(i => ({ id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad }));
      vaciar();
      navigate('/pedido-exitoso', { state: { total, items: resumenItems } });

    } catch (err) {
      const msg = err.response?.data?.message || 'Error al procesar el pago';
      setCardError(msg);
      toast.error(msg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen del carrito */}
      <div className="card p-5" style={{ borderRadius: '16px' }}>
        <h3 className="font-bold text-sm mb-4" style={{ color: '#0B1D3A' }}>Resumen del pedido</h3>
        <div className="space-y-2 mb-4">
          {carrito.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-500 truncate max-w-[200px]">
                {item.nombre} <span className="text-slate-400">×{item.cantidad}</span>
              </span>
              <span className="font-medium" style={{ color: '#0B1D3A' }}>
                {formatPrecio(item.precio * item.cantidad)}
              </span>
            </div>
          ))}
        </div>
        <div className="gold-divider mb-3" />
        <div className="flex justify-between font-bold">
          <span style={{ color: '#0B1D3A' }}>Total</span>
          <span className="text-lg" style={{ color: '#0B1D3A' }}>{formatPrecio(total)}</span>
        </div>
      </div>

      {/* Datos de tarjeta */}
      <div className="card p-5" style={{ borderRadius: '16px' }}>
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} style={{ color: '#0B1D3A' }} />
          <h3 className="font-bold text-sm" style={{ color: '#0B1D3A' }}>Datos de pago</h3>
        </div>
        <div className="p-4 border rounded-xl" style={{ borderColor: '#DDE3EE', background: '#F8F9FC' }}>
          <CardElement options={CARD_STYLE} />
        </div>
        {cardError && (
          <p className="text-xs text-red-500 mt-2">{cardError}</p>
        )}
        <p className="text-xs text-slate-400 mt-3">
          🧪 Tarjeta de prueba: <span className="font-mono">4242 4242 4242 4242</span> · Cualquier fecha futura · CVC: 123
        </p>
      </div>

      <button type="submit" disabled={!stripe || procesando}
        className="btn-gold w-full py-4 text-base font-bold disabled:opacity-60">
        {procesando ? (
          <span className="flex items-center gap-2 justify-center">
            <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin"
              style={{ borderColor: 'rgba(11,29,58,0.3)', borderTopColor: '#0B1D3A' }} />
            Procesando pago...
          </span>
        ) : (
          <span className="flex items-center gap-2 justify-center">
            <Lock size={16} /> Pagar {formatPrecio(total)}
          </span>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <Shield size={13} style={{ color: '#C9A84C' }} />
        Pago seguro procesado por Stripe. Tus datos están encriptados.
      </div>
    </form>
  );
};

// ── Página principal ──────────────────────────────────────
export default function PaymentPage() {
  useSEO({ title: 'Pago Seguro', url: '/pago' });
  const navigate = useNavigate();

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <button onClick={() => navigate('/carrito')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver al carrito
      </button>

      <div className="mb-6">
        <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>CHECKOUT</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Pago Seguro
        </h1>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
