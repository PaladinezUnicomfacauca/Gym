import React, { useEffect, useState } from 'react';
import { managerService } from '../services/managerService';
import { roleService } from '../services/roleService';
import {
  sanitizePersonNameInput,
  sanitizePhoneDigits,
  validatePersonNameForSubmit,
  validatePhone10
} from '../utils/personFields';
import { MdEdit } from "react-icons/md";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';

export default function ManagerProfile() {
  const navigate = useNavigate();
  // Obtener manager logueado desde localStorage
  const managerData = JSON.parse(localStorage.getItem('managerData'));
  const id = managerData?.id_manager;
  const [manager, setManager] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name_manager: '',
    phone: '',
    email: '',
    id_role: ''
  });
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Al montar (o si cambia el id): carga el administrador desde el servidor y rellena el formulario.
  useEffect(() => {
    if (!id) {
      setError('No hay sesión activa.');
      setLoading(false);
      return;
    }
    // Pide los datos del manager logueado y actualiza estado local.
    const fetchManager = async () => {
      try {
        setLoading(true);
        const [data, rolesList] = await Promise.all([
          managerService.getById(id),
          roleService.getAll().catch(() => [])
        ]);
        setManager(data);
        setRoles(Array.isArray(rolesList) ? rolesList : []);
        setFormData({
          name_manager: data.name_manager || '',
          phone: data.phone || '',
          email: data.email || '',
          id_role: data.id_role != null ? String(data.id_role) : ''
        });
      } catch (err) {
        setError('Error al cargar los datos del administrador');
      } finally {
        setLoading(false);
      }
    };
    fetchManager();
  }, [id]);

  // Activa el modo edición y sincroniza el formulario con los datos guardados.
  const handleStartEditing = () => {
    setUpdateError('');
    setFormData({
      name_manager: manager.name_manager || '',
      phone: manager.phone || '',
      email: manager.email || '',
      id_role: manager.id_role != null ? String(manager.id_role) : ''
    });
    setIsEditing(true);
  };

  // Actualiza nombre, teléfono, email o rol mientras el usuario escribe.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'name_manager') {
      next = sanitizePersonNameInput(value);
    } else if (name === 'phone') {
      next = sanitizePhoneDigits(value);
    }
    setFormData(prev => ({ ...prev, [name]: next }));
    setUpdateError('');
  };

  // Sale del modo edición, restaura el formulario y limpia los campos de contraseña.
  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name_manager: manager.name_manager || '',
      phone: manager.phone || '',
      email: manager.email || '',
      id_role: manager.id_role != null ? String(manager.id_role) : ''
    });
    setShowPasswordFields(false);
    setPasswordData({ current: '', new: '', confirm: '' });
    setUpdateError('');
  };

  // Guarda los cambios en el servidor (y opcionalmente la contraseña) y refresca el perfil.
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setUpdateError('');
      const nameErr = validatePersonNameForSubmit(formData.name_manager);
      if (nameErr) {
        setUpdateError(nameErr);
        setLoading(false);
        return;
      }
      const phoneErr = validatePhone10(formData.phone);
      if (phoneErr) {
        setUpdateError(phoneErr);
        setLoading(false);
        return;
      }
      if (!formData.id_role || Number.isNaN(Number(formData.id_role))) {
        setUpdateError('Selecciona un rol válido');
        setLoading(false);
        return;
      }
      let updateData = {
        name_manager: formData.name_manager.trim(),
        phone: formData.phone,
        email: formData.email,
        id_role: Number(formData.id_role)
      };
      // Si los campos de contraseña están llenos y válidos, incluir password
      if (showPasswordFields && passwordData.new && passwordData.confirm) {
        if (passwordData.new !== passwordData.confirm) {
          setPasswordError('La nueva contraseña y la confirmación no coinciden');
          setLoading(false);
          return;
        }
        if (!passwordData.current) {
          setPasswordError('La contraseña actual es obligatoria');
          setLoading(false);
          return;
        }
        updateData.password = passwordData.new;
        updateData.currentPassword = passwordData.current;
      }
      await managerService.update(id, updateData);
      const updated = await managerService.getById(id);
      setManager(updated);
      const roleName =
        roles.find((r) => Number(r.id_role) === Number(updated.id_role))?.name_role;
      try {
        const stored = JSON.parse(localStorage.getItem('managerData') || '{}');
        if (stored && stored.id_manager === updated.id_manager) {
          localStorage.setItem(
            'managerData',
            JSON.stringify({
              ...stored,
              id_role: updated.id_role,
              ...(roleName ? { name_role: roleName } : {})
            })
          );
        }
      } catch {
        /* ignore */
      }
      setIsEditing(false);
      setShowPasswordFields(false);
      setPasswordData({ current: '', new: '', confirm: '' });
      setPasswordError('');
      setPasswordSuccess('');
      setUpdateError('');
      alert('Perfil actualizado exitosamente');
    } catch (err) {
      const backendError = err?.response?.data?.error || '';
      if (
        backendError === 'La contraseña actual es incorrecta' ||
        backendError === 'La contraseña actual es obligatoria para cambiar la contraseña'
      ) {
        setPasswordError(backendError);
      } else if (backendError === 'La nueva contraseña y la confirmación no coinciden') {
        setPasswordError(backendError);
      } else {
        setUpdateError(backendError || 'Error al actualizar el perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  // Actualiza los inputs de contraseña y borra mensajes de error/éxito previos.
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  // Pantalla de espera mientras se cargan los datos.
  if (loading) {
    return (
      <div className="container mx-auto px-8 py-10">
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  // Error global (sesión, carga o actualización fallida).
  if (error) {
    return (
      <div className="container mx-auto px-8 py-10">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  // No hay registro de administrador tras la petición.
  if (!manager) {
    return (
      <div className="container mx-auto px-8 py-10">
        <div className="text-center">Administrador no encontrado</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Perfil del Administrador</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <FiChevronLeft className="text-xl" />
              Volver
            </span>
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name_manager"
                  value={formData.name_manager}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                  maxLength={40}
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{manager.name_manager}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                  placeholder="10 dígitos"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{manager.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo electrónico</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{manager.email}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              {isEditing ? (
                <select
                  name="id_role"
                  value={formData.id_role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100 bg-white"
                  required
                >
                  <option value="">Selecciona un rol</option>
                  {roles.map((r) => (
                    <option key={r.id_role} value={String(r.id_role)}>
                      {r.name_role}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {roles.find((r) => Number(r.id_role) === Number(manager.id_role))?.name_role ??
                    (manager.id_role != null ? `Rol #${manager.id_role}` : '—')}
                </div>
              )}
            </div>
            {/* Cambiar contraseña */}
            {isEditing && (
              <div className="mt-4 flex flex-col gap-4">
                <p
                  className="text-blue-700 font-semibold cursor-pointer hover:underline w-fit"
                  onClick={() => {
                    setShowPasswordFields(v => !v);
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                >
                  Cambiar contraseña
                </p>
                {showPasswordFields && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña actual</label>
                      <input
                        type="password"
                        name="current"
                        value={passwordData.current}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                        autoComplete="current-password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña nueva</label>
                      <input
                        type="password"
                        name="new"
                        value={passwordData.new}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                        autoComplete="new-password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar contraseña</label>
                      <input
                        type="password"
                        name="confirm"
                        value={passwordData.confirm}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                        autoComplete="new-password"
                      />
                    </div>
                    {passwordError && <p className="text-red-600 text-sm font-medium mt-1">{passwordError}</p>}
                    {passwordSuccess && <div className="text-green-600 text-sm font-medium">{passwordSuccess}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
          {isEditing && updateError && (
            <p className="text-red-600 text-sm font-medium mt-2">{updateError}</p>
          )}
          {/* Botones de acción */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            {!isEditing ? (
              <button
                onClick={handleStartEditing}
                className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
              >
                Editar perfil
                <MdEdit />
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
