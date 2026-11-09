import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import Logo from "./logo.jsx";

export default function Sidebar({
  items,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  // Tutup drawer mobile dengan tombol Esc
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => e.key === "Escape" && onCloseMobile();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, onCloseMobile]);

  // Saat dilipat (hanya di desktop), label disembunyikan
  const label = collapsed ? "lg:hidden" : "";

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-night/60 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Menu utama"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-night text-slate-400 transition-all duration-300 ease-ratchet lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div
          className={`flex h-16 items-center justify-between px-5 ${
            collapsed ? "lg:justify-center lg:px-0" : ""
          }`}
        >
          {collapsed ? (
            <>
              <span className="lg:hidden">
                <Logo variant="light" />
              </span>
              <span
                className="font-display hidden text-2xl text-white lg:inline"
                style={{ fontWeight: 800 }}
              >
                S<span className="text-amber">.</span>
              </span>
            </>
          ) : (
            <Logo variant="light" />
          )}
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {items.map(({ to, label: text, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              title={collapsed ? text : undefined}
              className={({ isActive }) =>
                `nav-item flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                  collapsed ? "lg:justify-center" : ""
                } ${
                  isActive
                    ? "bg-white/[0.06] text-white"
                    : "hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.75} className="shrink-0" />
              <span className={label}>{text}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-white/10 p-3 lg:block">
          <button
            onClick={onToggleCollapse}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-white ${
              collapsed ? "justify-center" : ""
            }`}
            aria-label={collapsed ? "Perluas menu" : "Lipat menu"}
          >
            {collapsed ? (
              <ChevronsRight size={20} />
            ) : (
              <ChevronsLeft size={20} />
            )}
            {!collapsed && <span>Lipat menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
