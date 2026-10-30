// Ambil pesan error yang ramah dari respons Axios
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.request) {
    return "Backend tidak terjangkau. Pastikan server sedang berjalan.";
  }
  return "Terjadi kesalahan. Silakan coba lagi.";
}
