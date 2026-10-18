import prisma from "../config/database.js";

export async function getServices(req, res) {
  try {
    const services = await prisma.service.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data layanan",
    });
  }
}

export async function getServiceById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID layanan tidak valid",
      });
    }

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail layanan",
    });
  }
}

export async function createService(req, res) {
  try {
    const { namaLayanan, harga, estimasiMenit, deskripsi } = req.body;

    if (
      typeof namaLayanan !== "string" ||
      !namaLayanan.trim() ||
      harga === undefined ||
      !Number.isFinite(Number(harga)) ||
      Number(harga) < 0 ||
      !Number.isInteger(Number(estimasiMenit)) ||
      Number(estimasiMenit) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama, harga valid, dan estimasi menit positif wajib diisi",
      });
    }

    const service = await prisma.service.create({
      data: {
        namaLayanan: namaLayanan.trim(),
        harga: Number(harga),
        estimasiMenit: Number(estimasiMenit),
        deskripsi: deskripsi?.trim() || null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Layanan berhasil ditambahkan",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan layanan",
    });
  }
}

export async function updateService(req, res) {
  try {
    const id = Number(req.params.id);
    const { namaLayanan, harga, estimasiMenit, deskripsi } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID layanan tidak valid",
      });
    }

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan",
      });
    }

    if (
      typeof namaLayanan !== "string" ||
      !namaLayanan.trim() ||
      harga === undefined ||
      !Number.isFinite(Number(harga)) ||
      Number(harga) < 0 ||
      !Number.isInteger(Number(estimasiMenit)) ||
      Number(estimasiMenit) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Nama, harga valid, dan estimasi menit positif wajib diisi",
      });
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        namaLayanan: namaLayanan.trim(),
        harga: Number(harga),
        estimasiMenit: Number(estimasiMenit),
        deskripsi: deskripsi?.trim() || null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: service,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui layanan",
    });
  }
}

export async function deleteService(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID layanan tidak valid",
      });
    }

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan",
      });
    }

    // Jangan menghapus layanan yang sudah dipakai pada transaksi.
    const usedInBooking = await prisma.bookingDetail.findFirst({
      where: { serviceId: id },
    });

    if (usedInBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Layanan sudah digunakan dalam booking dan tidak dapat dihapus",
      });
    }

    await prisma.service.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Layanan berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus layanan",
    });
  }
}
