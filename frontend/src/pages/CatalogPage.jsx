import React from 'react';
import { Plus, ImageOff } from 'lucide-react'; // Agregamos icono para imagen rota

const CatalogPage = ({ productos, agregarAlCarrito }) => (
  <div className="p-8 max-w-6xl mx-auto">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-slate-800">Nuestros Productos</h2>
      <p className="text-slate-500 mt-2">Tecnología de punta directa de nuestra base de datos.</p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {productos.map((prod) => (
        <div key={prod.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition group relative overflow-hidden flex flex-col">
          
          {/* Badge de Stock */}
          {prod.stock === 0 && (
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold z-10">
              AGOTADO
            </div>
          )}
          
          {/* Lógica inteligente de Imagen: ¿Es URL o Emoji? */}
          <div className="h-48 w-full mb-4 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition flex items-center justify-center overflow-hidden">
            {prod.imagen_url && prod.imagen_url.startsWith('http') ? (
              <img 
                src={prod.imagen_url} 
                alt={prod.nombre} 
                className="h-full w-full object-contain mix-blend-multiply"
                onError={(e) => {e.target.style.display='none'}} // Si falla la imagen, no la muestra
              />
            ) : (
              // Si no es URL, asumimos que es un emoji o texto corto
              <span className="text-6xl">{prod.imagen_url || <ImageOff className="text-gray-300"/>}</span>
            )}
          </div>
          
          {/* Información */}
          <div className="mt-auto">
            <h3 className="font-bold text-lg text-slate-800 truncate">{prod.nombre}</h3>
            <p className="text-blue-600 font-bold text-xl mt-1">${Number(prod.precio).toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-1">Stock disponible: {prod.stock}</p>
            
            <button 
              onClick={() => agregarAlCarrito(prod)}
              disabled={prod.stock === 0}
              className={`w-full mt-4 py-2 rounded-lg transition flex items-center justify-center gap-2 ${
                prod.stock > 0 
                  ? 'bg-slate-900 text-white hover:bg-blue-600 cursor-pointer active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Plus className="h-4 w-4" />
              {prod.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CatalogPage;