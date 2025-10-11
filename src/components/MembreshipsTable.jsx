import React from 'react';
import { FaCaretDown } from "react-icons/fa6";
import ButtonUserDetails from './ButtonUserDetails';

const MembreshipsTable = ({ data, states = [], selectedState = "todos", onStateChange, plans = [], selectedPlan = "todos", onPlanChange }) => {
    return (
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] border-1 border-gray-300 rounded-2xl">
            <table className="min-w-full bg-white">
                <thead className="sticky top-0 z-20 border-gray-300 bg-white shadow-sm">
                    <tr>
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">No.</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Nombre</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Teléfono</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Fecha inscripción</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Último pago</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Método de pago</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Administrador</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">No. recibo</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">
                            <div className="relative w-full">
                                <select
                                    className="w-20 px-2 py-1 pr-8 text-sm rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300"
                                    value={selectedPlan}
                                    onChange={e => onPlanChange(e.target.value)}
                                >
                                    <option value="todos">Plan</option>
                                    {plans.map(plan => (
                                        <option key={plan} value={plan}>
                                            {plan} {plan === 1 ? 'día' : 'días'}
                                        </option>
                                    ))}
                                </select>
                                <FaCaretDown className="absolute right-2 top-1/2 -translate-y-1/2 text-black text-xs pointer-events-none" />
                            </div>
                        </th>
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Vence</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">
                            <div className="relative w-full">
                                <select
                                    className="w-full px-2 py-1 pr-8 text-sm rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-gray-300"
                                    value={selectedState}
                                    onChange={e => onStateChange(e.target.value)}
                                >
                                    <option value="todos">Estado</option>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <FaCaretDown className="absolute right-2 top-1/2 -translate-y-1/2 text-black text-xs pointer-events-none" />
                            </div>
                        </th>
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Días en mora</th>
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr 
                            key={item.id_membership} 
                            className="hover:bg-gray-50"
                        >
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{data.length - index}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.name_user}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.user_phone}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.user_created_at}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.last_payment}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.name_method}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.name_manager}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.receipt_number}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                {item.days_duration} {item.days_duration === 1 ? 'día' : 'días'}
                            </td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.expiration_date}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded ${item.name_state === 'Vigente' ? 'bg-green-100 text-green-800' :
                                    item.name_state === 'Por vencer' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {item.name_state}
                                </span>
                            </td>
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                {item.days_arrears > 0 ? item.days_arrears : ''}
                            </td>
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">
                                <ButtonUserDetails 
                                    userId={item.id_user} 
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MembreshipsTable; 