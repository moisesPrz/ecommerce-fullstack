// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Save, Eye, EyeOff, Shield, ShoppingBag, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/Layout';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';

export default function ProfilePage() {
  useSEO({ title: 'Mi Perfil', url: '/perfil' });

  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [tab, setTab] = useState('perfil');
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({ nombre: usuario?.nombre || '', email: usuario?.email || '' });
  const [passForm, setPassForm] = useState({ passwordActual: '', passwordNuevo: '', passwordConfirm: '' });
  const [mostrarPass, setMostrarPass] = useState({ actual: false, nuevo: false, confirm: false });
  const [stats, setStats] = useState(null);

  // ── Direcciones ──
  const [direcciones, setDirecciones] = useState([]);
  const [mostrarFormDir, setMostrarFormDir] = useState(false);
  const [editandoDir, setEditandoDir] = useState(null);
  const [cargandoDir, setCargandoDir] = useState(false);
  const formDirVacio = { nombre_destinatario: '', direccion: '', ciudad: '', departamento: '', codigo_postal: '', telefono: '', is_principal: false };
  const [formDir, setFormDir] = useState(formDirVacio);

  useEffect(() => {
    if (!usuario) { navigate('/login'); return; }
    setForm({ nombre: usuario.nombre, email: usuario.email });
    cargarStats();
    cargarDirecciones();
  }, [usuario]);

  const cargarStats = async () => {
    try {
      const res = await api.get('/pedidos');
      const pedidos = Array.isArray(res.data) ? res.data : [];
      setStats({ totalPedidos: pedidos.length });
    } catch { setStats({ totalPedidos: 0 }); }
  };

  const cargarDirecciones = async () => {
    try {
      const res = await api.get('/direcciones');
      setDirecciones(res.data);
    } catch { setDirecciones([]); }
  };

  const handleGuardarDireccion = async (e) => {
    e.preventDefault();
    setCargandoDir(true);
    try {
      if (editandoDir) {
        await api.put(`/direcciones/${editandoDir}`, formDir);
        toast.exito('Dirección actualizada');
      } else {
        await api.post('/direcciones', formDir);
        toast.exito('Dirección agregada');
      }
      setFormDir(formDirVacio);
      setEditandoDir(null);
      setMostrarFormDir(false);
      cargarDirecciones();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar dirección');
    } finally {
      setCargandoDir(false);
    }
  };

  const handleEliminarDireccion = async (id) => {
    if (!window.confirm('¿Eliminar esta dirección?')) return;
    try {
      await api.delete(`/direcciones/${id}`);
      toast.exito('Dirección eliminada');
      cargarDirecciones();
    } catch { toast.error('Error al eliminar dirección'); }
  };

  const handleEstablecerPrincipal = async (id) => {
    try {
      await api.patch(`/direcciones/${id}/principal`);
      toast.exito('Dirección principal actualizada');
      cargarDirecciones();
    } catch { toast.error('Error al actualizar'); }
  };

  const handleEditarDireccion = (dir) => {
    setFormDir({
      nombre_destinatario: dir.nombre_destinatario,
      direccion: dir.direccion,
      ciudad: dir.ciudad,
      departamento: dir.departamento,
      codigo_postal: dir.codigo_postal || '',
      telefono: dir.telefono || '',
      is_principal: dir.is_principal,
    });
    setEditandoDir(dir.id);
    setMostrarFormDir(true);
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || form.nombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return;
    }
    setCargando(true);
    try {
      await api.put('/auth/perfil', { nombre: form.nombre.trim() });
      // Actualizar localStorage
      const usuarioActualizado = { ...usuario, nombre: form.nombre.trim() };
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
      window.dispatchEvent(new Event('storage'));
      toast.exito('Perfil actualizado correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (passForm.passwordNuevo.length < 8) {
      toast.error('La nueva contraseña debe tener mínimo 8 caracteres');
      return;
    }
    if (!/[A-Z]/.test(passForm.passwordNuevo)) {
      toast.error('La contraseña debe incluir al menos una mayúscula');
      return;
    }
    if (passForm.passwordNuevo !== passForm.passwordConfirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setCargando(true);
    try {
      await api.put('/auth/cambiar-password', {
        passwordActual: passForm.passwordActual,
        passwordNuevo: passForm.passwordNuevo,
      });
      setPassForm({ passwordActual: '', passwordNuevo: '', passwordConfirm: '' });
      toast.exito('Contraseña actualizada correctamente');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Contraseña actual incorrecta');
    } finally {
      setCargando(false);
    }
  };

  const rolColor = {
    administrador: 'bg-purple-100 text-purple-700',
    vendedor: 'bg-blue-100 text-blue-700',
    cliente: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold mb-1" style={{ color: '#C9A84C' }}>CUENTA</p>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
          Mi Perfil
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── SIDEBAR ── */}
        <div className="space-y-4">
          {/* Avatar + info */}
          <div className="card p-6 text-center" style={{ borderRadius: '20px' }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0B1D3A, #1E3A5F)' }}>
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-lg mb-1" style={{ color: '#0B1D3A' }}>{usuario?.nombre}</h2>
            <p className="text-sm text-slate-500 mb-3">{usuario?.email}</p>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${rolColor[usuario?.rol] || rolColor.cliente}`}>
              {usuario?.rol}
            </span>
          </div>

          {/* Stats */}
          <div className="card p-5" style={{ borderRadius: '20px' }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#0B1D3A' }}>Resumen</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <ShoppingBag size={15} /> Mis pedidos
                </div>
                <span className="font-bold text-sm" style={{ color: '#0B1D3A' }}>
                  {stats?.totalPedidos ?? '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Shield size={15} /> Rol
                </div>
                <span className="font-bold text-sm capitalize" style={{ color: '#0B1D3A' }}>{usuario?.rol}</span>
              </div>
            </div>
          </div>

          {/* Tabs navegación */}
          <div className="card overflow-hidden" style={{ borderRadius: '20px' }}>
            {[
              { id: 'perfil', label: 'Información personal', icon: User },
              { id: 'direcciones', label: 'Mis direcciones', icon: MapPin },
              { id: 'seguridad', label: 'Cambiar contraseña', icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all text-left ${
                  tab === id ? 'text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
                style={tab === id ? { background: '#0B1D3A' } : {}}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENIDO ── */}
        <div className="lg:col-span-2">

          {/* Editar perfil */}
          {tab === 'perfil' && (
            <div className="card p-6" style={{ borderRadius: '20px' }}>
              <h2 className="font-bold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                Información personal
              </h2>
              <p className="text-sm text-slate-500 mb-6">Actualiza tu nombre y datos de contacto.</p>

              <form onSubmit={handleGuardarPerfil} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={form.nombre}
                      onChange={e => setForm({ ...form, nombre: e.target.value })}
                      className="input-field pl-11" placeholder="Tu nombre" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={form.email} disabled
                      className="input-field pl-11 opacity-60 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">El correo no se puede cambiar por seguridad.</p>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={cargando}
                    className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-60">
                    {cargando ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Guardando...
                      </span>
                    ) : (
                      <><Save size={16} /> Guardar cambios</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mis Direcciones */}
          {tab === 'direcciones' && (
            <div className="card p-6" style={{ borderRadius: '20px' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                    Mis direcciones
                  </h2>
                  <p className="text-sm text-slate-500">Gestiona tus direcciones de envío.</p>
                </div>
                <button onClick={() => { setMostrarFormDir(!mostrarFormDir); setEditandoDir(null); setFormDir(formDirVacio); }}
                  className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
                  <Plus size={15} /> Nueva
                </button>
              </div>

              {/* Formulario */}
              {mostrarFormDir && (
                <form onSubmit={handleGuardarDireccion} className="mb-6 p-5 rounded-2xl space-y-4"
                  style={{ background: 'rgba(11,29,58,0.03)', border: '1px solid rgba(11,29,58,0.08)' }}>
                  <h3 className="font-semibold text-sm" style={{ color: '#0B1D3A' }}>
                    {editandoDir ? 'Editar dirección' : 'Nueva dirección'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input placeholder="Nombre del destinatario *" value={formDir.nombre_destinatario}
                      onChange={e => setFormDir({ ...formDir, nombre_destinatario: e.target.value })}
                      className="input-field sm:col-span-2" required />
                    <input placeholder="Dirección *" value={formDir.direccion}
                      onChange={e => setFormDir({ ...formDir, direccion: e.target.value })}
                      className="input-field sm:col-span-2" required />
                    <input placeholder="Ciudad *" value={formDir.ciudad}
                      onChange={e => setFormDir({ ...formDir, ciudad: e.target.value })}
                      className="input-field" required />
                    <input placeholder="Departamento *" value={formDir.departamento}
                      onChange={e => setFormDir({ ...formDir, departamento: e.target.value })}
                      className="input-field" required />
                    <input placeholder="Código postal" value={formDir.codigo_postal}
                      onChange={e => setFormDir({ ...formDir, codigo_postal: e.target.value })}
                      className="input-field" />
                    <input placeholder="Teléfono" value={formDir.telefono}
                      onChange={e => setFormDir({ ...formDir, telefono: e.target.value })}
                      className="input-field" />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={formDir.is_principal}
                      onChange={e => setFormDir({ ...formDir, is_principal: e.target.checked })}
                      className="rounded" />
                    Establecer como dirección principal
                  </label>
                  <div className="flex gap-3 pt-1">
                    <button type="submit" disabled={cargandoDir}
                      className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60">
                      {cargandoDir ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                      {editandoDir ? 'Actualizar' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => { setMostrarFormDir(false); setEditandoDir(null); setFormDir(formDirVacio); }}
                      className="px-6 py-2.5 text-sm text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista de direcciones */}
              {direcciones.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <MapPin size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No tienes direcciones guardadas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {direcciones.map(dir => (
                    <div key={dir.id} className="p-4 rounded-2xl border transition-all"
                      style={{ borderColor: dir.is_principal ? '#C9A84C' : '#DDE3EE', background: dir.is_principal ? 'rgba(201,168,76,0.04)' : 'white' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm" style={{ color: '#0B1D3A' }}>{dir.nombre_destinatario}</p>
                            {dir.is_principal && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: 'rgba(201,168,76,0.15)', color: '#C9A84C' }}>
                                Principal
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">{dir.direccion}</p>
                          <p className="text-xs text-slate-400">{dir.ciudad}, {dir.departamento}{dir.codigo_postal ? ` · ${dir.codigo_postal}` : ''}</p>
                          {dir.telefono && <p className="text-xs text-slate-400">{dir.telefono}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!dir.is_principal && (
                            <button onClick={() => handleEstablecerPrincipal(dir.id)} title="Establecer como principal"
                              className="p-2 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition-colors">
                              <Star size={15} />
                            </button>
                          )}
                          <button onClick={() => handleEditarDireccion(dir)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Save size={15} />
                          </button>
                          <button onClick={() => handleEliminarDireccion(dir.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cambiar contraseña */}
          {tab === 'seguridad' && (
            <div className="card p-6" style={{ borderRadius: '20px' }}>
              <h2 className="font-bold text-lg mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#0B1D3A' }}>
                Cambiar contraseña
              </h2>
              <p className="text-sm text-slate-500 mb-6">Usa una contraseña segura de al menos 8 caracteres.</p>

              <form onSubmit={handleCambiarPassword} className="space-y-5">
                {[
                  { key: 'passwordActual', label: 'Contraseña actual', showKey: 'actual', placeholder: '••••••••' },
                  { key: 'passwordNuevo', label: 'Nueva contraseña', showKey: 'nuevo', placeholder: 'Mínimo 8 caracteres' },
                  { key: 'passwordConfirm', label: 'Confirmar nueva contraseña', showKey: 'confirm', placeholder: 'Repite la contraseña' },
                ].map(({ key, label, showKey, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#0B1D3A' }}>{label}</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={mostrarPass[showKey] ? 'text' : 'password'}
                        value={passForm[key]}
                        onChange={e => setPassForm({ ...passForm, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="input-field pl-11 pr-12" required />
                      <button type="button"
                        onClick={() => setMostrarPass({ ...mostrarPass, [showKey]: !mostrarPass[showKey] })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {mostrarPass[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-4 rounded-xl text-sm" style={{ background: 'rgba(11,29,58,0.04)', border: '1px solid rgba(11,29,58,0.08)' }}>
                  <p className="font-semibold mb-2" style={{ color: '#0B1D3A' }}>Requisitos:</p>
                  <ul className="space-y-1 text-slate-500 text-xs">
                    <li className={passForm.passwordNuevo.length >= 8 ? 'text-green-600' : ''}>
                      {passForm.passwordNuevo.length >= 8 ? '✅' : '○'} Mínimo 8 caracteres
                    </li>
                    <li className={/[A-Z]/.test(passForm.passwordNuevo) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(passForm.passwordNuevo) ? '✅' : '○'} Al menos una mayúscula
                    </li>
                    <li className={/[0-9]/.test(passForm.passwordNuevo) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(passForm.passwordNuevo) ? '✅' : '○'} Al menos un número
                    </li>
                    <li className={passForm.passwordNuevo && passForm.passwordNuevo === passForm.passwordConfirm ? 'text-green-600' : ''}>
                      {passForm.passwordNuevo && passForm.passwordNuevo === passForm.passwordConfirm ? '✅' : '○'} Las contraseñas coinciden
                    </li>
                  </ul>
                </div>

                <button type="submit" disabled={cargando}
                  className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-60">
                  {cargando ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Actualizando...
                    </span>
                  ) : (
                    <><Lock size={16} /> Actualizar contraseña</>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
