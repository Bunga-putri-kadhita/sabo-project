import prisma from "../config/database.js";

// Mengirim pesan pada booking
export async function sendMessage(req, res) {
  try {
    const bookingId = Number(req.params.bookingId);
    const { message, receiverId } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID booking tidak valid",
      });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pesan tidak boleh kosong",
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

    // Customer hanya boleh chat pada booking miliknya.
    // Admin boleh menangani chat booking customer.
    if (req.user.role !== "ADMIN" && booking.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Kamu tidak memiliki akses ke booking ini",
      });
    }

    let targetReceiverId;

    if (req.user.role === "ADMIN") {
      targetReceiverId = Number(receiverId);

      if (targetReceiverId !== booking.userId) {
        return res.status(400).json({
          success: false,
          message: "Penerima harus pemilik booking",
        });
      }
    } else {
      // Pesan customer diarahkan ke admin.
      // Untuk sementara, gunakan ID admin dari request.
      targetReceiverId = Number(receiverId);

      const receiver = await prisma.user.findUnique({
        where: { id: targetReceiverId },
      });

      if (!receiver || receiver.role !== "ADMIN") {
        return res.status(400).json({
          success: false,
          message: "Penerima harus akun admin yang valid",
        });
      }
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        bookingId,
        senderId: req.user.id,
        receiverId: targetReceiverId,
        message: message.trim(),
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
