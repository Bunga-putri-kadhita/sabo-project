export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel kiri: hanya tampil di layar besar */}
      <aside className="relative hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <div className="text-2xl font-bold tracking-wide">
          SABO<span className="text-amber-500">.</span>
        </div>
        <div>
          <h2 className="max-w-md text-4xl font-bold leading-tight">
            Booking servis lebih mudah, tanpa antre.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Pilih layanan, tentukan jadwal, dan pantau status pengerjaan
            kendaraanmu dari mana saja.
          </p>
        </div>
        <p className="text-sm text-slate-400">Smart Auto Booking Online</p>
      </aside>

      {/* Panel kanan: form */}
      <main className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-2xl font-bold text-slate-900 lg:hidden">
            SABO<span className="text-amber-500">.</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
