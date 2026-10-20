import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  updateMyBooking,
  cancelMyBooking,
  assignMechanic,
} from "../controllers/booking.controller.js";

const router = express.Router();

// Semua endpoint booking wajib login
router.use(authenticate);

// ==========================================
// CUSTOMER: MELIHAT DAN MENGELOLA BOOKING
// ==========================================

// Melihat riwayat booking milik sendiri
router.get("/", getMyBookings);

// Membuat booking baru
router.post("/", createBooking);

// Mengedit booking milik sendiri
router.put("/:id", updateMyBooking);

// Membatalkan booking milik sendiri
router.delete("/:id", cancelMyBooking);

// ==========================================
// ADMIN: MENGELOLA STATUS BOOKING
// ==========================================

// Mengubah status booking, khusus admin
router.patch("/:id/status", authorize("ADMIN"), updateBookingStatus);
// Menugaskan Mechanic oleh admin
router.patch("/:id/assign-mechanic", authorize("ADMIN"), assignMechanic);
export default router;
