import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

import {
  createDpPayment,
  createSettlementPayment,
  getBookingPayments,
  verifyPayment,
  getAllPayments,
  rejectPayment,
  uploadPaymentProof
} from "../controllers/payment.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(authenticate);

// ADMIN dan KASIR melihat semua pembayaran
router.get(
  "/payments",
  authorize("ADMIN", "KASIR"),
  getAllPayments,
);

// Customer membuat tagihan DP
router.post(
  "/bookings/:id/payments/dp",
  authorize("CUSTOMER"),
  createDpPayment,
);

// Customer membuat tagihan pelunasan
router.post(
  "/bookings/:id/payments/settlement",
  authorize("CUSTOMER"),
  createSettlementPayment,
);

// Customer, Admin, dan Kasir melihat riwayat pembayaran
router.get("/bookings/:id/payments", getBookingPayments);

// Admin atau Kasir memverifikasi pembayaran transfer/tunai
router.patch(
  "/payments/:paymentId/verify",
  authorize("ADMIN", "KASIR"),
  verifyPayment,
);

router.patch(
  "/payments/:paymentId/reject",
  authorize("ADMIN", "KASIR"),
  rejectPayment,
);

router.post(
  "/payments/:paymentId/proof",
  upload.single("proof"),
  uploadPaymentProof,
);

export default router;
