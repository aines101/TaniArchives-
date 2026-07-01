import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("tani_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("tani_user");
      }
    }
  }, []);

  const loginWithGoogle = (profile) => {
    // Mocked Google login — stored locally for MVP.
    const u = {
      id: profile.email,
      name: profile.name,
      email: profile.email,
      picture:
        profile.picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          profile.name || profile.email
        )}`,
    };
    localStorage.setItem("tani_user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem("tani_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
