import api from "./client";

export const vehicleApi = {
  list: async () => (await api.get("/vehicles")).data.data ?? [],
  create: async (body) => (await api.post("/vehicles", body)).data.data,
  update: async (id, body) =>
    (await api.put(`/vehicles/${id}`, body)).data.data,
  remove: (id) => api.delete(`/vehicles/${id}`),
};
export const serviceApi = {
  list: async () => (await api.get("/services")).data.data ?? [],
};

export const bookingApi = {
  list: async () => (await api.get("/bookings")).data.data ?? [],
  get: async (id) => (await api.get(`/bookings/${id}`)).data.data,
  create: async (body) => (await api.post("/bookings", body)).data.data,
  update: async (id, body) =>
    (await api.put(`/bookings/${id}`, body)).data.data,
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// Respons pembayaran memakai kunci "payments" / "payment", bukan "data".
export const paymentApi = {
  list: async (bookingId) =>
    (await api.get(`/bookings/${bookingId}/payments`)).data.data ?? [],

  payDp: async (bookingId, method) =>
    (await api.post(`/bookings/${bookingId}/payments/dp`, { method })).data
      .data,

  paySettlement: async (bookingId, method) =>
    (await api.post(`/bookings/${bookingId}/payments/settlement`, { method }))
      .data.data,
};

export const chatApi = {
  list: async (bookingId) =>
    (await api.get(`/chat/${bookingId}`)).data.data ?? [],
  send: async (bookingId, message) =>
    (await api.post(`/chat/${bookingId}`, { message })).data.data,
};

export const reviewApi = {
  create: async (body) => (await api.post("/reviews", body)).data.data,
};
