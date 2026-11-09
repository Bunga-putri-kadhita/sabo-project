import {
  CalendarCheck,
  HardHat,
  LayoutDashboard,
  MessageSquare,
  Wallet,
  Wrench,
} from "lucide-react";

// Menu sidebar per role. Hak akses mengikuti backend:
// - ADMIN: kelola booking, layanan, mekanik, verifikasi pembayaran, chat
// - KASIR: verifikasi pembayaran, hanya melihat layanan dan mekanik
export const menuByRole = {
  ADMIN: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/bookings", label: "Booking", icon: CalendarCheck },
    { to: "/admin/services", label: "Layanan", icon: Wrench },
    { to: "/admin/mechanics", label: "Mekanik", icon: HardHat },
    { to: "/admin/payments", label: "Pembayaran", icon: Wallet },
    { to: "/admin/chat", label: "Chat", icon: MessageSquare },
  ],
  KASIR: [
    { to: "/kasir/payments", label: "Pembayaran", icon: Wallet },
    { to: "/kasir/services", label: "Layanan", icon: Wrench },
    { to: "/kasir/mechanics", label: "Mekanik", icon: HardHat },
  ],
};
