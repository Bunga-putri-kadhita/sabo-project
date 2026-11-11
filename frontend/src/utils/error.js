// Ambil pesan error yang ramah dari error Axios atau error biasa
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return "Backend tidak terjangkau. Pastikan server sedang berjalan.";
  }
  return error.message || "Terjadi kesalahan. Silakan coba lagi.";
}
