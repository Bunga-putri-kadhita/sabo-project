// Web ini hanya untuk ADMIN dan KASIR. CUSTOMER memakai aplikasi mobile.
export const STAFF_ROLES = ["ADMIN", "KASIR"];

export function isStaff(role) {
  return STAFF_ROLES.includes(role);
}

// Halaman pertama setelah login, sesuai role
export function homeByRole(role) {
  if (role === "ADMIN") return "/admin";
  if (role === "KASIR") return "/kasir/payments";
  return "/login";
}
