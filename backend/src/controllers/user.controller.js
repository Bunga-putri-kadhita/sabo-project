import prisma from "../config/database.js";

// Mengambil daftar Admin untuk kebutuhan Chat
export async function getAdminList(req, res) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Daftar admin berhasil diambil",
      data: admins,
    });
  } catch (error) {
    console.error("Get admin list error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar admin",
    });
  }
}
