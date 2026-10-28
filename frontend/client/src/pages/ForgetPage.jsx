import { useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { MdMail, MdArrowForward, MdErrorOutline } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoFlash } from "react-icons/io5";
import { MdBarChart, MdShield } from "react-icons/md";

// ─── Sub-components (shared with Login) ──────────────────────────────────────

function IndustrialBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#F59E0B" fillOpacity="0.18" />
        </pattern>
        <pattern id="grid" x="0" y="0" width="128" height="128" patternUnits="userSpaceOnUse">
          <path
            d="M 128 0 L 0 0 0 128"
            fill="none"
            stroke="#F59E0B"
            strokeOpacity="0.06"
            strokeWidth="0.8"
          />
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
      {[[180, 320], [340, 240], [520, 180], [340, 380], [420, 440], [100, 420], [260, 420]].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4.5" fill="#F59E0B" fillOpacity="0.25" />
          <circle cx={cx} cy={cy} r="2" fill="#F59E0B" fillOpacity="0.55" />
        </g>
      ))}
      <g transform="translate(55, 80)" stroke="#F59E0B" strokeOpacity="0.2" fill="none" strokeWidth="1">
        <rect x="0" y="0" width="110" height="160" rx="2" />
        <rect x="8" y="8" width="94" height="144" rx="1" />
        <line x1="20" y1="30" x2="90" y2="30" strokeWidth="2" />
        <line x1="20" y1="38" x2="90" y2="38" strokeWidth="1.2" />
        <line x1="20" y1="46" x2="90" y2="46" strokeWidth="1.2" />
        {[70, 90, 110, 130].map((y) => (
          <g key={y}>
            <rect x="20" y={y} width="30" height="10" rx="1" />
            <rect x="58" y={y} width="30" height="10" rx="1" />
          </g>
        ))}
        <line x1="16" y1="65" x2="94" y2="65" strokeDasharray="3 2" />
        <line x1="16" y1="155" x2="94" y2="155" strokeDasharray="3 2" strokeOpacity="0.1" />
      </g>
      <radialGradient id="glow" cx="28%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

function HeroPanel() {
  const features = [
    {
      icon: <IoFlash size={16} />,
      title: "Smart Configuration",
      desc: "Create customized your cabinet configurations with real-time compatibility validation.",
    },
    {
      icon: <MdBarChart size={16} />,
      title: "Instant Quotation",
      desc: "Generate detailed quotes in seconds.",
    },
    {
      icon: <MdShield size={16} />,
      title: "Order Tracking",
      desc: "End-to-end visibility from design to delivery.",
    },
  ];

  return (
    <div className="relative flex flex-col justify-between h-full px-10 py-12 lg:px-14 lg:py-16 z-10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center overflow-hidden justify-center">
          <img src="/logo.png" alt="" className="w-full h-full object-contain" />
        </div>
        <span
          className="text-white font-semibold tracking-wide text-base uppercase"
          style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em" }}
        >
          Sofamel
        </span>
        <span className="ml-1 text-[10px] font-medium text-amber-400 border border-amber-500/40 rounded px-1.5 py-0.5 tracking-widest uppercase">
          Configurator
        </span>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Electrical Cabinet Platform
          </p>
          <h1
            className="text-white leading-[1.1] font-bold"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 2.9rem)",
            }}
          >
            Design, Configure &
            <br />
            <span className="text-amber-400">Quote Electrical</span>
            <br />
            Cabinets Online
          </h1>
        </div>
        <p
          className="text-gray-400 leading-relaxed max-w-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9375rem" }}
        >
          Model electrical cabinets, generate instant quotations, download configuration reports, and track your orders from a single platform.
        </p>
        <ul className="space-y-4 pt-2">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3 group">
              <div className="mt-0.5 w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:bg-amber-500/20 transition-colors duration-200">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-sm font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {f.title}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-gray-500 text-xs">
          Trusted by <span className="text-amber-400 font-medium">industrial clients</span> across multiple projects
        </p>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-400"
    >
      <MdErrorOutline size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function InputField({ id, label, type, name, value, onChange, required, icon, placeholder, autoComplete }) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: isActive ? "#F59E0B" : "#6B7280" }}
      >
        {icon}
      </div>
      <label
        htmlFor={id}
        className="absolute left-11 transition-all duration-200 pointer-events-none select-none"
        style={{
          top: isActive ? "8px" : "50%",
          transform: isActive ? "translateY(0) scale(0.78)" : "translateY(-50%)",
          transformOrigin: "left center",
          fontSize: isActive ? "11px" : "14px",
          color: focused ? "#F59E0B" : isActive ? "#9CA3AF" : "#6B7280",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={focused ? placeholder : ""}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl border bg-gray-900/60 pl-11 pr-4 pb-3 pt-6 text-sm text-white outline-none transition-all duration-200"
        style={{
          borderColor: focused ? "#F59E0B" : "#374151",
          boxShadow: focused ? "0 0 0 3px rgba(245,158,11,0.12)" : "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      />
    </div>
  );
}

// ─── Main ForgotPassword Component ───────────────────────────────────────────

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(ENDPOINTS.AUTH.FORGET, { email });

      Swal.fire({
        title: "Email Sent",
        text: res.data.message,
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#F59E0B",
        background: "#ffffff",
        color: "#000000",
        customClass: {
          popup: "swal-rounded"
        }
      });

      navigate("/login");
    } catch (err) {
      const message = err?.response?.data?.message || "Something went wrong";
      setError(message);

      Swal.fire({
        text: message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#F59E0B",
        background: "#ffffff",
        color: "#000000",
        customClass: {
          popup: "swal-rounded"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1117" }}
      >
        {/* ── Left: Hero ───────────────────────────────── */}
        <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] overflow-hidden">
          <IndustrialBackground />
          <div
            className="absolute right-0 top-0 h-full w-24 z-10"
            style={{ background: "linear-gradient(to right, transparent, #0D1117)" }}
          />
          <div className="anim-slide-r w-full">
            <HeroPanel />
          </div>
        </div>

        {/* ── Right: Forgot Password card ──────────────── */}
        <div
          className="flex flex-1 items-center justify-center px-5 py-12 lg:px-12"
          style={{ background: "#0D1117" }}
        >
          {/* Mobile logo */}
          <div className="absolute top-6 left-6 flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <span className="text-white font-semibold text-sm tracking-wide uppercase">
              Sofamel
            </span>
          </div>

          <div className="w-full max-w-[420px] space-y-8">
            {/* Header */}
            <div className="anim-fade-up d-100 space-y-1">
              <p className="text-amber-400 text-[11px] font-semibold tracking-[0.2em] uppercase">
                Account Recovery
              </p>
              <h2
                className="text-white font-bold"
                style={{ fontSize: "1.75rem", lineHeight: 1.2 }}
              >
                Forgot your password?
              </h2>
              <p className="text-gray-500 text-sm pt-0.5">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {/* Card */}
            <div
              className="anim-fade-up d-200 rounded-2xl border p-7 space-y-5"
              style={{
                background: "rgba(17,24,39,0.9)",
                borderColor: "#1F2937",
                boxShadow:
                  "0 0 0 1px rgba(245,158,11,0.05), 0 24px 48px rgba(0,0,0,0.4)",
              }}
            >
              {/* Error banner */}
              {error && (
                <div className="anim-fade-up">
                  <ErrorBanner message={error} />
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Email */}
                <div className="anim-fade-up d-280">
                  <InputField
                    id="email"
                    label="Email address"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    placeholder="you@company.com"
                    autoComplete="email"
                    icon={<MdMail size={15} />}
                  />
                </div>

                {/* Submit */}
                <div className="anim-fade-up d-360 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-gray-900 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: loading
                        ? "#D97706"
                        : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                    }}
                  >
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                      }}
                    />
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <>
                          <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <MdArrowForward
                            size={14}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px" style={{ background: "#1F2937" }} />
                <span className="text-gray-600 text-xs">Remember your password?</span>
                <div className="flex-1 h-px" style={{ background: "#1F2937" }} />
              </div>

              {/* Back to login */}
              <Link
                to="/login"
                className="group flex items-center justify-center gap-1.5 w-full rounded-xl border py-3 text-sm font-medium transition-all duration-200"
                style={{ borderColor: "#1F2937", color: "#9CA3AF" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#374151";
                  e.currentTarget.style.color = "#F9FAFB";
                  e.currentTarget.style.background = "rgba(31,41,55,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1F2937";
                  e.currentTarget.style.color = "#9CA3AF";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Back to Sign In
              </Link>
            </div>

            {/* Footer links */}
            <div className="anim-fade-up d-440 flex items-center justify-center gap-5 text-xs text-gray-600">
              <Link to="/" className="hover:text-gray-400 transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;