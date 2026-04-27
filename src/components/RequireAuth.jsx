import { Navigate } from 'react-router-dom';

// Protege rutas: solo deja pasar si hay sesión de manager; si no, redirige al inicio sin dejar entrada en el historial.
export default function RequireAuth({ children, allowedRoles }) {
    const token = localStorage.getItem('managerToken');
    if (!token) {
      return <Navigate to='/' replace />;
    }

    if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
      let role = '';
      let roleId = null;

      try {
        const managerData = JSON.parse(localStorage.getItem('managerData'));
        role = String(
          managerData?.name_role ||
          managerData?.role ||
          managerData?.rol ||
          ''
        ).trim().toLowerCase();
        roleId = managerData?.id_role;
      } catch (e) {}

      const allowedNormalized = allowedRoles.map((allowedRole) =>
        String(allowedRole).trim().toLowerCase()
      );

      // Soporta validación por nombre del rol y por id_role=1 cuando "superusuario" está permitido.
      const hasRoleAccess =
        (role && allowedNormalized.includes(role)) ||
        (allowedNormalized.includes('superusuario') && Number(roleId) === 1);

      if (!hasRoleAccess) {
        return <Navigate to='/membresias' replace />;
      }
    }

    return children;
}
