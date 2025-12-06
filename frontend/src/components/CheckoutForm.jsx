import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const CheckoutForm = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js no ha cargado todavía.
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      // Detectamos automáticamente si estamos en localhost o en Vercel
      const baseUrl = window.location.origin;

      // Confirmamos el pago con Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // Esto redirige a /completado en tu dominio actual (sea local o nube)
          return_url: `${baseUrl}/completado`, 
        },
        redirect: "if_required", // IMPORTANTE: Evita recargar la página si el pago es directo
      });

      if (error) {
        // Error de tarjeta (fondos insuficientes, rechazada, etc.)
        if (error.type === "card_error" || error.type === "validation_error") {
          setMensaje(error.message);
        } else {
          setMensaje("Ocurrió un error inesperado al procesar el pago.");
        }
        setCargando(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // ¡Pago exitoso!
        // console.log("Pago exitoso:", paymentIntent);
        onSuccess(paymentIntent.id);
        setCargando(false);
      } else {
        // Estado pendiente o procesando
        setMensaje("El pago se está procesando. Revisa tu correo.");
        setCargando(false);
      }
    } catch (err) {
      console.error(err);
      setMensaje("Error de conexión con el servidor de pagos.");
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
        
        {/* Componente oficial de Stripe (Maneja validaciones y seguridad) */}
        <PaymentElement id="payment-element" />
      </div>

      {mensaje && (
        <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
          mensaje.includes('procesando') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
        }`}>
           <AlertCircle className="h-4 w-4"/>
           {mensaje}
        </div>
      )}

      <button 
        disabled={cargando || !stripe || !elements} 
        id="submit"
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {cargando ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" /> Procesando...
          </>
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