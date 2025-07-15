import React from "react";
import CreateAuctionForm from "../components/CreateAuctionForm";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function CreateAuctionPage() {
  const navigate = useNavigate();

  const handleAuctionCreated = () => {
    // Redirigir a la página principal después de crear una subasta
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-100 py-6 flex flex-col">
      {/* Decoración de fondo - Ahora está fuera del contenedor principal y ocupa toda la pantalla */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-20 md:-right-0 w-96 h-96 md:w-[40vw] md:h-[40vw] bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-20 md:-left-0 w-96 h-96 md:w-[40vw] md:h-[40vw] bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/3 w-80 h-80 md:w-[30vw] md:h-[30vw] bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6">
        {/* Navbar con navegación y botón de logout */}
        <Navbar />

        {/* Título de la sección */}
        <div className="mb-10 text-center animate-slide-up max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 drop-shadow-sm">
            Crear Nueva Subasta
          </h2>
          <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-3 rounded-full"></div>
          <p className="text-gray-600 mt-3 text-lg">
            Completa el formulario para crear tu subasta
          </p>
        </div>

        {/* Formulario sin fondo para mostrar el gradiente */}
        <div className="animate-fade-in max-w-4xl mx-auto rounded-2xl shadow-lg border border-white/30 p-8">
          <CreateAuctionForm onAuctionCreated={handleAuctionCreated} />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm p-4 animate-fade-in">
          <p>
            © {new Date().getFullYear()} La Plata Remata. Todos los derechos
            reservados.
          </p>
        </footer>
      </div>

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

export default CreateAuctionPage;
