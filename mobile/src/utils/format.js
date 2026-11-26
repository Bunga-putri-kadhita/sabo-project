// Tanpa Intl supaya aman di semua perangkat (Hermes) dan tanggal tidak bergeser zona waktu.
const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
export const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const pad = (n) => String(n).padStart(2, "0");

// Harga dari backend berupa string Decimal, misalnya "600000.00"
export function rupiah(value) {
  const n = Math.round(Number(value) || 0);
  return "Rp " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const menit = (v) => `${Number(v) || 0} menit`;

// bookingDate dari backend = tanggal UTC tanpa jam, jadi dibaca dengan getUTC*
export function tanggal(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Alias agar screen yang memanggil tanggalID tetap memakai parser UTC yang sama
export const tanggalID = tanggal;

export function tanggalPendek(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]}`;
}

// Waktu lengkap (createdAt, paidAt) ditampilkan dalam WIB
function wib(iso) {
  return new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
}
export function waktuWIB(iso) {
  if (!iso) return "-";
  const d = wib(iso);
  return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} WIB`;
}
export function jamWIB(iso) {
  const d = wib(iso);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

// Tanggal lokal perangkat -> "YYYY-MM-DD" (format yang diminta backend)
export function toYMD(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const jamSekarang = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
