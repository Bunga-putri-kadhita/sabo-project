import { useAuth } from "../context/AuthContext";

// Placeholder sementara, akan diganti di Tahap 4, 5, dan 7
export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-slate-900 p-8 text-white shadow-sm">
        <p className="text-sm text-slate-400">Dashboard Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Halo, {user.name}</h1>
        <p className="mt-1 text-slate-300">
          {user.email} · Role: {user.role}
        </p>
        <button
          onClick={logout}
          className="mt-6 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-400"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
