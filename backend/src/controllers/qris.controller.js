import prisma from "../config/database.js";

function buildDummyQrisPayload(payment) {
  return [
    "SABO-DUMMY-QRIS",
    `PAYMENT_ID=${payment.id}`,
    `BOOKING_ID=${payment.bookingId}`,
    `TYPE=${payment.type}`,
    `AMOUNT=${payment.amount.toString()}`,
    `REFERENCE=SABO-${payment.id}`,
  ].join("|");
}

export async function getDummyQris(req, res) {
  try {
    const paymentId = Number(req.params.paymentId);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({ success: false, message: "ID pembayaran tidak valid" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan" });
    }
    if (req.user.role === "CUSTOMER" && payment.booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Kamu tidak memiliki akses ke pembayaran ini" });
    }
    if (payment.method !== "QRIS") {
      return res.status(400).json({ success: false, message: "Pembayaran ini bukan menggunakan QRIS" });
    }
    if (payment.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "QR hanya tersedia untuk pembayaran PENDING" });
    }

    return res.status(200).json({
      success: true,
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        qrPayload: buildDummyQrisPayload(payment),
        simulationEnabled: process.env.ENABLE_QRIS_SIMULATION === "true" && process.env.NODE_ENV !== "production",
      },
    });
  } catch (error) {
    console.error("Get dummy QRIS error:", error);
    return res.status(500).json({ success: false, message: "Gagal membuat QR pembayaran" });
  }
}

export async function simulateQrisPayment(req, res) {
  try {
    if (process.env.ENABLE_QRIS_SIMULATION !== "true" || process.env.NODE_ENV === "production") {
      return res.status(403).json({ success: false, message: "Simulasi QRIS tidak aktif" });
    }

    const paymentId = Number(req.params.paymentId);
    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({ success: false, message: "ID pembayaran tidak valid" });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Pembayaran tidak ditemukan" });
    }
    if (req.user.role !== "CUSTOMER" || payment.booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Hanya pemilik booking yang dapat menjalankan simulasi" });
    }
    if (payment.method !== "QRIS") {
      return res.status(400).json({ success: false, message: "Pembayaran ini bukan menggunakan QRIS" });
    }
    if (payment.status !== "PENDING") {
      return res.status(409).json({ success: false, message: "Pembayaran tidak lagi menunggu pembayaran" });
    }

    const now = new Date();
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        gatewayReference: `SABO-SIM-${payment.id}`,
        paidAt: now,
      },
      include: { booking: true },
    });

    return res.status(200).json({
      success: true,
      message: "Pembayaran QRIS dummy berhasil disimulasikan",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Simulate QRIS payment error:", error);
    return res.status(500).json({ success: false, message: "Gagal memproses simulasi pembayaran" });
  }
}
