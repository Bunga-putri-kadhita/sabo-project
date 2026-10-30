import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeByRole } from "../utils/roles";
import FullPageLoader from "./FullPageLoader";

// Halaman yang butuh login. `roles` membatasi role yang boleh masuk.
// Catatan: ini hanya kenyamanan tampilan, otorisasi sebenarnya tetap di backend.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeByRole(user.role)} replace />;
  }
  return <Outlet />;
}
