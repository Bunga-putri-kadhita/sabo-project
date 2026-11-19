import { useEffect, useRef } from "react";
import gsap from "gsap";
import Logo from "../components/Logo";
import GearDial from "../components/GearDial";

export default function AuthLayout({ title, subtitle, nudge = 0, children }) {
  const root = useRef(null);

  // Masuk berurutan; dilewati bila pengguna memilih reduced motion
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-in]", {
        y: 22,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.07,
        clearProps: "all",
      });
      gsap.from("[data-dial]", {
        rotation: -40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        transformOrigin: "50% 50%",
        clearProps: "all",
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      <a href="#utama" className="skip-link">
        Lewati ke formulir
      </a>

      <aside className="relative hidden overflow-hidden bg-night p-12 text-white lg:flex lg:flex-col lg:justify-between lg:gap-8 xl:p-16">
        <Logo variant="light" />

        <div className="relative my-auto">
          <p className="font-mono text-xs tracking-[0.18em] text-amber">
            ALUR BOOKING
          </p>
          <h2 className="font-display mt-4 max-w-[12ch] text-[clamp(3rem,min(6.5vw,11vh),6.5rem)] leading-[0.88] font-extrabold uppercase">
            Satu putaran, satu status.
          </h2>
          <div
            data-dial
            className="mx-auto mt-8 w-full max-w-[min(22rem,34vh)]"
          >
            <GearDial nudge={nudge} />
          </div>
        </div>

        <p className="text-sm text-slate-400">
          Smart Auto Booking Online. Panel Admin dan Kasir.
        </p>
      </aside>

      <main
        id="utama"
        className="flex items-center justify-center bg-ground px-5 py-10 sm:px-10"
      >
        <div className="w-full max-w-[26rem]">
          <div data-in className="mb-10 lg:hidden">
            <Logo variant="dark" />
          </div>
          <h1
            data-in
            className="font-display text-[clamp(2.6rem,5vw,3.6rem)] leading-[0.92] font-extrabold uppercase"
          >
            {title}
          </h1>
          <p data-in className="mt-4 text-muted">
            {subtitle}
          </p>
          <div className="mt-9">{children}</div>
        </div>
      </main>
    </div>
  );
}
