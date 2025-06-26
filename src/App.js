import React from "react";
import AuctionList from "./components/AuctionList";
import AuthComponent from "./components/AuthComponent";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-6xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">La Plata Remata</h1>
          <p className="text-gray-600">Subastas en línea</p>
        </header>

        {/* Componente de autenticación */}
        <div className="mb-8">
          <AuthComponent />
        </div>

        {/* Listado de subastas */}
        <AuctionList />
      </div>
    </div>
  );
}

export default App;
