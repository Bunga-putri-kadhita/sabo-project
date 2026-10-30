import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeByRole } from "../utils/roles";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import FullPageLoader from "../components/FullPageLoader";
import Login from "../pages/Login";
import Register from "../pages/Register";
import CustomerHome from "../pages/CustomerHome";
import AdminDashboard from "../pages/AdminDashboard";

// Alamat "/" mengarahkan ke beranda sesuai role, atau ke login jika belum masuk.
// Nanti diganti landing page.
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return <Navigate to={user ? homeByRole(user.role) : "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute roles={["CUSTOMER"]} />}>
        <Route path="/dashboard" element={<CustomerHome />} />
      </Route>

      <Route element={<ProtectedRoute roles={["ADMIN", "KASIR"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
