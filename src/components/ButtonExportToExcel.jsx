import React, { useState } from 'react';
import { FiDownload } from "react-icons/fi";
import { membershipService } from '../services/membershipService';

const ButtonExportToExcel = ({ searchTerm, selectedState, selectedPlan }) => {
    const [exporting, setExporting] = useState(false);

    // Descarga un Excel de membresías aplicando los filtros actuales (búsqueda, estado y plan).
    // Mientras descarga desactiva el botón; si falla, muestra un aviso al usuario.
    const handleExportToExcel = async () => {
        try {
            setExporting(true);
            await membershipService.exportToExcel({
                searchTerm,
                selectedState,
                selectedPlan
            });
        } catch (error) {
            console.error('Error al exportar:', error);
            alert('Error al exportar el archivo Excel');
        } finally {
            setExporting(false);
        }
    };

    return (
        <button
            className="group bg-green-100 text-green-800 font-medium py-2 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExportToExcel}
            disabled={exporting}
        >
            <span className="flex items-center gap-2">
                <span className="hidden group-hover:inline">
                    {exporting ? 'Descargando...' : 'Descargar Excel'}
                </span>
                <FiDownload className="text-xl" />
            </span>
        </button>
    );
};

export default ButtonExportToExcel; 