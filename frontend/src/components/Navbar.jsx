import React from 'react';
import { ShoppingCart, LogOut, Package, Shield, User, Store } from 'lucide-react';

const Navbar = ({ usuario, vistaActual, onNavegar, onCerrarSesion, carritoCantidad }) => {
  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO - Clic para ir al Catálogo */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
            onClick={() => onNavegar('catalogo')}
          >
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TechMarket</span>
          </div>

          {/* MENÚ DERECHO */}
          <div className="flex items-center gap-6">
            
            {/* Si NO hay usuario (Invitado) */}
            {!usuario ? (
              <>
                <button 
                  onClick={() => onNavegar('login')}
                  className="text-slate-300 hover:text-white font-medium transition"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => onNavegar('registro')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold transition shadow-lg shadow-blue-900/50"
                >
                  Regístrate
                </button>
              </>
            ) : (
              /* Si SÍ hay usuario (Logueado) */
              <div className="flex items-center gap-4">
                
                <span className="hidden md:flex items-center gap-2 text-slate-300 text-sm">
                  <User className="h-4 w-4" />
                  Hola, <span className="font-bold text-white">{usuario.nombre}</span>
                </span>

                <div className="h-6 w-px bg-slate-700 mx-2"></div>

                {/* BOTÓN ADMIN (Solo si es administrador) */}
                {usuario.rol === 'administrador' && (
                  <button 
                    onClick={() => onNavegar('admin')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                      vistaActual === 'admin' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                )}

                {/* BOTÓN MIS PEDIDOS (Nuevo) */}
                <button 
                  onClick={() => onNavegar('pedidos')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${
                    vistaActual === 'pedidos' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Mis Pedidos</span>
                </button>

                {/* BOTÓN LOGOUT */}
                <button 
                  onClick={onCerrarSesion}
                  className="text-red-400 hover:text-red-300 hover:bg-slate-800 p-2 rounded-lg transition"
                  title="Cerrar Sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* BOTÓN CARRITO (Siempre visible) */}
            <button 
              onClick={() => onNavegar('carrito')}
              className="relative group p-2"
            >
              <ShoppingCart className={`h-6 w-6 transition ${vistaActual === 'carrito' ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`} />
              
              {carritoCantidad > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
                  {carritoCantidad}
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;