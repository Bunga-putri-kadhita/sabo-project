import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../layouts/AuthLayout";
import TextField from "../components/TextField";
import { getErrorMessage } from "../utils/error";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Nama lengkap wajib diisi";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = "Email tidak valid";
    if (form.phone && !/^[0-9+\-\s]{8,16}$/.test(form.phone)) {
      next.phone = "Nomor HP tidak valid";
    }
    if (form.password.length < 6)
      next.password = "Kata sandi minimal 6 karakter";
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Kata sandi tidak sama";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Daftar"
      subtitle="Buat akun untuk mulai booking servis kendaraanmu."
    >
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
          id="name"
          name="name"
          label="Nama lengkap"
          placeholder="Nama lengkap"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
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
          id="phone"
          name="phone"
          type="tel"
          label="No. HP (opsional)"
          placeholder="08123456789"
          autoComplete="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <TextField
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          label="Kata sandi"
          placeholder="Minimal 6 karakter"
          autoComplete="new-password"
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
        <TextField
          id="confirmPassword"
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          label="Konfirmasi kata sandi"
          placeholder="Ulangi kata sandi"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-base font-semibold text-slate-900 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{" "}
        <Link
          to="/login"
          className="font-semibold text-slate-900 underline decoration-amber-500 underline-offset-4"
        >
          Masuk
        </Link>
      </p>
    </AuthLayout>
  );
}
