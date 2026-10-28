import { useEffect, useState } from "react";
import { getBoxTypes } from "../api/configuratorApi";
import { useDispatch } from "react-redux";
import { setSelectedBoxType, resetConfigurator } from "../store/slices/configuratorSlice";
import { useNavigate } from "react-router-dom";
import ProgressStepper from "../components/ProgressStepper";

const BoxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const ZapIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const LayersIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-xl" />
      <div className="w-16 h-5 bg-gray-100 rounded-full" />
    </div>
    <div className="w-32 h-5 bg-gray-100 rounded mb-2" />
    <div className="w-24 h-3 bg-gray-100 rounded mb-4" />
    <div className="w-full h-3 bg-gray-100 rounded mb-2" />
    <div className="w-4/5 h-3 bg-gray-100 rounded mb-5" />
    <div className="grid grid-cols-3 gap-2">
      <div className="h-12 bg-gray-100 rounded-xl" />
      <div className="h-12 bg-gray-100 rounded-xl" />
      <div className="h-12 bg-gray-100 rounded-xl" />
    </div>
  </div>
);

const COLOR_PALETTE = [
  { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100", icon: "text-blue-500" },
  { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100", icon: "text-violet-500" },
  { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100", icon: "text-amber-500" },
  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", icon: "text-orange-500" },
  { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-100", icon: "text-teal-500" },
  { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-100", icon: "text-cyan-500" },
  { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100", icon: "text-rose-500" },
  { bg: "bg-green-50", text: "text-green-700", border: "border-green-100", icon: "text-green-500" },
  { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-100", icon: "text-slate-500" },
  { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-100", icon: "text-indigo-500" },
  { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-100", icon: "text-pink-500" },
  { bg: "bg-lime-50", text: "text-lime-700", border: "border-lime-100", icon: "text-lime-500" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", border: "border-fuchsia-100", icon: "text-fuchsia-500" },
  { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-100", icon: "text-sky-500" },
  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-100", icon: "text-emerald-500" },
];

const hashFamily = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return hash;
};

const getColors = (family) => COLOR_PALETTE[hashFamily(family ?? "") % COLOR_PALETTE.length];

/* ─── Light Advanced Background ───────────────────────────── */
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

export default function BoxTypesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getBoxTypes()
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (box) => {
    dispatch(resetConfigurator());
    dispatch(setSelectedBoxType(box));
    navigate("/app/new/templates");
  };

  return (
    <div className="min-h-screen bg-gray-50/60">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8">

        {/* Title row */}
        <div className="max-w-7xl mx-auto py-4 md:py-5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
            <span>Configurator</span>
            <span>›</span>
            <span className="text-amber-600">Box Type</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  Select Your Box Type
                </h1>
                {!loading && (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-900">{data.length}</span>
                    <span className="text-xs text-gray-500">available</span>
                  </div>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1.5 max-w-xl hidden sm:block">
                Choose the electrical distribution enclosure that best fits your
                installation requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Progress stepper */}
        <div className="max-w-7xl mx-auto border-t border-gray-100">
          <ProgressStepper currentStep={1} />
        </div>
      </div>

      <div className="relative">
        {/* Background */}
        <IndustrialBackground />
        {/* Content */}
        <div className="max-w-7xl mx-auto px-3 md:px-5 py-4 md:py-5 min-h-screen">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
              {data.map((box) => {
                const colors = getColors(box.family);
                const isHovered = hoveredId === box.id;

                return (
                  <div
                    key={box.id}
                    onClick={() => handleSelect(box)}
                    onMouseEnter={() => setHoveredId(box.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`
                    relative bg-white border rounded-2xl p-4 md:p-6 cursor-pointer
                    transition-all duration-200
                    ${isHovered
                        ? "border-gray-300 shadow-lg shadow-gray-100 -translate-y-0.5"
                        : "border-gray-100 shadow-sm hover:shadow-md"
                      }
                  `}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center ${colors.icon} flex-shrink-0`}>
                        <BoxIcon />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {box.family}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{box.variant}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="font-bold text-gray-900 text-sm md:text-base mb-0.5 tracking-tight">{box.code}</h2>
                    <p className="text-xs text-gray-400 font-medium mb-2.5 truncate">
                      {box.material} · {box.mounting_type} · {box.color}
                    </p>

                    {/* Description — hidden on small mobile to save space */}
                    <p className="sm:text-sm text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2 block">
                      {box.description}
                    </p>

                    {/* Specs grid */}
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-4">
                      {[
                        { label: "Width", value: parseFloat(box.width_mm).toFixed(0) },
                        { label: "Height", value: parseFloat(box.height_mm).toFixed(0) },
                        { label: "Depth", value: parseFloat(box.depth_mm).toFixed(0) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-2 md:p-3 text-center">
                          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5">{label}</p>
                          <p className="text-xs md:text-sm font-semibold text-gray-700">
                            {value}<span className="text-[10px] md:text-xs font-normal text-gray-400"> mm</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        <LayersIcon /> {box.ip_rating}
                      </span>
                      {box.has_earth_leakage && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          <ShieldIcon /> {box.earth_leakage_rating}
                        </span>
                      )}
                      {box.has_overcurrent && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          <ZapIcon /> Overcurrent
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {box.configurable_boxes_count} templates
                      </span>
                      <span className={`text-xs font-semibold flex items-center gap-1 transition-all duration-200 ${isHovered ? colors.text : "text-gray-400"}`}>
                        Select
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          className={`transition-transform duration-200 ${isHovered ? "translate-x-0.5" : ""}`}>
                          <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}