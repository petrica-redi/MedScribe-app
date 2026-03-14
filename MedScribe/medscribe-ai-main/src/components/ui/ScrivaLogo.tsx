interface ScrivaLogoProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}

export function ScrivaLogo({
  size = 32,
  variant = "light",
  className,
}: ScrivaLogoProps) {
  const bg = variant === "light" ? "#0f766e" : "#14b8a6";
  const fg = variant === "light" ? "#fff" : "#042f2e";
  const fgMuted =
    variant === "light" ? "rgba(13,148,136,0.5)" : "rgba(13,148,136,0.4)";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="4" y="4" width="64" height="64" rx="16" fill={bg} />
      {/* Document */}
      <rect x="12" y="18" width="22" height="28" rx="3" fill={fg} opacity="0.95" />
      <line x1="16" y1="26" x2="30" y2="26" stroke={fgMuted} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="30" x2="27" y2="30" stroke={fgMuted} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="34" x2="24" y2="34" stroke={fgMuted} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="38" x2="28" y2="38" stroke={fgMuted} strokeWidth="1.5" strokeLinecap="round" />
      {/* Microphone */}
      <rect x="42" y="14" width="12" height="18" rx="6" fill={fg} opacity="0.95" />
      <path
        d="M42 27 Q42 35 48 35 Q54 35 54 27"
        stroke={fg}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <line x1="48" y1="35" x2="48" y2="40" stroke={fg} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="44" y1="40" x2="52" y2="40" stroke={fg} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {/* Stethoscope disc */}
      <circle cx="48" cy="54" r="9" fill={fg} opacity="0.95" />
      <circle cx="48" cy="54" r="5.5" fill={bg} />
      <circle cx="48" cy="54" r="2.5" fill={fg} opacity="0.8" />
    </svg>
  );
}
