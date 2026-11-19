const nf = new Intl.NumberFormat("id-ID");

// Harga dari backend berupa string Decimal, misalnya "600000.00"
export function formatRupiah(value) {
  return `Rp ${nf.format(Number(value) || 0)}`;
}

export function formatMenit(value) {
  return `${Number(value) || 0} menit`;
}

// bookingDate dari backend berupa tanggal tanpa jam (UTC), jadi diformat dengan zona UTC agar tidak bergeser hari
export function formatTanggal(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
// Waktu lengkap (createdAt, paidAt) ditampilkan dalam WIB
export function formatWaktu(iso) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }).format(new Date(iso)) + " WIB";
}