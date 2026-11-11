import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { serviceApi } from "../services/catalog";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/error";
import { formatMenit, formatRupiah } from "../utils/format";
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
import TextAreaField from "../components/TextAreaField";

const EMPTY_FORM = {
  namaLayanan: "",
  harga: "",
  estimasiMenit: "",
  deskripsi: "",
};

function validate(form) {
  const e = {};
  if (!form.namaLayanan.trim()) e.namaLayanan = "Nama layanan wajib diisi";
  if (
    form.harga === "" ||
    !Number.isFinite(Number(form.harga)) ||
    Number(form.harga) < 0
  )
    e.harga = "Isi harga dengan angka 0 atau lebih";
  if (
    !Number.isInteger(Number(form.estimasiMenit)) ||
    Number(form.estimasiMenit) <= 0
  )
    e.estimasiMenit = "Isi estimasi dengan menit bilangan bulat lebih dari 0";
  return e;
}

export default function Services() {
  const { user } = useAuth();
  const canEdit = user.role === "ADMIN";
  const toast = useToast();

  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: "",
  });
  const [query, setQuery] = useState("");

  // form tambah/ubah. editing: null = tutup, "new" = tambah, objek = ubah
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // hapus
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [removing, setRemoving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    serviceApi
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.items;
    return state.items.filter((s) =>
      `${s.namaLayanan} ${s.deskripsi ?? ""}`.toLowerCase().includes(q),
    );
  }, [state.items, query]);

  function openForm(service) {
    setErrors({});
    setFormError("");
    if (service) {
      setForm({
        namaLayanan: service.namaLayanan,
        harga: String(Number(service.harga)),
        estimasiMenit: String(service.estimasiMenit),
        deskripsi: service.deskripsi ?? "",
      });
      setEditing(service);
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
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = {
      namaLayanan: form.namaLayanan.trim(),
      harga: Number(form.harga),
      estimasiMenit: Number(form.estimasiMenit),
      deskripsi: form.deskripsi.trim(),
    };

    setSaving(true);
    try {
      if (editing === "new") {
        const created = await serviceApi.create(body);
        setState((s) => ({ ...s, items: [created, ...s.items] }));
        toast("Layanan berhasil ditambahkan");
      } else {
        const updated = await serviceApi.update(editing.id, body);
        setState((s) => ({
          ...s,
          items: s.items.map((i) => (i.id === updated.id ? updated : i)),
        }));
        toast("Layanan berhasil diperbarui");
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
      await serviceApi.remove(deleting.id);
      setState((s) => ({
        ...s,
        items: s.items.filter((i) => i.id !== deleting.id),
      }));
      toast("Layanan berhasil dihapus");
      setDeleting(null);
    } catch (error) {
      setDeleteError(getErrorMessage(error));
    } finally {
      setRemoving(false);
    }
  }

  const addButton = canEdit ? (
    <AddButton onClick={() => openForm(null)}>Tambah Layanan</AddButton>
  ) : null;
  const total = state.items.length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHead
        title="Kelola Layanan"
        subtitle={
          canEdit
            ? "Daftar paket dan jenis perawatan kendaraan yang ditawarkan bengkel."
            : "Daftar paket dan jenis perawatan kendaraan. Kasir hanya dapat melihat."
        }
        action={addButton}
      />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Cari layanan"
          label="Cari layanan"
        />
        {state.status === "ready" && (
          <p className="font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase tnum">
            {total} layanan terdaftar
          </p>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line bg-card">
        {state.status === "loading" && <SkeletonRows />}
        {state.status === "error" && (
          <ErrorState message={state.error} onRetry={retry} />
        )}

        {state.status === "ready" && total === 0 && (
          <EmptyState
            title="Belum ada layanan"
            text={
              canEdit
                ? "Tambahkan layanan pertama agar bisa dipilih pada booking."
                : "Admin belum menambahkan layanan."
            }
            action={addButton}
          />
        )}

        {state.status === "ready" && total > 0 && visible.length === 0 && (
          <EmptyState
            title="Tidak ditemukan"
            text={`Tidak ada layanan yang cocok dengan "${query.trim()}".`}
          />
        )}

        {state.status === "ready" && visible.length > 0 && (
          <>
            {/* Desktop: tabel */}
            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-line font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">
                  <th scope="col" className="px-6 py-4 font-medium">
                    Nama layanan
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Deskripsi
                  </th>
                  <th scope="col" className="px-4 py-4 text-right font-medium">
                    Harga
                  </th>
                  <th scope="col" className="px-4 py-4 font-medium">
                    Estimasi
                  </th>
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
                {visible.map((s) => (
                  <tr key={s.id} className="row">
                    <th
                      scope="row"
                      className="px-6 py-5 align-top font-semibold"
                    >
                      {s.namaLayanan}
                    </th>
                    <td className="max-w-sm px-4 py-5 align-top text-sm text-muted">
                      {s.deskripsi || "-"}
                    </td>
                    <td className="px-4 py-5 text-right align-top font-mono text-sm whitespace-nowrap tnum">
                      {formatRupiah(s.harga)}
                    </td>
                    <td className="px-4 py-5 align-top font-mono text-sm whitespace-nowrap tnum">
                      {formatMenit(s.estimasiMenit)}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-3 align-top">
                        <div className="flex justify-end gap-1">
                          <IconButton
                            label={`Ubah ${s.namaLayanan}`}
                            onClick={() => openForm(s)}
                          >
                            <Pencil size={17} />
                          </IconButton>
                          <IconButton
                            label={`Hapus ${s.namaLayanan}`}
                            danger
                            onClick={() => {
                              setDeleteError("");
                              setDeleting(s);
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

            {/* HP: kartu bertumpuk */}
            <ul className="divide-y divide-line md:hidden">
              {visible.map((s) => (
                <li key={s.id} className="px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold">{s.namaLayanan}</p>
                    {canEdit && (
                      <div className="-mt-1 -mr-2 flex shrink-0">
                        <IconButton
                          label={`Ubah ${s.namaLayanan}`}
                          onClick={() => openForm(s)}
                        >
                          <Pencil size={17} />
                        </IconButton>
                        <IconButton
                          label={`Hapus ${s.namaLayanan}`}
                          danger
                          onClick={() => {
                            setDeleteError("");
                            setDeleting(s);
                          }}
                        >
                          <Trash2 size={17} />
                        </IconButton>
                      </div>
                    )}
                  </div>
                  {s.deskripsi && (
                    <p className="mt-1 text-sm text-muted">{s.deskripsi}</p>
                  )}
                  <p className="mt-3 flex gap-5 font-mono text-sm tnum">
                    <span>{formatRupiah(s.harga)}</span>
                    <span className="text-muted">
                      {formatMenit(s.estimasiMenit)}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Tambah / ubah */}
      <Modal
        open={editing !== null}
        title={editing === "new" ? "Tambah Layanan" : "Ubah Layanan"}
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
            id="namaLayanan"
            name="namaLayanan"
            label="Nama layanan"
            placeholder="Contoh: Ganti Oli Mesin"
            value={form.namaLayanan}
            onChange={handleChange}
            error={errors.namaLayanan}
            data-autofocus
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="harga"
              name="harga"
              type="number"
              inputMode="numeric"
              min="0"
              label="Harga (Rp)"
              placeholder="150000"
              value={form.harga}
              onChange={handleChange}
              error={errors.harga}
            />
            <TextField
              id="estimasiMenit"
              name="estimasiMenit"
              type="number"
              inputMode="numeric"
              min="1"
              label="Estimasi (menit)"
              placeholder="60"
              value={form.estimasiMenit}
              onChange={handleChange}
              error={errors.estimasiMenit}
            />
          </div>
          <TextAreaField
            id="deskripsi"
            name="deskripsi"
            label="Deskripsi (opsional)"
            placeholder="Apa saja yang dikerjakan"
            value={form.deskripsi}
            onChange={handleChange}
          />
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
        title="Hapus layanan?"
        message={
          deleting ? `"${deleting.namaLayanan}" akan dihapus permanen.` : ""
        }
        note="Layanan yang sudah dipakai booking tidak dapat dihapus."
        error={deleteError}
        busy={removing}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
