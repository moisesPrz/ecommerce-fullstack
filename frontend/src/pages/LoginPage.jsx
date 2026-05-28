// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Store, ArrowRight, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { useSEO } from '../hooks/useSEO';

export default function LoginPage() {
  useSEO({ title: 'Iniciar Sesión', url: '/login' });

  const [form, setForm] = useState({ email: '', password: '' });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const destino = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Completa todos los campos');
      return;
    }
    setCargando(true);
    try {
      const usuario = await login(form.email.trim(), form.password);
      toast.exito(`¡Bienvenido, ${usuario.nombre}! 👋`);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F9FC' }}>
      {/* Panel decorativo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #1E3A5F 60%, #2563EB 100%)' }}>
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-14">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Store size={24} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              TechMarket
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            Tu marketplace de <span style={{ color: '#C9A84C' }}>tecnología</span> de confianza
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Accede a miles de productos tecnológicos con los mejores vendedores del mercado.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[{ value: '500+', label: 'Productos' }, { value: '100%', label: 'Seguro' }, { value: '24/7', label: 'Soporte' }].map(s => (
              <div key={s.label} className="text-center p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-bold mb-1" style={{ color: '#C9A84C' }}>{s.value}</p>
                <p className="text-blue-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
              <Store size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              TechMarket
            </span>
          </div>

          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
            Bienvenido de nuevo
          </h2>
          <p className="text-slate-500 mb-8">Ingresa a tu cuenta para continuar</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>Correo electrónico</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required placeholder="tu@correo.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11" autoComplete="email" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold" style={{ color: '#0B1D3A' }}>Contraseña</label>
                <Link to="/recuperar-password" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={mostrarPass ? 'text' : 'password'} required placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-12" autoComplete="current-password" />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={cargando}
              className="btn-primary w-full py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
              {cargando ? (
                <span className="flex items-center gap-2 justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2 justify-center">
                  Ingresar <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-semibold hover:underline" style={{ color: '#1E3A5F' }}>
              Regístrate gratis
            </Link>
          </p>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">ACCESO SEGURO</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            🔒 Tus datos están protegidos con encriptación SSL
          </p>
        </div>
      </div>
    </div>
  );
}
