import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';

export default function ResetPasswordPage() {
  useSEO({ title: 'Nueva contraseña' });

  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setExito(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace es inválido o ha expirado.');
    } finally {
      setCargando(false);
    }
  };

  const fortaleza = (() => {
    if (password.length === 0) return null;
    if (password.length < 8) return { label: 'Muy corta', color: 'bg-red-400', w: 'w-1/4' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password))
      return { label: 'Fuerte', color: 'bg-green-500', w: 'w-full' };
    if (/[A-Z]/.test(password) || /[0-9]/.test(password))
      return { label: 'Media', color: 'bg-amber-400', w: 'w-1/2' };
    return { label: 'Débil', color: 'bg-orange-400', w: 'w-1/3' };
  })();

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0B1D3A 0%, #1E3A5F 60%, #2563EB 100%)' }}>
      <div className="w-full max-w-md">
        <div className="card p-8" style={{ borderRadius: '24px' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
              <KeyRound size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
              Nueva contraseña
            </h1>
            <p className="text-sm text-slate-500 mt-1">Elige una contraseña segura para tu cuenta.</p>
          </div>

          {exito ? (
            <div className="text-center py-4">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h2 className="font-bold text-lg mb-2" style={{ color: '#0B1D3A' }}>¡Contraseña actualizada!</h2>
              <p className="text-sm text-slate-500 mb-2">Redirigiendo al inicio de sesión...</p>
              <Link to="/login" className="btn-primary px-6 py-2.5 inline-block mt-3">
                Ir ahora
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nueva contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={verPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="input-field pr-10"
                    required
                    autoFocus
                  />
                  <button type="button" onClick={() => setVerPass(!verPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fortaleza && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${fortaleza.color} ${fortaleza.w}`} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Fortaleza: {fortaleza.label}</p>
                  </div>
                )}
              </div>

              {/* Confirmar */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type={verPass ? 'text' : 'password'}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="input-field"
                  required
                />
                {confirmar && password !== confirmar && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} /> Las contraseñas no coinciden
                  </p>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={cargando || password !== confirmar}
                className="w-full btn-primary py-3 font-semibold disabled:opacity-60"
              >
                {cargando ? 'Guardando...' : 'Establecer nueva contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
