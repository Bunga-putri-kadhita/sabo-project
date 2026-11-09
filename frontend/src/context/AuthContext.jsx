import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../services/api";
import { isStaff } from "../utils/roles";

const AuthContext = createContext(null);

// Hanya sesi ADMIN/KASIR yang dianggap valid di web
function readStoredUser() {
  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    return stored && isStaff(stored.role) ? stored : null;
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
        const me = res.data.data;
        if (!isStaff(me.role)) {
          clearSession();
          return;
        }
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
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

    // Akun customer ditolak sebelum token disimpan
    if (!isStaff(loggedInUser.role)) {
      throw new Error(
        "Akun customer hanya bisa digunakan di aplikasi mobile SABO.",
      );
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout: clearSession }}
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
