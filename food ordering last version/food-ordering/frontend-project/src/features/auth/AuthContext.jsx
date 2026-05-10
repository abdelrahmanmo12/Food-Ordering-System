import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const role = user?.role || "customer";

  const login = (email, password, selectedRole) => {
    if (!email || !password) return false;
    setUser({ email, name: email.split("@")[0], role: selectedRole || "customer" });
    return true;
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, role, login, logout, setUser }), [user, role]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

