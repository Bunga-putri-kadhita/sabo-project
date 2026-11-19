import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Judul tab browser mengikuti halaman yang dibuka
const TITLES = [
  [/^\/$/, "SABO | Servis tanpa antre, booking online"],
  [/^\/login\/?$/, "Masuk | SABO"],
  [/^\/(admin|kasir)\/?$/, "Dashboard | SABO"],
  [/^\/admin\/bookings\/[^/]+\/?$/, "Detail Booking | SABO"],
  [/^\/admin\/bookings\/?$/, "Booking | SABO"],
  [/^\/(admin|kasir)\/services\/?$/, "Layanan | SABO"],
  [/^\/(admin|kasir)\/mechanics\/?$/, "Mekanik | SABO"],
  [/^\/(admin|kasir)\/payments\/?$/, "Pembayaran | SABO"],
  [/^\/admin\/chat(\/[^/]+)?\/?$/, "Chat Customer | SABO"],
];

export default function PageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    const hit = TITLES.find(([re]) => re.test(pathname));
    document.title = hit ? hit[1] : "Halaman tidak ditemukan | SABO";
  }, [pathname]);
  return null;
}
