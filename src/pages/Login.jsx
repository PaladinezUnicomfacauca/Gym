import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../services/managerService';
import { FaCaretDown } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    name_manager: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Carga los administradores al iniciar para llenar el select.
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const data = await managerService.getLoginList();
        setManagers(data);
      } catch (err) {
        setError('Error al cargar administradores');
      }
    };
    fetchManagers();
  }, []);

  // Actualiza formData cuando cambia un campo del formulario.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Envía el login, maneja errores y redirige si es correcto.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await managerService.login({
        name_manager: formData.name_manager,
        password: formData.password
      });
      navigate('/membresias');
    } catch (err) {
      setError(err.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex-1 flex items-center justify-center p-4 min-h-0'>
      <div className='bg-white p-6 md:p-8 rounded-2xl border border-gray-300 w-full max-w-md'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-black'>Iniciar sesión</h2>
        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='block text-gray-500 text-sm mb-2' htmlFor='name_manager'>Administrador</label>
            <div className="relative">
              <select
                id='name_manager'
                name='name_manager'
                value={formData.name_manager}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer'
                required
              >
                <option value='' className='text-gray-500'>Seleccione el administrador</option>
                {managers.map(manager => (
                  <option key={manager.id_manager} value={manager.name_manager}>
                    {manager.name_manager}
                  </option>
                ))}
              </select>
              <FaCaretDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>
          <div>
            <label className='block text-gray-500 text-sm mb-2' htmlFor='password'>Contraseña</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 ${formData.password ? 'pr-10' : ''}`}
                required
              />
              {formData.password && (
                <button
                  type='button'
                  onClick={() => setShowPassword(prev => !prev)}
                  className='absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 cursor-pointer'
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold cursor-pointer'
          >
            {loading ? 'Procesando...' : 'Aceptar'}
          </button>
        </form>
      </div>
    </div>
  );
}