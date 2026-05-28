// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold mb-4" style={{ color: '#0B1D3A', fontFamily: "'Playfair Display', serif" }}>
          404
        </p>
        <div className="gold-divider mb-6 mx-auto" style={{ width: '60px' }} />
        <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Página no encontrada
        </h2>
        <p className="text-slate-500 mb-8">
          La página que buscas no existe o fue movida.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.history.back()}
            className="btn-outline flex items-center gap-2 px-5 py-2.5">
            <ArrowLeft size={16} /> Volver
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2 px-5 py-2.5">
            <Home size={16} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
