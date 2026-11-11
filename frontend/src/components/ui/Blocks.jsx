import { Search } from "lucide-react";

export function PageHead({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-[clamp(2.4rem,5vw,3.4rem)] leading-[0.9] font-extrabold uppercase">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

export function AddButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-primary flex shrink-0 items-center justify-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold"
    >
      <span className="text-lg leading-none" aria-hidden="true">
        +
      </span>
      {children}
    </button>
  );
}

export function SearchBox({ value, onChange, placeholder, label }) {
  return (
    <label className="relative block w-full sm:max-w-sm">
      <span className="sr-only">{label}</span>
      <Search
        size={18}
        className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-card py-3 pr-4 pl-11 text-base outline-none transition-colors placeholder:text-slate-400 focus-visible:border-amber focus-visible:outline-none"
      />
    </label>
  );
}

export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="divide-y divide-line" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-6 px-6 py-5"
        >
          <div className="h-4 w-1/4 rounded bg-line" />
          <div className="h-4 w-1/3 rounded bg-line" />
          <div className="ml-auto h-4 w-20 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="px-6 py-14 text-center">
      <p className="font-display text-3xl font-extrabold uppercase">
        Data gagal dimuat
      </p>
      <p className="mx-auto mt-3 max-w-md text-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold transition-colors hover:border-night hover:bg-night hover:text-white"
      >
        Coba lagi
      </button>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="px-6 py-16 text-center">
      <p className="font-display text-4xl font-extrabold uppercase">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-muted">{text}</p>
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  );
}

export function IconButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-lg text-muted transition-colors ${
        danger
          ? "hover:bg-red-50 hover:text-danger"
          : "hover:bg-night hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
