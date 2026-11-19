import api from "./api";

// Layanan: GET boleh semua role login; POST/PUT/DELETE hanya ADMIN (aturan backend).
export const serviceApi = {
  list: async () => (await api.get("/services")).data.data,
  create: async (body) => (await api.post("/services", body)).data.data,
  update: async (id, body) =>
    (await api.put(`/services/${id}`, body)).data.data,
  remove: async (id) => (await api.delete(`/services/${id}`)).data,
};

// Mekanik: sama. PUT selalu butuh namaMekanik, jadi kirim data lengkap.
export const mechanicApi = {
  list: async () => (await api.get("/mechanics")).data.data,
  create: async (body) => (await api.post("/mechanics", body)).data.data,
  update: async (id, body) =>
    (await api.put(`/mechanics/${id}`, body)).data.data,
  remove: async (id) => (await api.delete(`/mechanics/${id}`)).data,
};

// Booking (ADMIN). Respons assign dan status tidak menyertakan data pelanggan, jadi gabungkan dengan data lama.
export const bookingApi = {
  list: async () => (await api.get("/bookings")).data.data,
  get: async (id) => (await api.get(`/bookings/${id}`)).data.data,
  assignMechanic: async (id, mechanicId) =>
    (await api.patch(`/bookings/${id}/assign-mechanic`, { mechanicId })).data
      .data,
  setStatus: async (id, status) =>
    (await api.patch(`/bookings/${id}/status`, { status })).data.data,
};

// Pembayaran: respons memakai kunci "payments" (bukan "data"), sesuai backend
export const paymentApi = {
  listByBooking: async (bookingId) =>
    (await api.get(`/bookings/${bookingId}/payments`)).data.payments ?? [],
  // ADMIN dan KASIR. QRIS ditolak backend (harus lewat payment gateway).
  verify: async (paymentId) =>
    (await api.patch(`/payments/${paymentId}/verify`)).data.payment,
};
export const chatApi = {
  list: async (bookingId) =>
    (await api.get(`/chat/${bookingId}`)).data.data ?? [],
  send: async (bookingId, message) =>
    (await api.post(`/chat/${bookingId}`, { message })).data.data,
};
