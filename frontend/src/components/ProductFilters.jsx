// ARCHIVO: src/components/ProductFilters.jsx
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const ProductFilters = ({ onFiltrar }) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');

  // IDs de categorías basados en tu base de datos
  const categorias = [
    { id: 1, nombre: 'Tecnología' },
    { id: 2, nombre: 'Audio' },
    { id: 3, nombre: 'Periféricos' },
    { id: 4, nombre: 'Mobiliario' }
  ];

  const manejarEnvio = (e) => {
    e.preventDefault();
    onFiltrar({ busqueda, categoria }); // Enviamos los datos al padre
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoria('');
    onFiltrar({}); // Recargar todo limpio
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <form onSubmit={manejarEnvio} className="flex flex-col md:flex-row gap-4 items-center">
        
        {/* Input Buscador */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar productos (ej: Gamer)..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Select Categoría */}
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <select
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition w-full md:w-auto">
          Buscar
        </button>

        {(busqueda || categoria) && (
          <button type="button" onClick={limpiarFiltros} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        )}
      </form>
    </div>
  );
};

export default ProductFilters;