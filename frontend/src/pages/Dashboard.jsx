import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { bookingApi, paymentApi } from "../services/catalog";
import { getErrorMessage } from "../utils/error";
import { formatRupiah, formatTanggal } from "../utils/format";
import { STATUS, STATUS_ORDER } from "../utils/bookingStatus";
import { EmptyState, ErrorState, PageHead } from "../components/ui/Blocks";
import { BookingStatusPill, PlateChip } from "../components/ui/BookingParts";

function Tile({ label, value, to, note, loading }) {
  return (
    <Link
      to={to}
      className="row group block rounded-lg border border-line bg-card p-5 transition-colors hover:border-night"
    >
      <p className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-3 font-display text-5xl leading-none tnum">
        {loading ? "–" : value}
      </p>
      <p className="mt-3 flex items-center justify-between text-sm text-muted">
        {note}
        <ArrowRight
          size={16}
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </p>
    </Link>
  );
}

export default function Dashboard() {
  const [state, setState] = useState({
    status: "loading",
    bookings: [],
    payments: [],
    partial: false,
    error: "",
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const bookings = await bookingApi.list();
        if (!alive) return;
        // Angka booking langsung tampil, angka pembayaran menyusul
        setState({
          status: "ready",
          bookings,
          payments: [],
          partial: false,
          error: "",
          payLoading: true,
        });
        const targets = bookings.filter((b) => b.status !== "PENDING");
        const res = await Promise.allSettled(
          targets.map((b) => paymentApi.listByBooking(b.id)),
        );
        if (!alive) return;
        const payments = res.flatMap((r) =>
          r.status === "fulfilled" ? r.value : [],
        );
        setState((s) => ({
          ...s,
          payments,
          partial: res.some((r) => r.status === "rejected"),
          payLoading: false,
        }));
      } catch (error) {
        if (alive)
          setState({
            status: "error",
            bookings: [],
            payments: [],
            partial: false,
            error: getErrorMessage(error),
          });
      }
    })();
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const stats = useMemo(() => {
    const count = Object.fromEntries(STATUS_ORDER.map((k) => [k, 0]));
    state.bookings.forEach((b) => {
      if (count[b.status] !== undefined) count[b.status] += 1;
    });
    const verifikasi = state.payments.filter(
      (p) => p.status === "PENDING" && p.method !== "QRIS",
    ).length;
    const masuk = state.payments
      .filter((p) => p.status === "PAID")
      .reduce((a, p) => a + Number(p.amount), 0);
    const recent = [...state.bookings].sort((a, b) => b.id - a.id).slice(0, 6);
    return { count, verifikasi, masuk, recent };
  }, [state.bookings, state.payments]);

  const loading = state.status === "loading";

  return (
    <div className="mx-auto max-w-7xl">
      <PageHead
        title="Dashboard"
        subtitle="Ringkasan booking dan pembayaran bengkel."
      />

      {state.status === "error" ? (
        <div className="mt-8 rounded-lg border border-line bg-card">
          <ErrorState
            message={state.error}
            onRetry={() => {
              setState((s) => ({ ...s, status: "loading", error: "" }));
              setReloadKey((k) => k + 1);
            }}
          />
        </div>
      ) : (
        <>
          <section
            aria-label="Perlu tindakan"
            className="mt-8 grid gap-4 sm:grid-cols-2"
          >
            <Tile
              label="Menunggu persetujuan"
              value={stats.count.PENDING}
              to="/admin/bookings"
              note="Setujui dan tugaskan mekanik"
              loading={loading}
            />
            <Tile
              label="Pembayaran perlu verifikasi"
              value={stats.verifikasi}
              to="/admin/payments"
              note="Transfer dan tunai"
              loading={loading || state.payLoading}
            />
          </section>

          <section aria-label="Booking per status" className="mt-4">
            <ol className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
              {STATUS_ORDER.map((k, i) => (
                <li key={k} className="bg-card p-5">
                  <p className="flex items-center gap-2 font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                    <span
                      className={`size-2 rounded-full ${STATUS[k].dot}`}
                      aria-hidden="true"
                    />
                    {i + 1}. {STATUS[k].label}
                  </p>
                  <p className="mt-3 font-display text-4xl leading-none tnum">
                    {loading ? "–" : stats.count[k]}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-label="Uang masuk"
            className="mt-4 rounded-lg border border-line bg-card p-5"
          >
            <p className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
              Uang masuk (pembayaran lunas)
            </p>
            <p className="mt-3 font-mono text-3xl tnum">
              {loading || state.payLoading ? "–" : formatRupiah(stats.masuk)}
            </p>
            {state.partial && (
              <p className="mt-2 text-sm text-muted">
                Sebagian pembayaran gagal dimuat, angka ini mungkin belum
                lengkap.
              </p>
            )}
          </section>

          <section aria-labelledby="terbaru" className="mt-10">
            <div className="flex items-end justify-between">
              <h2 id="terbaru" className="font-display text-2xl uppercase">
                Booking terbaru
              </h2>
              <Link
                to="/admin/bookings"
                className="text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-amber"
              >
                Lihat semua
              </Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-line bg-card">
              {!loading && stats.recent.length === 0 ? (
                <EmptyState
                  title="Belum ada booking"
                  text="Booking dari aplikasi customer akan muncul di sini."
                />
              ) : (
                <ul className="divide-y divide-line">
                  {stats.recent.map((b) => (
                    <li key={b.id}>
                      <Link
                        to={`/admin/bookings/${b.id}`}
                        className="row flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4"
                      >
                        <span className="min-w-0">
                          <span className="block font-mono text-sm font-medium">
                            {b.bookingCode}
                          </span>
                          <span className="block truncate text-sm text-muted">
                            {b.user?.name ?? "-"} ·{" "}
                            {formatTanggal(b.bookingDate)} {b.bookingTime}
                          </span>
                        </span>
                        <span className="flex items-center gap-4">
                          {b.vehicle?.platNomor && (
                            <PlateChip>{b.vehicle.platNomor}</PlateChip>
                          )}
                          <span className="font-mono text-sm tnum">
                            {formatRupiah(b.totalPrice)}
                          </span>
                          <BookingStatusPill status={b.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
