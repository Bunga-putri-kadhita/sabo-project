import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { bookingApi, chatApi } from "../services/catalog";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/error";
import { formatWaktu } from "../utils/format";
import {
  EmptyState,
  ErrorState,
  SearchBox,
  SkeletonRows,
} from "../components/ui/Blocks";
import { BookingStatusPill } from "../components/ui/BookingParts";

const POLL_MS = 5000;

function BookingList({ state, activeId, query, setQuery, onRetry }) {
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...state.items].sort((a, b) => b.id - a.id);
    if (!q) return sorted;
    return sorted.filter((b) =>
      [b.bookingCode, b.user?.name, b.vehicle?.platNomor].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [state.items, query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line p-4">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Cari kode, nama, atau plat"
          label="Cari percakapan"
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {state.status === "loading" && <SkeletonRows rows={6} />}
        {state.status === "error" && (
          <ErrorState message={state.error} onRetry={onRetry} />
        )}
        {state.status === "ready" && items.length === 0 && (
          <EmptyState
            title="Tidak ada booking"
            text="Percakapan dibuka per booking."
          />
        )}
        <ul className="divide-y divide-line">
          {items.map((b) => (
            <li key={b.id}>
              <Link
                to={`/admin/chat/${b.id}`}
                aria-current={
                  String(b.id) === String(activeId) ? "true" : undefined
                }
                className={`row block px-4 py-4 ${String(b.id) === String(activeId) ? "bg-amber/10" : ""}`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium">
                    {b.user?.name ?? "-"}
                  </span>
                  <BookingStatusPill status={b.status} />
                </span>
                <span className="mt-1 block truncate font-mono text-xs text-muted">
                  {b.bookingCode} · {b.vehicle?.platNomor ?? "-"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Thread({ bookingId, booking, myId }) {
  const [state, setState] = useState({
    status: "loading",
    messages: [],
    error: "",
  });
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const endRef = useRef(null);
  const lastCount = useRef(0);
  const inputRef = useRef(null);

  const load = useCallback(
    async (silent) => {
      try {
        const messages = await chatApi.list(bookingId);
        setState({ status: "ready", messages, error: "" });
      } catch (error) {
        // polling yang gagal tidak menghapus pesan yang sudah tampil
        if (!silent)
          setState({
            status: "error",
            messages: [],
            error: getErrorMessage(error),
          });
      }
    },
    [bookingId],
  );

  useEffect(() => {
    lastCount.current = 0;
    setState({ status: "loading", messages: [], error: "" });
    setText("");
    setSendError("");
    load(false);
    // Backend belum punya realtime, jadi cek pesan baru berkala saat tab terlihat
    const t = setInterval(() => {
      if (!document.hidden) load(true);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [bookingId, load]);

  useEffect(() => {
    if (state.messages.length !== lastCount.current) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      endRef.current?.scrollIntoView({
        behavior: lastCount.current === 0 || reduce ? "auto" : "smooth",
        block: "end",
      });
      lastCount.current = state.messages.length;
    }
  }, [state.messages]);

  async function submit(e) {
    e?.preventDefault();
    const message = text.trim();
    if (!message || sending) return;
    setSending(true);
    setSendError("");
    try {
      const sent = await chatApi.send(bookingId, message);
      setState((s) => ({
        ...s,
        messages: s.messages.some((m) => m.id === sent.id)
          ? s.messages
          : [...s.messages, sent],
      }));
      setText("");
      inputRef.current?.focus();
    } catch (error) {
      setSendError(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
        <Link
          to="/admin/chat"
          aria-label="Kembali ke daftar percakapan"
          className="-ml-2 rounded-lg p-2 text-muted hover:bg-black/5 hover:text-ink md:hidden"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {booking?.user?.name ?? `Booking #${bookingId}`}
          </p>
          <p className="truncate font-mono text-xs text-muted">
            {booking
              ? `${booking.bookingCode} · ${booking.vehicle?.platNomor ?? "-"}`
              : ""}
          </p>
        </div>
        <Link
          to={`/admin/bookings/${bookingId}`}
          className="shrink-0 text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-amber"
        >
          Lihat booking
        </Link>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto bg-ground/60 px-4 py-5 sm:px-5"
        role="log"
        aria-live="polite"
        aria-label="Riwayat pesan"
      >
        {state.status === "loading" && <SkeletonRows rows={4} />}
        {state.status === "error" && (
          <ErrorState
            message={state.error}
            onRetry={() => {
              setState((s) => ({ ...s, status: "loading" }));
              load(false);
            }}
          />
        )}
        {state.status === "ready" && state.messages.length === 0 && (
          <EmptyState
            title="Belum ada pesan"
            text="Tulis pesan pertama untuk customer di bawah."
          />
        )}
        <ul className="flex flex-col gap-3">
          {state.messages.map((m) => {
            const mine = m.senderId === myId || m.sender?.role === "ADMIN";
            return (
              <li
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 sm:max-w-[70%] ${mine ? "bg-night text-white" : "border border-line bg-card"}`}
                >
                  <p className="text-[0.95rem] break-words whitespace-pre-wrap">
                    {m.message}
                  </p>
                  <p
                    className={`mt-1.5 font-mono text-[0.68rem] tnum ${mine ? "text-slate-300" : "text-muted"}`}
                  >
                    {mine ? "" : `${m.sender?.name ?? "Customer"} · `}
                    {formatWaktu(m.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="border-t border-line p-3 sm:p-4">
        {sendError && (
          <p
            role="alert"
            className="mb-2 border-l-[3px] border-danger bg-red-50 px-3 py-2 text-sm text-danger"
          >
            {sendError}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="pesan" className="sr-only">
            Tulis pesan
          </label>
          <textarea
            id="pesan"
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Tulis pesan..."
            className="max-h-32 min-h-12 flex-1 resize-none rounded-lg border border-line bg-card px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-500 focus-visible:border-amber focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Kirim pesan"
            className="btn-primary grid size-12 shrink-0 place-items-center rounded-lg disabled:opacity-50"
          >
            <ArrowUp size={20} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Chat() {
  const { user } = useAuth();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    status: "loading",
    items: [],
    error: "",
  });
  const [query, setQuery] = useState("");
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

  const active = state.items.find((b) => String(b.id) === String(bookingId));

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="sr-only">Chat customer</h1>
      <div className="grid h-[calc(100dvh-6rem)] overflow-hidden rounded-lg border border-line bg-card sm:h-[calc(100dvh-8rem)] md:grid-cols-[20rem_1fr]">
        <div
          className={`${bookingId ? "hidden md:block" : "block"} min-h-0 border-line md:border-r`}
        >
          <BookingList
            state={state}
            activeId={bookingId}
            query={query}
            setQuery={setQuery}
            onRetry={() => {
              setState((s) => ({ ...s, status: "loading" }));
              setReloadKey((k) => k + 1);
            }}
          />
        </div>
        <div className={`${bookingId ? "block" : "hidden md:block"} min-h-0`}>
          {bookingId ? (
            <Thread
              key={bookingId}
              bookingId={bookingId}
              booking={active}
              myId={user?.id}
            />
          ) : (
            <div className="grid h-full place-items-center">
              <EmptyState
                title="Pilih percakapan"
                text="Pilih booking di sebelah kiri untuk membaca dan membalas pesan customer."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
