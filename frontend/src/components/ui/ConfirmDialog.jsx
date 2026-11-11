import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  title,
  message,
  note,
  error,
  confirmLabel = "Hapus",
  busy,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel} busy={busy}>
      <p className="text-ink">{message}</p>
      {note && (
        <p className="mt-3 border-l-[3px] border-amber bg-amber/10 px-4 py-3 text-sm text-ink">
          {note}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-3 border-l-[3px] border-danger bg-red-50 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}
      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          data-autofocus
          onClick={onCancel}
          disabled={busy}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold transition-colors hover:border-night hover:bg-night hover:text-white disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="rounded-lg bg-danger px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60"
        >
          {busy ? "Memproses..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
