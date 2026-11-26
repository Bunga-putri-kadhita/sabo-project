import axios from "axios";
import { getToken } from "../storage";

// HP tidak bisa pakai "localhost". Isi EXPO_PUBLIC_API_URL di file .env, contoh:
// EXPO_PUBLIC_API_URL=http://192.168.1.10:5000/api
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://172.20.100.225:5000/api";

const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handler 401 dipasang oleh AuthContext supaya sesi kedaluwarsa otomatis keluar.
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthCall =
      url.includes("/auth/login") || url.includes("/auth/register");
    if (err.response?.status === 401 && !isAuthCall && onUnauthorized)
      onUnauthorized();
    return Promise.reject(err);
  },
);

export function errMsg(err, fallback = "Terjadi kesalahan. Coba lagi.") {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED")
    return "Koneksi ke server terlalu lama. Coba lagi.";
  if (err?.message === "Network Error")
    return "Tidak bisa terhubung ke server. Pastikan HP dan komputer satu Wi-Fi dan alamat API benar.";
  return fallback;
}

export default api;
