import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeByRole } from "../utils/roles";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import FullPageLoader from "../components/FullPageLoader";
import StaffLayout from "../layouts/StaffLayout";
import Login from "../pages/Login";
import PlaceholderPage from "../pages/PlaceholderPage";
import Services from "../pages/Services";
import Mechanics from "../pages/Mechanics";

// Alamat "/" mengarahkan ke beranda sesuai role, atau ke login jika belum masuk.
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
      </Route>

      {/* ADMIN */}
      <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
        <Route path="/admin" element={<StaffLayout />}>
          <Route
            index
            element={
              <PlaceholderPage
                title="Dashboard"
                description="Ringkasan jumlah booking per status dan daftar booking terbaru."
                access="ADMIN"
                endpoints={["GET /api/bookings"]}
              />
            }
          />
          <Route
            path="bookings"
            element={
              <PlaceholderPage
                title="Kelola Booking"
                description="Daftar semua booking, detail, penugasan mekanik, dan perubahan status."
                access="ADMIN"
                endpoints={[
                  "GET /api/bookings",
                  "GET /api/bookings/:id",
                  "PATCH /api/bookings/:id/assign-mechanic",
                  "PATCH /api/bookings/:id/status",
                ]}
              />
            }
          />
          <Route path="services" element={<Services />} />
          <Route path="mechanics" element={<Mechanics />} />
          <Route
            path="payments"
            element={
              <PlaceholderPage
                title="Pembayaran"
                description="Riwayat pembayaran per booking dan verifikasi transfer atau tunai."
                access="ADMIN"
                endpoints={[
                  "GET /api/bookings/:id/payments",
                  "PATCH /api/payments/:paymentId/verify",
                ]}
              />
            }
          />
          <Route
            path="chat"
            element={
              <PlaceholderPage
                title="Chat Customer"
                description="Percakapan dengan customer berdasarkan booking."
                access="ADMIN"
                endpoints={[
                  "GET /api/chat/:bookingId",
                  "POST /api/chat/:bookingId",
                ]}
              />
            }
          />
        </Route>
      </Route>

      {/* KASIR */}
      <Route element={<ProtectedRoute roles={["KASIR"]} />}>
        <Route path="/kasir" element={<StaffLayout />}>
          <Route index element={<Navigate to="payments" replace />} />
          <Route
            path="payments"
            element={
              <PlaceholderPage
                title="Pembayaran"
                description="Verifikasi pembayaran transfer atau tunai."
                access="KASIR dan ADMIN"
                endpoints={[
                  "GET /api/bookings/:id/payments",
                  "PATCH /api/payments/:paymentId/verify",
                ]}
              />
            }
          />
          <Route path="services" element={<Services />} />
          <Route path="mechanics" element={<Mechanics />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
