import axios from 'axios';

// Detecta si estamos en producción (internet) o desarrollo (localhost)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;