import logoWhite from "../assets/logo-white.png";
import logoBlack from "../assets/logo-black.png";

// variant "light" = di atas latar gelap (logo putih); "dark" = di atas latar terang (logo hitam)
export default function Logo({
  variant = "light",
  showWord = true,
  size = 36,
}) {
  const src = variant === "light" ? logoWhite : logoBlack;
  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="object-contain"
      />
      {showWord && (
        <span
          className={`font-display text-[1.6rem] leading-none tracking-[0.04em] ${
            variant === "light" ? "text-white" : "text-ink"
          }`}
          style={{ fontWeight: 800 }}
        >
          SABO<span className="text-amber">.</span>
        </span>
      )}
    </span>
  );
}
