// ARCHIVO: frontend/src/pages/CatalogPage.jsx
import React from 'react';
import { ShoppingCart, Star, Tag, TrendingUp, Shield, Truck } from 'lucide-react';

const formatPrecio = (precio) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(precio);

// ── PRODUCT CARD ──────────────────────────────────────────
const ProductCard = ({ producto, agregarAlCarrito }) => {
  const tieneDescuento = producto.precio_anterior && producto.precio_anterior > producto.precio;
  const descuento = tieneDescuento
    ? Math.round((1 - producto.precio / producto.precio_anterior) * 100) : 0;

  return (
    <div className="card group cursor-pointer" style={{ borderRadius: '20px' }}>
      {/* Imagen */}
      <div className="relative overflow-hidden" style={{ height: '220px', background: '#F8F9FC' }}>
        {producto.imagen_url ? (
          <img src={producto.imagen_url} alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {tieneDescuento && (
            <span className="badge-gold text-xs font-bold px-2.5 py-1 rounded-lg">-{descuento}%</span>
          )}
          {producto.stock === 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">Sin stock</span>
          )}
        </div>

        {/* Overlay botón */}
        <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(11,29,58,0.7), transparent)' }}>
          <button onClick={() => agregarAlCarrito(producto)}
            disabled={producto.stock === 0}
            className="btn-gold text-sm px-5 py-2.5 disabled:opacity-50">
            <ShoppingCart size={15} /> Agregar al carrito
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <p className="text-xs font-medium mb-1.5" style={{ color: '#8A9BB5' }}>
          {producto.id_categoria === 1 ? 'Tecnología' :
           producto.id_categoria === 2 ? 'Audio' :
           producto.id_categoria === 3 ? 'Periféricos' : 'Mobiliario'}
        </p>
        <h3 className="font-semibold text-sm leading-snug mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors"
          style={{ color: '#0B1D3A', minHeight: '40px' }}>
          {producto.nombre}
        </h3>

        {/* Rating simulado */}
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={11} className={s <= 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
          ))}
          <span className="text-xs text-slate-400 ml-1">(4.0)</span>
        </div>

        {/* Precio */}
        <div className="flex items-end justify-between">
          <div>
            {tieneDescuento && (
              <p className="text-xs text-slate-400 line-through">{formatPrecio(producto.precio_anterior)}</p>
            )}
            <p className="text-xl font-bold" style={{ color: '#0B1D3A' }}>{formatPrecio(producto.precio)}</p>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${producto.stock > 5 ? 'bg-green-400' : producto.stock > 0 ? 'bg-amber-400' : 'bg-red-400'}`} />
            <span className="text-xs text-slate-500">
              {producto.stock > 5 ? 'Disponible' : producto.stock > 0 ? `${producto.stock} left` : 'Agotado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── PÁGINA PRINCIPAL ──────────────────────────────────────
const CatalogPage = ({ productos, agregarAlCarrito }) => {
  return (
    <div>
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #1E3A5F 55%, #2563EB 100%)' }}>

        {/* Decoraciones */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 -translate-y-1/2 translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 translate-y-1/2 -translate-x-1/3"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold animate-fade-up"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.3)' }}>
              <TrendingUp size={14} /> Marketplace #1 en Colombia
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight animate-fade-up-delay-1"
              style={{ fontFamily: "'Playfair Display', serif" }}>
              Tecnología de <span style={{ color: '#C9A84C' }}>primera</span>,<br />a tu alcance
            </h1>
            <p className="text-blue-200 text-lg mb-8 animate-fade-up-delay-2">
              Los mejores productos tecnológicos con garantía, envío seguro y los precios más competitivos del mercado.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up-delay-3">
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Shield size={16} style={{ color: '#C9A84C' }} /> Compra 100% segura
              </div>
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Truck size={16} style={{ color: '#C9A84C' }} /> Envío a todo Colombia
              </div>
              <div className="flex items-center gap-2 text-blue-200 text-sm">
                <Tag size={16} style={{ color: '#C9A84C' }} /> Mejores precios
              </div>
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="gold-divider" />
      </section>

      {/* ── CATÁLOGO ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header sección */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#C9A84C' }}>NUESTRO CATÁLOGO</p>
            <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Productos destacados
            </h2>
          </div>
          <p className="text-sm text-slate-500">{productos.length} productos disponibles</p>
        </div>

        {/* Grid */}
        {productos.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: '#0B1D3A' }}>No hay productos disponibles</h3>
            <p className="text-slate-500">Vuelve pronto, estamos actualizando el catálogo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto, i) => (
              <div key={producto.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard producto={producto} agregarAlCarrito={agregarAlCarrito} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── BANNER INFERIOR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl p-10 text-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C9A84C 0%, transparent 50%), radial-gradient(circle at 80% 50%, #3B82F6 0%, transparent 50%)' }} />
          <div className="relative">
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              ¿Quieres vender en TechMarket?
            </h3>
            <p className="text-blue-200 mb-6 max-w-md mx-auto">
              Únete a nuestra red de vendedores y llega a miles de compradores en toda Colombia.
            </p>
            <button className="btn-gold px-8 py-3">
              Empezar a vender →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;
