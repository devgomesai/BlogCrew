export function Logo({ height = 28 }: { height?: number }) {
  const w = Math.round(height * (160 / 36));
  return (
    <svg
      viewBox="0 0 160 36"
      width={w}
      height={height}
      fill="none"
      aria-label="BlogCrew"
      role="img"
      style={{ display: "block" }}
    >
      <title>BlogCrew</title>
      {/* orbit ring */}
      <circle
        cx="18"
        cy="18"
        r="14"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeWidth="1.5"
        fill="none"
      />
      {/* hub */}
      <circle
        cx="18"
        cy="18"
        r="5"
        fill="currentColor"
      />
      {/* planner */}
      <circle
        cx="18"
        cy="8"
        r="3"
        fill="currentColor"
        fillOpacity={0.65}
      />
      {/* researcher */}
      <circle
        cx="28"
        cy="18"
        r="3"
        fill="currentColor"
        fillOpacity={0.65}
      />
      {/* writer */}
      <circle
        cx="18"
        cy="28"
        r="3"
        fill="currentColor"
        fillOpacity={0.65}
      />
      {/* editor */}
      <circle
        cx="8"
        cy="18"
        r="3"
        fill="currentColor"
        fillOpacity={0.65}
      />
      {/* wordmark */}
      <text
        x="46"
        y="24"
        fontFamily="Anthropic Sans, system-ui, -apple-system, sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="-0.3"
        fill="currentColor"
      >
        BlogCrew
      </text>
    </svg>
  );
}
