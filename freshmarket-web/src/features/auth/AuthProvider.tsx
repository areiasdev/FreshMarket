import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthResponse, User } from "../../types";
import { AuthContext } from "./authContext";
import { clearCartStorage } from "../cart/CartStorage";

function dispatchUserChanged() {
  window.dispatchEvent(new Event("auth:userChanged"));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (data: AuthResponse) => {
    const previousUser = localStorage.getItem("user");
    if (previousUser) {
      try {
        const prev = JSON.parse(previousUser);
        if (prev.id !== data.user.id) clearCartStorage();
      } catch { /* ignora */ }
    }

    localStorage.setItem("accessToken",  data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user",         JSON.stringify(data.user));
    setUser(data.user);
    dispatchUserChanged();
  };

  const updateUser = (updated: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...updated };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    clearCartStorage();
    setUser(null);
    dispatchUserChanged();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}