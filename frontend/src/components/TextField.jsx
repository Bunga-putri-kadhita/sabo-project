export default function TextField({ label, error, rightSlot, ...props }) {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          aria-invalid={error ? "true" : "false"}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500/40 ${
            error ? "border-red-500" : "border-slate-200 focus:border-amber-500"
          } ${rightSlot ? "pr-24" : ""}`}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
