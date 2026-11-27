import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("housemates_access")) {
      setLoading(false);
      return;
    }
    api.get("/auth/me/")
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("housemates_access");
        localStorage.removeItem("housemates_refresh");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (identifier, password) => {
    const payload = await api.post("/auth/login/", { username: identifier, password });
    localStorage.setItem("housemates_access", payload.access);
    localStorage.setItem("housemates_refresh", payload.refresh);
    setUser(payload.user);
    return payload.user;
  };

  const register = async (payload) => {
    const result = await api.post("/auth/signup/", payload);
    localStorage.setItem("housemates_access", result.access);
    localStorage.setItem("housemates_refresh", result.refresh);
    setUser(result.user);
    return result.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout/", {});
    } catch {
      // Local token removal still ends this browser session.
    }
    localStorage.removeItem("housemates_access");
    localStorage.removeItem("housemates_refresh");
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
