import prisma from "../config/database.js";

// Mengirim pesan pada booking

export async function sendMessage(req, res) {
  try {
    const bookingId = Number(req.params.bookingId);
    const { message } = req.body;

    // Validasi ID booking
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID booking tidak valid",
      });
    }

    // Validasi pesan
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pesan tidak boleh kosong",
      });
    }

    // Cari booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
      });
    }

    // Customer hanya boleh chat pada booking miliknya.
    // Admin boleh menangani chat semua booking.
    if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki akses ke booking ini",
      });
    }

    let targetReceiverId;

    if (req.user.role === "ADMIN") {
      // Jika pengirim Admin, penerima adalah pemilik booking
      targetReceiverId = booking.userId;
    } else {
      // Jika pengirim Customer, cari akun Admin otomatis
      const admin = await prisma.user.findFirst({
        where: {
          role: "ADMIN",
        },
        select: {
          id: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      if (!admin) {
        return res.status(503).json({
          success: false,
          message: "Admin belum tersedia",
        });
      }

      targetReceiverId = admin.id;
    }

    // Simpan pesan
    const chatMessage = await prisma.chatMessage.create({
      data: {
        bookingId,
        senderId: req.user.id,
        receiverId: targetReceiverId,
        message: message.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pesan berhasil dikirim",
      data: chatMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengirim pesan",
    });
  }
}

// Melihat riwayat chat pada booking
export async function getChatMessages(req, res) {
  try {
    const bookingId = Number(req.params.bookingId);

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

    if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki akses ke chat ini",
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Riwayat chat berhasil diambil",
      data: messages,
    });
  } catch (error) {
    console.error("Get chat messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil riwayat chat",
    });
  }
}
