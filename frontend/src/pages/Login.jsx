import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import { getErrorMessage } from "../utils/error";
import { homeByRole } from "../utils/roles";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Email tidak valid";
    if (!form.password) next.password = "Kata sandi wajib diisi";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const user = await login(form.email.trim(), form.password);
      navigate(homeByRole(user.role), { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Masuk Dashboard Bengkel"
      subtitle="Khusus Admin dan Kasir. Masuk untuk melanjutkan."
      nudge={form.email.length + form.password.length}
    >
      {apiError && (
        <div
          role="alert"
          className="mb-5 border-l-[3px] border-danger bg-red-50 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      <form data-in onSubmit={handleSubmit} className="space-y-6" noValidate>
        <TextField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="nama@email.com"
          autoComplete="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <TextField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Kata sandi"
          placeholder="Masukkan kata sandi"
          autoComplete="current-password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="rounded px-1 py-1 text-sm font-medium text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-amber"
            >
              {showPassword ? "Sembunyikan" : "Tampilkan"}
            </button>
          }
        />
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary flex w-full items-center justify-between rounded-lg px-5 py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>{submitting ? "Memproses..." : "Masuk"}</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
      </form>

      <p data-in className="mt-8 text-sm text-muted">
        Pelanggan? Gunakan aplikasi mobile SABO.
      </p>
    </AuthLayout>
  );
}
