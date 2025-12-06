import React, { useState } from 'react';
import api from '../config/api'; // Importamos la configuración
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLogin, alIrARegistro }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const respuesta = await api.post('/auth/login', formData);
      const { token, usuario } = respuesta.data;
      onLogin(usuario, token);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <LogIn className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Bienvenido</h2>
          <p className="text-slate-500">Ingresa a tu cuenta para comprar</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="email" name="email" required className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none" placeholder="correo@ejemplo.com" value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input type="password" name="password" required className="w-full pl-10 pr-4 py-3 border rounded-lg outline-none" placeholder="••••••••" value={formData.password} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition active:scale-95">Iniciar Sesión</button>
        </form>
        <p className="mt-6 text-center text-slate-600">¿No tienes cuenta? <button onClick={alIrARegistro} className="text-blue-600 font-bold hover:underline">Regístrate aquí</button></p>
      </div>
    </div>
  );
};

export default LoginPage;