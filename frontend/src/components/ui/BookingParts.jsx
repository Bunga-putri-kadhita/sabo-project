import { Check } from "lucide-react";
import { STATUS, STATUS_ORDER } from "../../utils/bookingStatus";

export function BookingStatusPill({ status }) {
  const s = STATUS[status] ?? STATUS.PENDING;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs whitespace-nowrap ${s.pill}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}

export function PlateChip({ children }) {
  return <span className="inline-block rounded border border-slate-300 bg-ground px-2 py-0.5 font-mono text-xs font-medium tracking-wider whitespace-nowrap">{children}</span>;
}

// Langkah status: yang sudah lewat bergaris amber, yang sedang berjalan ditandai
export function Stepper({ status }) {
  const current = STATUS_ORDER.indexOf(status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Tahapan booking">
      {STATUS_ORDER.map((key, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <li key={key} className="min-w-0" aria-current={now ? "step" : undefined}>
            <span className={`block h-0.5 transition-colors duration-500 ${i <= current ? "bg-amber" : "bg-line"}`} />
            <span className="mt-3 flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-2">
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[0.65rem] transition-colors duration-500 ${now ? "bg-night text-amber" : done ? "bg-amber text-night" : "bg-line text-muted"}`}>
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-xs sm:text-sm ${now ? "font-semibold" : done ? "" : "text-muted"}`}>{STATUS[key].label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}