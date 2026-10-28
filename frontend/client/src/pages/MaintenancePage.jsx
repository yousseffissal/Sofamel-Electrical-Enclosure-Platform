import { MdBuild } from "react-icons/md";
import { FiInfo } from "react-icons/fi";

function IndustrialBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#94A3B8" fillOpacity="0.12" />
        </pattern>

        <pattern id="grid" width="110" height="110" patternUnits="userSpaceOnUse">
          <path d="M 110 0 L 0 0 0 110" fill="none" stroke="#CBD5E1" strokeOpacity="0.25" strokeWidth="1" />
        </pattern>

        <radialGradient id="glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="#F8FAFC" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#dots)" />

      <line
        x1="0"
        y1="100%"
        x2="65%"
        y2="0"
        stroke="#F97316"
        strokeOpacity="0.04"
        strokeWidth="160"
      />

      <g
        stroke="#64748B"
        strokeOpacity="0.15"
        fill="none"
        strokeWidth="1"
        strokeDasharray="6 6"
      >
        <polyline points="90,300 240,300 240,200 420,200 420,260 640,260" />
        <polyline points="180,520 180,420 340,420 340,340 520,340" />
      </g>

      <circle cx="240" cy="300" r="4" fill="#F97316" fillOpacity="0.25" />
      <circle cx="420" cy="200" r="4" fill="#F97316" fillOpacity="0.25" />
      <circle cx="340" cy="420" r="4" fill="#F97316" fillOpacity="0.25" />

      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

export default function MaintenancePage() {
  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <IndustrialBackground />

      {/* CARD */}
      <div className="relative w-full max-w-xl">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 text-center relative overflow-hidden">

          <div className="absolute top-0 left-0 w-full h-1 bg-orange-400" />

          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-5">
            <MdBuild size={24} />
          </div>

          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
            Under maintenance
          </span>

          <h1 className="text-xl font-bold text-gray-900 mt-4">
            This page is under maintenance
          </h1>

          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            This section is temporarily unavailable.<br />
            It will be back up shortly — no action needed from your side.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">Planning</span>
            <span>›</span>
            <span className="px-2 py-1 rounded-full bg-gray-100">
              Maintenance
            </span>
            <span>›</span>
            <span className="px-2 py-1 rounded-full bg-gray-100">Deploying</span>
          </div>

          <div className="mt-5 flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-left">
            <FiInfo className="text-orange-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
              Our team is working on this. Updates will reflect automatically once maintenance is complete.
            </p>
          </div>

          <p className="text-[11px] text-gray-400 mt-5">
            System status: maintenance mode
          </p>
        </div>
      </div>
    </div>
  );
}