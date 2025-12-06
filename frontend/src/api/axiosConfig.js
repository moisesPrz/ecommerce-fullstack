import axios from 'axios';

// Creamos una instancia de Axios con la URL base de tu Backend
const api = axios.create({
    baseURL: 'http://localhost:3001/api', // La URL de tu servidor Node.js
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Antes de cada petición, inyectamos el Token si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        // Estándar Bearer Token para la seguridad
        config.headers.Authorization = `Bearer ${token}`; 
    }
    return config;
});

export default api;
