import api from "./client";

export const authApi = {
  login: async (email, password) =>
    (await api.post("/auth/login", { email, password })).data.data,
  register: async (body) => (await api.post("/auth/register", body)).data.data,
  me: async () => (await api.get("/auth/me")).data.data,
};
