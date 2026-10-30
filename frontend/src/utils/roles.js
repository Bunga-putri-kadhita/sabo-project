// CUSTOMER ke dashboard customer, ADMIN dan KASIR ke dashboard admin
export function homeByRole(role) {
  return role === "CUSTOMER" ? "/dashboard" : "/admin";
}
