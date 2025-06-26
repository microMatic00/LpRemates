import React from "react";
import AuthComponent from "../components/AuthComponent";

function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">La Plata Remata</h1>
          <p className="text-gray-600">Subastas en línea</p>
        </header>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <AuthComponent redirectAfterLogin={true} />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
