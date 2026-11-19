import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookingApi } from "../services/catalog";
import { getErrorMessage } from "../utils/error";
import { formatRupiah, formatTanggal } from "../utils/format";
import {
  EmptyState,
  ErrorState,
  PageHead,
  SearchBox,
  SkeletonRows,
} from "../components/ui/Blocks";
import { BookingStatusPill, PlateChip } from "../components/ui/BookingParts";
import { STATUS, STATUS_ORDER } from "../utils/bookingStatus";

function layananRingkas(details) {
  const names = (details ?? [])
    .map((d) => d.service?.namaLayanan)
    .filter(Boolean);
  if (names.length === 0) return "-";
  return names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
}

export default function Bookings() {
  const navigate = useNavigate();
  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: "",
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("SEMUA");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    bookingApi
      .list()
      .then((items) => alive && setState({ status: "ready", items, error: "" }))
      .catch(
        (error) =>
          alive &&
          setState({
            status: "error",
            items: [],
            error: getErrorMessage(error),
          }),
      );
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  function retry() {
    setState((s) => ({ ...s, status: "loading" }));
    setReloadKey((k) => k + 1);
  }

  const counts = useMemo(() => {
    const c = { SEMUA: state.items.length };
    STATUS_ORDER.forEach(
      (k) => (c[k] = state.items.filter((b) => b.status === k).length),
    );
    return c;
  }, [state.items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.items.filter(
      (b) =>
        (filter === "SEMUA" || b.status === filter) &&
        (!q ||
          `${b.bookingCode} ${b.user?.name ?? ""} ${b.vehicle?.platNomor ?? ""}`
            .toLowerCase()
            .includes(q)),
    );
  }, [state.items, query, filter]);

  const total = state.items.length;
  const tabs = [
    ["SEMUA", "Semua"],
    ...STATUS_ORDER.map((k) => [k, STATUS[k].label]),
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHead
        title="Kelola Booking"
        subtitle="Daftar pemesanan servis dari pelanggan. Buka satu booking untuk menugaskan mekanik dan mengubah statusnya."
      />

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter status"
          className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 max-sm:[mask-image:linear-gradient(to_right,#000_88%,transparent)] sm:mx-0 sm:px-0"
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
              <span className="font-mono text-xs tnum">
                ({counts[key] ?? 0})
              </span>
            </button>
          ))}
        </div>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Cari kode, pelanggan, atau plat"
          label="Cari booking"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-card">
        {state.status === "loading" && <SkeletonRows />}
        {state.status === "error" && (
          <ErrorState message={state.error} onRetry={retry} />
        )}
        {state.status === "ready" && total === 0 && (
          <EmptyState
            title="Belum ada booking"
            text="Booking dari aplikasi pelanggan akan muncul di sini."
          />
        )}
        {state.status === "ready" && total > 0 && visible.length === 0 && (
          <EmptyState
            title="Tidak ditemukan"
            text="Tidak ada booking yang cocok dengan pencarian atau filter ini."
          />
        )}

        {state.status === "ready" && visible.length > 0 && (
          <>
            <table className="hidden w-full text-left lg:table">
              <thead>
                <tr className="border-b border-line font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  <th scope="col" className="px-6 py-4 font-medium">
                    Kode
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Pelanggan
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Kendaraan
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Layanan
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Jadwal
                  </th>
                  <th scope="col" className="px-4 py-4 text-right font-medium">
                    Total
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Mekanik
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((b) => (
                  <tr
                    key={b.id}
                    className="row cursor-pointer"
                    onClick={() => navigate(`/admin/bookings/${b.id}`)}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-mono text-sm font-medium whitespace-nowrap"
                    >
                      <Link
                        to={`/admin/bookings/${b.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="underline decoration-line underline-offset-4 hover:decoration-amber"
                      >
                        {b.bookingCode}
                      </Link>
                    </th>
                    <td className="px-4 py-4">
                      <p className="font-medium">{b.user?.name ?? "-"}</p>
                      <p className="font-mono text-xs text-muted tnum">
                        {b.user?.phone || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <PlateChip>{b.vehicle?.platNomor}</PlateChip>
                      <p className="mt-1 text-xs text-muted">
                        {b.vehicle?.merk} {b.vehicle?.tipe} ({b.vehicle?.tahun})
                      </p>
                    </td>
                    <td className="max-w-40 px-4 py-4 text-sm">
                      {layananRingkas(b.bookingDetails)}
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      <p className="tnum">{formatTanggal(b.bookingDate)}</p>
                      <p className="font-mono text-xs text-muted tnum">
                        {b.bookingTime}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right font-mono text-sm whitespace-nowrap tnum">
                      {formatRupiah(b.totalPrice)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {b.mechanic?.namaMekanik ?? (
                        <span className="text-muted italic">
                          Belum ditugaskan
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <BookingStatusPill status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line lg:hidden">
              {visible.map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/admin/bookings/${b.id}`}
                    className="block px-5 py-5 transition-colors hover:bg-ground/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-mono text-sm font-medium">
                        {b.bookingCode}
                      </p>
                      <BookingStatusPill status={b.status} />
                    </div>
                    <p className="mt-2 font-semibold">{b.user?.name ?? "-"}</p>
                    <p className="mt-1 text-sm text-muted">
                      <PlateChip>{b.vehicle?.platNomor}</PlateChip>{" "}
                      <span className="ml-1">
                        {b.vehicle?.merk} {b.vehicle?.tipe}
                      </span>
                    </p>
                    <p className="mt-2 text-sm">
                      {layananRingkas(b.bookingDetails)}
                    </p>
                    <p className="mt-3 flex flex-wrap justify-between gap-x-4 font-mono text-sm tnum">
                      <span>
                        {formatTanggal(b.bookingDate)}, {b.bookingTime}
                      </span>
                      <span>{formatRupiah(b.totalPrice)}</span>
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Mekanik: {b.mechanic?.namaMekanik ?? "Belum ditugaskan"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
