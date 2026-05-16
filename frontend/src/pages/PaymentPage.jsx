import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import api from '../config/api'; // Importamos la configuración
import CheckoutForm from '../components/CheckoutForm';
import { ShieldCheck, Lock } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentPage = ({ carrito, token, onCompraExitosa }) => {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (carrito.length === 0) return;

    const crearIntento = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Usamos api.post
            const res = await api.post("/pagos/create-payment-intent", {
                items: carrito.map(p => ({ id: p.id, quantity: p.cantidad }))
            }, config);
            
            setClientSecret(res.data.clientSecret);
        } catch (error) {
            console.error("Error al iniciar pago:", error);
            alert("Error conectando con la pasarela de pagos.");
        }
    };
    crearIntento();
  }, [carrito, token]);

  const appearance = { theme: 'stripe' };
  const options = { clientSecret, appearance };

  if (carrito.length === 0) return <div className="p-10 text-center">Tu carrito está vacío.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Resumen de Compra</h2>
                <div className="space-y-4 mb-6">
                    {carrito.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">{item.cantidad}x {item.nombre}</span>
                            <span className="font-bold">${(item.precio * item.cantidad).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total a Pagar:</span>
                    <span>${carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0).toFixed(2)}</span>
                </div>
                <div className="mt-8 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                    <ShieldCheck className="h-5 w-5" /> Pagos seguros por Stripe.
                </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
                <div className="mb-6"><h1 className="text-2xl font-bold text-slate-900">Datos de Pago</h1><p className="text-slate-400 text-sm flex items-center gap-1 mt-1"><Lock className="h-3 w-3"/> Encriptación SSL</p></div>
                {clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                        <CheckoutForm onSuccess={onCompraExitosa} />
                    </Elements>
                ) : (
                    <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div></div>
                )}
            </div>
        </div>
    </div>
  );
};

export default PaymentPage;