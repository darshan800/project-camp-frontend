import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await api.get("/auth/current-user");
        setUser(response.data.data);
      } catch (err) {
        // don't remove token on failure — just leave user as null
        console.error("Failed to fetch current user", err);
      } finally {
        setAuthLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);