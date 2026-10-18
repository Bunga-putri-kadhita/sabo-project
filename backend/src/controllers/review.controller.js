import prisma from "../config/database.js";

// Membuat review untuk booking yang sudah selesai
export async function createReview(req, res) {
  try {
    const bookingId = Number(req.body.bookingId);
    const { rating, comment } = req.body;

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID booking tidak valid",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating harus berupa angka 1 sampai 5",
      });
    }

    // Pastikan booking milik customer yang login
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.id,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
      });
    }

    if (booking.status !== "SELESAI") {
      return res.status(400).json({
        success: false,
        message: "Review hanya bisa diberikan untuk booking SELESAI",
      });
    }

    // Cegah review ganda untuk booking yang sama
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Booking ini sudah memiliki review",
      });
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        rating,
        comment: comment?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review berhasil dibuat",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal membuat review",
    });
  }
}

// Melihat review dari booking milik customer yang login
export async function getMyReviews(req, res) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          userId: req.user.id,
        },
      },
      include: {
        booking: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Review berhasil diambil",
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil review",
    });
  }
}
