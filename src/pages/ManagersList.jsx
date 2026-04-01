import React, { useState, useEffect } from 'react';
import ManagersTable from '../components/ManagersTable';
import { useNavigate } from 'react-router-dom';
import { managerService } from '../services/managerService';
import { FaPlus } from "react-icons/fa6";

const ManagersList = () => {
    const navigate = useNavigate();
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Normaliza texto: minúsculas, sin tildes, sin caracteres especiales
    const normalize = (str) =>
        (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/\u0300-\u036f/g, "") // quita tildes
            .replace(/[^a-z0-9]/gi, ""); // quita caracteres especiales

    // Al montar: carga todos los administradores desde el servidor.
    useEffect(() => {
        // Pide la lista y actualiza el estado; al terminar quita el estado de carga.
        const fetchManagers = async () => {
            try {
                const data = await managerService.getAll();
                setManagers(data);
            } catch (err) {
                setError('Error al cargar administradores');
            } finally {
                setLoading(false);
            }
        };
        fetchManagers();
    }, []);

    // Pide confirmación, elimina en el servidor y quita el ítem de la lista local.
    const handleDelete = async (managerId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este administrador?')) {
            try {
                await managerService.delete(managerId);
                setManagers(managers.filter(manager => manager.id_manager !== managerId));
                alert('Administrador eliminado exitosamente');
            } catch (err) {
                setError('Error al eliminar el administrador');
                console.error(err);
            }
        }
    };

    return (
        <div className="container mx-auto px-8 py-10">
            <div className="mb-6">
                <div className="flex justify-between items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold">Lista de Administradores</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 sm:hidden">
                            <button
                                className="group bg-blue-100 text-blue-800 font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
                                onClick={() => navigate('/agregar-administrador')}
                            >
                                <span className="flex items-center">
                                    <FaPlus className="text-lg" />
                                </span>
                            </button>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, teléfono o email..."
                                className="w-64 lg:w-80 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="group bg-blue-100 text-blue-800 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                                onClick={() => navigate('/agregar-administrador')}
                            >
                                <span className="flex items-center gap-2">
                                    Agregar
                                    <FaPlus className="hidden group-hover:inline" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full sm:hidden">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o email..."
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            {loading ? (
                <div>Cargando...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <ManagersTable
                    data={managers.filter(manager => {
                        const nombre = normalize(manager.name_manager);
                        const telefono = normalize(manager.phone);
                        const email = normalize(manager.email);
                        const term = normalize(searchTerm);
                        return nombre.includes(term) || telefono.includes(term) || email.includes(term);
                    })}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ManagersList;
