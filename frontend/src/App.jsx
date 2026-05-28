// src/App.jsx — Versión completa con React Router, Lazy Loading y SEO
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { PrivateRoute, AdminRoute, VendedorRoute, PublicRoute } from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// ── LAZY LOADING — Solo carga la página cuando se necesita ──
const CatalogPage       = lazy(() => import('./pages/CatalogPage'));
const LoginPage         = lazy(() => import('./pages/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/RegisterPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const PaymentPage       = lazy(() => import('./pages/PaymentPage'));
const OrdersPage        = lazy(() => import('./pages/OrdersPage'));
const AdminPage         = lazy(() => import('./pages/AdminPage'));
const VendedorPage      = lazy(() => import('./pages/VendedorPage'));
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'));
const ProfilePage         = lazy(() => import('./pages/ProfilePage'));
const ProductDetailPage   = lazy(() => import('./pages/ProductDetailPage'));
const OrderSuccessPage    = lazy(() => import('./pages/OrderSuccessPage'));
const ForgotPasswordPage  = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage   = lazy(() => import('./pages/ResetPasswordPage'));
const WishlistPage        = lazy(() => import('./pages/WishlistPage'));

// Spinner mientras carga la página
const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
      style={{ borderColor: '#0B1D3A', borderTopColor: 'transparent' }} />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
          <ErrorBoundary>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              {/* ── RUTAS PÚBLICAS CON LAYOUT ── */}
              <Route element={<Layout />}>
                <Route index element={<CatalogPage />} />
                <Route path="/carrito" element={<CartPage />} />

                {/* Rutas solo para NO autenticados */}
                <Route path="/login" element={
                  <PublicRoute><LoginPage /></PublicRoute>
                } />
                <Route path="/registro" element={
                  <PublicRoute><RegisterPage /></PublicRoute>
                } />
                <Route path="/recuperar-password" element={
                  <PublicRoute><ForgotPasswordPage /></PublicRoute>
                } />
                <Route path="/reset-password/:token" element={
                  <PublicRoute><ResetPasswordPage /></PublicRoute>
                } />

                {/* Detalle de producto — pública */}
                <Route path="/producto/:id" element={<ProductDetailPage />} />

                {/* Favoritos — requiere login */}
                <Route path="/favoritos" element={
                  <PrivateRoute><WishlistPage /></PrivateRoute>
                } />

                {/* Rutas protegidas — requieren login */}
                <Route path="/pago" element={
                  <PrivateRoute><PaymentPage /></PrivateRoute>
                } />
                <Route path="/pedido-exitoso" element={
                  <PrivateRoute><OrderSuccessPage /></PrivateRoute>
                } />
                <Route path="/mis-pedidos" element={
                  <PrivateRoute><OrdersPage /></PrivateRoute>
                } />
                <Route path="/perfil" element={
                  <PrivateRoute><ProfilePage /></PrivateRoute>
                } />

                {/* Rutas protegidas — requieren rol vendedor */}
                <Route path="/vendedor" element={
                  <VendedorRoute><VendedorPage /></VendedorRoute>
                } />

                {/* Rutas protegidas — requieren rol admin */}
                <Route path="/admin" element={
                  <AdminRoute><AdminPage /></AdminRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          </ErrorBoundary>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
