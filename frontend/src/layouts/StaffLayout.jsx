import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { menuByRole } from "../config/menu";

function readCollapsed() {
  try {
    return localStorage.getItem("sidebarCollapsed") === "1";
  } catch {
    return false;
  }
}

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = menuByRole[user.role] ?? [];

  // Judul halaman = menu dengan path terpanjang yang cocok
  const current = items
    .filter(
      (i) =>
        location.pathname === i.to || location.pathname.startsWith(i.to + "/"),
    )
    .sort((a, b) => b.to.length - a.to.length)[0];

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", next ? "1" : "0");
      } catch {
        // abaikan jika penyimpanan browser tidak tersedia
      }
      return next;
    });
  }

  return (
    <div className="flex min-h-svh bg-ground">
      <a href="#konten" className="skip-link">
        Lewati ke konten
      </a>
      <Sidebar
        items={items}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-ground/85 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-ink hover:bg-black/5 lg:hidden"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-display text-2xl leading-none font-extrabold uppercase tracking-wide">
              {current?.label ?? "SABO"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.email}</p>
            </div>
            <span
              className={`rounded-md px-2 py-1 font-mono text-[0.65rem] font-medium tracking-[0.14em] ${
                user.role === "ADMIN"
                  ? "bg-night text-amber"
                  : "bg-amber text-night"
              }`}
            >
              {user.role}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition-colors hover:border-night hover:bg-night hover:text-white"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        <main id="konten" tabIndex={-1} className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
