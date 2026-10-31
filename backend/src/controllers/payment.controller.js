import { Prisma } from "@prisma/client";
import prisma from "../config/database.js";

// Membuat pembayaran DP 30%
export async function createDpPayment(req, res) {
  try {
    const bookingId = Number(req.params.id);
    const { method } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        message: "ID booking tidak valid",
      });
    }

    if (!["QRIS", "TRANSFER", "CASH"].includes(method)) {
      return res.status(400).json({
        message: "Metode pembayaran tidak valid",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (req.user.role === "CUSTOMER" && booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses ke booking ini",
      });
    }

    if (booking.status !== "APPROVED") {
      return res.status(400).json({
        message: "DP hanya bisa dibuat jika booking sudah APPROVED",
      });
    }

    const amount = new Prisma.Decimal(booking.totalPrice)
      .mul(0.3)
      .toDecimalPlaces(2);

    const existingPayment = await prisma.payment.findUnique({
      where: {
        bookingId_type: {
          bookingId,
          type: "DP",
        },
      },
    });

    if (existingPayment) {
      if (existingPayment.status === "PAID") {
        return res.status(400).json({
          message: "DP booking ini sudah dibayar",
        });
      }

      if (
        existingPayment.status === "PENDING" &&
        existingPayment.method !== method
      ) {
        return res.status(409).json({
          message: "Masih ada pembayaran DP yang menunggu konfirmasi",
          payment: existingPayment,
        });
      }

 if (existingPayment.status === "PENDING") {
   const payment =
     existingPayment.method === null
       ? await prisma.payment.update({
           where: { id: existingPayment.id },
           data: { method },
         })
       : existingPayment;

   if (payment.method !== method) {
     return res.status(409).json({
       message: "Metode pembayaran sudah dipilih untuk tagihan ini",
       payment,
     });
   }

   return res.status(200).json({
     message: "Tagihan pelunasan tersedia",
     payment,
   });
 }

      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          method,
          amount,
          status: "PENDING",
          gatewayReference: null,
          proofUrl: null,
          verifiedById: null,
          verifiedAt: null,
          paidAt: null,
        },
      });

      return res.status(200).json({
        message: "Tagihan DP berhasil dibuat ulang",
        payment,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        type: "DP",
        method,
        amount,
      },
    });

    return res.status(201).json({
      message: "Tagihan DP berhasil dibuat",
      payment,
    });
  } catch (error) {
    console.error("Create DP payment error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}

// Membuat pembayaran pelunasan
export async function createSettlementPayment(req, res) {
  try {
    const bookingId = Number(req.params.id);
    const { method } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        message: "ID booking tidak valid",
      });
    }

    if (!["QRIS", "TRANSFER", "CASH"].includes(method)) {
      return res.status(400).json({
        message: "Metode pembayaran tidak valid",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (req.user.role === "CUSTOMER" && booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses ke booking ini",
      });
    }

    if (booking.status !== "SELESAI") {
      return res.status(400).json({
        message: "Pelunasan hanya bisa dibuat setelah booking SELESAI",
      });
    }

    const dpPayment = await prisma.payment.findUnique({
      where: {
        bookingId_type: {
          bookingId,
          type: "DP",
        },
      },
    });

    if (!dpPayment || dpPayment.status !== "PAID") {
      return res.status(400).json({
        message: "DP harus lunas sebelum melakukan pelunasan",
      });
    }

    const amount = new Prisma.Decimal(booking.totalPrice)
      .minus(dpPayment.amount)
      .toDecimalPlaces(2);

    if (amount.lessThanOrEqualTo(0)) {
      return res.status(400).json({
        message: "Tidak ada sisa pembayaran",
      });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: {
        bookingId_type: {
          bookingId,
          type: "PELUNASAN",
        },
      },
    });

    if (existingPayment) {
      if (existingPayment.status === "PAID") {
        return res.status(400).json({
          message: "Pelunasan booking ini sudah dibayar",
        });
      }

      if (
        existingPayment.status === "PENDING" &&
        existingPayment.method !== method
      ) {
        return res.status(409).json({
          message: "Masih ada pelunasan yang menunggu konfirmasi",
          payment: existingPayment,
        });
      }

      if (existingPayment.status === "PENDING") {
        return res.status(200).json({
          message: "Tagihan pelunasan masih menunggu pembayaran",
          payment: existingPayment,
        });
      }

      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          method,
          amount,
          status: "PENDING",
          gatewayReference: null,
          proofUrl: null,
          verifiedById: null,
          verifiedAt: null,
          paidAt: null,
        },
      });

      return res.status(200).json({
        message: "Tagihan pelunasan berhasil dibuat ulang",
        payment,
      });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        type: "PELUNASAN",
        method,
        amount,
      },
    });

    return res.status(201).json({
      message: "Tagihan pelunasan berhasil dibuat",
      payment,
    });
  } catch (error) {
    console.error("Create settlement payment error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}

// Melihat riwayat pembayaran booking
export async function getBookingPayments(req, res) {
  try {
    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        message: "ID booking tidak valid",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking tidak ditemukan",
      });
    }

    if (req.user.role === "CUSTOMER" && booking.userId !== req.user.id) {
      return res.status(403).json({
        message: "Kamu tidak memiliki akses ke booking ini",
      });
    }

    const payments = await prisma.payment.findMany({
      where: { bookingId },
      include: {
        verifiedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      message: "Riwayat pembayaran berhasil diambil",
      payments,
    });
  } catch (error) {
    console.error("Get booking payments error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}

// Verifikasi pembayaran transfer atau tunai oleh Admin/Kasir
export async function verifyPayment(req, res) {
  try {
    const paymentId = Number(req.params.paymentId);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        message: "ID pembayaran tidak valid",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({
        message: "Pembayaran tidak ditemukan",
      });
    }

    if (payment.method === "QRIS") {
      return res.status(400).json({
        message: "Pembayaran QRIS harus dikonfirmasi melalui payment gateway",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        message: "Pembayaran ini bukan berstatus PENDING",
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAID",
        verifiedById: req.user.id,
        verifiedAt: new Date(),
        paidAt: new Date(),
      },
      include: {
        booking: true,
        verifiedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Pembayaran berhasil diverifikasi",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
    });
  }
}
