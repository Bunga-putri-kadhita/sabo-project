import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { clearToken, getToken, setToken } from "../storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  // Pulihkan sesi saat aplikasi dibuka.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await authApi.me();
          setUser(me.user ?? me);
        } catch {
          await clearToken();
        }
      }
      setBooting(false);
    })();
  }, [logout]);

  const login = useCallback(async (email, password) => {
    const { user: u, token } = await authApi.login(email, password);
    if (u.role !== "CUSTOMER") {
      const e = new Error("role");
      e.response = {
        data: {
          message:
            "Akun ini bukan akun customer. Gunakan aplikasi web untuk admin/kasir.",
        },
      };
      throw e;
    }
    await setToken(token);
    setUser(u);
  }, []);

  const register = useCallback(async (body) => {
    const { user: u, token } = await authApi.register(body);
    await setToken(token);
    setUser(u);
  }, []);

  const value = useMemo(
    () => ({ user, booting, login, register, logout }),
    [user, booting, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
