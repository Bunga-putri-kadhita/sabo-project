import { useAuth } from "../context/AuthContext";

// Placeholder sementara, akan diganti di Tahap 4 dan 6
export default function CustomerHome() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm text-slate-500">Dashboard Customer</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Halo, {user.name}
        </h1>
        <p className="mt-1 text-slate-600">
          {user.email} · Role: {user.role}
        </p>
        <button
          onClick={logout}
          className="mt-6 rounded-xl border border-slate-900 px-4 py-2 font-medium text-slate-900 hover:bg-slate-900 hover:text-white"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
