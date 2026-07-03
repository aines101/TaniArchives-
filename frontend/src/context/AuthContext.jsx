import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
const AUTH_TOKEN_KEY = "session_token";

const setAuthToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  }
};

const loadStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const signInWithGoogle = () => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error("Missing REACT_APP_GOOGLE_CLIENT_ID environment variable.");
    return;
  }
  const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI || window.location.origin + "/auth/callback";
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: redirectUri,
    prompt: "select_account",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const storedToken = loadStoredToken();
    if (storedToken) {
      setAuthToken(storedToken);
    }
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (e) {
      setUser(null);
      if (storedToken) {
        setAuthToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("code")) {
        setLoading(false);
        return;
      }
    }
    checkAuth();
  }, [checkAuth]);

  const exchangeSession = async (sessionId) => {
    const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI || window.location.origin + "/auth/callback";
    const res = await api.post("/auth/session", { code: sessionId, redirect_uri: redirectUri });
    if (res?.data?.session_token) {
      setAuthToken(res.data.session_token);
    }
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    setUser(null);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, exchangeSession, logout, refresh: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
