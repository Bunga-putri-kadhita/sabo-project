import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { bookingApi, paymentApi } from "../services/catalog";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/error";
import { formatRupiah, formatWaktu } from "../utils/format";
import {
  EmptyState,
  ErrorState,
  PageHead,
  SkeletonRows,
} from "../components/ui/Blocks";
import { BookingStatusPill, PlateChip } from "../components/ui/BookingParts";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";

const TYPE = { DP: "DP", PELUNASAN: "Pelunasan" };
const STATUS = {
  PAID: { label: "Lunas", cls: "bg-emerald-50 text-emerald-800" },
  PENDING: { label: "Menunggu", cls: "bg-amber/15 text-amber-deep" },
  FAILED: { label: "Gagal", cls: "bg-red-50 text-danger" },
  EXPIRED: { label: "Kedaluwarsa", cls: "bg-slate-100 text-slate-600" },
};

// QRIS tidak bisa diverifikasi manual: backend menolaknya (harus lewat payment gateway)
const canVerify = (p) => p.status === "PENDING" && p.method !== "QRIS";

const RECENT_KEY = "sabo.kasir.recent";
function readRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(v) ? v.slice(0, 6) : [];
  } catch {
    return [];
  }
}
function writeRecent(list) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* penyimpanan tidak tersedia, abaikan */
  }
}

function toRow(payment, booking) {
  return {
    ...payment,
    bk: {
      id: booking.id,
      code: booking.bookingCode,
      customer: booking.user?.name ?? "-",
    },
  };
}

function Money({ label, value, strong }) {
  return (
    <div>
      <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
        {label}
      </dt>
      <dd
        className={`mt-1 font-mono tnum ${strong ? "text-2xl text-ink" : "text-lg"}`}
      >
        {value}
      </dd>
    </div>
  );
}

// Ringkasan booking hasil pencarian Kasir (data dari GET /bookings/:id dan pembayarannya)
function BookingSummary({ booking, items }) {
  const total = Number(booking.totalPrice ?? 0);
  const paid = items
    .filter((p) => p.status === "PAID")
    .reduce((n, p) => n + Number(p.amount), 0);
  const waiting = items.filter(canVerify).length;
  return (
    <section
      aria-label="Ringkasan booking"
      className="mt-8 rounded-lg border border-line bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
        <p className="font-mono text-sm font-medium">{booking.bookingCode}</p>
        <BookingStatusPill status={booking.status} />
      </div>
      <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.2fr_1fr]">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
              Pelanggan
            </dt>
            <dd className="mt-1 font-medium">{booking.user?.name ?? "-"}</dd>
            {booking.user?.phone && (
              <dd className="font-mono text-xs text-muted">
                {booking.user.phone}
              </dd>
            )}
          </div>
          <div>
            <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
              Kendaraan
            </dt>
            <dd className="mt-1">
              {booking.vehicle?.platNomor ? (
                <PlateChip>{booking.vehicle.platNomor}</PlateChip>
              ) : (
                "-"
              )}
            </dd>
            <dd className="mt-1 text-muted">
              {[booking.vehicle?.merk, booking.vehicle?.tipe]
                .filter(Boolean)
                .join(" ")}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
              Mekanik
            </dt>
            <dd className="mt-1 font-medium">
              {booking.mechanic?.namaMekanik ?? "Belum ditugaskan"}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
              Layanan
            </dt>
            <dd className="mt-1 text-muted">
              {(booking.bookingDetails ?? [])
                .map((d) => d.service?.namaLayanan)
                .filter(Boolean)
                .join(", ") || "-"}
            </dd>
          </div>
        </dl>
        <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
          <Money label="Total biaya" value={formatRupiah(total)} />
          <Money label="Sudah dibayar" value={formatRupiah(paid)} />
          <Money
            label="Sisa tagihan"
            value={formatRupiah(Math.max(total - paid, 0))}
            strong
          />
          <Money label="Perlu verifikasi" value={`${waiting} pembayaran`} />
        </dl>
      </div>
    </section>
  );
}

function StatusPill({ status, type }) {
  const baseStatus = STATUS[status] ?? STATUS.PENDING;
  const s =
    type === "DP" && status === "PAID"
      ? { ...baseStatus, label: "DP Terbayar" }
      : baseStatus;
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 font-mono text-xs whitespace-nowrap ${s.cls}`}
    >
      {s.label}
    </span>
  );
}

function Action({ p, onVerify }) {
  if (canVerify(p)) {
    return (
      <button
        type="button"
        onClick={() => onVerify(p)}
        className="btn-primary rounded-lg px-4 py-2.5 text-sm font-semibold"
      >
        Verifikasi
      </button>
    );
  }
  if (p.status === "PENDING" && p.method === "QRIS")
    return <span className="text-sm text-muted">Menunggu gateway QRIS</span>;
  if (p.status === "PAID")
    return (
      <span className="text-sm text-muted">
        {p.verifiedBy ? `Oleh ${p.verifiedBy.name}` : "Terverifikasi"}
      </span>
    );
  return null;
}

function PaymentList({ items, onVerify, linkable }) {
  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-b border-line font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
            <th scope="col" className="px-6 py-4 font-medium">
              Booking
            </th>
            <th scope="col" className="px-4 py-4 font-medium">
              Jenis
            </th>
            <th scope="col" className="px-4 py-4 font-medium">
              Metode
            </th>
            <th scope="col" className="px-4 py-4 text-right font-medium">
              Jumlah
            </th>
            <th scope="col" className="px-4 py-4 font-medium">
              Dibuat
            </th>
            <th scope="col" className="px-4 py-4 font-medium">
              Status
            </th>
            <th scope="col" className="px-6 py-4 text-right font-medium">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map((p) => (
            <tr key={p.id} className="row">
              <th scope="row" className="px-6 py-4 align-top">
                {linkable ? (
                  <Link
                    to={`/admin/bookings/${p.bk.id}`}
                    className="font-mono text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-amber"
                  >
                    {p.bk.code}
                  </Link>
                ) : (
                  <span className="font-mono text-sm font-medium">
                    {p.bk.code}
                  </span>
                )}
                <p className="mt-0.5 text-sm font-normal text-muted">
                  {p.bk.customer}
                </p>
              </th>
              <td className="px-4 py-4 align-top font-medium">
                {TYPE[p.type] ?? p.type}
              </td>
              <td className="px-4 py-4 align-top font-mono text-sm">
                {p.method}
              </td>
              <td className="px-4 py-4 text-right align-top font-mono text-sm whitespace-nowrap tnum">
                {formatRupiah(p.amount)}
              </td>
              <td className="px-4 py-4 align-top font-mono text-xs whitespace-nowrap text-muted tnum">
                {formatWaktu(p.createdAt)}
              </td>
              <td className="px-4 py-4 align-top">
                <StatusPill status={p.status} type={p.type} />
              </td>
              <td className="px-6 py-3 text-right align-top">
                <Action p={p} onVerify={onVerify} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line md:hidden">
        {items.map((p) => (
          <li key={p.id} className="px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-medium">{p.bk.code}</p>
                <p className="text-sm text-muted">{p.bk.customer}</p>
              </div>
              <StatusPill status={p.status} type={p.type} />
            </div>
            <p className="mt-3 flex flex-wrap justify-between gap-x-4 font-mono text-sm tnum">
              <span>
                {TYPE[p.type] ?? p.type} · {p.method}
              </span>
              <span>{formatRupiah(p.amount)}</span>
            </p>
            <p className="mt-1 font-mono text-xs text-muted tnum">
              {formatWaktu(p.createdAt)}
            </p>
            <div className="mt-4">
              <Action p={p} onVerify={onVerify} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Payments() {
  const { user } = useAuth();
  const isAdmin = user.role === "ADMIN";
  const toast = useToast();

  const [state, setState] = useState({
    status: isAdmin ? "loading" : "idle",
    items: [],
    error: "",
    partial: false,
  });
  const [filter, setFilter] = useState("PERLU");
  const [reloadKey, setReloadKey] = useState(0);

  // KASIR: cari per ID booking
  const [lookupId, setLookupId] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState(readRecent);
  const [found, setFound] = useState(null);
  const [session, setSession] = useState({ count: 0, sum: 0 });

  const [target, setTarget] = useState(null);
  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  // ADMIN: ambil semua booking, lalu pembayaran tiap booking yang sudah disetujui.
  // Backend belum punya endpoint daftar pembayaran, jadi digabung di sini.
  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    (async () => {
      try {
        const bookings = await bookingApi.list();
        const withPayments = bookings.filter((b) => b.status !== "PENDING");
        const results = await Promise.allSettled(
          withPayments.map((b) => paymentApi.listByBooking(b.id)),
        );
        if (!alive) return;
        const items = [];
        let partial = false;
        results.forEach((r, i) => {
          if (r.status === "fulfilled")
            r.value.forEach((p) => items.push(toRow(p, withPayments[i])));
          else partial = true;
        });
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setState({ status: "ready", items, error: "", partial });
      } catch (error) {
        if (alive)
          setState({
            status: "error",
            items: [],
            error: getErrorMessage(error),
            partial: false,
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin, reloadKey]);

  function retry() {
    setState((s) => ({ ...s, status: "loading" }));
    setReloadKey((k) => k + 1);
  }

  async function lookup(rawId) {
    setLookupError("");
    const id = Number(rawId);
    if (!Number.isInteger(id) || id <= 0) {
      setLookupError("Isi ID booking dengan angka bulat lebih dari 0");
      return;
    }
    setSearching(true);
    try {
      const [booking, payments] = await Promise.all([
        bookingApi.get(id),
        paymentApi.listByBooking(id),
      ]);
      setState({
        status: "ready",
        items: payments.map((p) => toRow(p, booking)),
        error: "",
        partial: false,
      });
      setFilter("SEMUA");
      setFound(booking);
      setLookupId(String(id));
      const next = [
        { id, code: booking.bookingCode, customer: booking.user?.name ?? "-" },
        ...readRecent().filter((r) => r.id !== id),
      ].slice(0, 6);
      writeRecent(next);
      setRecent(next);
    } catch (error) {
      setLookupError(getErrorMessage(error));
    } finally {
      setSearching(false);
    }
  }

  function handleLookup(e) {
    e.preventDefault();
    lookup(lookupId);
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyError("");
    try {
      const updated = await paymentApi.verify(target.id);
      setState((s) => ({
        ...s,
        items: s.items.map((p) =>
          p.id === target.id ? { ...p, ...updated, bk: p.bk } : p,
        ),
      }));
      toast("Pembayaran berhasil diverifikasi");
      setSession((x) => ({
        count: x.count + 1,
        sum: x.sum + Number(target.amount),
      }));
      setTarget(null);
    } catch (error) {
      setVerifyError(getErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  }

  const counts = useMemo(
    () => ({
      PERLU: state.items.filter(canVerify).length,
      SEMUA: state.items.length,
      PAID: state.items.filter((p) => p.status === "PAID").length,
    }),
    [state.items],
  );

  const visible = useMemo(() => {
    if (filter === "PERLU") return state.items.filter(canVerify);
    if (filter === "PAID")
      return state.items.filter((p) => p.status === "PAID");
    return state.items;
  }, [state.items, filter]);

  const tabs = [
    ["PERLU", "Perlu verifikasi"],
    ["PAID", "Sudah dibayar"],
    ["SEMUA", "Semua"],
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHead
        title="Pembayaran"
        subtitle={
          isAdmin
            ? "Riwayat pembayaran dari semua booking. Verifikasi transfer atau tunai setelah uangnya diterima."
            : "Cari booking berdasarkan ID, lalu verifikasi transfer atau tunai setelah uangnya diterima."
        }
      />

      {!isAdmin && (
        <form onSubmit={handleLookup} noValidate className="mt-8 max-w-md">
          <label
            htmlFor="lookupId"
            className="mb-2 block font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase"
          >
            ID booking
          </label>
          <div className="flex gap-2">
            <input
              id="lookupId"
              inputMode="numeric"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Contoh: 12"
              aria-invalid={lookupError ? "true" : "false"}
              aria-describedby={lookupError ? "lookup-error" : undefined}
              className="min-w-0 flex-1 rounded-lg border border-line bg-card px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-500 focus-visible:border-amber focus-visible:outline-none"
            />
            <button
              type="submit"
              disabled={searching}
              className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {searching ? "Mencari..." : "Cari"}
            </button>
          </div>
          {lookupError && (
            <p
              id="lookup-error"
              role="alert"
              className="mt-3 text-sm font-medium text-danger"
            >
              {lookupError}
            </p>
          )}
        </form>
      )}

      {!isAdmin && recent.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
            Terakhir dicari
          </p>
          <ul className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => lookup(r.id)}
                  disabled={searching}
                  className="rounded-lg border border-line bg-card px-3.5 py-2 text-left text-sm transition-colors hover:border-night disabled:opacity-60"
                >
                  <span className="font-mono font-medium">{r.code}</span>
                  <span className="ml-2 text-muted">{r.customer}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isAdmin && session.count > 0 && (
        <p
          role="status"
          className="mt-6 inline-flex flex-wrap items-center gap-x-3 rounded-lg bg-night px-4 py-3 text-sm text-white"
        >
          <span className="font-mono text-xs tracking-[0.14em] text-amber uppercase">
            Sesi ini
          </span>
          <span>{session.count} pembayaran diverifikasi</span>
          <span className="font-mono tnum">{formatRupiah(session.sum)}</span>
        </p>
      )}

      {!isAdmin && found && state.status === "ready" && (
        <BookingSummary booking={found} items={state.items} />
      )}

      {!isAdmin && state.status === "idle" && (
        <ol className="mt-10 grid max-w-3xl gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
          {[
            [
              "Minta ID booking",
              "ID ada di detail booking. Tanyakan ke admin atau customer.",
            ],
            [
              "Cari dan periksa",
              "Lihat DP dan pelunasan yang masih menunggu verifikasi.",
            ],
            [
              "Verifikasi",
              "Setelah uang transfer atau tunai diterima, tekan Verifikasi.",
            ],
          ].map(([t, d], i) => (
            <li key={t} className="bg-card p-5">
              <p className="font-mono text-xs text-amber-deep">0{i + 1}</p>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      )}

      {state.status !== "idle" && (
        <>
          <div
            role="group"
            aria-label="Filter pembayaran"
            className="mt-8 flex gap-1 overflow-x-auto"
          >
            {tabs.map(([key, text]) => (
              <button
                key={key}
                type="button"
                aria-pressed={filter === key}
                onClick={() => setFilter(key)}
                className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${filter === key ? "bg-night text-white" : "text-muted hover:bg-black/5 hover:text-ink"}`}
              >
                {text}{" "}
                <span className="font-mono text-xs tnum">({counts[key]})</span>
              </button>
            ))}
          </div>

          {state.partial && (
            <p
              role="status"
              className="mt-3 border-l-4 border-amber bg-amber/10 px-4 py-3 text-sm"
            >
              Sebagian pembayaran gagal dimuat, jadi daftar ini mungkin belum
              lengkap. Muat ulang untuk mencoba lagi.
            </p>
          )}

          <div className="mt-4 overflow-hidden rounded-lg border border-line bg-card">
            {state.status === "loading" && <SkeletonRows />}
            {state.status === "error" && (
              <ErrorState message={state.error} onRetry={retry} />
            )}
            {state.status === "ready" && state.items.length === 0 && (
              <EmptyState
                title="Belum ada pembayaran"
                text={
                  isAdmin
                    ? "Pembayaran muncul setelah customer membuat tagihan DP pada booking yang disetujui."
                    : "Booking ini belum memiliki pembayaran."
                }
              />
            )}
            {state.status === "ready" &&
              state.items.length > 0 &&
              visible.length === 0 && (
                <EmptyState
                  title={filter === "PERLU" ? "Semua beres" : "Tidak ada data"}
                  text={
                    filter === "PERLU"
                      ? "Tidak ada pembayaran transfer atau tunai yang menunggu verifikasi."
                      : "Tidak ada pembayaran pada filter ini."
                  }
                />
              )}
            {state.status === "ready" && visible.length > 0 && (
              <PaymentList
                items={visible}
                onVerify={(p) => {
                  setVerifyError("");
                  setTarget(p);
                }}
                linkable={isAdmin}
              />
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        open={target !== null}
        tone="ok"
        title="Verifikasi pembayaran?"
        message={
          target
            ? `${TYPE[target.type] ?? target.type} ${formatRupiah(target.amount)} (${target.method}) dari ${target.bk.customer} untuk ${target.bk.code} akan ditandai sudah dibayar.`
            : ""
        }
        note="Pastikan uangnya sudah diterima. Tindakan ini tidak dapat dibatalkan."
        error={verifyError}
        confirmLabel="Ya, verifikasi"
        busy={verifying}
        onConfirm={handleVerify}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
