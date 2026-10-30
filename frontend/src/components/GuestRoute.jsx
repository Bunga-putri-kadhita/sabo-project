import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeByRole } from "../utils/roles";
import FullPageLoader from "./FullPageLoader";

// Halaman khusus tamu (login, daftar). Yang sudah login diarahkan ke beranda role-nya.
export default function GuestRoute() {
  const { user, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={homeByRole(user.role)} replace />;
  return <Outlet />;
}
