import { Prisma } from "@prisma/client";
import prisma from "../config/database.js";

// Membuat pembayaran DP 30%
export async function createDpPayment(req, res) {
  try {
    const bookingId = Number(req.params.id);
    const { method } = req.body;
console.log("ID booking dari request:", req.params.id);

if (!Number.isInteger(bookingId) || bookingId <= 0) {
  return res.status(400).json({
    success: false,
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
       existingPayment.method !== null &&
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
  success: true,
  message: "Tagihan DP berhasil dibuat ulang",
  data: payment,
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
  success: true,
  message: "Tagihan DP berhasil dibuat",
  data: payment,
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
  success: false,
  message: "ID booking tidak valid",
});
    }

    if (!["QRIS", "TRANSFER", "CASH"].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Metode pembayaran tidak valid",
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
     return res.status(404).json({
       success: false,
       message: "Booking tidak ditemukan",
     });
    }

    if (req.user.role === "CUSTOMER" && booking.userId !== req.user.id) {
     return res.status(403).json({
       success: false,
       message: "Kamu tidak memiliki akses ke booking ini",
     });
    }

    if (booking.status !== "SELESAI") {
     return res.status(400).json({
       success: false,
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
       success: false,
       message: "DP harus lunas sebelum melakukan pelunasan",
     });
    }

    const amount = new Prisma.Decimal(booking.totalPrice)
      .minus(dpPayment.amount)
      .toDecimalPlaces(2);

    if (amount.lessThanOrEqualTo(0)) {
     return res.status(400).json({
       success: false,
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
         success: false,
         message: "Pelunasan booking ini sudah dibayar",
       });
      }

      if (
        existingPayment.status === "PENDING" &&
        existingPayment.method !== method
      ) {
        return res.status(409).json({
          success: false,
          message: "Masih ada pelunasan yang menunggu konfirmasi",
          data: existingPayment,
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

 return res.status(200).json({
   success: true,
   message: "Tagihan pelunasan tersedia",
   data: payment,
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
        success: true,
        message: "Tagihan pelunasan berhasil dibuat ulang",
        data: payment,
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
     success: true,
     message: "Tagihan pelunasan berhasil dibuat",
     data: payment,
   });
  } catch (error) {
    console.error("Create settlement payment error:", error);
   return res.status(500).json({
     success: false,
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
      success: false,
      message: "ID booking tidak valid",
    });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
      });
    }

    if (req.user.role === "CUSTOMER" && booking.userId !== req.user.id) {
     return res.status(403).json({
       success: false,
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
    success: true,
    message: "Riwayat pembayaran berhasil diambil",
    data: payments,
  });
  } catch (error) {
    console.error("Get booking payments error:", error);
   return res.status(500).json({
     success: false,
     message: "Terjadi kesalahan pada server",
   });
  }
}

// Verifikasi pembayaran QRIS, transfer, atau tunai oleh Admin/Kasir
export async function verifyPayment(req, res) {
  try {
    const paymentId = Number(req.params.paymentId);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran tidak valid",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Pembayaran tidak ditemukan",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Pembayaran ini bukan berstatus PENDING",
      });
    }

    // QRIS dan transfer harus diperiksa manual melalui aplikasi bank
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
      success: true,
      message: "Pembayaran berhasil diverifikasi",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Verify payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memverifikasi pembayaran",
    });
  }
}



export async function getAllPayments(req, res) {
  try {
    const { status, type } = req.query;

    const allowedStatuses = ["PENDING", "PAID", "FAILED", "EXPIRED"];
    const allowedTypes = ["DP", "PELUNASAN"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Filter status pembayaran tidak valid",
      });
    }

    if (type && !allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Filter jenis pembayaran tidak valid",
      });
    }

    const payments = await prisma.payment.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      include: {
        booking: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            vehicle: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Daftar pembayaran berhasil diambil",
      data: payments,
    });
  } catch (error) {
    console.error("Get all payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pembayaran",
    });
  }
}


export async function rejectPayment(req, res) {
  try {
    const paymentId = Number(req.params.paymentId);
    const { reason } = req.body;

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran tidak valid",
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Alasan penolakan wajib diisi",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Pembayaran tidak ditemukan",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Hanya pembayaran PENDING yang bisa ditolak",
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "FAILED",
        rejectionReason: reason.trim(),
        verifiedById: req.user.id,
        verifiedAt: new Date(),
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
      success: true,
      message: "Pembayaran berhasil ditolak",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Reject payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menolak pembayaran",
    });
  }
}


export async function uploadPaymentProof(req, res) {
  try {
    const paymentId = Number(req.params.paymentId);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID pembayaran tidak valid",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Bukti pembayaran wajib diunggah",
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Pembayaran tidak ditemukan",
      });
    }

    if (
      req.user.role === "CUSTOMER" &&
      payment.booking.userId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki akses ke pembayaran ini",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Bukti hanya bisa diunggah untuk pembayaran PENDING",
      });
    }

    const proofUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { proofUrl },
    });

    return res.status(200).json({
      success: true,
      message: "Bukti pembayaran berhasil diunggah",
      data: updatedPayment,
    });
  } catch (error) {
    console.error("Upload payment proof error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengunggah bukti pembayaran",
    });
  }
}
