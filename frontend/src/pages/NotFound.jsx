import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { homeByRole } from "../utils/roles";

export default function NotFound() {
  const { user } = useAuth();
  const home = user ? homeByRole(user.role) : "/";
  return (
    <div className="grid min-h-svh grid-rows-[auto_1fr] bg-night text-white">
      <header className="px-5 py-5 sm:px-10">
        <Link to="/" aria-label="SABO, beranda">
          <Logo variant="light" />
        </Link>
      </header>
      <main
        id="utama"
        className="mx-auto flex w-full max-w-7xl flex-col justify-center px-5 pb-20 sm:px-10"
      >
        <p className="font-mono text-xs tracking-[0.18em] text-amber">
          KODE 404
        </p>
        <h1 className="font-display mt-3 text-[clamp(7rem,28vw,20rem)] leading-[0.8] font-extrabold text-amber">
          404
        </h1>
        <p className="font-display mt-6 text-[clamp(2rem,5vw,3.4rem)] leading-[0.95] font-extrabold uppercase">
          Halaman ini tidak ditemukan.
        </p>
        <p className="mt-4 max-w-md text-lg text-slate-300">
          Alamatnya mungkin salah ketik, atau halamannya sudah dipindah.
        </p>
        <Link
          to={home}
          className="btn-primary mt-9 inline-flex w-fit items-center gap-2 rounded-lg px-7 py-4 text-base font-semibold"
        >
          <ArrowLeft size={18} aria-hidden="true" />{" "}
          {user ? "Kembali ke beranda panel" : "Kembali ke beranda"}
        </Link>
      </main>
    </div>
  );
}
