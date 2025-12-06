import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = ({ carrito, onEliminar, onActualizarCantidad, onComprar }) => {
  
  // 1. CALCULAR TOTAL (Corrección: Aseguramos que precio sea Número)
  const total = carrito.reduce((sum, item) => {
    return sum + (Number(item.precio) * item.cantidad);
  }, 0);

  if (carrito.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
          <ShoppingBag className="h-12 w-12 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
        <p className="mt-2">¡Ve al catálogo y agrega productos increíbles!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-3">
        <ShoppingBag /> Tu Carrito de Compras
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LISTA DE PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          {carrito.map((item) => {
            // CORRECCIÓN CRÍTICA: Convertimos el precio a número aquí mismo
            const precioNumerico = Number(item.precio); 

            return (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center">
                {/* Imagen */}
                <div className="h-24 w-24 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                   {item.imagen_url && item.imagen_url.startsWith('http') ? (
                      <img src={item.imagen_url} alt={item.nombre} className="h-full w-full object-contain mix-blend-multiply" />
                   ) : (
                      <span className="text-3xl">{item.imagen_url}</span>
                   )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800">{item.nombre}</h3>
                  <p className="text-blue-600 font-bold">
                    ${precioNumerico.toFixed(2)} {/* Aquí usamos la variable convertida */}
                  </p>
                </div>

                {/* Controles de Cantidad */}
                <div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-lg">
                  <button 
                    onClick={() => onActualizarCantidad(item.id, -1)}
                    className="p-1 hover:bg-white rounded-full transition shadow-sm"
                    disabled={item.cantidad <= 1}
                  >
                    <Minus className="h-4 w-4 text-slate-600" />
                  </button>
                  <span className="font-bold w-4 text-center">{item.cantidad}</span>
                  <button 
                    onClick={() => onActualizarCantidad(item.id, 1)}
                    className="p-1 hover:bg-white rounded-full transition shadow-sm"
                    disabled={item.cantidad >= item.stock}
                  >
                    <Plus className="h-4 w-4 text-slate-600" />
                  </button>
                </div>

                {/* Eliminar */}
                <button 
                  onClick={() => onEliminar(item.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar producto"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* RESUMEN DE COMPRA */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-24">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen del Pedido</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Envío</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="h-px bg-slate-200 my-2"></div>
              <div className="flex justify-between text-xl font-bold text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={onComprar}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95 flex items-center justify-center gap-2"
            >
              Proceder al Pago
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <p className="text-xs text-center text-slate-400 mt-4">
              Transacción segura y encriptada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;