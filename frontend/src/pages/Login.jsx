import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import { getErrorMessage } from "../utils/error";
import { homeByRole } from "../utils/roles";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      title="Masuk"
      subtitle="Selamat datang kembali. Masuk untuk melanjutkan."
    >
      {location.state?.registered && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Pendaftaran berhasil, silakan masuk.
        </div>
      )}
      {apiError && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              {showPassword ? "Sembunyikan" : "Tampilkan"}
            </button>
          }
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-slate-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="font-semibold text-slate-900 underline decoration-amber-500 underline-offset-4"
        >
          Daftar
        </Link>
      </p>
    </AuthLayout>
  );
}
