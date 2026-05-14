import React from 'react';
import { MdDelete } from "react-icons/md";

const ManagersTable = ({ data, onDelete }) => {
    return (
        <div className="overflow-x-auto overflow-y-auto max-h-[500px] border-1 border-gray-300 rounded-2xl">
            <table className="min-w-full bg-white">
                <thead className="sticky top-0 z-20 border-gray-300 bg-white shadow-sm">
                    <tr>
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">No.</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Nombre</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Teléfono</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Email</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-left whitespace-nowrap bg-white z-20">Rol</th> 
                        <th className="px-6 py-3 border-gray-300 font-semibold text-black text-center whitespace-nowrap bg-white z-20">Eliminar</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr 
                            key={item.id_manager} 
                            className="hover:bg-gray-50"
                        >
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{index + 1}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.name_manager}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.phone}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.email}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap">{item.name_role || '—'}</td> 
                            <td className="px-6 py-4 border-b border-gray-200 whitespace-nowrap text-center">
                                <button
                                    onClick={() => onDelete(item.id_manager)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                                    title="Eliminar"
                                >
                                    <MdDelete className="text-lg" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManagersTable;
