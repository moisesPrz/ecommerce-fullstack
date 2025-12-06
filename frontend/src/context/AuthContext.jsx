import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar si hay sesión guardada al cargar la página
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('usuario');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    // Función de Login
    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            
            // Verificamos que la respuesta tenga data
            if (res.data) {
                const { token, usuario } = res.data;
                // Guardar en localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('usuario', JSON.stringify(usuario));
                setUser(usuario);
                return { success: true };
            }
            return { success: false, error: 'Respuesta inesperada del servidor' };
            
        } catch (error) {
            console.error("Error en login:", error.response?.data);
            return { 
                success: false, 
                error: error.response?.data?.error || 'Error al iniciar sesión' 
            };
        }
    };

    // Función de Logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};