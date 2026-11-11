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
