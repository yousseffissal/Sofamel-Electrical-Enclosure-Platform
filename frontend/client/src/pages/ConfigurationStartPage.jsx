import { useNavigate } from "react-router-dom";
import { MdBuild, MdGridView } from "react-icons/md";

const BUILD_STEPS = ["Box type", "Template", "Items", "Summary"];

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

export default function ConfigurationStartPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-16">

      <IndustrialBackground />

      <div className="relative max-w-3xl w-full">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            How would you like to start?
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Choose the best way to create or explore your configurations.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Custom Configurator */}
          <div
            onClick={() => navigate("/app/new/box-types")}
            className="group overflow-hidden relative bg-white border border-gray-100 rounded-2xl p-7 cursor-pointer shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col"
          >
            {/* subtle top glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />

            <div className="flex items-center justify-between mb-6">
              <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
                <MdBuild size={20} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                4 steps
              </span>
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-1.5">
              Build custom configuration
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed flex-1">
              Full control over every detail — choose your box type, layout template,
              and components one step at a time.
            </p>

            <div className="flex items-center gap-1 mt-5 flex-wrap">
              {BUILD_STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-1">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    {step}
                  </span>
                  {i < BUILD_STEPS.length - 1 && (
                    <span className="text-gray-300 text-xs">›</span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
              <span className="text-sm font-semibold text-orange-500">Start building</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-orange-400 group-hover:translate-x-0.5 transition-transform duration-150">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

          {/* Distributions */}
          <div
            onClick={() => navigate("/app/distributions")}
            className="group overflow-hidden relative bg-white border border-gray-100 rounded-2xl p-7 cursor-pointer shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col"
          >
            {/* subtle top glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-sky-200" />

            <div className="absolute top-5 right-5">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                Recommended
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                <MdGridView size={20} />
              </div>
            </div>

            <h2 className="text-base font-bold text-gray-900 mb-1.5">
              Explore distributions
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed flex-1">
              Browse a curated library of pre-built configurations. Faster to set up and ideal
              for standard or recurring installations.
            </p>

            <div className="grid grid-cols-4 gap-1.5 mt-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 rounded-lg bg-blue-50 border border-blue-100"
                  style={{ opacity: 0.5 + (i % 3) * 0.2 }} />
              ))}
            </div>

            <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
              <span className="text-sm font-semibold text-blue-500">View gallery</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className="text-blue-400 group-hover:translate-x-0.5 transition-transform duration-150">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>

        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          You can always switch between both options later.
        </p>
      </div>
    </div>
  );
}