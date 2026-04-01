import React, { useState, useEffect } from 'react';
import MembreshipsTable from '../components/MembreshipsTable';
import ButtonExportToExcel from '../components/ButtonExportToExcel';
import { FiChevronRight } from "react-icons/fi";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { membershipService } from '../services/membershipService';

const MembershipsList = () => {
    const navigate = useNavigate();
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedState, setSelectedState] = useState("todos");
    const [selectedPlan, setSelectedPlan] = useState("todos");

    // Normaliza texto: minúsculas, sin tildes, sin caracteres especiales
    const normalize = (str) =>
        (str || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/\u0300-\u036f/g, "") // quita tildes
            .replace(/[^a-z0-9]/gi, ""); // quita caracteres especiales

    // Al montar: carga todas las membresías con detalle desde el servidor.
    useEffect(() => {
        // Pide la lista y actualiza el estado; al terminar quita el estado de carga.
        const fetchMemberships = async () => {
            try {
                const data = await membershipService.getAllWithDetails();
                setMemberships(data);
            } catch (err) {
                setError('Error al cargar membresías');
            } finally {
                setLoading(false);
            }
        };
        fetchMemberships();
    }, []);



    // Extrae los estados únicos de los datos de membresía
    const uniqueStates = [
        ...new Set(memberships.map(m => m.name_state).filter(Boolean))
    ];
    // Extrae los planes únicos de los datos de membresía
    const uniquePlans = [
        ...new Set(memberships.map(m => m.days_duration).filter(Boolean))
    ];

    return (
        <div className="container mx-auto px-8 py-10">
            <div className="mb-6">
                <div className="flex justify-between items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold">Control de Membresías</h1>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 sm:hidden">
                            <ButtonExportToExcel 
                                searchTerm={searchTerm}
                                selectedState={selectedState}
                                selectedPlan={selectedPlan}
                            />
                            <button
                                className="group bg-blue-100 text-blue-800 font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer"
                                onClick={() => navigate('/inscribir-usuario')}
                            >
                                <span className="flex items-center">
                                    <FaPlus className="text-lg" />
                                </span>
                            </button>
                        </div>
                        <div className="hidden sm:flex items-center gap-4">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o teléfono..."
                                className="w-64 lg:w-80 px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <ButtonExportToExcel 
                                searchTerm={searchTerm}
                                selectedState={selectedState}
                                selectedPlan={selectedPlan}
                            />
                            <button
                                className="group bg-blue-100 text-blue-800 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                                onClick={() => navigate('/inscribir-usuario')}
                            >
                                <span className="flex items-center gap-1">
                                    Inscribir
                                    <FiChevronRight className="hidden group-hover:inline text-xl" />
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="w-full sm:hidden">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
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
                <MembreshipsTable
                    data={memberships.filter(m => {
                        const nombre = normalize(m.name_user);
                        const telefono = normalize(m.user_phone);
                        const term = normalize(searchTerm);
                        const stateMatch = selectedState === "todos" || m.name_state === selectedState;
                        const planMatch = selectedPlan === "todos" || m.days_duration === parseInt(selectedPlan);
                        return (nombre.includes(term) || telefono.includes(term)) && stateMatch && planMatch;
                    })}
                    states={uniqueStates}
                    selectedState={selectedState}
                    onStateChange={setSelectedState}
                    plans={uniquePlans}
                    selectedPlan={selectedPlan}
                    onPlanChange={setSelectedPlan}
                />
            )}
        </div>
    );
};

export default MembershipsList;