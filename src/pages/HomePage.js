import React from "react";
import AuctionList from "../components/AuctionList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-6xl mx-auto px-4">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              La Plata Remata
            </h1>
            <p className="text-gray-600">Subastas en línea</p>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-700">
              Usuario: {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Listado de subastas */}
        <AuctionList />
      </div>
    </div>
  );
}

export default HomePage;
