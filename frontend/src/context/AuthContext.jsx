import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TOKEN_KEY = "bv_token";

const AuthCtx = createContext({
  user: null, status: "loading",
  login: async () => {}, register: async () => {}, logout: () => {}, googleLogin: () => {},
  setUserFromToken: () => {},
});

export const useAuth = () => useContext(AuthCtx);

function authClient(token) {
  const c = axios.create({ baseURL: API, timeout: 30000 });
  if (token) c.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return c;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | auth | anon

  const checkMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setStatus("anon"); return; }
    try {
      const { data } = await authClient(token).get("/auth/me");
      setUser(data);
      setStatus("auth");
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setStatus("anon");
    }
  }, []);

  useEffect(() => {
    // Skip /me check if returning from Emergent Google callback (handled separately)
    if (window.location.hash?.includes("session_id=")) {
      setStatus("anon"); return;
    }
    checkMe();
  }, [checkMe]);

  const persist = (token, userData) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(userData);
    setStatus("auth");
  };

  const login = async (email, password) => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (email, password, name) => {
    const { data } = await axios.post(`${API}/auth/register`, { email, password, name });
    persist(data.token, data.user);
    return data.user;
  };

  const exchangeGoogleSession = async (session_id) => {
    const { data } = await axios.post(`${API}/auth/google-callback`, { session_id });
    persist(data.token, data.user);
    return data.user;
  };

  const googleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null); setStatus("anon");
  };

  return (
    <AuthCtx.Provider value={{ user, status, login, register, logout, googleLogin, exchangeGoogleSession }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
