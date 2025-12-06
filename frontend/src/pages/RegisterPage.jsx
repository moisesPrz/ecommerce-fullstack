import React, { useState } from 'react';
import api from '../config/api'; // Importamos la configuración
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

const RegisterPage = ({ onRegistro, alIrALogin }) => {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // Usamos api.post sin poner toda la URL
      const res = await api.post('/auth/register', formData);
      const { token, usuario } = res.data;

      alert("¡Cuenta creada con éxito! Bienvenido.");
      onRegistro(usuario, token);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al registrarse.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-slate-900 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Crear Cuenta</h2>
          <p className="text-slate-500">Únete para empezar a comprar</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm"><AlertCircle className="h-5 w-5" /><span>{error}</span></div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nombre</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="text" name="nombre" required className="w-full pl-10 pr-4 py-3 border rounded-lg" placeholder="Juan Pérez" value={formData.nombre} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 border rounded-lg" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="password" name="password" required className="w-full pl-10 pr-4 py-3 border rounded-lg" placeholder="Mín. 8 caracteres..." value={formData.password} onChange={handleChange} />
            </div>
            <p className="text-xs text-slate-400 mt-1">Requiere: 8 carácteres, mayúscula, número y símbolo.</p>
          </div>
          <button type="submit" disabled={cargando} className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50">
            {cargando ? 'Creando...' : 'Registrarse'}
          </button>
        </form>
        <p className="mt-6 text-center text-slate-600">¿Ya tienes cuenta? <button onClick={alIrALogin} className="text-blue-600 font-bold hover:underline">Inicia Sesión</button></p>
      </div>
    </div>
  );
};

export default RegisterPage;