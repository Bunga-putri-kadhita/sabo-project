import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  // true selama token yang tersimpan masih diverifikasi ke backend
  const [loading, setLoading] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Saat aplikasi dibuka: verifikasi token yang tersimpan lewat GET /auth/me
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem("user", JSON.stringify(res.data.data));
      })
      .catch((error) => {
        // Hanya logout kalau token ditolak, bukan karena backend sedang mati
        if (error.response?.status === 401) clearSession();
      })
      .finally(() => setLoading(false));
  }, [clearSession]);

  // Interceptor Axios memberi sinyal ini saat token ditolak backend
  useEffect(() => {
    window.addEventListener("auth:expired", clearSession);
    return () => window.removeEventListener("auth:expired", clearSession);
  }, [clearSession]);

  async function login(email, password) {
    const res = await api.post("/auth/login", { email, password });
    const { user: loggedInUser, token } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register({ name, email, phone, password }) {
    await api.post("/auth/register", { name, email, phone, password });
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout: clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
