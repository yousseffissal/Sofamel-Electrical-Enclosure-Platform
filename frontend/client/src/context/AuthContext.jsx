import { createContext, useContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("access-token-user") || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  
  // --- login ---
  const login = async (formData) => {
    if(localStorage.getItem("access-token-user"))
    {
      logout();
    }
    try {
      const res = await api.post(ENDPOINTS.AUTH.LOGIN, formData);

      localStorage.setItem("access-token-user", res.data.access_token);
      setToken(res.data.access_token);
      setIsAuthenticated(true);
      setUser(res.data.user);

    } catch (err) {
      if (err.response) {
        const error = new Error(err.response.data.message || "Something went wrong");
        console.error("Login error:", err.response.data);
        error.status = err.response.status;
        throw error;
      } else {
        throw new Error("Network error");
      }
    }
  };

  // --- register ---
  const register = async (formData) => {
    if(localStorage.getItem("access-token-user"))
    {
      logout();
    }
    try {
      const res = await api.post(ENDPOINTS.AUTH.REGISTER, formData);
      localStorage.setItem("access-token-user", res.data.access_token);
      setToken(res.data.access_token);
      setIsAuthenticated(true);
      setUser(res.data.user);

    } catch (err) {
      if (err.response) {
        const error = new Error(err.response.data.message || "Something went wrong");
        console.error("Register error:", err.response.data);
        error.status = err.response.status;
        throw error;
      } else {
        throw new Error("Network error");
      }
    }
  };

  // --- logout ---
  const logout = async () => {
    await api.post(ENDPOINTS.AUTH.LOGOUT);
    localStorage.removeItem("access-token-user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const logoutAll = async () => {
    await api.post(ENDPOINTS.AUTH.LOGOUTALL);
    localStorage.removeItem("access-token-user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // --- fetch current user ---
  const fetchMe = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;

    try {
      const res = await api.get(ENDPOINTS.AUTH.ME);
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        token,
        login,
        register,
        logout,
        logoutAll,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);