import prisma from "../config/database.js";

export async function getMechanics(req, res) {
  try {
    const mechanics = await prisma.mechanic.findMany({
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: mechanics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data mekanik",
    });
  }
}

export async function getMechanicById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID mekanik tidak valid",
      });
    }

    const mechanic = await prisma.mechanic.findUnique({
      where: { id },
    });

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mekanik tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: mechanic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail mekanik",
    });
  }
}

export async function createMechanic(req, res) {
  try {
    const { namaMekanik, noHp, statusAktif } = req.body;

    if (typeof namaMekanik !== "string" || !namaMekanik.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama mekanik wajib diisi",
      });
    }

    if (
      statusAktif !== undefined &&
      !["AKTIF", "TIDAK_AKTIF"].includes(statusAktif)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status mekanik tidak valid",
      });
    }

    const mechanic = await prisma.mechanic.create({
      data: {
        namaMekanik: namaMekanik.trim(),
        noHp: noHp?.trim() || null,
        statusAktif: statusAktif || "AKTIF",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Mekanik berhasil ditambahkan",
      data: mechanic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan mekanik",
    });
  }
}

export async function updateMechanic(req, res) {
  try {
    const id = Number(req.params.id);
    const { namaMekanik, noHp, statusAktif } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID mekanik tidak valid",
      });
    }

    const existing = await prisma.mechanic.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Mekanik tidak ditemukan",
      });
    }

    if (typeof namaMekanik !== "string" || !namaMekanik.trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama mekanik wajib diisi",
      });
    }

    if (
      statusAktif !== undefined &&
      !["AKTIF", "TIDAK_AKTIF"].includes(statusAktif)
    ) {
      return res.status(400).json({
        success: false,
        message: "Status mekanik tidak valid",
      });
    }

    const mechanic = await prisma.mechanic.update({
      where: { id },
      data: {
        namaMekanik: namaMekanik.trim(),
        noHp: noHp?.trim() || null,
        ...(statusAktif !== undefined && { statusAktif }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Data mekanik berhasil diperbarui",
      data: mechanic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui mekanik",
    });
  }
}

export async function deleteMechanic(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID mekanik tidak valid",
      });
    }

    const mechanic = await prisma.mechanic.findUnique({
      where: { id },
    });

    if (!mechanic) {
      return res.status(404).json({
        success: false,
        message: "Mekanik tidak ditemukan",
      });
    }

    // Mekanik yang pernah ditugaskan ke booking tidak dihapus.
    const hasBookings = await prisma.booking.findFirst({
      where: { mechanicId: id },
    });

    if (hasBookings) {
      return res.status(409).json({
        success: false,
        message:
          "Mekanik memiliki riwayat booking. Ubah statusnya menjadi TIDAK_AKTIF.",
      });
    }

    await prisma.mechanic.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Mekanik berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus mekanik",
    });
  }
}
