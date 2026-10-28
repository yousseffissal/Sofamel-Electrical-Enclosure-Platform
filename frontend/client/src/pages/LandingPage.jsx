import { useNavigate } from "react-router-dom";
import { MdArrowForward, MdBarChart, MdShield } from "react-icons/md";
import { IoFlash } from "react-icons/io5";

function IndustrialBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#F59E0B" fillOpacity="0.18" />
        </pattern>
        <pattern id="grid" x="0" y="0" width="128" height="128" patternUnits="userSpaceOnUse">
          <path d="M 128 0 L 0 0 0 128" fill="none" stroke="#F59E0B" strokeOpacity="0.06" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#0D1117" />
      <rect width="100%" height="100%" fill="url(#dots)" />
      <rect width="100%" height="100%" fill="url(#grid)" />
      <line x1="0" y1="100%" x2="55%" y2="0" stroke="#F59E0B" strokeOpacity="0.04" strokeWidth="220" />
      <g stroke="#F59E0B" strokeOpacity="0.22" fill="none">
        <polyline points="60,320 180,320 180,240 340,240 340,180 520,180 520,260 700,260" strokeWidth="1.2" strokeDasharray="6 4" />
        <polyline points="340,240 340,380 420,380 420,440 600,440" strokeWidth="1.2" strokeDasharray="6 4" />
        <polyline points="100,520 100,420 260,420 260,340 400,340" strokeWidth="0.9" strokeDasharray="4 6" strokeOpacity="0.13" />
      </g>
      {[[180,320],[340,240],[520,180],[340,380],[420,440],[100,420],[260,420]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4.5" fill="#F59E0B" fillOpacity="0.25" />
          <circle cx={cx} cy={cy} r="2" fill="#F59E0B" fillOpacity="0.55" />
        </g>
      ))}
      <radialGradient id="glow" cx="50%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: <IoFlash size={16} />, title: "Smart Configuration", desc: "Build electrical cabinet configurations with real-time validation." },
    { icon: <MdBarChart size={16} />, title: "Instant Quotation", desc: "Generate detailed quotes and PDF reports in seconds." },
    { icon: <MdShield size={16} />, title: "Order Tracking", desc: "End-to-end visibility from design to delivery." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-fade-up { animation: fadeUp 0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .d-100 { animation-delay: .10s }
        .d-200 { animation-delay: .20s }
        .d-300 { animation-delay: .30s }
        .d-400 { animation-delay: .40s }
        .d-500 { animation-delay: .50s }
      `}</style>

      <div
        className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden"
        style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1117" }}
      >
        <IndustrialBackground />

        <div className="relative z-10 w-full max-w-2xl mx-auto text-center space-y-10">

          {/* Logo */}
          <div className="anim-fade-up d-100 flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Sofamel" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-semibold tracking-wide text-base uppercase">Sofamel</span>
            <span className="text-[10px] font-medium text-amber-400 border border-amber-500/40 rounded px-1.5 py-0.5 tracking-widest uppercase">
              Configurator
            </span>
          </div>

          {/* Headline */}
          <div className="anim-fade-up d-200 space-y-4">
            <p className="text-amber-400 text-[11px] font-semibold tracking-[0.2em] uppercase">
              Electrical Cabinet Platform
            </p>
            <h1
              className="text-white font-bold leading-tight"
              style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
            >
              Design, Configure &<br />
              <span className="text-amber-400">Quote Electrical</span> Cabinets Online
            </h1>
          </div>

          {/* Prototype notice card */}
          <div
            className="anim-fade-up d-300 rounded-2xl border p-6 text-left space-y-3"
            style={{
              background: "rgba(245,158,11,0.05)",
              borderColor: "rgba(245,158,11,0.2)",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Prototype Notice
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              This landing page is a <span className="text-amber-400 font-medium">work in progress placeholder</span>.
              The current file serves as a structural prototype to establish routing and layout scaffolding
              for the Sofamel Configurator platform. It is intentionally minimal and does not represent
              the final design or content of the production landing page.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              The final landing page should be built in the <span className="text-white font-medium">same visual style
              as the login page</span> — dark background (<code className="text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded text-xs">#0D1117</code>),
              amber accent system, DM Sans typography, animated SVG industrial background, and the same
              card and layout conventions. It should include a proper hero section, feature highlights,
              a call-to-action, and any marketing or product content relevant to the platform.
              The <code className="text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded text-xs">LandingPage.jsx</code> file
              needs to be fully redesigned and replaced before going to production.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              And No! this is not an AI generated note I put it because I didn't have the time to make it, I built the project piece by piece.
            </p>
          </div>

          {/* Feature pills */}
          <div className="anim-fade-up d-400 flex flex-wrap justify-center gap-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-2 rounded-xl border px-4 py-2.5"
                style={{ borderColor: "#1F2937", background: "rgba(17,24,39,0.8)" }}
              >
                <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  {f.icon}
                </div>
                <span className="text-gray-300 text-xs font-medium">{f.title}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="anim-fade-up d-500">
            <button
              onClick={() => navigate("/login")}
              className="group relative inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-gray-900 transition-all duration-200 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" }}
              />
              <span className="relative flex items-center gap-2">
                Go to Sign In
                <MdArrowForward size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            </button>
            <p className="text-gray-600 text-xs mt-3">
              Access your configurations, quotes & orders
            </p>
          </div>

        </div>
      </div>
    </>
  );
}