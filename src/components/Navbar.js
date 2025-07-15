import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="mb-8 bg-white/70 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center">
        {/* Logo y título */}
        <div className="text-center md:text-left mb-4 md:mb-0">
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white text-xl">🔨</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              La Plata Remata
            </h1>
          </div>
          <p className="text-gray-600 mt-1 tracking-wide">
            Las mejores subastas en línea
          </p>
        </div>

        {/* Links de navegación */}
        <nav className="flex items-center space-x-6 mb-4 md:mb-0">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
                : "font-medium text-gray-600 hover:text-blue-600 hover:border-b-2 hover:border-blue-600 pb-1 transition duration-200"
            }
          >
            Subastas
          </NavLink>
          <NavLink
            to="/create-auction"
            className={({ isActive }) =>
              isActive
                ? "font-medium text-purple-600 border-b-2 border-purple-600 pb-1"
                : "font-medium text-gray-600 hover:text-purple-600 hover:border-b-2 hover:border-purple-600 pb-1 transition duration-200"
            }
          >
            Nueva Subasta
          </NavLink>
        </nav>

        {/* Información de usuario y botón de logout */}
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-3 shadow-md">
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </span>
              </div>
              <div>
                <span className="block text-sm font-medium text-gray-700">
                  {user?.name || user?.email}
                </span>
                <span className="text-xs text-green-600 flex items-center">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                  Conectado
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-2.5 px-5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
