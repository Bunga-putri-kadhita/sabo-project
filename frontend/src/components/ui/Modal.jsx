import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Dialog aksesibel: fokus masuk, Tab terkunci di dalam, Esc menutup, fokus kembali ke pemicu.
export default function Modal({
  open,
  title,
  onClose,
  busy = false,
  children,
}) {
  const panel = useRef(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);

  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first =
      panel.current?.querySelector("[data-autofocus]") ??
      panel.current?.querySelector(FOCUSABLE);
    first?.focus();

    function onKey(e) {
      if (e.key === "Escape" && !busyRef.current) {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [...panel.current.querySelectorAll(FOCUSABLE)];
      if (nodes.length === 0) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="anim-fade absolute inset-0 bg-night/60 backdrop-blur-[2px]"
        onClick={() => !busy && onClose()}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="anim-pop relative flex max-h-[92svh] w-full flex-col overflow-y-auto rounded-t-2xl bg-ground sm:max-w-lg sm:rounded-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-6 pb-4">
          <h2
            id={titleId}
            className="font-display text-3xl leading-none font-extrabold uppercase"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="-mr-2 rounded-lg p-2 text-muted transition-colors hover:bg-black/5 hover:text-ink disabled:opacity-40"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
