import crypto from "node:crypto";
import prisma from "../config/database.js";

// ==================================================
// 1. CREATE BOOKING
// Membuat booking baru beserta detail layanan yang dipilih
// ==================================================
export async function createBooking(req, res) {
  try {
    // Ambil data dari request body
    const { vehicleId, serviceIds, bookingDate, bookingTime } = req.body;

    // ----------------------------------------------
    // A. Validasi ID kendaraan
    // ----------------------------------------------
    const parsedVehicleId = Number(vehicleId);

    if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID kendaraan tidak valid",
      });
    }

    // ----------------------------------------------
    // B. Validasi daftar layanan
    // Pastikan minimal satu layanan dipilih
    // dan semua ID layanan berupa bilangan positif
    // ----------------------------------------------
    if (
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0 ||
      !serviceIds.every((id) => Number.isInteger(Number(id)) && Number(id) > 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pilih minimal satu layanan yang valid",
      });
    }

    // Ubah semua ID layanan menjadi angka
    const normalizedServiceIds = serviceIds.map(Number);

    // Cegah layanan yang sama dipilih lebih dari sekali
    if (new Set(normalizedServiceIds).size !== normalizedServiceIds.length) {
      return res.status(400).json({
        success: false,
        message: "Layanan tidak boleh dipilih dua kali",
      });
    }

    // ----------------------------------------------
    // C. Validasi format tanggal dan jam
    // Format tanggal: YYYY-MM-DD
    // Format jam: HH:mm
    // ----------------------------------------------
    if (
      typeof bookingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
      typeof bookingTime !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(bookingTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tanggal harus YYYY-MM-DD dan jam harus HH:mm",
      });
    }

    // Buat objek tanggal dalam format UTC
    const date = new Date(`${bookingDate}T00:00:00.000Z`);

    // Pastikan tanggal benar-benar valid,
    // misalnya tanggal 2026-02-30 harus ditolak
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Tanggal booking tidak valid",
      });
    }

    // ----------------------------------------------
    // D. Cegah booking pada tanggal yang sudah lewat
    // Gunakan tanggal lokal server agar perbandingan
    // tidak mencampur tanggal lokal dan tanggal UTC
    // ----------------------------------------------
    const sekarang = new Date();

    const tanggalHariIni =
      `${sekarang.getFullYear()}-` +
      `${String(sekarang.getMonth() + 1).padStart(2, "0")}-` +
      `${String(sekarang.getDate()).padStart(2, "0")}`;

    if (bookingDate < tanggalHariIni) {
      return res.status(400).json({
        success: false,
        message: "Tanggal booking tidak boleh di masa lalu",
      });
    }

    // ----------------------------------------------
    // E. Cegah booking pada jam yang sudah lewat hari ini
    // ----------------------------------------------
    const jamSekarang =
      `${String(sekarang.getHours()).padStart(2, "0")}:` +
      `${String(sekarang.getMinutes()).padStart(2, "0")}`;

    if (bookingDate === tanggalHariIni && bookingTime <= jamSekarang) {
      return res.status(400).json({
        success: false,
        message: "Jam booking harus lebih dari waktu sekarang",
      });
    }

    // ----------------------------------------------
    // F. Validasi kepemilikan kendaraan
    // Customer hanya boleh menggunakan kendaraannya sendiri
    // req.user.id berasal dari middleware autentikasi
    // ----------------------------------------------
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: parsedVehicleId,
        userId: req.user.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan tidak ditemukan atau bukan milik Anda",
      });
    }

    // ----------------------------------------------
    // G. Ambil data layanan dari database
    // Harga dan estimasi tidak boleh dipercaya dari client
    // ----------------------------------------------
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: normalizedServiceIds,
        },
      },
    });

    // Pastikan semua layanan yang diminta tersedia
    if (services.length !== normalizedServiceIds.length) {
      return res.status(400).json({
        success: false,
        message: "Ada layanan yang tidak ditemukan",
      });
    }

    // ----------------------------------------------
    // H. Hitung total harga dan durasi layanan
    // Harga diambil dari database, bukan request body
    // ----------------------------------------------
    const totalPrice = services.reduce(
      (total, service) => total + Number(service.harga),
      0,
    );

    const totalDuration = services.reduce(
      (total, service) => total + Number(service.estimasiMenit),
      0,
    );

    // ----------------------------------------------
    // I. Cek apakah tanggal dan jam sudah dipesan
    // Status aktif dianggap masih menggunakan slot
    // ----------------------------------------------
    const bookingBentrok = await prisma.booking.findFirst({
      where: {
        bookingDate: date,
        bookingTime: bookingTime,
        status: {
          in: ["PENDING", "APPROVED", "DIPROSES"],
        },
      },
    });

    // Jika ditemukan booking pada slot yang sama,
    // batalkan pembuatan booking baru
    if (bookingBentrok) {
      return res.status(409).json({
        success: false,
        message: "Jadwal tersebut sudah dipesan, silakan pilih jam lain",
      });
    }

    // ----------------------------------------------
    // J. Buat booking beserta detail layanan
    // Transaksi memastikan booking dan detailnya
    // dibuat bersama-sama
    // ----------------------------------------------
    const booking = await prisma.$transaction(async (tx) => {
      return tx.booking.create({
        data: {
          // Buat kode booking unik
          bookingCode: `SABO-${crypto
            .randomUUID()
            .replaceAll("-", "")
            .slice(0, 12)
            .toUpperCase()}`,

          // Ambil identitas customer dari token login
          userId: req.user.id,

          // Simpan kendaraan yang dipilih
          vehicleId: parsedVehicleId,

          // Simpan tanggal dan jam booking
          bookingDate: date,
          bookingTime: bookingTime,

          // Simpan total harga hasil perhitungan server
          totalPrice: totalPrice.toFixed(2),

          // Booking baru menunggu konfirmasi
          status: "PENDING",

          // Simpan semua layanan ke tabel BookingDetail
          bookingDetails: {
            create: services.map((service) => ({
              serviceId: service.id,
              price: service.harga,
            })),
          },
        },

        // Sertakan detail kendaraan dan layanan
        // pada respons hasil pembuatan booking
        include: {
          vehicle: true,
          bookingDetails: {
            include: {
              service: true,
            },
          },
        },
      });
    });

    // ----------------------------------------------
    // K. Respons jika booking berhasil dibuat
    // HTTP 201 berarti resource baru berhasil dibuat
    // ----------------------------------------------
    return res.status(201).json({
      success: true,
      message: "Booking berhasil dibuat",
      data: {
        ...booking,
        totalDuration,
      },
    });
  } catch (error) {
    // Catat detail error di terminal untuk debugging
    console.error("Create booking error:", error);

    // Kirim pesan umum kepada client
    return res.status(500).json({
      success: false,
      message: "Gagal membuat booking",
    });
  }
}

// ==================================================
// 2. GET MY BOOKINGS
// Menampilkan riwayat booking milik customer login
// ==================================================
export async function getMyBookings(req, res) {
  try {
    // Ambil booking yang dimiliki oleh customer saat ini
    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.id,
      },

      // Sertakan informasi kendaraan, mekanik,
      // dan detail layanan setiap booking
      include: {
        vehicle: true,
        mechanic: true,
        bookingDetails: {
          include: {
            service: true,
          },
        },
      },

      // Tampilkan booking terbaru terlebih dahulu
      orderBy: {
        createdAt: "desc",
      },
    });

    // Kirim riwayat booking
    return res.status(200).json({
      success: true,
      message: "Riwayat booking berhasil diambil",
      data: bookings,
    });
  } catch (error) {
    // Catat error untuk pemeriksaan di terminal
    console.error("Get my bookings error:", error);

    // Kirim respons error kepada client
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat booking",
    });
  }
}


export async function updateBookingStatus(req, res) {
  try {
    // Ambil ID booking dari URL
    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID booking tidak valid",
      });
    }

    // Ambil status baru dari request body
    const { status } = req.body;

    // Sesuaikan daftar ini dengan enum BookingStatus
    const allowedStatuses = ["PENDING", "APPROVED", "DIPROSES", "SELESAI"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status booking tidak valid",
      });
    }

    // Pastikan booking tersedia
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
      });
    }

    // Perbarui status booking
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        vehicle: true,
        bookingDetails: {
          include: { service: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Status booking berhasil diperbarui",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status booking",
    });
  }
}


export async function updateMyBooking(req, res) {
  try {
    // Validasi ID booking dari URL
    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID booking tidak valid",
      });
    }

    // Cari booking milik customer yang sedang login
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.id,
      },
      include: {
        bookingDetails: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking tidak ditemukan",
      });
    }

    // Customer hanya boleh mengedit booking PENDING
    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Hanya booking PENDING yang bisa diedit",
      });
    }

    // Ambil data yang ingin diperbarui
    const { vehicleId, serviceIds, bookingDate, bookingTime } = req.body;

    // Untuk versi ini, semua field wajib dikirim
    if (
      vehicleId === undefined ||
      serviceIds === undefined ||
      bookingDate === undefined ||
      bookingTime === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "vehicleId, serviceIds, bookingDate, dan bookingTime wajib diisi",
      });
    }

    // Validasi kendaraan milik customer
    const parsedVehicleId = Number(vehicleId);

    if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID kendaraan tidak valid",
      });
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: parsedVehicleId,
        userId: req.user.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan tidak ditemukan atau bukan milik Anda",
      });
    }

    // Validasi daftar layanan
    if (
      !Array.isArray(serviceIds) ||
      serviceIds.length === 0 ||
      !serviceIds.every((id) => Number.isInteger(Number(id)) && Number(id) > 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Pilih minimal satu layanan yang valid",
      });
    }

    const normalizedServiceIds = serviceIds.map(Number);

    if (new Set(normalizedServiceIds).size !== normalizedServiceIds.length) {
      return res.status(400).json({
        success: false,
        message: "Layanan tidak boleh dipilih dua kali",
      });
    }

    // Validasi format tanggal dan jam
    if (
      typeof bookingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
      typeof bookingTime !== "string" ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(bookingTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Format tanggal harus YYYY-MM-DD dan jam HH:mm",
      });
    }

    const date = new Date(`${bookingDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Tanggal booking tidak valid",
      });
    }

    // Tolak tanggal atau jam yang sudah lewat
    const now = new Date();

    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    if (
      bookingDate < today ||
      (bookingDate === today && bookingTime <= currentTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Tanggal dan jam booking harus di masa depan",
      });
    }

    // Ambil layanan terbaru dari database
    const services = await prisma.service.findMany({
      where: {
        id: { in: normalizedServiceIds },
      },
    });

    if (services.length !== normalizedServiceIds.length) {
      return res.status(400).json({
        success: false,
        message: "Ada layanan yang tidak ditemukan",
      });
    }

    // Cek bentrok jadwal, kecuali booking milik sendiri
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: bookingId },
        bookingDate: date,
        bookingTime,
        status: {
          in: ["PENDING", "APPROVED", "DIPROSES"],
        },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "Jadwal sudah dipesan, silakan pilih waktu lain",
      });
    }

    // Hitung ulang harga berdasarkan layanan terbaru
    const totalPrice = services.reduce(
      (sum, service) => sum + Number(service.harga),
      0,
    );

    const totalDuration = services.reduce(
      (sum, service) => sum + Number(service.estimasiMenit),
      0,
    );

    // Perbarui booking dan detail layanan dalam satu transaksi
    const updatedBooking = await prisma.$transaction(async (tx) => {
      await tx.bookingDetail.deleteMany({
        where: { bookingId },
      });

      return tx.booking.update({
        where: { id: bookingId },
        data: {
          vehicleId: parsedVehicleId,
          bookingDate: date,
          bookingTime,
          totalPrice: totalPrice.toFixed(2),
          bookingDetails: {
            create: services.map((service) => ({
              serviceId: service.id,
              price: service.harga,
            })),
          },
        },
        include: {
          vehicle: true,
          bookingDetails: {
            include: { service: true },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Booking berhasil diperbarui",
      data: {
        ...updatedBooking,
        totalDuration,
      },
    });
  } catch (error) {
    console.error("Update my booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui booking",
    });
  }
}


export async function cancelMyBooking(req, res) {
  try {
    // Validasi ID booking
    const bookingId = Number(req.params.id);

    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID booking tidak valid",
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

    // Hanya booking PENDING yang boleh dibatalkan customer
    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Hanya booking PENDING yang bisa dibatalkan",
      });
    }

    // Hapus booking; detailnya diharapkan ikut terhapus
    // berdasarkan relasi cascade pada schema Prisma
    await prisma.booking.delete({
      where: {
        id: bookingId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking berhasil dibatalkan",
    });
  } catch (error) {
    console.error("Cancel my booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal membatalkan booking",
    });
  }
}

// penugasan mechanic oleh admin

export async function assignMechanic(req, res) {
  try {
    const bookingId = Number(req.params.id);
    const mechanicId = Number(req.body.mechanicId);

    if (
      !Number.isInteger(bookingId) ||
      bookingId <= 0 ||
      !Number.isInteger(mechanicId) ||
      mechanicId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID booking atau ID mekanik tidak valid",
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

    if (booking.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Mekanik hanya bisa ditetapkan pada booking PENDING",
      });
    }

    const mechanic = await prisma.mechanic.findUnique({
      where: { id: mechanicId },
    });

    if (!mechanic || mechanic.statusAktif !== "AKTIF") {
      return res.status(400).json({
        success: false,
        message: "Mekanik tidak ditemukan atau tidak aktif",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        mechanicId: mechanicId,
        status: "APPROVED",
      },
      include: {
        vehicle: true,
        mechanic: true,
        bookingDetails: {
          include: { service: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Mekanik berhasil ditetapkan",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Assign mechanic error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menetapkan mekanik",
    });
  }
}
