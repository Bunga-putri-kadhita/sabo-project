// Halaman sementara. Akan diganti dengan halaman asli di tahap berikutnya.
export default function PlaceholderPage({
  title,
  description,
  access,
  endpoints = [],
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span
          className="inline-block size-2 rounded-full bg-amber"
          aria-hidden="true"
        />
        <span className="font-mono text-[0.7rem] tracking-[0.18em] text-amber-deep">
          SEGERA HADIR
        </span>
      </div>
      <h2 className="font-display mt-4 text-[clamp(2.8rem,6vw,4.5rem)] leading-[0.9] font-extrabold uppercase">
        {title}
      </h2>
      <p className="mt-5 max-w-xl text-lg text-muted">{description}</p>

      {access && (
        <p className="mt-8 border-t border-line pt-4 text-sm text-muted">
          <span className="font-mono text-[0.7rem] tracking-[0.14em] text-ink">
            HAK AKSES
          </span>
          <span className="ml-3">{access}</span>
        </p>
      )}

      {endpoints.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[0.7rem] tracking-[0.14em]">
            ENDPOINT BACKEND
          </p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {endpoints.map((e) => (
              <li key={e} className="py-2.5 font-mono text-xs text-muted">
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
