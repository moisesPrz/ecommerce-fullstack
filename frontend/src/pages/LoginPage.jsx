// ARCHIVO: frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Store, ArrowRight, Lock, Mail } from 'lucide-react';
import api from '../config/api';

const LoginPage = ({ onLogin, alIrARegistro }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await api.post('/auth/login', form);
      if (res.data) {
        const { token, usuario } = res.data;
        onLogin(usuario, token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F9FC' }}>

      {/* ── PANEL IZQUIERDO (Decorativo) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #1E3A5F 60%, #2563EB 100%)' }}>

        {/* Círculos decorativos */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />

        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
              <Store size={24} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              TechMarket
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tu marketplace de <span style={{ color: '#C9A84C' }}>tecnología</span> de confianza
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-12">
            Accede a miles de productos tecnológicos con los mejores vendedores del mercado colombiano.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { value: '500+', label: 'Productos' },
              { value: '100%', label: 'Seguro' },
              { value: '24/7', label: 'Soporte' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
                <p className="text-2xl font-bold mb-1" style={{ color: '#C9A84C' }}>{stat.value}</p>
                <p className="text-blue-200 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANEL DERECHO (Formulario) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">

          {/* Header móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
              <Store size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              TechMarket
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500">Ingresa a tu cuenta para continuar</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-11"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={mostrarPass ? 'text' : 'password'} required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-11 pr-12"
                />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {mostrarPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={cargando}
              className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {cargando ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Ingresar <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-sm text-slate-500">¿No tienes cuenta? </span>
            <button onClick={alIrARegistro}
              className="text-sm font-semibold hover:underline transition-all"
              style={{ color: '#1E3A5F' }}>
              Regístrate gratis
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">ACCESO SEGURO</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            🔒 Tus datos están protegidos con encriptación SSL de 256 bits
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
