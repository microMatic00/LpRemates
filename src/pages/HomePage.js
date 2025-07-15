import React, { useState } from "react";
import AuctionList from "../components/AuctionList";
import CreateAuctionForm from "../components/CreateAuctionForm";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [refreshAuctions, setRefreshAuctions] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Cuando se crea una subasta, refrescamos el listado
  const handleAuctionCreated = () => {
    setRefreshAuctions((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-6xl mx-auto px-4 z-10">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center bg-white/70 backdrop-blur-lg p-5 rounded-2xl shadow-xl border border-white/20 transition-all duration-300 hover:shadow-2xl animate-fade-in">
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
        </header>

        {/* Formulario para crear subasta (solo si está autenticado) */}
        {user && <CreateAuctionForm onAuctionCreated={handleAuctionCreated} />}

        {/* Título de la sección */}
        <div className="mb-8 text-center animate-slide-up">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Subastas Activas
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-2 rounded-full"></div>
          <p className="text-gray-600 mt-2">
            Encuentra los mejores artículos para pujar
          </p>
        </div>

        {/* Listado de subastas */}
        <div className="animate-fade-in">
          <AuctionList key={refreshAuctions} />
        </div>
      </div>

      {/* Decoración de fondo */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-1/4 left-1/3 w-60 h-60 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-gray-500 text-sm p-4 animate-fade-in">
        <p>
          © {new Date().getFullYear()} La Plata Remata. Todos los derechos
          reservados.
        </p>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.9s ease-out forwards;
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default HomePage;
