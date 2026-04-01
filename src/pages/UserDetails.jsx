import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { planService } from '../services/planService';
import { paymentMethodService } from '../services/paymentMethodService';
import { MdEdit, MdDelete } from "react-icons/md";
import { FiChevronLeft } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";

const UserDetails = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [plans, setPlans] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [managers, setManagers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name_user: '',
        phone: '',
        id_plan: '',
        id_method: '',
        id_manager: '',
        receipt_number: '',
        registration_date: '',  // Nueva fecha de inscripción
        last_payment_date: ''   // Nueva fecha de último pago
    });

    // Administrador en sesión (desde localStorage).
    const managerData = JSON.parse(localStorage.getItem('managerData'));
    const loggedManagerId = managerData?.id_manager;
    const loggedManagerName = managerData?.name_manager;

    // Al montar o si cambia el usuario: carga datos, planes y métodos; rellena el formulario.
    useEffect(() => {
        // Pide usuario, membresías, planes y métodos en paralelo y arma el estado inicial.
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [userData, membershipsData, plansData, methodsData] = await Promise.all([
                    userService.getById(userId),
                    userService.getMembershipsByUser(userId),
                    planService.getAll(),
                    paymentMethodService.getAll()
                ]);
                
                setUser(userData);
                setMemberships(membershipsData);
                setPlans(plansData);
                setPaymentMethods(methodsData);

                // Membresía más reciente para enlazar plan y método al formulario.
                const latestMembership = membershipsData.length > 0 ? membershipsData[0] : null;
                
                // Plan y método que coinciden con esa membresía (por duración y nombre).
                const matchingPlan = plansData.find(plan => plan.days_duration === latestMembership?.days_duration);
                const matchingMethod = methodsData.find(method => method.name_method === latestMembership?.name_method);
                
                setFormData({
                    name_user: userData.name_user || '',
                    phone: userData.phone || '',
                    id_plan: matchingPlan ? matchingPlan.id_plan.toString() : '',
                    id_method: matchingMethod ? matchingMethod.id_method.toString() : '',
                    id_manager: latestMembership?.id_manager?.toString() || '',
                    receipt_number: latestMembership?.receipt_number || '',
                    registration_date: userData.created_at || '',
                    last_payment_date: latestMembership?.last_payment || ''
                });
            } catch (err) {
                setError('Error al cargar los datos del usuario');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);



    // Activa el modo edición y sincroniza el formulario con usuario y última membresía.
    const handleStartEditing = () => {
        const latestMembership = memberships.length > 0 ? memberships[0] : null;
        
        const matchingPlan = plans.find(plan => plan.days_duration === latestMembership?.days_duration);
        const matchingMethod = paymentMethods.find(method => method.name_method === latestMembership?.name_method);
        
        // IDs como string para que coincidan con los valores de los <select>.
        const formDataToSet = {
            name_user: user.name_user || '',
            phone: user.phone || '',
            id_plan: matchingPlan ? matchingPlan.id_plan.toString() : '',
            id_method: matchingMethod ? matchingMethod.id_method.toString() : '',
            id_manager: latestMembership?.id_manager?.toString() || '',
            receipt_number: latestMembership?.receipt_number || '',
            registration_date: user.created_at || '',
            last_payment_date: latestMembership?.last_payment || ''
        };
        
        setFormData(formDataToSet);
        setIsEditing(true);
    };

    // Actualiza los campos del formulario mientras el usuario escribe.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Cancela la edición y restaura el formulario a los valores guardados.
    const handleCancel = () => {
        setIsEditing(false);
        const latestMembership = memberships.length > 0 ? memberships[0] : null;
        
        const matchingPlan = plans.find(plan => plan.days_duration === latestMembership?.days_duration);
        const matchingMethod = paymentMethods.find(method => method.name_method === latestMembership?.name_method);
        
        setFormData({
            name_user: user.name_user || '',
            phone: user.phone || '',
            id_plan: matchingPlan ? matchingPlan.id_plan.toString() : '',
            id_method: matchingMethod ? matchingMethod.id_method.toString() : '',
            id_manager: latestMembership?.id_manager?.toString() || '',
            receipt_number: latestMembership?.receipt_number || ''
        });
    };

    // Envía los cambios al servidor y vuelve a cargar usuario y membresías.
    const handleUpdate = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!formData.receipt_number.trim()) {
                setError('El número de recibo es requerido');
                setLoading(false);
                return;
            }
            
            const updateData = {
                name_user: formData.name_user,
                phone: formData.phone,
                id_plan: formData.id_plan,
                id_method: formData.id_method,
                receipt_number: formData.receipt_number,
                id_manager: loggedManagerId,
                registration_date: formData.registration_date || null,
                last_payment_date: formData.last_payment_date || null
            };
            
            await userService.updateUserWithMembership(userId, updateData);
            
            const [userData, membershipsData] = await Promise.all([
                userService.getById(userId),
                userService.getMembershipsByUser(userId)
            ]);
            setUser(userData);
            setMemberships(membershipsData);
            setIsEditing(false);
            alert('Usuario actualizado exitosamente');
        } catch (err) {
            console.error('=== Detalle del error ===');
            console.error('Objeto de error:', err);
            console.error('Respuesta:', err.response);
            console.error('Datos de la respuesta:', err.response?.data);
            console.error('Mensaje:', err.message);
            console.error('Estado HTTP:', err.response?.status);
            
            const errorMessage = err.response?.data?.error || 'Error al actualizar el usuario';
            setError(errorMessage);
            console.error('Error del backend:', err.response?.data || err);
        } finally {
            setLoading(false);
        }
    };

    // Pide confirmación, elimina el usuario en el servidor y va a la lista de membresías.
    const handleDelete = async () => {
        const confirmMessage = '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.';
        
        if (window.confirm(confirmMessage)) {
            try {
                setLoading(true);
                setError(null);
                
                await userService.delete(userId);
                
                navigate('/membresias');
            } catch (err) {
                console.error('Error al eliminar usuario:', err);
                const errorMessage = err.response?.data?.error || 'Error al eliminar el usuario';
                setError(errorMessage);
                setLoading(false);
            }
        }
    };

    // Pantalla de espera mientras se cargan los datos.
    if (loading) {
        return (
            <div className="container mx-auto px-8 py-10">
                <div className="text-center">Cargando...</div>
            </div>
        );
    }

    // Error global (carga o actualización fallida).
    if (error) {
        return (
            <div className="container mx-auto px-8 py-10">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        );
    }

    // No hay usuario tras la petición.
    if (!user) {
        return (
            <div className="container mx-auto px-8 py-10">
                <div className="text-center">Usuario no encontrado</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-8 py-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Datos del Usuario</h1>
                    <button
                        onClick={() => navigate('/membresias')}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
                    >
                        <span className="flex items-center gap-1">
                            <FiChevronLeft className="text-xl" />
                            Volver
                        </span>
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="name_user"
                                    value={formData.name_user}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-md">
                                    {user.name_user}
                                </div>
                            )}
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teléfono
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                                    placeholder="10 dígitos"
                                />
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-md">
                                    {user.phone}
                                </div>
                            )}
                        </div>
                        
                        {/* Plan */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Plan
                            </label>
                            {isEditing ? (
                                <div className="relative">
                                    <select
                                        name="id_plan"
                                        value={formData.id_plan || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer"
                                    >
                                        {plans.map(plan => (
                                            <option key={plan.id_plan} value={plan.id_plan.toString()}>
                                                {plan.days_duration} {plan.days_duration === 1 ? 'día' : 'días'}
                                            </option>
                                        ))}
                                    </select>
                                    <FaCaretDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                </div>
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-md">
                                    {memberships.length > 0 ? (
                                        `${memberships[0].days_duration} ${memberships[0].days_duration === 1 ? 'día' : 'días'}`
                                    ) : (
                                        'Sin membresías'
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Método de Pago */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Método de Pago
                            </label>
                            {isEditing ? (
                                <div className="relative">
                                    <select
                                        name="id_method"
                                        value={formData.id_method || ''}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer"
                                    >
                                        {paymentMethods.map(method => (
                                            <option key={method.id_method} value={method.id_method.toString()}>
                                                {method.name_method}
                                            </option>
                                        ))}
                                    </select>
                                    <FaCaretDown className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                </div>
                            ) : (
                                <div className="px-3 py-2 bg-gray-50 rounded-md">
                                    {memberships.length > 0 ? memberships[0].name_method : 'Sin membresías'}
                                </div>
                            )}
                        </div>

                        {/* Receipt Number */}
                        {isEditing && (
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Recibo</label>
                                <input
                                    type="text"
                                    name="receipt_number"
                                    value={formData.receipt_number}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                                    required
                                />
                            </div>
                        )}

                        {/* Fecha de Inscripción */}
                        {isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Inscripción
                                </label>
                                <input
                                    type="date"
                                    name="registration_date"
                                    value={formData.registration_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Dejar vacío para mantener fecha actual</p>
                            </div>
                        )}

                        {/* Fecha de Último Pago */}
                        {isEditing && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Último Pago
                                </label>
                                <input
                                    type="date"
                                    name="last_payment_date"
                                    value={formData.last_payment_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
                                />
                                <p className="text-xs text-gray-500 mt-1">Dejar vacío para usar fecha actual</p>
                            </div>
                        )}
                    </div>

                    {/* Membresía actual */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold mb-4">Membresía Actual</h3>
                        {memberships.length > 0 ? (
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Último Pago</label>
                                        <div className="text-sm">{memberships[0].last_payment}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                                        <div className="text-sm">{memberships[0].expiration_date}</div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            memberships[0].name_state === 'Vigente' ? 'bg-green-100 text-green-800' :
                                            memberships[0].name_state === 'Por vencer' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {memberships[0].name_state}
                                        </span>
                                    </div>
                                    {memberships[0].name_state === 'Vencido' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Días en Mora</label>
                                            <div className="text-sm font-semibold text-red-600">{memberships[0].days_arrears}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">Este usuario no tiene membresía registrada</div>
                        )}
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                        {!isEditing ? (
                            <>
                                <button
                                    onClick={handleStartEditing}
                                    className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
                                >
                                    Editar
                                    <MdEdit />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
                                >
                                    Eliminar
                                    <MdDelete />
                                </button>
                            </>
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
};

export default UserDetails; 