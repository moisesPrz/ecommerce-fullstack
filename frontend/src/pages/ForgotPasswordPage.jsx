import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

export default function ForgotPasswordPage() {
  useSEO({ title: 'Recuperar contraseña', url: '/forgot-password' });

  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setEnviado(true);
    } catch {
      setError('Ocurrió un error. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #1E3A5F 60%, #2563EB 100%)' }}>
      <div className="w-full max-w-md">
        <div className="card p-8" style={{ borderRadius: '24px' }}>
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
              <Mail size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Recuperar contraseña
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Te enviaremos un enlace para restablecer tu acceso.
            </p>
          </div>

          {enviado ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h2 className="font-bold text-lg mb-2" style={{ color: '#0B1D3A' }}>¡Correo enviado!</h2>
              <p className="text-sm text-slate-500 mb-6">
                Si <strong>{email}</strong> está registrado, recibirás un enlace en los próximos minutos.
                Revisa también tu carpeta de spam.
              </p>
              <Link to="/login" className="btn-primary px-6 py-2.5 inline-block">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-field"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={cargando}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-60"
              >
                {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>

              <Link to="/login"
                className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mt-2">
                <ArrowLeft size={14} /> Volver al inicio de sesión
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
