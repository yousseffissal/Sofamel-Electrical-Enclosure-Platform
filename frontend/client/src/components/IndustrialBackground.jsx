function IndustrialBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Soft dot grid */}
        <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#94A3B8" fillOpacity="0.12" />
        </pattern>

        {/* Soft grid */}
        <pattern id="grid" width="110" height="110" patternUnits="userSpaceOnUse">
          <path
            d="M 110 0 L 0 0 0 110"
            fill="none"
            stroke="#CBD5E1"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
        </pattern>

        {/* Subtle glow */}
        <radialGradient id="glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base (white background feel) */}
      <rect width="100%" height="100%" fill="#F8FAFC" />

      {/* Layers */}
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#dots)" />

      {/* Soft diagonal wash */}
      <line
        x1="0"
        y1="100%"
        x2="65%"
        y2="0"
        stroke="#3B82F6"
        strokeOpacity="0.03"
        strokeWidth="180"
      />

      {/* Circuit lines (light blue-gray) */}
      <g
        stroke="#64748B"
        strokeOpacity="0.18"
        fill="none"
        strokeWidth="1.1"
        strokeDasharray="6 6"
      >
        <polyline points="80,320 220,320 220,220 420,220 420,280 640,280" />
        <polyline points="160,520 160,420 320,420 320,340 520,340" />
      </g>

      {/* Nodes */}
      {[
        [220, 320],
        [420, 220],
        [320, 420],
        [520, 340],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill="#3B82F6" fillOpacity="0.18" />
          <circle cx={x} cy={y} r="2" fill="#3B82F6" fillOpacity="0.5" />
        </g>
      ))}

      {/* Glow overlay */}
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

export default IndustrialBackground;