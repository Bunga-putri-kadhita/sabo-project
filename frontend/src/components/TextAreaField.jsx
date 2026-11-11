export default function TextAreaField({ label, error, ...props }) {
  const errId = error ? `${props.id}-error` : undefined;
  return (
    <div>
      <label
        htmlFor={props.id}
        className="mb-1 block font-mono text-[0.7rem] tracking-[0.14em] text-muted uppercase"
      >
        {label}
      </label>
      <div className="group relative">
        <textarea
          rows={3}
          {...props}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errId}
          className={`w-full resize-none border-0 border-b bg-transparent px-0 py-3 text-lg text-ink outline-none transition-colors placeholder:text-slate-400 focus-visible:outline-none ${
            error ? "border-danger" : "border-slate-300 hover:border-slate-500"
          }`}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-amber transition-transform duration-500 ease-ratchet group-focus-within:scale-x-100" />
      </div>
      {error && (
        <p id={errId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
