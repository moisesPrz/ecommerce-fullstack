// ARCHIVO: frontend/src/components/ProductFilters.jsx
import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const categorias = [
  { id: '', label: 'Todos' },
  { id: '1', label: 'Tecnología' },
  { id: '2', label: 'Audio' },
  { id: '3', label: 'Periféricos' },
  { id: '4', label: 'Mobiliario' },
];

const ProductFilters = ({ onFiltrar }) => {
  const [busqueda, setBusqueda] = useState('');
  const [categoriaActiva, setCategoriaActiva] = useState('');

  const handleBuscar = (e) => {
    e.preventDefault();
    const filtros = {};
    if (busqueda.trim()) filtros.busqueda = busqueda.trim();
    if (categoriaActiva) filtros.categoria = categoriaActiva;
    onFiltrar(filtros);
  };

  const handleCategoria = (id) => {
    setCategoriaActiva(id);
    const filtros = {};
    if (busqueda.trim()) filtros.busqueda = busqueda.trim();
    if (id) filtros.categoria = id;
    onFiltrar(filtros);
  };

  const limpiar = () => {
    setBusqueda('');
    setCategoriaActiva('');
    onFiltrar({});
  };

  return (
    <div className="py-6 border-b" style={{ borderColor: '#EEF1F6' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

          {/* Buscador */}
          <form onSubmit={handleBuscar} className="flex gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8A9BB5' }} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="input-field pl-11 py-3"
              />
              {busqueda && (
                <button type="button" onClick={() => { setBusqueda(''); onFiltrar(categoriaActiva ? { categoria: categoriaActiva } : {}); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-primary px-5 py-3 shrink-0">
              <Search size={16} />
            </button>
          </form>

          {/* Filtros rápidos */}
          {(busqueda || categoriaActiva) && (
            <button onClick={limpiar} className="text-sm font-medium flex items-center gap-1.5 hover:underline"
              style={{ color: '#1E3A5F' }}>
              <X size={14} /> Limpiar filtros
            </button>
          )}
        </div>

        {/* Categorías */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {categorias.map(cat => (
            <button key={cat.id} onClick={() => handleCategoria(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                categoriaActiva === cat.id
                  ? 'text-white shadow-sm'
                  : 'hover:bg-slate-100'
              }`}
              style={categoriaActiva === cat.id
                ? { background: '#0B1D3A', color: 'white' }
                : { background: '#EEF1F6', color: '#3D5278' }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
