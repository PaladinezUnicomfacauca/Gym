import { Navigate } from 'react-router-dom';

// Protege rutas: solo deja pasar si hay sesión de manager; si no, redirige al inicio sin dejar entrada en el historial.
export default function RequireAuth({ children }) {
    const token = localStorage.getItem('managerToken');
    if (!token) {
      return <Navigate to='/' replace />;
    }
    return children;
}
