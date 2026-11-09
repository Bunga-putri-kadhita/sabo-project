import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// Empat status booking nyata dari backend
export const STEPS = [
  { code: "PENDING", label: "Menunggu" },
  { code: "APPROVED", label: "Disetujui" },
  { code: "DIPROSES", label: "Diproses" },
  { code: "SELESAI", label: "Selesai" },
];

const TEETH = 16;
function gearPath(rOut = 96, rIn = 80) {
  const pts = [];
  const step = (Math.PI * 2) / TEETH;
  for (let i = 0; i < TEETH; i++) {
    const a = i * step;
    const q = step / 4;
    [
      [a - q * 1.5, rIn],
      [a - q * 0.7, rOut],
      [a + q * 0.7, rOut],
      [a + q * 1.5, rIn],
    ].forEach(([ang, r]) =>
      pts.push(
        `${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`,
      ),
    );
  }
  return "M" + pts.join("L") + "Z";
}
const PATH = gearPath();

// Roda gigi melangkah 90° melewati empat status booking. Satu clock: gsap.ticker.
export default function GearDial({ nudge = 0 }) {
  const gear = useRef(null);
  const [step, setStep] = useState(0);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  // Langkah otomatis (idle): setiap ~2.6 dtk, berhenti saat tab tersembunyi
  useEffect(() => {
    if (reduced.current) return;
    let last = gsap.ticker.time;
    let idx = 0;
    const tick = () => {
      if (document.hidden) {
        last = gsap.ticker.time;
        return;
      }
      if (gsap.ticker.time - last < 2.6) return;
      last = gsap.ticker.time;
      idx = (idx + 1) % STEPS.length;
      setStep(idx);
      gsap.to(gear.current, {
        rotation: `+=90`,
        duration: 0.9,
        ease: "back.out(2.2)",
        transformOrigin: "50% 50%",
        overwrite: "auto",
      });
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  // Bereaksi saat pengguna mengetik: satu "klik" kecil
  useEffect(() => {
    if (reduced.current || !nudge) return;
    gsap.to(gear.current, {
      rotation: "+=6",
      duration: 0.35,
      ease: "back.out(3)",
      transformOrigin: "50% 50%",
      overwrite: "auto",
    });
  }, [nudge]);

  return (
    <div className="relative w-full">
      <svg
        viewBox="-110 -110 220 220"
        className="block w-full"
        role="img"
        aria-label={`Roda gigi status booking: ${STEPS[step].label}`}
      >
        {STEPS.map((s, i) => {
          const a = (i * Math.PI) / 2 - Math.PI / 2;
          const on = i === step;
          return (
            <g key={s.code}>
              <circle
                cx={Math.cos(a) * 106}
                cy={Math.sin(a) * 106}
                r={on ? 3.2 : 1.8}
                fill={on ? "#F59E0B" : "#475569"}
                style={{ transition: "all .4s" }}
              />
            </g>
          );
        })}
        <g ref={gear}>
          <path
            d={PATH}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle r="62" fill="none" stroke="#334155" strokeWidth="1" />
          <circle r="22" fill="none" stroke="#F59E0B" strokeWidth="1.4" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle
              key={i}
              r="6"
              cx={Math.cos((i * Math.PI) / 3) * 42}
              cy={Math.sin((i * Math.PI) / 3) * 42}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
            />
          ))}
        </g>
        <path
          d="M0,-108 L-4,-118 L4,-118 Z"
          fill="#F59E0B"
          transform="translate(0 6)"
        />
      </svg>

      <ol
        className="mt-6 grid grid-cols-4 gap-2 border-t border-white/10 pt-4"
        aria-hidden="true"
      >
        {STEPS.map((s, i) => (
          <li key={s.code} className="min-w-0">
            <span
              className={`block h-px origin-left transition-all duration-500 ${i <= step ? "w-full bg-amber" : "w-full bg-white/15"}`}
            />
            <span
              className={`mt-3 block font-mono text-[0.65rem] tracking-wider transition-colors duration-500 ${i === step ? "text-amber" : "text-slate-500"}`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className={`block text-[0.8rem] transition-colors duration-500 ${i === step ? "text-white" : "text-slate-500"}`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
