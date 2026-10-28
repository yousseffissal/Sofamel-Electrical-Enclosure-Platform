import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdMail, MdLock, MdArrowForward, MdChevronRight, MdErrorOutline, MdBarChart, MdShield } from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated SVG background: blueprint grid + circuit trace motifs */
function IndustrialBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Fine dot grid */}
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#F59E0B" fillOpacity="0.18" />
        </pattern>
        {/* Large grid lines */}
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

      {/* Layered background */}
      <rect width="100%" height="100%" fill="#0D1117" />
      <rect width="100%" height="100%" fill="url(#dots)" />
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Decorative amber diagonal accent */}
      <line
        x1="0" y1="100%" x2="55%" y2="0"
        stroke="#F59E0B" strokeOpacity="0.04" strokeWidth="220"
      />

      {/* Circuit trace: main horizontal bus */}
      <g stroke="#F59E0B" strokeOpacity="0.22" fill="none">
        <polyline
          points="60,320 180,320 180,240 340,240 340,180 520,180 520,260 700,260"
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />
        {/* Vertical branch */}
        <polyline
          points="340,240 340,380 420,380 420,440 600,440"
          strokeWidth="1.2"
          strokeDasharray="6 4"
        />
        {/* Secondary trace */}
        <polyline
          points="100,520 100,420 260,420 260,340 400,340"
          strokeWidth="0.9"
          strokeDasharray="4 6"
          strokeOpacity="0.13"
        />
      </g>

      {/* Junction nodes */}
      {[
        [180, 320], [340, 240], [520, 180], [340, 380], [420, 440], [100, 420], [260, 420],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="4.5" fill="#F59E0B" fillOpacity="0.25" />
          <circle cx={cx} cy={cy} r="2" fill="#F59E0B" fillOpacity="0.55" />
        </g>
      ))}

      {/* Cabinet outline sketch — top-left decorative element */}
      <g
        transform="translate(55, 80)"
        stroke="#F59E0B"
        strokeOpacity="0.2"
        fill="none"
        strokeWidth="1"
      >
        {/* Outer cabinet box */}
        <rect x="0" y="0" width="110" height="160" rx="2" />
        {/* Door panel */}
        <rect x="8" y="8" width="94" height="144" rx="1" />
        {/* Bus bars */}
        <line x1="20" y1="30" x2="90" y2="30" strokeWidth="2" />
        <line x1="20" y1="38" x2="90" y2="38" strokeWidth="1.2" />
        <line x1="20" y1="46" x2="90" y2="46" strokeWidth="1.2" />
        {/* Breakers */}
        {[70, 90, 110, 130].map((y) => (
          <g key={y}>
            <rect x="20" y={y} width="30" height="10" rx="1" />
            <rect x="58" y={y} width="30" height="10" rx="1" />
          </g>
        ))}
        {/* DIN rails */}
        <line x1="16" y1="65" x2="94" y2="65" strokeDasharray="3 2" />
        <line x1="16" y1="155" x2="94" y2="155" strokeDasharray="3 2" strokeOpacity="0.1" />
      </g>

      {/* Measurement bracket lines */}
      <g stroke="#F59E0B" strokeOpacity="0.1" fill="none" strokeWidth="0.7">
        <line x1="0" y1="200" x2="90" y2="200" />
        <line x1="0" y1="202" x2="0" y2="198" />
        <line x1="90" y1="202" x2="90" y2="198" />
        <line x1="0" y1="500" x2="50" y2="500" />
        <line x1="0" y1="502" x2="0" y2="498" />
        <line x1="50" y1="502" x2="50" y2="498" />
      </g>

      {/* Radial glow — subtle warm center */}
      <radialGradient id="glow" cx="28%" cy="50%" r="55%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

/** Left panel: hero section with value propositions */
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
      {/* Logo / Brand */}
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

      {/* Central headline */}
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

        {/* Feature list */}
        <ul className="space-y-4 pt-2">
          {features.map((f) => (
            <li key={f.title} className="flex items-start gap-3 group">
              <div className="mt-0.5 w-7 h-7 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:bg-amber-500/20 transition-colors duration-200">
                {f.icon}
              </div>
              <div>
                <p
                  className="text-white text-sm font-medium"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {f.title}
                </p>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom badge */}
      <div className="flex items-center gap-2">
        <p className="text-gray-500 text-xs">
          Trusted by <span className="text-amber-400 font-medium">industrial clients</span> across multiple projects
        </p>
      </div>
    </div>
  );
}

/** Inline error banner */
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

/** Floating label input field */
function InputField({
  id,
  label,
  type,
  name,
  value,
  onChange,
  required,
  icon,
  suffix,
  placeholder,
  autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      {/* Icon */}
      <div
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: isActive ? "#F59E0B" : "#6B7280" }}
      >
        {icon}
      </div>

      {/* Floating label */}
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

      {/* Input */}
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
        className="w-full rounded-xl border bg-gray-900/60 pl-11 pr-11 pb-3 pt-6 text-sm text-white outline-none transition-all duration-200"
        style={{
          borderColor: focused ? "#F59E0B" : "#374151",
          boxShadow: focused ? "0 0 0 3px rgba(245,158,11,0.12)" : "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      />

      {/* Suffix slot (eye button etc.) */}
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Restore remembered email
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setForm((f) => ({ ...f, email: saved }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/app/new");

      Swal.fire({
        title: "Welcome back",
        text: "You have been logged in successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#F59E0B",
        background: "#ffffff",
        color: "#000000",
        customClass: {
          popup: "swal-rounded"
        }
      });
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Something went wrong";
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
      {/* Google font — DM Sans */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .anim-fade-up   { animation: fadeUp   0.55s cubic-bezier(.22,.68,0,1.2) both; }
        .anim-slide-r   { animation: slideRight 0.5s cubic-bezier(.22,.68,0,1.2) both; }
        .d-100 { animation-delay: .10s }
        .d-150 { animation-delay: .15s }
        .d-200 { animation-delay: .20s }
        .d-280 { animation-delay: .28s }
        .d-360 { animation-delay: .36s }
        .d-440 { animation-delay: .44s }
        .d-520 { animation-delay: .52s }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #111827 inset !important;
          -webkit-text-fill-color: #F9FAFB !important;
          caret-color: #F9FAFB;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1117" }}
      >
        {/* ── Left: Hero ───────────────────────────────── */}
        <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] overflow-hidden">
          <IndustrialBackground />
          {/* Separator gradient */}
          <div
            className="absolute right-0 top-0 h-full w-24 z-10"
            style={{
              background:
                "linear-gradient(to right, transparent, #0D1117)",
            }}
          />
          <div className="anim-slide-r w-full">
            <HeroPanel />
          </div>
        </div>

        {/* ── Right: Login card ────────────────────────── */}
        <div
          className="flex flex-1 items-center justify-center px-5 py-12 lg:px-12"
          style={{ background: "#0D1117" }}
        >
          {/* Mobile logo */}
          <div className="absolute top-6 left-6 flex items-center gap-2.5 lg:hidden  mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <span
              className="text-white font-semibold text-sm tracking-wide uppercase"
            >
              Sofamel
            </span>
          </div>

          <div className="w-full max-w-[420px] space-y-8 mt-10">
            {/* Header */}
            <div className="anim-fade-up d-100 space-y-1">
              <p className="text-amber-400 text-[11px] font-semibold tracking-[0.2em] uppercase">
                Client Portal
              </p>
              <h2
                className="text-white font-bold"
                style={{ fontSize: "1.75rem", lineHeight: 1.2 }}
              >
                Sign in to your account
              </h2>
              <p className="text-gray-500 text-sm pt-0.5">
                Access your configurations, quotes &amp; orders.
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
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="you@company.com"
                    autoComplete="email"
                    icon={<MdMail size={15} />}
                  />
                </div>

                {/* Password */}
                <div className="anim-fade-up d-360">
                  <InputField
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Your password"
                    autoComplete="current-password"
                    icon={<MdLock size={15} />}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-150"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <IoMdEye size={14} /> : <IoMdEyeOff size={14} />}
                      </button>
                    }
                  />
                </div>

                {/* Remember me + Forgot */}
                <div className="anim-fade-up d-440 flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only peer"
                        id="remember"
                      />
                      <div
                        className="w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center"
                        style={{
                          borderColor: rememberMe ? "#F59E0B" : "#374151",
                          background: rememberMe ? "#F59E0B" : "transparent",
                        }}
                      >
                        {rememberMe && (
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path
                              d="M1 3.5L3.5 6L8 1"
                              stroke="#111827"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs select-none group-hover:text-gray-300 transition-colors">
                      Remember me
                    </span>
                  </label>

                  <Link
                    to="/forget-password"
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit button */}
                <div className="anim-fade-up d-520 pt-1">
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
                    {/* Hover shimmer */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background:
                          "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
                      }}
                    />
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <>
                          <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign in
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
                <span className="text-gray-600 text-xs">New to the platform?</span>
                <div className="flex-1 h-px" style={{ background: "#1F2937" }} />
              </div>

              {/* Register */}
              <Link
                to="/register"
                className="group flex items-center justify-center gap-1.5 w-full rounded-xl border py-3 text-sm font-medium transition-all duration-200"
                style={{
                  borderColor: "#1F2937",
                  color: "#9CA3AF",
                }}
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
                Create an account
                <MdChevronRight
                  size={13}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            {/* Footer links */}
            <div className="anim-fade-up d-520 flex items-center justify-center gap-3 text-xs text-gray-600">
              <Link to="/" className="hover:text-gray-400 transition-colors">
                ← Back to home
              </Link>
              <span>·</span>
              <Link to="/privacy" className="hover:text-gray-400 transition-colors">
                Privacy Policy
              </Link>
              <span>·</span>
              <Link to="/terms" className="hover:text-gray-400 transition-colors">
                Service Terms
              </Link>
              <span>·</span>
              <Link to="/support" className="hover:text-gray-400 transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;