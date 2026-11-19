import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homeByRole } from "../utils/roles";
import ProtectedRoute from "../components/ProtectedRoute";
import GuestRoute from "../components/GuestRoute";
import FullPageLoader from "../components/FullPageLoader";
import StaffLayout from "../layouts/StaffLayout";
import Login from "../pages/Login";
import Services from "../pages/Services";
import Mechanics from "../pages/Mechanics";
import Bookings from "../pages/Bookings";
import BookingDetail from "../pages/BookingDetail";
import Payments from "../pages/Payments";
import Dashboard from "../pages/Dashboard";
import Chat from "../pages/Chat";
import Landing from "../pages/Landing";
import NotFound from "../pages/NotFound";
import PageTitle from "../components/PageTitle";

// Alamat "/": pengunjung melihat landing page, staf yang sudah masuk diarahkan ke beranda role-nya.
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? <Navigate to={homeByRole(user.role)} replace /> : <Landing />;
}

export default function AppRoutes() {
  return (
    <>
      <PageTitle />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ADMIN */}
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="/admin" element={<StaffLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="bookings/:id" element={<BookingDetail />} />
            <Route path="services" element={<Services />} />
            <Route path="mechanics" element={<Mechanics />} />
            <Route path="payments" element={<Payments />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:bookingId" element={<Chat />} />
          </Route>
        </Route>

        {/* KASIR */}
        <Route element={<ProtectedRoute roles={["KASIR"]} />}>
          <Route path="/kasir" element={<StaffLayout />}>
            <Route index element={<Navigate to="payments" replace />} />
            <Route path="payments" element={<Payments />} />
            <Route path="services" element={<Services />} />
            <Route path="mechanics" element={<Mechanics />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
