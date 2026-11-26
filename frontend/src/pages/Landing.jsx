import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Activity,
  ArrowRight,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  CloudCheck,
  Coffee,
  FileCheck2,
  Headphones,
  KeyRound,
  MapPin,
  Receipt,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  X,
} from "lucide-react";
import Logo from "../components/Logo";
import { formatRupiah } from "../utils/format";
import { INFO, KEUNGGULAN, LAYANAN, TAHAP } from "../data/landing";

gsap.registerPlugin(ScrollTrigger);

const rupiah = (n) => formatRupiah(n);

/* ───────── SECTION 2: LIVE TELEMETRY & STATUS PIT REAL-TIME ───────── */
function TelemetryConsole() {
  const [i, setI] = useState(0);
  const auto = useRef(true);
  const box = useRef(null);
  const t = TAHAP?.[i] || {
    code: "PROSES",
    label: "Laser Calib",
    aktor: "Master Technician",
    judul: "Porsche 911 GT3 Touring (992)",
    teks: "Penyelarasan sudut suspensi menggunakan Hunter HawkEye Elite 3D dengan kalibrasi torsi manufaktur.",
    chip: "DP 30% TERVERIFIKASI",
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = gsap.ticker.time;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0.25,
    });
    if (box.current) io.observe(box.current);
    const tick = () => {
      if (!auto.current || !visible || document.hidden) {
        last = gsap.ticker.time;
        return;
      }
      if (gsap.ticker.time - last < 4.2) return;
      last = gsap.ticker.time;
      setI((v) => (v + 1) % (TAHAP?.length || 4));
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

  const progressPct = Math.min(
    100,
    Math.round(((i + 1) / (TAHAP?.length || 4)) * 100),
  );

  return (
    <section
      id="live-telemetri"
      aria-labelledby="telemetri-h"
      className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:py-20"
    >
      <div
        ref={box}
        className="rounded-2xl border border-line bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] sm:p-8 lg:p-10"
      >
        {/* Header Bar */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.16em] text-amber-deep uppercase">
              <Activity size={14} className="text-amber" />
              <span>LIVE ATELIER TELEMETRY CONSOLE</span>
            </div>
            <h2
              id="telemetri-h"
              className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
            >
              Status Pit Real-Time & Eksekusi Pekerjaan
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Sistem SABO Telemetry Engine memantau setiap siklus torsi
              pengencangan, tekanan fluida rem, dan tahapan booking secara
              transparan.
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 self-start rounded-lg border border-line bg-ground px-3.5 py-2 md:self-auto">
            <span className="size-2.5 animate-pulse rounded-full bg-red-600" />
            <span className="font-mono text-[11px] font-semibold tracking-widest text-ink uppercase">
              REC • 60 FPS • PIT 03
            </span>
          </div>
        </div>

        {/* Grid: Dark Active Stall Card + Right Queue */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left: Dark Console */}
          <div className="flex flex-col justify-between gap-6 rounded-xl bg-night p-6 text-white shadow-md lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="block font-mono text-[11px] tracking-wider text-amber uppercase">
                  STALL ALOKASI #03 • {t.aktor || "HYDRAULIC FOUR-POST"}
                </span>
                <h3 className="mt-0.5 text-lg font-bold text-white sm:text-xl">
                  {t.judul}
                </h3>
              </div>
              <span className="rounded-md border border-white/15 bg-white/10 px-3 py-1 font-mono text-xs font-bold tracking-wider text-amber">
                B 1888 SAB
              </span>
            </div>

            {/* Interactive Stage Switcher (Synced with TAHAP) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-white/75 uppercase">
                  TAHAP PENGERJAAN: TAHAP {i + 1} DARI {TAHAP?.length || 4}
                </span>
                <span className="font-bold text-amber">
                  {progressPct}% SELESAI
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-amber transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Clickable Stage Tabs */}
              <div
                role="tablist"
                aria-label="Tahapan status servis"
                className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-4"
              >
                {(TAHAP || []).map((s, idx) => {
                  const active = idx === i;
                  const done = idx < i;
                  return (
                    <button
                      key={s.code}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => pick(idx)}
                      className={`rounded-lg border px-2.5 py-2 text-left font-mono text-[11px] transition-all ${
                        active
                          ? "border-amber bg-amber/20 font-semibold text-amber"
                          : done
                            ? "border-white/15 bg-white/5 text-amber"
                            : "border-white/10 bg-transparent text-white/55 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {idx + 1}. {s.label} {done ? "✓" : ""}
                    </button>
                  );
                })}
              </div>

              <p className="mt-1 text-xs leading-relaxed text-white/70">
                {t.teks}
              </p>
            </div>

            {/* Monospace Telemetry Gauges */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-white/10 bg-black/30 p-4">
              <div>
                <span className="block font-mono text-[10px] text-white/50 uppercase">
                  TORSI WHEEL NUT
                </span>
                <span className="mt-1 block font-mono text-base font-bold text-white sm:text-lg">
                  600 Nm
                </span>
                <span className="font-mono text-[10px] text-emerald-400">
                  PASSED ±0.5%
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-white/50 uppercase">
                  TEKANAN FLUIDA REM
                </span>
                <span className="mt-1 block font-mono text-base font-bold text-white sm:text-lg">
                  2.45 Bar
                </span>
                <span className="font-mono text-[10px] text-emerald-400">
                  VACUUM OK
                </span>
              </div>
              <div>
                <span className="block font-mono text-[10px] text-white/50 uppercase">
                  STATUS PEMBAYARAN
                </span>
                <span className="mt-1 block font-mono text-sm font-bold text-amber sm:text-base">
                  {t.chip || "DP 30% OK"}
                </span>
                <span className="font-mono text-[10px] text-amber">
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Lead Mechanic */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-amber/20 text-amber">
                  <Wrench size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Budi Santoso, S.T.
                  </p>
                  <p className="font-mono text-[11px] text-white/60">
                    Master Technician • 14 Thn Pengalaman
                  </p>
                </div>
              </div>
              <span className="rounded bg-white/10 px-2.5 py-1 font-mono text-[11px] text-amber">
                PIN: BNSP-A3-8821
              </span>
            </div>
          </div>

          {/* Right: Workshop Slot Queue & Claim CTA */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            <div className="flex flex-col gap-3 rounded-xl border border-line bg-ground p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-wider text-muted uppercase">
                  DAFTAR SLOT PIT HARI INI
                </span>
                <span className="font-mono text-[11px] font-bold text-amber-deep">
                  LIVE QUEUE
                </span>
              </div>

              {[
                {
                  bay: "01",
                  car: "BMW M3 Competition (G80)",
                  desc: "B 2038 WJZ • Kuras Rem Motul RBF 660",
                  status: "DISETUJUI",
                  badge: "bg-slate-200 text-slate-700",
                },
                {
                  bay: "02",
                  car: "Toyota Alphard 3.5 Lounge",
                  desc: "B 888 VIP • Perawatan Berkala 20.000 KM",
                  status: "DIPROSES",
                  badge: "bg-amber text-night",
                },
                {
                  bay: "04",
                  car: "Mercedes-AMG G63",
                  desc: "B 7777 ROY • Hunter Laser 3D Alignment",
                  status: "MENUNGGU",
                  badge: "bg-line text-muted",
                },
              ].map((item) => (
                <div
                  key={item.bay}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded bg-ground font-mono text-xs font-bold text-ink">
                      {item.bay}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {item.car}
                      </p>
                      <p className="font-mono text-[11px] text-muted">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded px-2 py-0.5 font-mono text-[10px] font-bold ${item.badge}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Direct Bay Reservation Box */}
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-line bg-ground p-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-base font-bold text-ink">
                  Ingin Mengamankan Pit 04?
                </p>
                <p className="text-xs text-muted">
                  Jadwal stall tersedia untuk sesi reservasi hari ini.
                </p>
              </div>
              <a
                href="#booking-concierge"
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-amber px-4 text-sm font-bold text-night transition-colors hover:bg-amber"
              >
                Klaim Slot Ini
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────── SECTION 3: KATALOG LAYANAN + SIMULATOR DP 30% INTERAKTIF ───────── */
function ServiceCatalogAndSimulator() {
  const [selectedIds, setSelectedIds] = useState(() => new Set([2]));

  const toggleService = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { total, menit } = useMemo(() => {
    const picked = (LAYANAN || []).filter((l) => selectedIds.has(l.id));
    return {
      total: picked.reduce((acc, l) => acc + l.harga, 0),
      menit: picked.reduce((acc, l) => acc + l.menit, 0),
    };
  }, [selectedIds]);

  const dp = Math.round(total * 0.3);

  const flagshipSuites = [
    {
      code: "SUITE 01 // PERIODIC MASTER",
      duration: "120 MENIT",
      title: "Grand Touring 20.000 KM Protocol",
      desc: "Program komprehensif kendaraan harian maupun GT. Pembersihan menyeluruh, penyeimbangan fluida teknis, dan diagnostik OBD-II.",
      price: 1250000,
      unit: "/ paket pengerjaan",
      featured: false,
      cta: "Reservasi Paket 01",
      features: [
        "48 Titik Inspeksi Laser & Undercarriage",
        "Kuras Sintetis Penuh & Penggantian Filter O.E.M",
        "Diagnostik Komputer ECU & Clearance Kode Error",
        "Pemeriksaan Kadar Air & Titik Didih Minyak Rem",
      ],
    },
    {
      code: "SUITE 02 // CHASSIS GEOMETRY",
      duration: "60 MENIT",
      title: "Chassis Calibration & 3D Laser Alignment",
      desc: "Penyelarasan sudut kemudi Camber, Caster, dan Toe menggunakan modul Hunter HawkEye Elite 3D berakurasi 0.01 derajat pabrikan.",
      price: 650000,
      unit: "/ 4 roda kalibrasi",
      featured: true,
      cta: "Reservasi Paket 02 (Unggulan)",
      features: [
        "Kalibrasi Sudut Kemudi Laser Komputer Hunter 3D",
        "High-Speed Dynamic Wheel Balancing 4 Roda",
        "Inspeksi Keausan Bushing Uretan & Ball Joint",
        "Pemeriksaan Tekanan Nitrogen & Runout Velg",
      ],
    },
    {
      code: "SUITE 03 // ENGINE RESTORATION",
      duration: "75 MENIT",
      title: "Master Engine Tune & Intake De-Carbon",
      desc: "Mengembalikan respons pedal gas spontan dan efisiensi ruang bakar optimal tanpa membongkar blok mesin.",
      price: 850000,
      unit: "/ mesin 4-6 silinder",
      featured: false,
      cta: "Reservasi Paket 03",
      features: [
        "Gurah Ruang Bakar Hidrogen HHO Tanpa Residu Kimia",
        "Dekarbonisasi Injektor Bensin Ultrasonik Presisi",
        "Pembersihan Throttle Body & Kalibrasi IACV Valve",
        "Reset Adaptasi ECU & Pengukuran Suhu Gas Buang",
      ],
    },
  ];

  return (
    <section
      id="layanan-eksklusif"
      aria-labelledby="katalog-h"
      className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:py-20"
    >
      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] text-amber-deep uppercase">
          <Sparkles size={14} className="text-amber" />
          <span>KATALOG LAYANAN MAHAKARYA</span>
        </div>
        <h2
          id="katalog-h"
          className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl"
        >
          Paket Perawatan Spesifikasi Tinggi
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Dirancang dengan metodologi pengerjaan manufaktur motorsport. Setiap
          parameter fluida, sudut suspensi, dan kompresi mesin diukur dengan
          sensor berkalibrasi resmi.
        </p>
      </div>

      {/* 3 Flagship Suites */}
      <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
        {flagshipSuites.map((suite) => (
          <div
            key={suite.code}
            className={`relative flex flex-col justify-between gap-7 rounded-2xl p-6 transition-all duration-300 sm:p-7 ${
              suite.featured
                ? "bg-night text-white shadow-2xl ring-1 ring-amber/40"
                : "border border-line bg-white text-ink shadow-sm hover:shadow-md"
            }`}
          >
            {suite.featured && (
              <div className="absolute -top-3 right-6 rounded bg-amber px-3 py-1 font-mono text-[10px] font-bold tracking-wider text-night uppercase">
                PILIHAN UTAMA ENTHUSIAST
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-mono text-[11px] font-semibold tracking-wider uppercase ${
                    suite.featured ? "text-amber" : "text-amber-deep"
                  }`}
                >
                  {suite.code}
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                    suite.featured
                      ? "bg-white/15 text-white"
                      : "bg-ground text-ink"
                  }`}
                >
                  {suite.duration}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold leading-snug">
                  {suite.title}
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    suite.featured ? "text-white/75" : "text-muted"
                  }`}
                >
                  {suite.desc}
                </p>
              </div>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span
                  className={`font-mono text-xl font-bold ${
                    suite.featured ? "text-amber" : "text-amber-deep"
                  }`}
                >
                  {rupiah(suite.price)}
                </span>
                <span
                  className={`text-xs ${
                    suite.featured ? "text-white/60" : "text-muted"
                  }`}
                >
                  {suite.unit}
                </span>
              </div>

              <ul
                className={`flex flex-col gap-2.5 border-t pt-4 text-xs sm:text-sm ${
                  suite.featured ? "border-white/15" : "border-ground"
                }`}
              >
                {suite.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        suite.featured ? "text-amber" : "text-amber-deep"
                      }`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href="#booking-concierge"
              className={`inline-flex h-11 w-full items-center justify-center rounded-lg text-sm font-bold transition-all ${
                suite.featured
                  ? "bg-amber text-night hover:bg-amber"
                  : "bg-ground text-ink hover:bg-amber hover:text-night"
              }`}
            >
              {suite.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Interactive Transparent Cost & DP 30% Estimator (From LAYANAN data) */}
      {LAYANAN && LAYANAN.length > 0 && (
        <div
          id="estimasi-transparan"
          className="mt-12 rounded-2xl border border-line bg-ground p-6 sm:p-8"
        >
          <div className="mb-6 flex flex-col justify-between gap-2 md:flex-row md:items-end">
            <div>
              <span className="font-mono text-[11px] font-semibold tracking-[0.16em] text-amber-deep uppercase">
                SIMULATOR ESTIMASI TRANSPARAN & DP 30%
              </span>
              <h3 className="mt-1 text-xl font-bold text-ink sm:text-2xl">
                Pilih Item Layanan, Hitung DP Secara Instan
              </h3>
            </div>
            <p className="font-mono text-xs text-muted">
              DP 30% DIBAYAR SETELAH ADMIN MENYETUJUI SLOT
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-8">
              {LAYANAN.map((item) => {
                const active = selectedIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleService(item.id)}
                    className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      active
                        ? "border-amber bg-white shadow-sm ring-1 ring-amber"
                        : "border-line bg-white/70 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-ink">
                        {item.nama}
                      </span>
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded border ${
                          active
                            ? "border-amber bg-amber text-night"
                            : "border-slate-400/40"
                        }`}
                      >
                        {active && <Check size={13} strokeWidth={3} />}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">{item.ket}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-ground pt-2.5 font-mono text-xs">
                      <span className="text-muted">{item.menit} menit</span>
                      <span className="font-bold text-ink">
                        {rupiah(item.harga)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col justify-between rounded-xl bg-night p-6 text-white lg:col-span-4">
              <div>
                <span className="font-mono text-[11px] tracking-widest text-amber uppercase">
                  RINGKASAN ESTIMASI
                </span>
                <p className="mt-2 font-mono text-3xl font-bold text-white">
                  {rupiah(total)}
                </p>
                <p className="mt-1 font-mono text-xs text-white/60">
                  {menit > 0
                    ? `Estimasi durasi ± ${menit} menit`
                    : "Pilih minimal satu layanan"}
                </p>

                <dl className="mt-5 space-y-2.5 border-t border-white/15 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/75">DP saat disetujui (30%)</dt>
                    <dd className="font-mono font-bold text-amber">
                      {rupiah(dp)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/75">Pelunasan selesai</dt>
                    <dd className="font-mono text-white">
                      {rupiah(total - dp)}
                    </dd>
                  </div>
                </dl>
              </div>

              <a
                href={INFO?.unduhUrl || "#booking-concierge"}
                className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber px-4 text-sm font-bold text-night transition-colors hover:bg-amber"
              >
                Lanjut Booking Sekarang
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ───────── MAIN LANDING PAGE ───────── */
export default function Landing() {
  const root = useRef(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: "",
    plate: "",
    suite: "Suite 01 — Grand Touring 20k KM",
    date: "",
    phone: "",
  });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-in]", {
        y: 22,
        opacity: 0,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "all",
      });
      gsap.utils.toArray("[data-reveal]").forEach((el) =>
        gsap.from(el, {
          y: 26,
          opacity: 0,
          duration: 0.75,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }),
      );
    }, root);
    return () => ctx.revert();
  }, []);

  function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingModalOpen(true);
  }

  const codePillars = [
    {
      roman: "I. ZERO DELAY",
      title: "Nol Calo, Nol Menunggu Antrean",
      desc: "Slot pit stall hidrolik telah disterilkan dan didedikasikan secara presisi pada jam reservasi Anda. Masuk bengkel, kendaraan langsung terangkat di lift.",
      badge: "Ketepatan Waktu 99.4%",
      Icon: Clock,
    },
    {
      roman: "II. CLEAR PRICING",
      title: "Transparansi Moneter Absolut",
      desc: "Biaya jasa dan harga suku cadang disepakati di awal. Setiap baut dan mililiter pelumas tercantum resmi tanpa biaya tambahan terselubung di akhir servis.",
      badge: "Digital SPK Approval",
      Icon: Receipt,
    },
    {
      roman: "III. ATELIER LOUNGE",
      title: "Executive Viewing Sanctuary",
      desc: "Ruang tunggu privat ber-AC dengan kaca kedap suara menghadap langsung ke pit kerja. Dilengkapi espresso bar single-origin dan Wi-Fi 200 Mbps.",
      badge: "Workstation Nyaman",
      Icon: Coffee,
    },
    {
      roman: "IV. IMMUTABLE LOG",
      title: "Dokumen Riwayat Terproteksi",
      desc: "Semua catatan penggantian suku cadang dan toleransi mesin disimpan permanen di akun SABO Cloud Anda, menjaga integritas nilai jual kembali kendaraan.",
      badge: "Akses Portal Pemilik Seumur Hidup",
      Icon: CloudCheck,
    },
  ];

  const testimonials = [
    {
      initials: "HS",
      name: "Ir. Hartono Subagyo",
      car: "Pemilik BMW Seri 5 & Toyota LC300",
      quote:
        "“SABO memperlakukan mobil saya bukan sekadar sebagai barang servis, melainkan karya rekayasa mesin. Kunci momen torsinya terkalibrasi presisi, dan tidak ada lecet sekecil pun pada velg forged saya.”",
    },
    {
      initials: "VM",
      name: "Dr. Vania Melati, Sp.A",
      car: "Pemilik Audi Q7 Quattro 3.0 TFSI",
      quote:
        "“Sistem booking online mereka benar-benar tepat waktu. Saya tiba pukul 09:00, pit stall 02 sudah kosong dan mekanik langsung menyambut. Sambil menunggu, saya bisa meeting di lounge mereka yang sangat hening.”",
    },
    {
      initials: "RK",
      name: "Reza Kurniadi",
      car: "Enthusiast • Mercedes-AMG C63s",
      quote:
        "“Transparansi suku cadang lama yang dikembalikan lengkap dengan kemasan part aslinya adalah pembeda terbesar SABO. Jarang ada bengkel di Jakarta dengan disiplin etika setinggi ini.”",
    },
  ];

  return (
    <div
      ref={root}
      className="min-h-screen bg-ground text-ink antialiased selection:bg-amber selection:text-night"
    >
      {/* ═════════ STICKY TOP NAVBAR ═════════ */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-5">
            <Link to="/" aria-label="SABO, beranda">
              <Logo variant="light" size={32} />
            </Link>

            <div className="hidden items-center gap-2 border-l border-white/15 pl-4 xl:flex">
              <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="font-mono text-[11px] tracking-wider text-white/80 uppercase">
                PIT BAYS: 04 OPEN
              </span>
            </div>
          </div>

          <nav
            aria-label="Navigasi Utama"
            className="hidden items-center gap-6 text-sm lg:flex"
          >
            <a
              href="#layanan-eksklusif"
              className="text-white/75 transition-colors hover:text-white"
            >
              Layanan Eksklusif
            </a>
            <a
              href="#standar-presisi"
              className="text-white/75 transition-colors hover:text-white"
            >
              Standar Presisi
            </a>
            <a
              href="#live-telemetri"
              className="text-white/75 transition-colors hover:text-white"
            >
              Live Telemetri
            </a>
            <a
              href="#estimasi-transparan"
              className="text-white/75 transition-colors hover:text-white"
            >
              Estimasi Transparan
            </a>
            <a
              href="#testimoni"
              className="text-white/75 transition-colors hover:text-white"
            >
              Portofolio
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg border border-white/20 px-3.5 py-2 text-xs font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white sm:inline-flex"
            >
              Masuk Staf
            </Link>
            <a
              href="#booking-concierge"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-amber px-4 text-sm font-bold text-night shadow-sm transition-colors hover:bg-amber"
            >
              Reservasi VIP
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ═════════ SECTION 1: EDITORIAL HERO ═════════ */}
        <section className="relative overflow-hidden bg-night text-white">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-amber-deep/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/4 size-80 rounded-full bg-amber/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-20">
            {/* Top Operational Telemetry Strip */}
            <div
              data-in
              className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5"
            >
              <div className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber" />
                <span className="font-mono text-[11px] tracking-[0.18em] text-amber uppercase">
                  ATELIER PERAWATAN & REKAYASA PRESISI OTOMOTIF
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-white/60">
                <span>LAT: -6.2241° S</span>
                <span>•</span>
                <span>CALIBRATION PROTOCOL V4.2</span>
                <span>•</span>
                <span className="font-bold text-amber">
                  STATUS: OPERATIONAL 100%
                </span>
              </div>
            </div>

            {/* Hero Split Grid */}
            <div className="grid grid-cols-1 items-end gap-10 pb-12 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-8">
                <span
                  data-in
                  className="font-mono text-[11px] tracking-[0.25em] text-amber uppercase"
                >
                  STANDAR BENGKEL MASTER JAKARTA
                </span>
                <h1
                  data-in
                  className="max-w-3xl text-3xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl"
                >
                  Presisi Mutlak. Standar Tertinggi untuk Kendaraan Istimewa
                  Anda.
                </h1>
                <p
                  data-in
                  className="max-w-2xl pt-1 text-base leading-relaxed text-white/75 sm:text-lg"
                >
                  SABO mendefinisikan ulang standar pemeliharaan performa roda
                  empat di Indonesia. Alokasi slot pit hidrolik berjadwal tanpa
                  antre, transparansi telemetri mekanik berstandar master
                  manufaktur, dan garansi suku cadang orisinal tanpa kompromi.
                </p>

                {/* Action Buttons */}
                <div
                  data-in
                  className="flex flex-wrap items-center gap-3.5 pt-4"
                >
                  <a
                    href="#booking-concierge"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-amber px-6 text-sm font-bold text-night shadow-md transition-all hover:bg-amber"
                  >
                    <CalendarCheck size={18} />
                    <span>Reservasi Jadwal Stall VIP</span>
                  </a>
                  <a
                    href={INFO?.whatsappUrl || "tel:+622155998890"}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-5 text-sm font-medium text-white transition-all hover:bg-white/20"
                  >
                    <Headphones size={18} className="text-amber" />
                    <span>Konsultasi Master Advisor</span>
                  </a>
                  <div className="flex items-center gap-1.5 pl-1 font-mono text-[11px] text-white/60">
                    <ShieldCheck size={16} className="text-amber" />
                    <span>ISO 9001:2015 Terverifikasi</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Spec Card */}
              <div data-in className="lg:col-span-4">
                <div className="relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-1.5 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80"
                    alt="Atelier Bay SABO dengan Porsche di atas hydraulic lift"
                    className="h-64 w-full rounded-lg object-cover brightness-90 contrast-105"
                  />
                  <div className="absolute top-4 right-4 rounded bg-night/85 px-2.5 py-1 backdrop-blur">
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-amber">
                      BAY 03 // LIVE CAMERA FEED
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between rounded-lg bg-night/90 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="font-mono text-[10px] text-white/80">
                        SENSOR LASER: ACTIVE
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-amber">
                      0.00° TOLERANSI KALIBRASI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Column Telemetry Bar */}
            <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  num: "01 / KAPASITAS STALL",
                  badge: "LIVE",
                  badgeClass: "bg-emerald-950 text-emerald-300",
                  title: "6 Hydraulic Stalls",
                  desc: "4 Bay aktif beroperasi • 2 Bay disinfeksi & standby steril.",
                },
                {
                  num: "02 / KUALIFIKASI MEKANIK",
                  badge: "BNSP MASTER",
                  badgeClass: "bg-white/15 text-white/85",
                  title: "Teknisi Level A3 & EV",
                  desc: "Sertifikasi High-Voltage EV & spesialis mesin performa tinggi.",
                },
                {
                  num: "03 / AKURASI CHASSIS",
                  badge: "HUNTER 3D",
                  badgeClass: "bg-white/15 text-white/85",
                  title: "Toleransi 0.01° Digital",
                  desc: "Laser Optical Alignment System dengan presisi pabrikan Jerman.",
                },
                {
                  num: "04 / INTEGRITAS PART",
                  badge: "100% ASLI",
                  badgeClass: "bg-amber/20 text-amber",
                  title: "Garansi Suku Cadang",
                  desc: "Komponen lama dikembalikan fisik & tervalidasi via digital SPK.",
                },
              ].map((stat) => (
                <div key={stat.num} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-amber">
                      {stat.num}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold ${stat.badgeClass}`}
                    >
                      {stat.badge}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-white">{stat.title}</p>
                  <p className="text-xs leading-relaxed text-white/65">
                    {stat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════ SECTION 2: LIVE TELEMETRY & TRACKER ═════════ */}
        <div data-reveal>
          <TelemetryConsole />
        </div>

        {/* ═════════ SECTION 3: SIGNATURE PACKAGES & DP SIMULATOR ═════════ */}
        <div data-reveal>
          <ServiceCatalogAndSimulator />
        </div>

        {/* ═════════ SECTION 4: THE SABO CODE OF EXCELLENCE ═════════ */}
        <section
          id="standar-presisi"
          aria-labelledby="code-h"
          className="border-y border-line bg-ground py-16 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="mb-12 flex flex-col gap-2">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-amber-deep uppercase">
                <Shield size={14} className="text-amber" />
                <span>FILOSOFI & PROTOKOL TANPA KOMPROMI</span>
              </div>
              <h2
                id="code-h"
                className="text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              >
                The SABO Code of Excellence
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Standar operasional yang dirancang khusus untuk memastikan
                kendaraan bernilai tinggi Anda menerima dedikasi mekanis
                tertinggi tanpa distorsi komunikasi bengkel konvensional.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {codePillars.map(({ roman, title, desc, badge, Icon }, idx) => (
                <div
                  key={roman}
                  data-reveal
                  className="flex flex-col justify-between gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-3">
                    <span className="font-mono text-sm font-bold tracking-wider text-amber-deep">
                      {roman}
                    </span>
                    <h3 className="text-lg font-bold text-ink">
                      {KEUNGGULAN?.[idx]?.[0] || title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted">
                      {KEUNGGULAN?.[idx]?.[1] || desc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-amber-deep">
                    <Icon size={15} />
                    <span>{badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═════════ SECTION 5: TESTIMONIALS ═════════ */}
        <section
          id="testimoni"
          aria-labelledby="testimoni-h"
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24"
        >
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.18em] text-amber-deep uppercase">
                <FileCheck2 size={14} className="text-amber" />
                <span>BESPOKE OWNER ENDORSEMENTS</span>
              </div>
              <h2
                id="testimoni-h"
                className="mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl"
              >
                Kepercayaan Kolektor & Profesional
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-muted sm:text-sm">
              Divalidasi langsung oleh para pemilik mobil sport, luxury sedan,
              dan armada eksekutif yang menuntut presisi tanpa toleransi
              kesalahan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                data-reveal
                className="flex flex-col justify-between gap-6 rounded-2xl border border-line bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex gap-1 text-amber">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        size={14}
                        fill="var(--color-amber)"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed text-ink">
                    {t.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-ground pt-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-ground font-bold text-ink">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{t.name}</p>
                    <p className="font-mono text-[11px] text-muted">{t.car}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═════════ SECTION 6: CONCIERGE VIP BOOKING FORM ═════════ */}
        <section
          id="booking-concierge"
          className="mx-auto mb-20 max-w-7xl px-5 sm:px-8"
        >
          <div className="relative overflow-hidden rounded-3xl bg-night p-6 text-white shadow-2xl sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-20 -bottom-20 size-80 rounded-full bg-amber/20 blur-3xl" />

            <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
              <div className="flex flex-col gap-4 lg:col-span-6">
                <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.2em] text-amber uppercase">
                  <KeyRound size={14} />
                  <span>EXCLUSIVE CONCIERGE DISPATCH</span>
                </div>
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  Kendaraan Anda Berhak Mendapatkan Penanganan Terbaik.
                </h2>
                <p className="text-sm leading-relaxed text-white/75 sm:text-base">
                  Tentukan tanggal dan model kendaraan Anda sekarang. Tim
                  Concierge SABO akan memvalidasi kesiapan mekanik spesialis dan
                  spare part yang cocok sebelum Anda tiba di studio.
                </p>
                <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Check size={15} className="text-emerald-400" />
                    <span>Tanpa Uang Muka Hangus</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check size={15} className="text-emerald-400" />
                    <span>Layanan Antar-Jemput Towing Tertutup</span>
                  </div>
                </div>
              </div>

              {/* Interactive Booking Card */}
              <div className="rounded-2xl bg-ground p-6 text-ink shadow-lg lg:col-span-6">
                <form
                  onSubmit={handleBookingSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="car-brand"
                        className="font-mono text-[11px] font-semibold text-muted uppercase"
                      >
                        Merek & Seri Kendaraan
                      </label>
                      <select
                        id="car-brand"
                        required
                        value={formData.brand}
                        onChange={(e) =>
                          setFormData({ ...formData, brand: e.target.value })
                        }
                        className="h-10 rounded-lg border border-line bg-ground px-3 text-sm text-ink focus:border-amber focus:bg-white focus:outline-none"
                      >
                        <option value="" disabled>
                          Pilih Pabrikan...
                        </option>
                        <option value="Porsche">
                          Porsche (911 / Cayman / Macan)
                        </option>
                        <option value="BMW">
                          BMW (M Power / Seri 3, 5, 7)
                        </option>
                        <option value="Mercedes-Benz">
                          Mercedes-Benz (AMG / Saloon)
                        </option>
                        <option value="Audi">Audi (RS / Quattro Lineup)</option>
                        <option value="Toyota-Lexus">
                          Lexus / Toyota Alphard / LC300
                        </option>
                        <option value="Lainnya">Model Eksotis / Lainnya</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="plate-no"
                        className="font-mono text-[11px] font-semibold text-muted uppercase"
                      >
                        Nomor Polisi (Plat)
                      </label>
                      <input
                        id="plate-no"
                        type="text"
                        required
                        placeholder="Contoh: B 1234 SAB"
                        value={formData.plate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plate: e.target.value.toUpperCase(),
                          })
                        }
                        className="h-10 rounded-lg border border-line bg-ground px-3 font-mono text-sm uppercase text-ink focus:border-amber focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="service-type"
                        className="font-mono text-[11px] font-semibold text-muted uppercase"
                      >
                        Kebutuhan Pengerjaan
                      </label>
                      <select
                        id="service-type"
                        required
                        value={formData.suite}
                        onChange={(e) =>
                          setFormData({ ...formData, suite: e.target.value })
                        }
                        className="h-10 rounded-lg border border-line bg-ground px-3 text-sm text-ink focus:border-amber focus:bg-white focus:outline-none"
                      >
                        <option value="Suite 01 — Grand Touring 20k KM">
                          Suite 01 — Grand Touring 20k KM
                        </option>
                        <option value="Suite 02 — Laser 3D Alignment">
                          Suite 02 — Laser 3D Alignment
                        </option>
                        <option value="Suite 03 — Engine Tune & De-Carbon">
                          Suite 03 — Engine Tune & De-Carbon
                        </option>
                        <option value="Inspeksi Khusus / Keluhan Suara">
                          Inspeksi Khusus / Keluhan Suara
                        </option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="booking-date"
                        className="font-mono text-[11px] font-semibold text-muted uppercase"
                      >
                        Tanggal Kunjungan
                      </label>
                      <input
                        id="booking-date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="h-10 rounded-lg border border-line bg-ground px-3 text-sm text-ink focus:border-amber focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="phone-no"
                      className="font-mono text-[11px] font-semibold text-muted uppercase"
                    >
                      Nomor WhatsApp Pemilik
                    </label>
                    <input
                      id="phone-no"
                      type="tel"
                      required
                      placeholder="+62 812-XXXX-XXXX"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="h-10 rounded-lg border border-line bg-ground px-3 text-sm text-ink focus:border-amber focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber text-sm font-bold text-night shadow-md transition-all hover:bg-amber"
                  >
                    <Calendar size={18} />
                    <span>Konfirmasi Slot Pit Eksklusif</span>
                  </button>

                  <p className="text-center font-mono text-[11px] text-muted">
                    Slot pit Anda akan dikunci selama 30 menit begitu verifikasi
                    WhatsApp terkirim.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═════════ FOOTER ═════════ */}
      <footer className="border-t border-white/10 bg-night text-white">
        <div className="mx-auto max-w-7xl px-5 pt-14 pb-8 sm:px-8">
          <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-4">
              <Logo variant="light" size={30} />
              <p className="max-w-sm text-xs leading-relaxed text-white/70">
                {INFO?.nama || "Smart Auto Booking Online"} — Studio presisi
                mekanis untuk pemilik kendaraan performa tinggi dan eksotis di
                Indonesia. Standar pengerjaan tersertifikasi ISO 9001:2015 & ISO
                14001.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded border border-white/20 px-2 py-1 font-mono text-[10px] text-amber">
                  ISO 9001:2015
                </span>
                <span className="rounded border border-white/20 px-2 py-1 font-mono text-[10px] text-amber">
                  TÜV SÜD CERTIFIED
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:col-span-3">
              <span className="font-mono text-[11px] tracking-wider text-amber uppercase">
                Koordinat Bengkel & Studio
              </span>
              <p className="text-xs leading-relaxed text-white/80">
                {INFO?.alamat ||
                  "SCBD Automotive Enclave, Lot 14, Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan"}
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-xs text-white/60">
                <MapPin size={14} className="text-amber" />
                <span>Valet Service & Enclosed Towing Available</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:col-span-3">
              <span className="font-mono text-[11px] tracking-wider text-amber uppercase">
                Concierge Hotline & Jam Operasional
              </span>
              <p className="text-xs leading-relaxed text-white/80">
                <span className="font-semibold text-amber">Telepon:</span>{" "}
                {INFO?.telepon || "+62 21 5599 8890"}
                <br />
                <span className="font-semibold text-amber">Email:</span>{" "}
                atelier@sabo-precision.id
              </p>
              <p className="pt-1 font-mono text-[11px] text-white/60">
                {INFO?.jam || "SENIN – SABTU: 07:30 – 19:30 WIB"}
              </p>
            </div>

            <div className="flex flex-col gap-2 lg:col-span-2">
              <span className="font-mono text-[11px] tracking-wider text-amber uppercase">
                Navigasi Cepat
              </span>
              <ul className="flex flex-col gap-1.5 text-xs text-white/70">
                <li>
                  <a href="#layanan-eksklusif" className="hover:text-white">
                    Layanan Master
                  </a>
                </li>
                <li>
                  <a href="#live-telemetri" className="hover:text-white">
                    Status Pit Stall
                  </a>
                </li>
                <li>
                  <a href="#estimasi-transparan" className="hover:text-white">
                    Kalkulator Biaya
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white">
                    Portal Login Staf
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <p className="font-mono text-[11px] text-white/50">
              © 2026 PT SABO PRESISI OTOMOTIF INDONESIA. HAK CIPTA DILINDUNGI.
            </p>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <a href="#standar-presisi" className="hover:text-white">
                Protokol Bengkel
              </a>
              <span>•</span>
              <Link to="/login" className="hover:text-white">
                Masuk Staf
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═════════ CONFIRMATION MODAL ═════════ */}
      {bookingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-ground p-6 text-ink shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-10 place-items-center rounded-xl bg-amber text-night">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-wider text-amber-deep uppercase">
                    RESERVASI TERKUNCI 30 MENIT
                  </span>
                  <h3 className="text-lg font-bold">
                    Slot Pit VIP Dikonfirmasi
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="rounded-lg p-1 text-muted hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-line bg-white p-4 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted">UNIT:</span>
                <span className="font-bold">{formData.brand || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">PLAT NOMOR:</span>
                <span className="font-bold">{formData.plate || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">PAKET:</span>
                <span className="font-bold">{formData.suite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">TANGGAL:</span>
                <span className="font-bold">{formData.date || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">WHATSAPP:</span>
                <span className="font-bold">{formData.phone || "-"}</span>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              Concierge SABO telah mengirimkan detail SPK digital ke WhatsApp
              Anda. Silakan masuk atau unduh aplikasi SABO untuk memantau live
              telemetri kendaraan.
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="h-11 flex-1 rounded-lg bg-night text-sm font-bold text-white hover:bg-black"
              >
                Selesai
              </button>
              {INFO?.unduhUrl && (
                <a
                  href={INFO.unduhUrl}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-amber text-sm font-bold text-night hover:bg-amber"
                >
                  Buka Aplikasi
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
