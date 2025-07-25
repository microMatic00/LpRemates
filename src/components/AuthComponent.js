import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthComponent = ({ redirectAfterLogin = false }) => {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Efecto para redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (redirectAfterLogin && isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate, redirectAfterLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error);
      } else if (redirectAfterLogin) {
        navigate("/home");
      }
    } catch (err) {
      console.error("Error de inicio de sesión:", err);
      setError(
        err.message || "Error al iniciar sesión. Verifica tus credenciales."
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const result = await register(email, password, name);

      if (!result.success) {
        setError(result.error);
      } else {
        setShowRegister(false);
        if (redirectAfterLogin) {
          navigate("/home");
        }
      }
    } catch (err) {
      console.error("Error de registro:", err);
      setError(
        err.message || "Error al registrar usuario. Intenta con otro email."
      );
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {isAuthenticated && user ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-700">
                <span className="font-medium">Usuario:</span>{" "}
                {user.name || user.email}
              </p>
              {user.email && (
                <p className="text-gray-500 text-sm">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
            >
              Cerrar sesión
            </button>
          </div>
          <p className="text-green-600 text-sm font-medium">
            Sesión iniciada. ¡Ya puedes hacer pujas!
          </p>
        </div>
      ) : (
        <>
          {showRegister ? (
            // Formulario de registro
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="text-lg font-medium">Registro</h3>
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nombre
                </label>
                <input
                  id="register-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                  minLength={8}
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
                >
                  Registrarse
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded w-full"
                >
                  Volver
                </button>
              </div>
            </form>
          ) : (
            // Formulario de inicio de sesión
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="text-lg font-medium">Iniciar sesión</h3>
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded w-full"
                >
                  Registrarse
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default AuthComponent;
