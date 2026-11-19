import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Logo from "../components/Logo";
import GearDial from "../components/GearDial";
import { formatRupiah } from "../utils/format";
import { INFO, KEUNGGULAN, LAYANAN, TAHAP } from "../data/landing";

gsap.registerPlugin(ScrollTrigger);

const rupiah = (n) => formatRupiah(n);

/* ───────── Tracker: satu tiket booking melewati empat status ───────── */
function Tracker() {
  const [i, setI] = useState(0);
  const auto = useRef(true);
  const box = useRef(null);
  const t = TAHAP[i];

  // Berputar sendiri sampai pengunjung memilih sendiri. Satu clock: gsap.ticker.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = gsap.ticker.time;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0.3,
    });
    io.observe(box.current);
    const tick = () => {
      if (!auto.current || !visible || document.hidden) {
        last = gsap.ticker.time;
        return;
      }
      if (gsap.ticker.time - last < 3.8) return;
      last = gsap.ticker.time;
      setI((v) => (v + 1) % TAHAP.length);
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  function pick(n) {
    auto.current = false;
    setI(n);
  }

  return (
    <section
      id="alur"
      aria-labelledby="alur-h"
      className="mx-auto max-w-7xl px-5 py-20 sm:px-10 lg:py-28"
    >
      <p className="font-mono text-xs tracking-[0.18em] text-amber-deep">
        ALUR BOOKING
      </p>
      <h2
        id="alur-h"
        className="font-display mt-3 max-w-[14ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.9] font-extrabold uppercase"
      >
        Satu booking, empat status.
      </h2>

      <div
        ref={box}
        className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16"
      >
        {/* Pilihan status */}
        <div
          role="tablist"
          aria-label="Status booking"
          className="flex flex-col"
        >
          {TAHAP.map((s, n) => (
            <button
              key={s.code}
              role="tab"
              id={`tab-${s.code}`}
              aria-selected={n === i}
              aria-controls="tahap-panel"
              tabIndex={n === i ? 0 : -1}
              onClick={() => pick(n)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                  e.preventDefault();
                  pick((n + 1) % 4);
                  document
                    .getElementById(`tab-${TAHAP[(n + 1) % 4].code}`)
                    ?.focus();
                }
                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  pick((n + 3) % 4);
                  document
                    .getElementById(`tab-${TAHAP[(n + 3) % 4].code}`)
                    ?.focus();
                }
              }}
              className={`row group relative flex items-center gap-5 border-t border-line py-5 text-left transition-colors last:border-b ${n === i ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              <span
                className={`font-mono text-sm tnum ${n === i ? "text-amber-deep" : ""}`}
              >
                0{n + 1}
              </span>
              <span className="font-display text-[clamp(2rem,4vw,3rem)] leading-none font-extrabold uppercase">
                {s.label}
              </span>
              <span className="ml-auto hidden font-mono text-xs tracking-[0.14em] uppercase sm:block">
                {s.aktor}
              </span>
              <span
                aria-hidden="true"
                className="absolute right-0 bottom-0 left-0 h-[3px] origin-left bg-amber transition-transform duration-500"
                style={{
                  transform: `scaleX(${n === i ? 1 : 0})`,
                  transitionTimingFunction: "var(--ease-ratchet)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Tiket booking: contoh tampilan */}
        <div
          id="tahap-panel"
          role="tabpanel"
          aria-labelledby={`tab-${t.code}`}
          aria-live="polite"
          className="rounded-lg border border-line bg-card"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <p className="font-mono text-sm font-medium">BK-CONTOH-001</p>
            <span className="rounded-full bg-amber/15 px-3 py-1 font-mono text-xs text-amber-deep">
              Contoh tampilan
            </span>
          </div>
          <div className="px-6 py-7">
            <ol className="flex gap-1.5" aria-hidden="true">
              {TAHAP.map((s, n) => (
                <li key={s.code} className="h-1.5 flex-1 rounded-full bg-line">
                  <span
                    className="block h-full rounded-full bg-amber transition-[width] duration-500"
                    style={{ width: n <= i ? "100%" : "0%" }}
                  />
                </li>
              ))}
            </ol>
            <p className="font-display mt-8 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-[0.98] font-extrabold uppercase">
              {t.judul}
            </p>
            <p className="mt-4 text-lg text-muted">{t.teks}</p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 text-sm">
              <div>
                <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  Kendaraan
                </dt>
                <dd className="mt-1 font-medium">B 1234 ABC · Avanza</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  Jadwal
                </dt>
                <dd className="mt-1 font-medium">Besok · 09.00</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  Mekanik
                </dt>
                <dd className="mt-1 font-medium">
                  {i === 0 ? "Belum ditugaskan" : "Nama mekanik"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  Pembayaran
                </dt>
                <dd className="mt-1 font-medium">{t.chip}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── Simulasi biaya: pilih layanan, lihat DP ───────── */
function Simulasi() {
  const [sel, setSel] = useState(() => new Set([2]));
  const toggle = (id) =>
    setSel((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const { total, menit } = useMemo(() => {
    const picked = LAYANAN.filter((l) => sel.has(l.id));
    return {
      total: picked.reduce((a, l) => a + l.harga, 0),
      menit: picked.reduce((a, l) => a + l.menit, 0),
    };
  }, [sel]);
  const dp = Math.round(total * 0.3);

  return (
    <section
      id="layanan"
      aria-labelledby="layanan-h"
      className="bg-night text-white"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-10 lg:py-28">
        <h2
          id="layanan-h"
          className="font-display max-w-[15ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.9] font-extrabold uppercase"
        >
          Pilih layanan, lihat DP-nya.
        </h2>
        <p className="mt-5 max-w-xl text-lg text-slate-300">
          Simulasi untuk membayangkan biayanya. Layanan dan harga di bawah ini
          contoh. Harga asli tampil di aplikasi.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <ul className="grid gap-px overflow-hidden rounded-lg border border-slate-700 bg-slate-700 sm:grid-cols-2">
            {LAYANAN.map((l) => {
              const on = sel.has(l.id);
              return (
                <li key={l.id} className="bg-night">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(l.id)}
                    className={`group relative flex h-full w-full flex-col p-6 text-left transition-colors ${on ? "bg-night-2" : "hover:bg-night-2/60"}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-0 bottom-0 left-0 w-[3px] origin-top bg-amber transition-transform duration-300"
                      style={{ transform: `scaleY(${on ? 1 : 0})` }}
                    />
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-lg font-semibold">{l.nama}</span>
                      <span
                        aria-hidden="true"
                        className={`grid size-6 shrink-0 place-items-center rounded-md border transition-colors ${on ? "border-amber bg-amber text-night" : "border-slate-500"}`}
                      >
                        {on && <Check size={16} strokeWidth={3} />}
                      </span>
                    </span>
                    <span className="mt-2 text-slate-400">{l.ket}</span>
                    <span className="mt-6 flex items-end justify-between font-mono text-sm tnum">
                      <span className="text-slate-400">{l.menit} menit</span>
                      <span>{rupiah(l.harga)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <aside
            aria-label="Ringkasan biaya"
            className="self-start rounded-lg border border-slate-700 p-6 lg:sticky lg:top-8"
          >
            <p className="font-mono text-xs tracking-[0.14em] text-slate-400 uppercase">
              Total estimasi
            </p>
            <p className="mt-2 font-mono text-4xl tnum" aria-live="polite">
              {rupiah(total)}
            </p>
            <p className="mt-1 font-mono text-sm text-slate-400 tnum">
              {menit > 0
                ? `sekitar ${menit} menit pengerjaan`
                : "Pilih minimal satu layanan"}
            </p>
            <dl className="mt-6 space-y-3 border-t border-slate-700 pt-5">
              <div className="flex items-baseline justify-between">
                <dt>DP saat disetujui (30%)</dt>
                <dd className="font-mono text-lg text-amber tnum">
                  {rupiah(dp)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between text-slate-300">
                <dt>Pelunasan setelah selesai</dt>
                <dd className="font-mono tnum">{rupiah(total - dp)}</dd>
              </div>
            </dl>
            <a
              href={INFO.unduhUrl}
              className="btn-primary mt-7 flex items-center justify-center gap-2 rounded-lg px-6 py-4 text-base font-semibold"
            >
              Booking di aplikasi{" "}
              <ArrowRight size={18} className="arrow" aria-hidden="true" />
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  const root = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-in]", {
        y: 24,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "all",
      });
      gsap.from("[data-dial]", {
        rotation: -40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        transformOrigin: "50% 50%",
        clearProps: "all",
      });
      gsap.utils
        .toArray("[data-reveal]")
        .forEach((el) =>
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }),
        );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="min-h-svh bg-ground">
      <a href="#utama" className="skip-link">
        Lewati ke konten
      </a>

      <header className="bg-night text-white">
        <nav
          aria-label="Utama"
          className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-10"
        >
          <Link to="/" aria-label="SABO, beranda">
            <Logo variant="light" />
          </Link>
          <ul className="flex items-center gap-1 text-sm sm:gap-2">
            <li className="hidden md:block">
              <a
                href="#alur"
                className="rounded-lg px-3 py-2 text-slate-300 hover:text-white"
              >
                Alur booking
              </a>
            </li>
            <li className="hidden md:block">
              <a
                href="#layanan"
                className="rounded-lg px-3 py-2 text-slate-300 hover:text-white"
              >
                Layanan
              </a>
            </li>
            <li className="hidden md:block">
              <a
                href="#kontak"
                className="rounded-lg px-3 py-2 text-slate-300 hover:text-white"
              >
                Kontak
              </a>
            </li>
            <li>
              <Link
                to="/login"
                className="rounded-lg border border-slate-600 px-4 py-2.5 font-semibold transition-colors hover:border-amber hover:text-amber"
              >
                Masuk staf
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-8 pb-14 sm:px-10 lg:grid-cols-[1.25fr_1fr] lg:pb-20">
          <div>
            <p
              data-in
              className="font-mono text-xs tracking-[0.18em] text-amber"
            >
              SMART AUTO BOOKING ONLINE
            </p>
            <h1
              data-in
              className="font-display mt-4 max-w-[10ch] text-[clamp(3.6rem,10vw,8.5rem)] leading-[0.84] font-extrabold uppercase"
            >
              Servis tanpa antre.
            </h1>
            <p data-in className="mt-7 max-w-xl text-lg text-slate-300">
              Pesan jadwal dari ponsel, pantau status dari Menunggu sampai
              Selesai, dan chat langsung dengan bengkel.
            </p>
            <div data-in className="mt-9 flex flex-wrap gap-3">
              <a
                href={INFO.unduhUrl}
                className="btn-primary inline-flex items-center gap-2 rounded-lg px-7 py-4 text-base font-semibold"
              >
                Unduh aplikasi{" "}
                <ArrowRight size={18} className="arrow" aria-hidden="true" />
              </a>
              <a
                href="#alur"
                className="rounded-lg border border-slate-600 px-7 py-4 text-base font-semibold transition-colors hover:border-white"
              >
                Lihat alurnya
              </a>
            </div>
          </div>
          <div data-dial className="mx-auto w-full max-w-[min(26rem,72vw)]">
            <GearDial />
          </div>
        </div>

        <dl className="mx-auto grid max-w-7xl grid-cols-2 border-t border-slate-700 px-5 sm:px-10 md:grid-cols-4">
          {[
            ["DP di depan", "30%"],
            ["Status booking", "4 tahap"],
            ["Mekanik", "Ditugaskan admin"],
            ["Tanya bengkel", "Chat per booking"],
          ].map(([k, v], n) => (
            <div
              key={k}
              className={`py-5 ${n % 2 === 0 ? "pr-4" : "pl-4"} ${n > 0 ? "md:border-l md:border-slate-700 md:px-6" : "md:pr-6"} ${n > 1 ? "border-t border-slate-700 md:border-t-0" : ""}`}
            >
              <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-slate-400 uppercase">
                {k}
              </dt>
              <dd className="font-display mt-1 text-2xl font-extrabold uppercase">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <main id="utama">
        <div data-reveal>
          <Tracker />
        </div>
        <Simulasi />

        <section
          aria-labelledby="unggul-h"
          className="mx-auto max-w-7xl px-5 py-20 sm:px-10 lg:py-28"
        >
          <h2
            id="unggul-h"
            data-reveal
            className="font-display max-w-[14ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.9] font-extrabold uppercase"
          >
            Yang dijanjikan sistemnya.
          </h2>
          <ul className="mt-12 grid gap-x-16 md:grid-cols-2">
            {KEUNGGULAN.map(([judul, teks]) => (
              <li
                key={judul}
                data-reveal
                className="row border-t border-line py-7"
              >
                <h3 className="font-display text-3xl leading-none font-extrabold uppercase">
                  {judul}
                </h3>
                <p className="mt-3 max-w-md text-muted">{teks}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="kontak"
          aria-labelledby="kontak-h"
          className="border-t border-line bg-card"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:py-28">
            <div>
              <h2
                id="kontak-h"
                className="font-display max-w-[11ch] text-[clamp(2.6rem,6vw,5rem)] leading-[0.9] font-extrabold uppercase"
              >
                Datang ke bengkel.
              </h2>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={INFO.unduhUrl}
                  className="btn-primary inline-flex items-center gap-2 rounded-lg px-7 py-4 text-base font-semibold"
                >
                  Unduh aplikasi{" "}
                  <ArrowRight size={18} className="arrow" aria-hidden="true" />
                </a>
                <a
                  href={INFO.whatsappUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-7 py-4 text-base font-semibold transition-colors hover:border-night hover:bg-night hover:text-white"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Tanya lewat
                  WhatsApp
                </a>
              </div>
            </div>
            <dl className="space-y-7 self-center">
              {[
                [MapPin, "Alamat", INFO.alamat],
                [Clock, "Jam buka", INFO.jam],
                [Phone, "Telepon", INFO.telepon],
              ].map(([Icon, label, value]) => (
                <div key={label} className="border-t border-line pt-5">
                  <dt className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted uppercase">
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </dt>
                  <dd className="mt-2 text-xl">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="bg-night text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm sm:px-10">
          <Logo variant="light" size={28} />
          <p>{INFO.nama}. Smart Auto Booking Online.</p>
          <Link
            to="/login"
            className="underline decoration-slate-600 underline-offset-4 hover:text-white"
          >
            Masuk staf
          </Link>
        </div>
      </footer>
    </div>
  );
}
