// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, Shield, User, Store, Menu, X, Package, ChevronDown, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const { usuario, logout, estaAutenticado, esAdmin, esVendedor } = useAuth();
  const { cantidadItems } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setUserMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
    } border-b border-slate-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
              <Store size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                TechMarket
              </span>
              <div className="h-0.5 w-0 group-hover:w-full transition-all duration-300 rounded"
                style={{ background: 'linear-gradient(90deg, #C9A84C, #E8C97A)' }} />
            </div>
          </Link>

          {/* Acciones desktop */}
          <div className="hidden md:flex items-center gap-2">

            {/* Favoritos */}
            <Link to="/favoritos" className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <Heart size={22} className="text-slate-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold flex items-center justify-center rounded-full border-2 border-white"
                  style={{ background: '#ef4444', color: 'white' }}>
                  {wishlist.length > 9 ? '9+' : wishlist.length}
                </span>
              )}
            </Link>

            {/* Carrito */}
            <Link to="/carrito" className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <ShoppingCart size={22} className="text-slate-600" />
              {cantidadItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold flex items-center justify-center rounded-full border-2 border-white"
                  style={{ background: '#C9A84C', color: '#0B1D3A' }}>
                  {cantidadItems > 9 ? '9+' : cantidadItems}
                </span>
              )}
            </Link>

            {!estaAutenticado ? (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/registro"
                  className="btn-primary text-sm px-5 py-2.5">
                  Registrarse
                </Link>
              </div>
            ) : (
              <div className="relative ml-2">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
                    {usuario?.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{usuario?.nombre?.split(' ')[0]}</p>
                    <p className="text-xs font-semibold leading-tight" style={{ color: '#C9A84C' }}>{usuario?.rol}</p>
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-50" style={{ background: '#F8F9FC' }}>
                        <p className="text-xs font-semibold text-slate-800 truncate">{usuario?.nombre}</p>
                        <p className="text-xs text-slate-500 truncate">{usuario?.email}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <Link to="/perfil" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                          <User size={15} className="text-slate-400" /> Mi Perfil
                        </Link>
                        <Link to="/mis-pedidos" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                          <Package size={15} className="text-slate-400" /> Mis Pedidos
                        </Link>
                        {esVendedor && !esAdmin && (
                          <Link to="/vendedor" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                            <Store size={15} className="text-slate-400" /> Mi Tienda
                          </Link>
                        )}
                        {esAdmin && (
                          <Link to="/admin" className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
                            style={{ color: '#1E3A5F', background: isActive('/admin') ? 'rgba(30,58,95,0.08)' : '' }}>
                            <Shield size={15} style={{ color: '#1E3A5F' }} /> Panel Admin
                          </Link>
                        )}
                        <hr className="border-slate-100 my-1" />
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <LogOut size={15} /> Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile — carrito + menú */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/carrito" className="relative p-2 rounded-xl hover:bg-slate-50">
              <ShoppingCart size={20} className="text-slate-600" />
              {cantidadItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold flex items-center justify-center rounded-full"
                  style={{ background: '#C9A84C', color: '#0B1D3A' }}>
                  {cantidadItems}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-slate-50">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 pt-3 space-y-1">
            <Link to="/" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Catálogo</Link>
            <Link to="/favoritos" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">
              <Heart size={14} className="text-red-400" /> Mis Favoritos
              {wishlist.length > 0 && <span className="ml-auto text-xs font-bold text-red-400">{wishlist.length}</span>}
            </Link>
            {!estaAutenticado ? (
              <>
                <Link to="/login" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Iniciar Sesión</Link>
                <Link to="/registro" className="block px-4 py-2.5 text-sm font-medium text-white rounded-xl" style={{ background: '#0B1D3A' }}>Registrarse</Link>
              </>
            ) : (
              <>
                <Link to="/perfil" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Mi Perfil</Link>
                <Link to="/mis-pedidos" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Mis Pedidos</Link>
                {esAdmin && <Link to="/admin" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Panel Admin</Link>}
                {esVendedor && <Link to="/vendedor" className="block px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl">Mi Tienda</Link>}
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl">Cerrar Sesión</button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
