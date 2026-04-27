import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CgMenuRight } from "react-icons/cg";
import Dropdown from './Dropdown';
import { FaUserGroup } from "react-icons/fa6";
import { LuLogOut } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";

const Nav = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener el nombre y el id del manager logueado
    let managerName = 'Iniciado';
    let managerId = null;
    let managerRole = '';
    let managerRoleId = null;
    try {
      const managerData = JSON.parse(localStorage.getItem('managerData'));
      if (managerData && managerData.name_manager) {
        managerName = managerData.name_manager;
      }
      if (managerData && managerData.id_manager) {
        managerId = managerData.id_manager;
      }
      if (managerData) {
        managerRole = String(managerData.name_role || managerData.role || managerData.rol || '').trim().toLowerCase();
        managerRoleId = managerData.id_role;
      }
    } catch (e) {}

    const isSuperuser = managerRole === 'superusuario' || Number(managerRoleId) === 1;

    const handleHome = () => {
        navigate('/membresias')
    }

    const handleProfile = () => {
        navigate('/perfil-administrador');
        setMenuOpen(false);
    };

    const handleManagers = () => {
        navigate('/administradores');
        setMenuOpen(false);
    };

    const handleLogout = () => {
        // Limpiar el token y datos del manager
        localStorage.removeItem('managerToken');
        localStorage.removeItem('managerData');
        navigate('/');
        setMenuOpen(false);
    };

    // Mostrar solo el logo en la página de login
    if (location.pathname === '/') {
      return (
        <nav className="bg-black w-full py-8 px-16 flex justify-center">
            <div className='flex items-center gap-3'>
                <img 
                    src="/Logo Biofitness 1.png" 
                    className='h-10'
                />
                <img 
                    src="/Logo Biofitness 2.png" 
                    className='h-10'
                />
            </div>
        </nav>
      );
    }

    // En las demás páginas, mostrar nombre y dropdown
    return (
        <nav className="bg-black w-full py-4 px-4 md:py-8 md:pl-18 md:pr-10">
            <div className="container mx-auto flex items-center justify-between">
                <div className='flex items-center gap-2 md:gap-3 cursor-pointer' onClick={handleHome}>
                    <img 
                        src="/Logo Biofitness 1.png" 
                        className='h-8 md:h-10'
                    />
                    <img 
                        src="/Logo Biofitness 2.png" 
                        className='h-8 md:h-10'
                    />
                </div>
                <div className='flex items-center gap-4 md:gap-10 relative'>
                    <p 
                        className='hidden md:block text-white text-lg md:text-2xl font-medium cursor-pointer' 
                        onClick={handleProfile}
                    >
                        {managerName}
                    </p>
                    <div>
                        <CgMenuRight
                            className='text-white text-xl md:text-2xl cursor-pointer'
                            onClick={() => setMenuOpen((open) => !open)}
                        />
                        <Dropdown open={menuOpen} onClose={() => setMenuOpen(false)}>
                            <button
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                onClick={handleProfile}
                            >
                                <FaUserCircle />
                                Perfil
                            </button>
                            {isSuperuser && (
                                <button
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    onClick={handleManagers}
                                >
                                    <FaUserGroup />
                                    Administradores
                                </button>
                            )}
                            <button
                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                onClick={handleLogout}
                            >
                                <LuLogOut />
                                Cerrar sesión
                            </button>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Nav; 