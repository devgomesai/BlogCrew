/**
 * Quill logo.
 *
 * Inlined (instead of <img src="/logo.svg">) so the ink details and the
 * wordmark can follow `currentColor`, which tracks the theme's
 * `--foreground` and stays legible on both the light cream and the
 * dark charcoal backgrounds.
 */
export function Logo({ height = 56 }: { height?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      height={height}
      role="img"
      aria-label="Quill"
      style={{
        display: "block",
        width: "auto",
        height,
        color: "hsl(var(--foreground))",
      }}
    >
      <title>Quill Logo</title>
      <defs>
        <linearGradient id="logo-feather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#EAD8B8" />
          <stop offset="55%" stopColor="#E0B066" />
          <stop offset="100%" stopColor="#C87A14" />
        </linearGradient>
        <linearGradient id="logo-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C87A14" />
          <stop offset="100%" stopColor="#D9A455" />
        </linearGradient>
      </defs>

      {/* Feather bird emblem */}
      <g>
        <path
          fill="url(#logo-feather)"
          d="M 176,222
             C 183,164 222,94 292,76
             C 320,68 344,80 362,101
             L 381,125
             C 356,115 337,122 323,139
             C 309,157 307,183 289,202
             C 267,226 225,241 194,279
             L 174,306
             C 178,273 192,245 211,222
             C 232,198 252,172 264,145
             C 232,170 204,193 176,222 Z"
        />

        {/* Head and beak */}
        <path
          fill="url(#logo-feather)"
          d="M 292,76
             C 324,67 354,82 373,109
             L 381,125
             C 360,113 342,119 329,135
             C 338,115 325,91 292,76 Z"
        />

        {/* Eye */}
        <path
          fill="currentColor"
          d="M 333,96 Q 345,100 351,109
             Q 339,109 333,96 Z"
        />

        {/* Wing cutout */}
        <path
          fill="currentColor"
          d="M 188,211
             Q 217,184 251,162
             Q 220,198 188,211 Z"
        />

        {/* Feather shaft */}
        <path
          fill="none"
          stroke="#C87A14"
          strokeWidth="5"
          strokeLinecap="round"
          d="M 175,307 Q 217,229 264,145"
        />

        {/* Lower feather detail */}
        <path
          fill="url(#logo-feather)"
          d="M 192,274
             Q 227,245 276,229
             Q 255,255 225,267
             L 192,274 Z"
        />

        {/* Ink stroke */}
        <path
          fill="none"
          stroke="url(#logo-gold)"
          strokeWidth="5"
          strokeLinecap="round"
          d="M 174,321 Q 240,311 294,306
             Q 323,303 292,296
             Q 265,291 233,296"
        />
      </g>

      {/* Wordmark — follows currentColor so it works in both themes */}
      <text
        x="256"
        y="421"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="100"
        fontWeight="600"
        letterSpacing="-5"
        textAnchor="middle"
        fill="currentColor"
      >
        Quill
      </text>
    </svg>
  );
}
