import React, { createContext, useState, useEffect, useContext } from "react";
import PocketBase from "pocketbase";

// Instancia de PocketBase
const POCKETBASE_URL = "http://127.0.0.1:8090";
const pb = new PocketBase(POCKETBASE_URL);

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => useContext(AuthContext);

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid);
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación inicial
    checkAuthState();

    // Escuchar cambios en la autenticación
    const unsubscribe = pb.authStore.onChange(() => {
      checkAuthState();
    });

    setLoading(false);
    return unsubscribe;
  }, []);

  const checkAuthState = () => {
    setIsAuthenticated(pb.authStore.isValid);
    setUser(pb.authStore.model);
  };

  const login = async (email, password) => {
    try {
      await pb.collection("users").authWithPassword(email, password);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.message || "Error al iniciar sesión. Verifica tus credenciales.",
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        name,
      };

      await pb.collection("users").create(data);
      await pb.collection("users").authWithPassword(email, password);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.message || "Error al registrar usuario. Intenta con otro email.",
      };
    }
  };

  const logout = () => {
    pb.authStore.clear();
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    pb,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
