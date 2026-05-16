// ARCHIVO: frontend/src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingCart, LogOut, Shield, User, Store, Menu, X, Package, ChevronDown } from 'lucide-react';

const Navbar = ({ usuario, vistaActual, onNavegar, onCerrarSesion, carritoCantidad }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-100' 
        : 'bg-white border-b border-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">

          {/* ── LOGO ── */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavegar('catalogo')}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
                <Store size={20} className="text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)' }} />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight" style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#0B1D3A'
              }}>
                TechMarket
              </span>
              <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C97A)' }} />
            </div>
          </div>

          {/* ── NAV LINKS (Desktop) ── */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Catálogo', vista: 'catalogo' },
            ].map(({ label, vista }) => (
              <button key={vista} onClick={() => onNavegar(vista)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  vistaActual === vista
                    ? 'text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                style={vistaActual === vista ? { background: '#0B1D3A' } : {}}>
                {label}
              </button>
            ))}
          </div>

          {/* ── ACCIONES DERECHA ── */}
          <div className="flex items-center gap-3">

            {/* Carrito */}
            <button onClick={() => onNavegar('carrito')}
              className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-slate-50 group">
              <ShoppingCart size={22} className="text-slate-600 group-hover:text-slate-900 transition-colors" />
              {carritoCantidad > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#0B1D3A' }}>
                  {carritoCantidad > 9 ? '9+' : carritoCantidad}
                </span>
              )}
            </button>

            {!usuario ? (
              <div className="flex items-center gap-2">
                <button onClick={() => onNavegar('login')}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
                  Iniciar Sesión
                </button>
                <button onClick={() => onNavegar('registro')} className="btn-primary text-sm px-5 py-2.5">
                  Registrarse
                </button>
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all duration-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
                    {usuario.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{usuario.nombre?.split(' ')[0]}</p>
                    <p className="text-xs leading-tight" style={{ color: '#C9A84C', fontWeight: 600 }}>
                      {usuario.rol}
                    </p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-50" style={{ background: '#F8F9FC' }}>
                      <p className="text-xs font-semibold text-slate-800">{usuario.nombre}</p>
                      <p className="text-xs text-slate-500">{usuario.email || usuario.rol}</p>
                    </div>
                    <div className="p-1.5">
                      <button onClick={() => { onNavegar('pedidos'); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                        <Package size={15} className="text-slate-400" /> Mis Pedidos
                      </button>
                      {usuario.rol === 'vendedor' && (
                        <button onClick={() => { onNavegar('vendedor'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                          <Store size={15} className="text-slate-400" /> Mi Tienda
                        </button>
                      )}
                      {usuario.rol === 'administrador' && (
                        <button onClick={() => { onNavegar('admin'); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
                          style={{ color: '#1E3A5F', background: 'rgba(30,58,95,0.06)' }}>
                          <Shield size={15} style={{ color: '#1E3A5F' }} /> Panel Admin
                        </button>
                      )}
                      <hr className="my-1.5 border-slate-100" />
                      <button onClick={() => { onCerrarSesion(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut size={15} /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
