export const STATUS = {
  PENDING: {
    label: "Menunggu",
    fg: "#92400E",
    bg: "#FEF3C7",
    dot: "#F59E0B",
    hint: "Menunggu persetujuan bengkel.",
  },
  APPROVED: {
    label: "Disetujui",
    fg: "#1E40AF",
    bg: "#DBEAFE",
    dot: "#3B82F6",
    hint: "Booking disetujui. Bayar DP agar servis bisa dimulai.",
  },
  DIPROSES: {
    label: "Diproses",
    fg: "#5B21B6",
    bg: "#EDE9FE",
    dot: "#8B5CF6",
    hint: "Kendaraanmu sedang dikerjakan.",
  },
  SELESAI: {
    label: "Selesai",
    fg: "#065F46",
    bg: "#D1FAE5",
    dot: "#10B981",
    hint: "Servis selesai. Terima kasih!",
  },
};
export const ORDER = ["PENDING", "APPROVED", "DIPROSES", "SELESAI"];

export const PAY_STATUS = {
  PENDING: { label: "Menunggu verifikasi", fg: "#92400E", bg: "#FEF3C7" },
  PAID: { label: "Lunas", fg: "#065F46", bg: "#D1FAE5" },
  FAILED: { label: "Gagal", fg: "#B91C1C", bg: "#FEE2E2" },
  EXPIRED: { label: "Kedaluwarsa", fg: "#B91C1C", bg: "#FEE2E2" },
};

export const METODE = { QRIS: "QRIS", TRANSFER: "Transfer", CASH: "Tunai" };

// Langkah berikutnya untuk customer setelah memilih metode bayar.
export const PETUNJUK = {
  CASH: "Bayar tunai di kasir bengkel. Sebutkan ID booking di bawah, lalu kasir akan memverifikasi.",
  TRANSFER:
    "Lakukan transfer sesuai arahan kasir, lalu sebutkan ID booking di bawah agar kasir bisa memverifikasi.",
  QRIS: "Pembayaran QRIS dikonfirmasi otomatis oleh sistem setelah kamu membayar.",
};
