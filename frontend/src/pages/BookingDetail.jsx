import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { bookingApi, mechanicApi, paymentApi } from "../services/catalog";
import { getErrorMessage } from "../utils/error";
import { formatMenit, formatRupiah, formatTanggal } from "../utils/format";
import { ErrorState } from "../components/ui/Blocks";
import {
  BookingStatusPill,
  PlateChip,
  Stepper,
} from "../components/ui/BookingParts";
import { useToast } from "../components/ui/Toast";

function Section({ title, children }) {
  return (
    <section className="rounded-lg border border-line bg-card">
      <h2 className="border-b border-line px-6 py-4 font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">
        {title}
      </h2>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

const PAY_TYPE = { DP: "DP", PELUNASAN: "Pelunasan" };
const PAY_STATUS = {
  PAID: { label: "Lunas", cls: "bg-emerald-50 text-emerald-800" },
  PENDING: { label: "Menunggu", cls: "bg-amber/15 text-amber-deep" },
  FAILED: { label: "Gagal", cls: "bg-red-50 text-danger" },
  EXPIRED: { label: "Kedaluwarsa", cls: "bg-slate-100 text-slate-600" },
};

function Field({ label, children }) {
  return (
    <div>
      <dt className="font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 font-medium break-words">{children || "-"}</dd>
    </div>
  );
}

// Teks dan tombol aksi mengikuti alur backend: PENDING > APPROVED > DIPROSES > SELESAI
const NEXT = {
  APPROVED: {
    to: "DIPROSES",
    label: "Mulai proses",
    note: "Booking baru bisa diproses setelah DP lunas.",
  },
  DIPROSES: {
    to: "SELESAI",
    label: "Tandai selesai",
    note: "Tagihan pelunasan dibuat otomatis oleh sistem saat booking selesai.",
  },
};

export default function BookingDetail() {
  const { id } = useParams();
  const toast = useToast();
  const [state, setState] = useState({
    status: "loading",
    booking: null,
    error: "",
  });
  const [mechanics, setMechanics] = useState([]);
  const [mechanicId, setMechanicId] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    bookingApi
      .get(id)
      .then(
        (booking) => alive && setState({ status: "ready", booking, error: "" }),
      )
      .catch(
        (error) =>
          alive &&
          setState({
            status: "error",
            booking: null,
            error: getErrorMessage(error),
          }),
      );
    return () => {
      alive = false;
    };
  }, [id, reloadKey]);

  const status = state.booking?.status;

  // Daftar mekanik hanya dibutuhkan saat booking masih menunggu
  useEffect(() => {
    if (status !== "PENDING") return;
    let alive = true;
    mechanicApi
      .list()
      .then(
        (items) =>
          alive && setMechanics(items.filter((m) => m.statusAktif === "AKTIF")),
      )
      .catch((error) => alive && setActionError(getErrorMessage(error)));
    return () => {
      alive = false;
    };
  }, [status]);

  // Status pembayaran (DP) menentukan apakah booking bisa diproses. Dimuat ulang saat status booking berubah.
  const [payments, setPayments] = useState({ status: "loading", items: [] });
  useEffect(() => {
    if (!status) return;
    let alive = true;
    paymentApi
      .listByBooking(id)
      .then((items) => alive && setPayments({ status: "ready", items }))
      .catch(() => alive && setPayments({ status: "error", items: [] }));
    return () => {
      alive = false;
    };
  }, [id, status]);

  function retry() {
    setState((s) => ({ ...s, status: "loading" }));
    setReloadKey((k) => k + 1);
  }

  async function run(task, successText) {
    setBusy(true);
    setActionError("");
    try {
      const updated = await task();
      // respons tidak memuat data pelanggan, jadi gabungkan agar tidak hilang
      setState((s) => ({
        ...s,
        booking: { ...s.booking, ...updated, user: s.booking.user },
      }));
      toast(successText);
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  function handleAssign(e) {
    e.preventDefault();
    if (!mechanicId) {
      setActionError("Pilih mekanik terlebih dahulu");
      return;
    }
    run(
      () => bookingApi.assignMechanic(state.booking.id, Number(mechanicId)),
      "Mekanik ditugaskan, booking disetujui",
    );
  }

  const back = (
    <Link
      to="/admin/bookings"
      className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} /> Kembali ke Kelola Booking
    </Link>
  );

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-6xl" aria-busy="true">
        {back}
        <div className="mt-6 h-28 animate-pulse rounded-lg bg-line" />
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-line" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-6xl">
        {back}
        <div className="mt-6 rounded-lg border border-line bg-card">
          <ErrorState message={state.error} onRetry={retry} />
        </div>
      </div>
    );
  }

  const b = state.booking;
  const next = NEXT[b.status];
  // Hanya dikunci bila pembayaran sudah berhasil dimuat dan DP belum lunas. Jika gagal dimuat, backend yang memutuskan.
  const dpPaid = payments.items.some(
    (p) => p.type === "DP" && p.status === "PAID",
  );
  const locked =
    b.status === "APPROVED" && payments.status === "ready" && !dpPaid;

  return (
    <div className="mx-auto max-w-6xl">
      {back}

      <header className="mt-6 flex flex-col gap-4 rounded-lg border border-line bg-card px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">
            Kode booking
          </p>
          <h2 className="mt-1 font-mono text-2xl font-medium tracking-tight sm:text-3xl">
            {b.bookingCode}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <p className="font-mono text-sm tnum">
            {formatTanggal(b.bookingDate)}, {b.bookingTime}
          </p>
          <BookingStatusPill status={b.status} />
        </div>
      </header>

      <div className="mt-4 rounded-lg border border-line bg-card px-6 py-5">
        <Stepper status={b.status} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-4">
          <Section title="Pelanggan">
            <dl className="grid gap-5 sm:grid-cols-3">
              <Field label="Nama">{b.user?.name}</Field>
              <Field label="No. HP">
                {b.user?.phone ? (
                  <a
                    href={`tel:${b.user.phone}`}
                    className="font-mono underline decoration-line underline-offset-4 hover:decoration-amber"
                  >
                    {b.user.phone}
                  </a>
                ) : null}
              </Field>
              <Field label="Email">{b.user?.email}</Field>
            </dl>
          </Section>

          <Section title="Kendaraan">
            <dl className="grid gap-5 sm:grid-cols-4">
              <Field label="Plat nomor">
                {b.vehicle?.platNomor ? (
                  <PlateChip>{b.vehicle.platNomor}</PlateChip>
                ) : null}
              </Field>
              <Field label="Merk dan tipe">
                {[b.vehicle?.merk, b.vehicle?.tipe].filter(Boolean).join(" ")}
              </Field>
              <Field label="Transmisi">{b.vehicle?.transmisi}</Field>
              <Field label="Tahun">{b.vehicle?.tahun}</Field>
            </dl>
          </Section>

          <Section title="Layanan dan biaya">
            <ul className="divide-y divide-line">
              {(b.bookingDetails ?? []).map((d) => (
                <li
                  key={d.id}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0"
                >
                  <div>
                    <p className="font-medium">{d.service?.namaLayanan}</p>
                    {d.service?.deskripsi && (
                      <p className="mt-0.5 text-sm text-muted">
                        {d.service.deskripsi}
                      </p>
                    )}
                    {d.service?.estimasiMenit ? (
                      <p className="mt-1 font-mono text-xs text-muted tnum">
                        {formatMenit(d.service.estimasiMenit)}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 font-mono text-sm tnum">
                    {formatRupiah(d.price)}
                  </p>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex items-baseline justify-between gap-4 border-t border-slate-300 pt-4">
              <span className="font-mono text-[0.7rem] tracking-[0.14em] uppercase">
                Total
              </span>
              <span className="font-mono text-xl font-medium tnum">
                {formatRupiah(b.totalPrice)}
              </span>
            </p>
          </Section>

          <Section title="Pembayaran">
            {payments.status === "loading" && (
              <p className="text-muted">Memuat pembayaran...</p>
            )}
            {payments.status === "error" && (
              <p className="text-muted">
                Pembayaran tidak dapat dimuat saat ini.
              </p>
            )}
            {payments.status === "ready" && payments.items.length === 0 && (
              <p className="text-muted">
                Belum ada pembayaran untuk booking ini.
              </p>
            )}
            {payments.status === "ready" && payments.items.length > 0 && (
              <ul className="divide-y divide-line">
                {payments.items.map((p) => {
                  const baseStatus = PAY_STATUS[p.status] ?? PAY_STATUS.PENDING;
                  const ps =
                    p.type === "DP" && p.status === "PAID"
                      ? { ...baseStatus, label: "DP Terbayar" }
                      : baseStatus;
                  return (
                    <li
                      key={p.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {PAY_TYPE[p.type] ?? p.type}
                        </p>
                        <p className="font-mono text-xs text-muted">
                          {p.method}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-sm tnum">
                          {formatRupiah(p.amount)}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 font-mono text-xs ${ps.cls}`}
                        >
                          {ps.label}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="Mekanik bertugas">
            {b.mechanic ? (
              <p className="font-medium">
                {b.mechanic.namaMekanik}{" "}
                <span className="ml-2 font-mono text-sm font-normal text-muted">
                  {b.mechanic.noHp}
                </span>
              </p>
            ) : (
              <p className="text-muted">
                Belum ditugaskan. Mekanik ditetapkan saat booking disetujui.
              </p>
            )}
          </Section>
        </div>

        {/* Aksi: di HP tampil lebih dulu agar mudah dijangkau */}
        <aside
          className="order-first rounded-lg border border-line bg-card lg:order-none lg:sticky lg:top-24"
          aria-label="Aksi booking"
        >
          <h2 className="border-b border-line px-6 py-4 font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">
            Aksi
          </h2>
          <div className="px-6 py-5">
            {actionError && (
              <p
                role="alert"
                className="mb-5 flex items-start gap-3 border-l-4 border-danger bg-red-50 px-4 py-3.5 text-base font-medium text-danger"
              >
                <TriangleAlert
                  size={20}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{actionError}</span>
              </p>
            )}

            {b.status === "PENDING" && (
              <form onSubmit={handleAssign} noValidate>
                <label
                  htmlFor="mechanicId"
                  className="mb-2 block font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase"
                >
                  Tugaskan mekanik aktif
                </label>
                <select
                  id="mechanicId"
                  value={mechanicId}
                  onChange={(e) => setMechanicId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-card px-3 py-3 text-base outline-none transition-colors focus-visible:border-amber"
                >
                  <option value="">Pilih mekanik</option>
                  {mechanics.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.namaMekanik}
                    </option>
                  ))}
                </select>
                {mechanics.length === 0 && (
                  <p className="mt-2 text-sm text-muted">
                    Belum ada mekanik aktif. Tambahkan atau aktifkan di menu
                    Mekanik.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary mt-4 w-full rounded-lg px-5 py-3.5 text-sm font-semibold disabled:opacity-60"
                >
                  {busy ? "Memproses..." : "Setujui dan tugaskan"}
                </button>
                <p className="mt-3 text-sm text-muted">
                  Menugaskan mekanik otomatis mengubah status menjadi Disetujui.
                </p>
              </form>
            )}

            {next && (
              <div>
                <button
                  type="button"
                  disabled={busy || locked}
                  onClick={() =>
                    run(
                      () => bookingApi.setStatus(b.id, next.to),
                      `Status diubah menjadi ${next.to === "DIPROSES" ? "Diproses" : "Selesai"}`,
                    )
                  }
                  className="btn-primary w-full rounded-lg px-5 py-3.5 text-sm font-semibold disabled:opacity-50"
                >
                  {busy ? "Memproses..." : next.label}
                </button>
                <p className="mt-3 text-sm text-muted">
                  {locked
                    ? "DP belum lunas. Verifikasi DP di menu Pembayaran, lalu proses booking ini."
                    : next.note}
                </p>
              </div>
            )}

            {b.status === "SELESAI" && (
              <p className="text-muted">
                Booking sudah selesai. Tidak ada aksi lanjutan di halaman ini.
              </p>
            )}
          </div>
          <div className="border-t border-line px-6 py-4">
            <Link
              to={`/admin/chat/${b.id}`}
              className="text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-amber"
            >
              Buka chat dengan customer
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}