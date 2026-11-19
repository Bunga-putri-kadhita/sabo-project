import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Info, Pencil, Trash2 } from "lucide-react";
import { bookingApi, mechanicApi } from "../services/catalog";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/error";
import { formatTanggal } from "../utils/format";
import { BookingStatusPill } from "../components/ui/BookingParts";
import {
  AddButton,
  EmptyState,
  ErrorState,
  IconButton,
  PageHead,
  SearchBox,
  SkeletonRows,
} from "../components/ui/Blocks";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useToast } from "../components/ui/Toast";
import TextField from "../components/TextField";

const EMPTY_FORM = { namaMekanik: "", noHp: "", statusAktif: "AKTIF" };

function StatusPill({ status }) {
  const aktif = status === "AKTIF";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs ${aktif ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
    >
      <span
        className={`size-1.5 rounded-full ${aktif ? "bg-emerald-500" : "bg-slate-400"}`}
        aria-hidden="true"
      />
      {aktif ? "Aktif" : "Tidak aktif"}
    </span>
  );
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ name, aktif }) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-10 shrink-0 place-items-center rounded-full font-mono text-sm font-medium ${aktif ? "bg-amber/20 text-amber-deep" : "bg-slate-100 text-slate-500"}`}
    >
      {initials(name)}
    </span>
  );
}

function Tile({ label, value, note }) {
  return (
    <div className="rounded-lg border border-line bg-card p-5">
      <p className="font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-3 font-display text-5xl leading-none tnum">{value}</p>
      {note && <p className="mt-3 text-sm text-muted">{note}</p>}
    </div>
  );
}

// Saklar aktif/tidak aktif. Hanya ADMIN yang bisa mengubahnya.
function Switch({ checked, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${checked ? "bg-amber" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 left-1 size-5 rounded-full bg-white transition-transform duration-300 ${checked ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

export default function Mechanics() {
  const { user } = useAuth();
  const canEdit = user.role === "ADMIN";
  const toast = useToast();

  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: "",
  });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("SEMUA");
  const [sort, setSort] = useState("TERBARU");
  const [toggling, setToggling] = useState(null);
  // Beban kerja hanya bisa dihitung ADMIN karena KASIR tidak punya akses daftar booking
  const [work, setWork] = useState({
    status: canEdit ? "loading" : "off",
    byMech: {},
  });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [removing, setRemoving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    mechanicApi
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

  useEffect(() => {
    if (!canEdit) return;
    let alive = true;
    bookingApi
      .list()
      .then((bookings) => {
        if (!alive) return;
        const byMech = {};
        bookings.forEach((b) => {
          if (!b.mechanicId) return;
          const e = (byMech[b.mechanicId] ??= { total: 0, aktif: [] });
          e.total += 1;
          if (b.status === "APPROVED" || b.status === "DIPROSES")
            e.aktif.push(b);
        });
        setWork({ status: "ready", byMech });
      })
      .catch(() => alive && setWork({ status: "error", byMech: {} }));
    return () => {
      alive = false;
    };
  }, [canEdit, reloadKey]);

  const load = (m) => work.byMech[m.id] ?? { total: 0, aktif: [] };

  async function handleToggle(m) {
    setToggling(m.id);
    try {
      // PUT di backend selalu membutuhkan namaMekanik, jadi kirim data lengkap
      const updated = await mechanicApi.update(m.id, {
        namaMekanik: m.namaMekanik,
        noHp: m.noHp ?? "",
        statusAktif: m.statusAktif === "AKTIF" ? "TIDAK_AKTIF" : "AKTIF",
      });
      setState((s) => ({
        ...s,
        items: s.items.map((i) => (i.id === updated.id ? updated : i)),
      }));
      toast(
        updated.statusAktif === "AKTIF"
          ? `${updated.namaMekanik} diaktifkan`
          : `${updated.namaMekanik} dinonaktifkan`,
      );
    } catch (error) {
      toast(getErrorMessage(error), "error");
    } finally {
      setToggling(null);
    }
  }

  function retry() {
    setState((s) => ({ ...s, status: "loading" }));
    setReloadKey((k) => k + 1);
  }

  const counts = useMemo(() => {
    const aktif = state.items.filter((m) => m.statusAktif === "AKTIF").length;
    return {
      SEMUA: state.items.length,
      AKTIF: aktif,
      TIDAK_AKTIF: state.items.length - aktif,
    };
  }, [state.items]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = state.items.filter(
      (m) =>
        (filter === "SEMUA" || m.statusAktif === filter) &&
        (!q || `${m.namaMekanik} ${m.noHp ?? ""}`.toLowerCase().includes(q)),
    );
    if (sort === "NAMA")
      list.sort((x, y) => x.namaMekanik.localeCompare(y.namaMekanik, "id"));
    else if (sort === "BEBAN")
      list.sort(
        (x, y) =>
          (work.byMech[y.id]?.aktif.length ?? 0) -
          (work.byMech[x.id]?.aktif.length ?? 0),
      );
    else list.sort((x, y) => y.id - x.id);
    return list;
  }, [state.items, query, filter, sort, work.byMech]);

  const bertugas = useMemo(
    () => state.items.filter((m) => (work.byMech[m.id]?.aktif.length ?? 0) > 0),
    [state.items, work.byMech],
  );

  function openForm(mechanic) {
    setErrors({});
    setFormError("");
    if (mechanic) {
      setForm({
        namaMekanik: mechanic.namaMekanik,
        noHp: mechanic.noHp ?? "",
        statusAktif: mechanic.statusAktif,
      });
      setEditing(mechanic);
    } else {
      setForm(EMPTY_FORM);
      setEditing("new");
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    if (!form.namaMekanik.trim()) {
      setErrors({ namaMekanik: "Nama mekanik wajib diisi" });
      return;
    }
    setErrors({});

    // PUT di backend selalu membutuhkan namaMekanik, jadi selalu kirim data lengkap
    const body = {
      namaMekanik: form.namaMekanik.trim(),
      noHp: form.noHp.trim(),
      statusAktif: form.statusAktif,
    };

    setSaving(true);
    try {
      if (editing === "new") {
        const created = await mechanicApi.create(body);
        setState((s) => ({ ...s, items: [created, ...s.items] }));
        toast("Mekanik berhasil ditambahkan");
      } else {
        const updated = await mechanicApi.update(editing.id, body);
        setState((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === updated.id ? updated : i)),
        }));
        toast("Data mekanik berhasil diperbarui");
      }
      setEditing(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setRemoving(true);
    setDeleteError("");
    try {
      await mechanicApi.remove(deleting.id);
      setState((s) => ({
        ...s,
        items: s.items.filter((i) => i.id !== deleting.id),
      }));
      toast("Mekanik berhasil dihapus");
      setDeleting(null);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setRemoving(false);
    }
  }

  const addButton = canEdit ? (
    <AddButton onClick={() => openForm(null)}>Tambah Mekanik</AddButton>
  ) : null;
  const total = state.items.length;
  const FILTERS = [
    ["SEMUA", "Semua"],
    ["AKTIF", "Aktif"],
    ["TIDAK_AKTIF", "Tidak aktif"],
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHead
        title="Kelola Mekanik"
        subtitle={
          canEdit
            ? "Daftar teknisi bengkel dan status ketersediaannya. Hanya mekanik aktif yang bisa ditugaskan ke booking."
            : "Daftar teknisi bengkel dan statusnya. Kasir hanya dapat melihat."
        }
        action={addButton}
      />

      <section
        aria-label="Ringkasan mekanik"
        className={`mt-8 grid gap-4 ${canEdit ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"}`}
      >
        <Tile
          label="Total mekanik"
          value={state.status === "ready" ? counts.SEMUA : "–"}
        />
        <Tile
          label="Aktif"
          value={state.status === "ready" ? counts.AKTIF : "–"}
          note="Bisa ditugaskan ke booking"
        />
        <Tile
          label="Tidak aktif"
          value={state.status === "ready" ? counts.TIDAK_AKTIF : "–"}
          note="Cuti atau tidak bertugas"
        />
        {canEdit && (
          <Tile
            label="Sedang bertugas"
            value={work.status === "ready" ? bertugas.length : "–"}
            note="Punya booking Disetujui atau Diproses"
          />
        )}
      </section>

      {canEdit && (
        <p className="mt-4 flex items-start gap-3 border-l-4 border-amber bg-amber/10 px-4 py-3.5 text-sm">
          <Info
            size={18}
            className="mt-0.5 shrink-0 text-amber-deep"
            aria-hidden="true"
          />
          <span>
            Mekanik yang sudah pernah ditugaskan tidak dapat dihapus. Matikan
            saklar Status agar tidak bisa dipilih untuk booking baru, riwayat
            pengerjaan tetap utuh.
          </span>
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Cari mekanik"
          label="Cari mekanik"
        />
        <div
          role="group"
          aria-label="Filter status"
          className="inline-flex self-start rounded-lg border border-line bg-card p-1"
        >
          {FILTERS.map(([key, text]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-night text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {text}{" "}
              <span className="font-mono text-xs tnum">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted">
        <p>
          {state.status === "ready"
            ? `Menampilkan ${visible.length} dari ${total} mekanik`
            : ""}
        </p>
        <label className="flex items-center gap-2">
          Urutkan
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-slate-300 bg-card px-3 py-2 text-sm text-ink outline-none focus-visible:border-amber"
          >
            <option value="TERBARU">Terbaru</option>
            <option value="NAMA">Nama A sampai Z</option>
            {canEdit && <option value="BEBAN">Tugas aktif terbanyak</option>}
          </select>
        </label>
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-line bg-card">
        {state.status === "loading" && <SkeletonRows />}
        {state.status === "error" && (
          <ErrorState message={state.error} onRetry={retry} />
        )}

        {state.status === "ready" && total === 0 && (
          <EmptyState
            title="Belum ada mekanik"
            text={
              canEdit
                ? "Tambahkan mekanik pertama agar bisa ditugaskan ke booking."
                : "Admin belum menambahkan mekanik."
            }
            action={addButton}
          />
        )}

        {state.status === "ready" && total > 0 && visible.length === 0 && (
          <EmptyState
            title="Tidak ditemukan"
            text="Tidak ada mekanik yang cocok dengan pencarian atau filter ini."
          />
        )}

        {state.status === "ready" && visible.length > 0 && (
          <>
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line font-mono text-[0.72rem] tracking-[0.14em] text-muted uppercase">
                  <th scope="col" className="px-6 py-4 font-medium">
                    Nama mekanik
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    No. HP
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Status
                  </th>
                  {canEdit && (
                    <th scope="col" className="px-4 py-4 font-medium">
                      Beban kerja
                    </th>
                  )}
                  {canEdit && (
                    <th
                      scope="col"
                      className="px-6 py-4 text-right font-medium"
                    >
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((m) => (
                  <tr key={m.id} className="row">
                    <th scope="row" className="px-6 py-4 font-semibold">
                      <span className="flex items-center gap-3">
                        <Avatar
                          name={m.namaMekanik}
                          aktif={m.statusAktif === "AKTIF"}
                        />
                        {m.namaMekanik}
                      </span>
                    </th>
                    <td className="px-4 py-4 font-mono text-sm tnum">
                      {m.noHp || "-"}
                    </td>
                    <td className="px-4 py-4">
                      {canEdit ? (
                        <span className="flex items-center gap-3">
                          <Switch
                            checked={m.statusAktif === "AKTIF"}
                            disabled={toggling === m.id}
                            onChange={() => handleToggle(m)}
                            label={`Status ${m.namaMekanik}`}
                          />
                          <span className="text-sm text-muted">
                            {m.statusAktif === "AKTIF"
                              ? "Aktif"
                              : "Tidak aktif"}
                          </span>
                        </span>
                      ) : (
                        <StatusPill status={m.statusAktif} />
                      )}
                    </td>
                    {canEdit && (
                      <td className="px-4 py-4 font-mono text-sm tnum">
                        {work.status === "ready" ? (
                          <>
                            {load(m).aktif.length} aktif{" "}
                            <span className="text-muted">
                              · {load(m).total} total
                            </span>
                          </>
                        ) : (
                          <span className="text-muted">
                            {work.status === "error" ? "Gagal dimuat" : "..."}
                          </span>
                        )}
                      </td>
                    )}
                    {canEdit && (
                      <td className="px-6 py-2">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            label={`Ubah ${m.namaMekanik}`}
                            onClick={() => openForm(m)}
                          >
                            <Pencil size={17} />
                          </IconButton>
                          <IconButton
                            label={`Hapus ${m.namaMekanik}`}
                            danger
                            onClick={() => {
                              setDeleteError("");
                              setDeleting(m);
                            }}
                          >
                            <Trash2 size={17} />
                          </IconButton>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="divide-y divide-line md:hidden">
              {visible.map((m) => (
                <li key={m.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={m.namaMekanik}
                        aktif={m.statusAktif === "AKTIF"}
                      />
                      <div>
                        <p className="font-semibold">{m.namaMekanik}</p>
                        <p className="mt-0.5 font-mono text-sm text-muted tnum">
                          {m.noHp || "-"}
                        </p>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="-mt-1 -mr-2 flex shrink-0">
                        <IconButton
                          label={`Ubah ${m.namaMekanik}`}
                          onClick={() => openForm(m)}
                        >
                          <Pencil size={17} />
                        </IconButton>
                        <IconButton
                          label={`Hapus ${m.namaMekanik}`}
                          danger
                          onClick={() => {
                            setDeleteError("");
                            setDeleting(m);
                          }}
                        >
                          <Trash2 size={17} />
                        </IconButton>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    {canEdit ? (
                      <span className="flex items-center gap-3">
                        <Switch
                          checked={m.statusAktif === "AKTIF"}
                          disabled={toggling === m.id}
                          onChange={() => handleToggle(m)}
                          label={`Status ${m.namaMekanik}`}
                        />
                        <span className="text-sm text-muted">
                          {m.statusAktif === "AKTIF" ? "Aktif" : "Tidak aktif"}
                        </span>
                      </span>
                    ) : (
                      <StatusPill status={m.statusAktif} />
                    )}
                    {canEdit && work.status === "ready" && (
                      <span className="font-mono text-xs text-muted tnum">
                        {load(m).aktif.length} aktif · {load(m).total} total
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {canEdit && work.status === "ready" && (
        <section aria-labelledby="bertugas-h" className="mt-10">
          <h3
            id="bertugas-h"
            className="font-display text-2xl font-extrabold uppercase"
          >
            Sedang bertugas
          </h3>
          {bertugas.length === 0 ? (
            <p className="mt-3 text-muted">
              Belum ada booking yang sedang ditangani mekanik.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {bertugas.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-line bg-card"
                >
                  <p className="flex items-center gap-3 border-b border-line px-5 py-4 font-semibold">
                    <Avatar name={m.namaMekanik} aktif />
                    {m.namaMekanik}
                  </p>
                  <ul className="divide-y divide-line">
                    {load(m).aktif.map((b) => (
                      <li key={b.id}>
                        <Link
                          to={`/admin/bookings/${b.id}`}
                          className="row flex items-center justify-between gap-3 px-5 py-3.5"
                        >
                          <span className="min-w-0">
                            <span className="block font-mono text-sm font-medium">
                              {b.bookingCode}
                            </span>
                            <span className="block truncate text-sm text-muted">
                              {b.vehicle?.platNomor ?? "-"} ·{" "}
                              {formatTanggal(b.bookingDate)} {b.bookingTime}
                            </span>
                          </span>
                          <BookingStatusPill status={b.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <Modal
        open={editing !== null}
        title={editing === "new" ? "Tambah Mekanik" : "Ubah Mekanik"}
        onClose={() => setEditing(null)}
        busy={saving}
      >
        <form onSubmit={handleSave} noValidate className="space-y-6">
          {formError && (
            <p
              role="alert"
              className="border-l-[3px] border-danger bg-red-50 px-4 py-3 text-sm text-danger"
            >
              {formError}
            </p>
          )}
          <TextField
            id="namaMekanik"
            name="namaMekanik"
            label="Nama mekanik"
            placeholder="Nama lengkap"
            value={form.namaMekanik}
            onChange={handleChange}
            error={errors.namaMekanik}
            data-autofocus
          />
          <TextField
            id="noHp"
            name="noHp"
            type="tel"
            inputMode="tel"
            label="No. HP (opsional)"
            placeholder="08xxxxxxxxxx"
            value={form.noHp}
            onChange={handleChange}
          />

          <fieldset>
            <legend className="mb-2 font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase">
              Status
            </legend>
            <div
              role="radiogroup"
              className="inline-flex rounded-lg border border-line bg-card p-1"
            >
              {[
                ["AKTIF", "Aktif"],
                ["TIDAK_AKTIF", "Tidak aktif"],
              ].map(([val, text]) => (
                <label
                  key={val}
                  className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${form.statusAktif === val ? "bg-night text-white" : "text-muted hover:text-ink"}`}
                >
                  <input
                    type="radio"
                    name="statusAktif"
                    value={val}
                    checked={form.statusAktif === val}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={saving}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold transition-colors hover:border-night hover:bg-night hover:text-white disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary rounded-lg px-6 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus mekanik?"
        message={
          deleting ? `"${deleting.namaMekanik}" akan dihapus permanen.` : ""
        }
        note="Mekanik yang sudah punya booking tidak dapat dihapus. Ubah statusnya menjadi Tidak aktif."
        error={deleteError}
        busy={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
