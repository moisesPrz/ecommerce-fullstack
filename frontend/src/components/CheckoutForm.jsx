import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return; // Stripe aún no carga

    setCargando(true);
    setMensaje(null);

    // Confirmamos el pago con Stripe
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:5173", // URL de retorno (no siempre se usa en SPA)
      },
      redirect: "if_required", // IMPORTANTE: Evita recargar la página si no es necesario
    });

    if (error) {
      setMensaje(error.message);
      setCargando(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // ¡Pago exitoso!
      onSuccess(paymentIntent.id);
      setCargando(false);
    } else {
      setMensaje("Ocurrió un error inesperado.");
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-600"/> 
          Tarjeta de Crédito / Débito
        </h3>
        
        {/* Componente oficial de Stripe (Maneja validaciones y seguridad solo) */}
        <PaymentElement />
      </div>

      {mensaje && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${mensaje.includes('succeeded') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
           {mensaje.includes('succeeded') ? <CheckCircle className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
           {mensaje}
        </div>
      )}

      <button 
        disabled={cargando || !stripe || !elements} 
        id="submit"
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {cargando ? (
          <span className="animate-pulse">Procesando pago...</span> 
        ) : (
          <>
            <CreditCard className="h-5 w-5" /> Pagar Ahora
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;