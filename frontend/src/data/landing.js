// GANTI semua data bertanda PLACEHOLDER dengan data bengkel yang asli sebelum dipublikasikan.

export const INFO = {
  nama: "SABO Auto Care", // PLACEHOLDER
  alamat: "Jl. Contoh Raya No. 12, Kota Anda", // PLACEHOLDER
  jam: "Senin sampai Sabtu, 08.00 sampai 17.00", // PLACEHOLDER
  telepon: "0812 0000 0000", // PLACEHOLDER
  whatsappUrl: "#", // PLACEHOLDER: https://wa.me/62812xxxxxxx
  unduhUrl: "#", // PLACEHOLDER: tautan Play Store atau APK aplikasi customer
  petaUrl: "#", // PLACEHOLDER: tautan Google Maps
};

// Layanan CONTOH. Daftar dan harga asli diatur admin di menu Layanan dan tampil di aplikasi.
export const LAYANAN = [
  {
    id: 1,
    nama: "Servis berkala",
    ket: "Pemeriksaan menyeluruh sesuai jarak tempuh.",
    menit: 120,
    harga: 600000,
  },
  {
    id: 2,
    nama: "Ganti oli mesin",
    ket: "Oli dan filter diganti, level cairan lain dicek.",
    menit: 45,
    harga: 150000,
  },
  {
    id: 3,
    nama: "Rem dan kaki-kaki",
    ket: "Kampas, cakram, dan komponen kaki-kaki diperiksa.",
    menit: 90,
    harga: 220000,
  },
  {
    id: 4,
    nama: "Tune up",
    ket: "Pengapian dan sistem bahan bakar disetel ulang.",
    menit: 60,
    harga: 350000,
  },
  {
    id: 5,
    nama: "Servis AC",
    ket: "Pengecekan freon, filter kabin, dan kompresor.",
    menit: 75,
    harga: 480000,
  },
  {
    id: 6,
    nama: "Aki dan kelistrikan",
    ket: "Tes aki, alternator, dan lampu.",
    menit: 30,
    harga: 120000,
  },
];

// Empat status booking yang nyata di sistem.
export const TAHAP = [
  {
    code: "PENDING",
    label: "Menunggu",
    aktor: "Admin bengkel",
    judul: "Booking masuk, jadwal diperiksa.",
    teks: "Kamu memilih layanan, kendaraan, tanggal, dan jam dari aplikasi. Admin memeriksa jadwal sebelum menyetujui.",
    chip: "Belum ada pembayaran",
  },
  {
    code: "APPROVED",
    label: "Disetujui",
    aktor: "Admin bengkel",
    judul: "Mekanik ditugaskan, DP dibayar.",
    teks: "Admin menyetujui dan menugaskan satu mekanik. Kamu membayar DP 30% dari total biaya lewat aplikasi.",
    chip: "DP 30%",
  },
  {
    code: "DIPROSES",
    label: "Diproses",
    aktor: "Mekanik",
    judul: "Kendaraanmu sedang dikerjakan.",
    teks: "Pengerjaan dimulai setelah DP terverifikasi oleh kasir atau admin. Ada pertanyaan? Chat langsung dari booking itu.",
    chip: "DP terverifikasi",
  },
  {
    code: "SELESAI",
    label: "Selesai",
    aktor: "Kasir",
    judul: "Lunasi sisanya, kendaraan siap diambil.",
    teks: "Sisa 70% dilunasi. Pembayaran tunai atau transfer diverifikasi kasir, lalu kendaraan boleh dibawa pulang.",
    chip: "Sisa 70%",
  },
];

// Hanya fitur yang benar-benar ada di sistem.
export const KEUNGGULAN = [
  [
    "Jadwal yang kamu pilih sendiri",
    "Tanggal dan jam dipilih saat booking. Tidak perlu datang lalu menunggu antrean.",
  ],
  [
    "Satu mekanik, ditugaskan admin",
    "Setiap booking punya mekanik bertugas yang namanya terlihat di detail booking.",
  ],
  [
    "Biaya jelas sebelum berangkat",
    "Total dihitung dari layanan yang dipilih. DP 30% di depan, sisanya setelah selesai.",
  ],
  [
    "Chat per booking",
    "Tanya atau kabari bengkel dari booking yang sama. Riwayat percakapan tersimpan.",
  ],
];
