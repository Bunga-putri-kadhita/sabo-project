const nf = new Intl.NumberFormat("id-ID");

// Harga dari backend berupa string Decimal, misalnya "600000.00"
export function formatRupiah(value) {
  return `Rp ${nf.format(Number(value) || 0)}`;
}

export function formatMenit(value) {
  return `${Number(value) || 0} menit`;
}
