import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { planService } from '../services/planService';
import { paymentMethodService } from '../services/paymentMethodService';
import { FaCaretDown } from "react-icons/fa";

export default function RegisterUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name_user: '',
    phone: '',
    id_plan: '',
    id_method: '',
    receipt_number: '',
    registration_date: '',  // Nueva fecha de inscripción
    last_payment_date: ''   // Nueva fecha de último pago
  });
  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [manager, setManager] = useState(null);

  // Al montar: carga planes y métodos de pago, y el administrador de sesión desde localStorage.
  useEffect(() => {
    // Pide planes y métodos en paralelo y actualiza el estado.
    const fetchData = async () => {
      try {
        const [plansData, methodsData] = await Promise.all([
          planService.getAll(),
          paymentMethodService.getAll()
        ]);
        setPlans(plansData);
        setPaymentMethods(methodsData);
      } catch (err) {
        setError('Error al cargar los datos');
      }
    };
    fetchData();
    const managerData = localStorage.getItem('managerData');
    if (managerData) {
      setManager(JSON.parse(managerData));
    }
  }, []);

  // Si cambia el plan elegido o la lista de planes, actualiza el plan seleccionado (detalle en pantalla).
  useEffect(() => {
    if (formData.id_plan) {
      const plan = plans.find(p => p.id_plan === parseInt(formData.id_plan));
      setSelectedPlan(plan);
    } else {
      setSelectedPlan(null);
    }
  }, [formData.id_plan, plans]);

  // Actualiza los campos del formulario mientras el usuario escribe.
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Crea usuario con membresía (incluye el administrador logueado) y navega a la lista de membresías.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await userService.createUserWithMembership({
        ...formData,
        id_manager: manager?.id_manager 
      });
      navigate('/membresias');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al crear la inscripción';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-4'>
      <div className='bg-white p-8 rounded-2xl border-1 border-gray-300 w-full max-w-md'>
        <h2 className='text-2xl font-semibold text-center mb-6 text-black'>Inscripción de Usuario</h2>
        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded'>
            {error}
          </div>
        )}
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='name_user'>
              Nombre
            </label>
            <input
              type='text'
              id='name_user'
              name='name_user'
              value={formData.name_user}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
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
            />
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='id_plan'>
              Plan de días
            </label>
            <div className="relative">
              <select
                id='id_plan'
                name='id_plan'
                value={formData.id_plan}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer'
                required
              >
                <option value='' className='text-gray-500'>Seleccione el plan de días</option>
                {plans.map(plan => (
                  <option key={plan.id_plan} value={plan.id_plan}>
                    {plan.days_duration} {plan.days_duration === 1 ? 'día' : 'días'} - {plan.plan_description}
                  </option>
                ))}
              </select>
              <FaCaretDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='id_method'>
              Método de pago
            </label>
            <div className="relative">
              <select
                id='id_method'
                name='id_method'
                value={formData.id_method}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer'
                required
              >
                <option value='' className='text-gray-500'>Seleccione el método de pago</option>
                {paymentMethods.map(method => (
                  <option key={method.id_method} value={method.id_method}>
                    {method.name_method}
                  </option>
                ))}
              </select>
              <FaCaretDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            </div>
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='receipt_number'>
              Número de Recibo
            </label>
            <input
              type='text'
              id='receipt_number'
              name='receipt_number'
              value={formData.receipt_number}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
              required
            />
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='registration_date'>
              Fecha de Inscripción
            </label>
            <input
              type='date'
              id='registration_date'
              name='registration_date'
              value={formData.registration_date}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
            />
            <p className='text-xs text-gray-500 mt-1'>Dejar vacío para usar fecha actual</p>
          </div>

          <div>
            <label className='block font-medium text-gray-700 text-sm mb-2' htmlFor='last_payment_date'>
              Fecha de Último Pago
            </label>
            <input
              type='date'
              id='last_payment_date'
              name='last_payment_date'
              value={formData.last_payment_date}
              onChange={handleInputChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100'
            />
            <p className='text-xs text-gray-500 mt-1'>Dejar vacío para usar fecha actual</p>
          </div>

          {selectedPlan && (
            <div>
              <label className='block font-medium text-gray-700 text-sm mb-2'>
                Total a pagar
              </label>
              <p className='w-full text-lg font-semibold text-blue-600'>
                ${selectedPlan.price.toLocaleString('es-CO')}
              </p>
            </div>
          )}

          <div className='flex gap-4 mt-6'>
            <button
              type='button'
              onClick={() => navigate('/membresias')}
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
  )
}
