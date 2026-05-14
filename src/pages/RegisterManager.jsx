import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../services/managerService';
import { roleService } from '../services/roleService';
import {
  sanitizePersonNameInput,
  sanitizePhoneDigits,
  validatePersonNameForSubmit,
  validatePhone10
} from '../utils/personFields';

export default function RegisterManager() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    name_manager: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    id_role: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await roleService.getAll();
        if (!cancelled) {
          setRoles(Array.isArray(list) ? list : []);
        }
      } catch {
        if (!cancelled) {
          setError('No se pudieron cargar los roles');
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Actualiza nombre, teléfono, email, rol o contraseñas mientras el usuario escribe.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'name_manager') {
      next = sanitizePersonNameInput(value);
    } else if (name === 'phone') {
      next = sanitizePhoneDigits(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: next
    }));
  };

  const validateForm = () => {
    const nameErr = validatePersonNameForSubmit(formData.name_manager);
    if (nameErr) {
      setError(nameErr);
      return false;
    }
    const phoneErr = validatePhone10(formData.phone);
    if (phoneErr) {
      setError(phoneErr);
      return false;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Formato de email inválido');
      return false;
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.id_role === '' || formData.id_role === null || Number.isNaN(Number(formData.id_role))) {
      setError('Selecciona un rol');
      return false;
    }

    return true;
  };

  // Valida el formulario, crea el administrador en el servidor y navega a la lista.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Crear objeto con los datos del manager (sin confirmPassword)
      const managerData = {
        name_manager: formData.name_manager.trim(),
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        id_role: Number(formData.id_role)
      };

      await managerService.create(managerData);
      navigate('/administradores');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el administrador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='bg-white p-8 rounded-2xl border-1 border-gray-300 w-full max-w-md'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-black'>
          Agregar administrador
        </h2>

        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}

        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='name_manager'>
              Nombre
            </label>
            <input
              type='text'
              id='name_manager'
              name='name_manager'
              value={formData.name_manager}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
              maxLength={40}
            />
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='phone'>
              Teléfono
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              value={formData.phone}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
              maxLength={10}
              inputMode='numeric'
              autoComplete='tel'
            />
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='email'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
              maxLength={50}
            />
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='id_role'>
              Rol
            </label>
            <select
              id='id_role'
              name='id_role'
              value={formData.id_role}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 bg-white'
              required
            >
              <option value=''>Selecciona un rol</option>
              {roles.map((r) => (
                <option key={r.id_role} value={r.id_role}>
                  {r.name_role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='password'>
              Contraseña
            </label>
            <input
              type='password'
              id='password'
              name='password'
              value={formData.password}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
              minLength={6}
            />
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='confirmPassword'>
              Confirmar Contraseña
            </label>
            <input
              type='password'
              id='confirmPassword'
              name='confirmPassword'
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
              minLength={6}
            />
          </div>

          <div className='flex gap-4 mt-8'>
            <button
              type='button'
              onClick={() => navigate('/administradores')}
              className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors cursor-pointer'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer'
            >
              {loading ? 'Procesando...' : 'Aceptar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
