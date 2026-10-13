import prisma from "../config/database.js";

export async function createVehicle(req, res) {
  try {
    const { platNomor, merk, tipe, transmisi, tahun } = req.body;

    if (!platNomor || !merk || !tipe || !transmisi || !tahun) {
      return res.status(400).json({
        success: false,
        message: "Semua data kendaraan wajib diisi",
      });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        platNomor,
      },
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Nomor plat sudah terdaftar",
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        userId: req.user.id,
        platNomor,
        merk,
        tipe,
        transmisi,
        tahun: Number(tahun),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Kendaraan berhasil ditambahkan",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan kendaraan",
      error: error.message,
    });
  }
}

export async function getMyVehicles(req, res) {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kendaraan",
      error: error.message,
    });
  }
}

export async function getVehicleById(req, res) {
  try {
    const vehicleId = Number(req.params.id);

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: req.user.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kendaraan",
      error: error.message,
    });
  }
}

export async function updateVehicle(req, res) {
  try {
    const vehicleId = Number(req.params.id);

    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: req.user.id,
      },
    });

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan tidak ditemukan",
      });
    }

    const { platNomor, merk, tipe, transmisi, tahun } = req.body;

    if (!platNomor || !merk || !tipe || !transmisi || !tahun) {
      return res.status(400).json({
        success: false,
        message: "Semua data kendaraan wajib diisi",
      });
    }

    const duplicatePlate = await prisma.vehicle.findFirst({
      where: {
        platNomor,
        id: {
          not: vehicleId,
        },
      },
    });

    if (duplicatePlate) {
      return res.status(400).json({
        success: false,
        message: "Nomor plat sudah digunakan kendaraan lain",
      });
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        platNomor,
        merk,
        tipe,
        transmisi,
        tahun: Number(tahun),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Kendaraan berhasil diperbarui",
      data: vehicle,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui kendaraan",
      error: error.message,
    });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const vehicleId = Number(req.params.id);

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        userId: req.user.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Kendaraan tidak ditemukan",
      });
    }

    await prisma.vehicle.delete({
      where: {
        id: vehicleId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Kendaraan berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kendaraan",
      error: error.message,
    });
  }
}
