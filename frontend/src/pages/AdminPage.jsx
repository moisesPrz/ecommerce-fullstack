// src/pages/AdminPage.jsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Save, Package, List, Upload } from 'lucide-react'; // Icono Upload nuevo

const AdminPage = ({ productos, onAgregar, onEliminar, onEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1
  });
  // Estado separado para el archivo de imagen
  const [archivoImagen, setArchivoImagen] = useState(null);
  
  const [modoEdicion, setModoEdicion] = useState(null);

  const categorias = [
    { id: 1, nombre: 'Tecnología' }, { id: 2, nombre: 'Audio' }, 
    { id: 3, nombre: 'Periféricos' }, { id: 4, nombre: 'Mobiliario' }
  ];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    setArchivoImagen(e.target.files[0]); // Guardamos el archivo real
  };

  const cargarDatosEdicion = (producto) => {
    setModoEdicion(producto.id);
    setFormData({
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock,
      descripcion: producto.descripcion || '',
      id_categoria: producto.id_categoria || 1
    });
    setArchivoImagen(null); // Resetear archivo al editar
  };

  const cancelarEdicion = () => {
    setModoEdicion(null);
    setFormData({ nombre: '', precio: '', stock: '', descripcion: '', id_categoria: 1 });
    setArchivoImagen(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.precio) return alert("Nombre y Precio obligatorios");

    // --- TRUCO: USAR FORM DATA PARA ENVIAR ARCHIVOS ---
    const datosEnvio = new FormData();
    datosEnvio.append('nombre', formData.nombre);
    datosEnvio.append('precio', formData.precio);
    datosEnvio.append('stock', formData.stock);
    datosEnvio.append('descripcion', formData.descripcion);
    datosEnvio.append('id_categoria', formData.id_categoria);
    
    // Solo agregamos la imagen si el usuario seleccionó una nueva
    if (archivoImagen) {
        datosEnvio.append('imagen', archivoImagen); 
    }
    // ------------------------------------------------

    if (modoEdicion) {
      onEditar(modoEdicion, datosEnvio);
    } else {
      onAgregar(datosEnvio);
    }
    cancelarEdicion();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-900 p-3 rounded-lg"><Package className="text-white"/></div>
        <div><h2 className="text-3xl font-bold text-slate-800">Panel de Administración</h2></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow border sticky top-24">
            <h3 className="font-bold mb-4">{modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} className="w-full p-2 border rounded" />
              
              {/* SELECTOR CATEGORÍA */}
              <select name="id_categoria" value={formData.id_categoria} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={handleChange} className="w-full p-2 border rounded" />
                <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} className="w-full p-2 border rounded" />
              </div>

              {/* INPUT DE ARCHIVO (NUEVO) */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                <div className="flex flex-col items-center gap-1 text-slate-500">
                    <Upload className="h-6 w-6"/>
                    <span className="text-xs font-bold">{archivoImagen ? archivoImagen.name : 'Subir Imagen'}</span>
                </div>
              </div>

              <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange} rows="2" className="w-full p-2 border rounded"></textarea>
              
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded font-bold">
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
                {modoEdicion && <button type="button" onClick={cancelarEdicion} className="bg-gray-200 p-2 rounded"><X/></button>}
              </div>
            </form>
          </div>
        </div>

        {/* Tabla (Sigue igual) */}
        <div className="lg:col-span-2">
           {/* ... (Aquí va la misma tabla de antes, no cambia nada visualmente) ... */}
           {/* Solo asegúrate de que al mostrar la tabla uses <img src={p.imagen_url} /> */}
           <table className="w-full bg-white text-left border rounded-xl overflow-hidden shadow">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-600">
              <tr><th className="p-4">Img</th><th className="p-4">Producto</th><th className="p-4">Precio</th><th className="p-4">Acciones</th></tr>
            </thead>
            <tbody className="divide-y">
              {productos.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4"><img src={p.imagen_url} alt="" className="h-10 w-10 object-cover rounded bg-gray-100"/></td>
                  <td className="p-4 font-medium">{p.nombre}</td>
                  <td className="p-4">${Number(p.precio).toFixed(2)}</td>
                  <td className="p-4 flex gap-2">
                    <button onClick={() => cargarDatosEdicion(p)} className="text-blue-600 p-2"><Edit size={16}/></button>
                    <button onClick={() => onEliminar(p.id)} className="text-red-500 p-2"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;