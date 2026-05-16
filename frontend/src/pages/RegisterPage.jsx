// ARCHIVO: frontend/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Eye, EyeOff, Store, ArrowRight, Lock, Mail, User, ShoppingBag } from 'lucide-react';
import api from '../config/api';

const RegisterPage = ({ onRegistro, alIrALogin }) => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'cliente' });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('La contraseña debe tener mínimo 8 caracteres');
    setCargando(true);
    try {
      const res = await api.post('/auth/register', form);
      if (res.data) {
        const { token, usuario } = res.data;
        onRegistro(usuario, token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: '#F8F9FC' }}>
      <div className="w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
            <Store size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
            TechMarket
          </span>
        </div>

        <div className="card p-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Crea tu cuenta
            </h2>
            <p className="text-slate-500 text-sm">Únete a la comunidad TechMarket</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0B1D3A' }}>Nombre completo</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" required placeholder="Juan Pérez" value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="input-field pl-10" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0B1D3A' }}>Correo electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required placeholder="tu@correo.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#0B1D3A' }}>Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={mostrarPass ? 'text' : 'password'} required placeholder="Mínimo 8 caracteres"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setMostrarPass(!mostrarPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {mostrarPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Tipo de cuenta */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>Tipo de cuenta</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cliente', label: 'Comprador', icon: ShoppingBag, desc: 'Quiero comprar' },
                  { value: 'vendedor', label: 'Vendedor', icon: Store, desc: 'Quiero vender' },
                ].map(({ value, label, icon: Icon, desc }) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, rol: value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      form.rol === value ? 'shadow-md' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={form.rol === value ? { borderColor: '#0B1D3A', background: 'rgba(11,29,58,0.04)' } : {}}>
                    <Icon size={18} className="mb-2" style={{ color: form.rol === value ? '#0B1D3A' : '#94A3B8' }} />
                    <p className="text-sm font-semibold" style={{ color: '#0B1D3A' }}>{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={cargando} className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60">
              {cargando ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center gap-2">Crear cuenta gratis <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <button onClick={alIrALogin} className="font-semibold hover:underline" style={{ color: '#1E3A5F' }}>
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
