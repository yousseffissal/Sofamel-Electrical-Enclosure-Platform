import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import {
  MdMail,
  MdLock,
  MdArrowForward,
  MdErrorOutline,
  MdBarChart,
  MdShield,
  MdPerson,
  MdCheckCircle,
} from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// ─── Design tokens (shared with Login) ────────────────────────────────────────
const DARK_BG = "#0D1117";
const CARD_BG = "rgba(17,24,39,0.9)";
const BORDER = "#1F2937";
const BORDER_MID = "#374151";
const AMBER = "#FFCA28";
const AMBER_DARK = "#D97706";
const AMBER_LITE = "#FBBF24";

// ─── Shared global styles (same keyframes as Login) ───────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .anim-fade-up { animation: fadeUp    0.55s cubic-bezier(.22,.68,0,1.2) both; }
  .anim-slide-r { animation: slideRight 0.5s  cubic-bezier(.22,.68,0,1.2) both; }
  .d-100 { animation-delay: .10s }
  .d-150 { animation-delay: .15s }
  .d-200 { animation-delay: .20s }
  .d-260 { animation-delay: .26s }
  .d-320 { animation-delay: .32s }
  .d-380 { animation-delay: .38s }
  .d-440 { animation-delay: .44s }
  .d-500 { animation-delay: .50s }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #111827 inset !important;
    -webkit-text-fill-color: #F9FAFB !important;
    caret-color: #F9FAFB;
  }
`;

// ─── Password strength ─────────────────────────────────────────────────────────
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const map = [
    { label: "Too short", color: "#EF4444" },
    { label: "Weak", color: "#F97316" },
    { label: "Fair", color: "#EAB308" },
    { label: "Good", color: "#22C55E" },
    { label: "Strong", color: "#10B981" },
  ];
  return { score, ...map[score] };
}

function PasswordStrengthBar({ password }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{
              background: i <= score ? color : BORDER_MID,
            }}
          />
        ))}
      </div>
      <p className="text-[11px] transition-colors duration-200" style={{ color }}>
        {label}
      </p>
    </div>
  );
}

// ─── Sub-components (identical structure to Login) ────────────────────────────

/** Blueprint SVG background — same grid as Login */
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


/** Left hero panel — registration-focused messaging */
function HeroPanel() {
  const steps = [
    {
      icon: <MdPerson size={15} />,
      step: "01",
      title: "Create your account",
      desc: "One-time setup in under 60 seconds.",
    },
    {
      icon: <IoFlash size={15} />,
      step: "02",
      title: "Configure your cabinet",
      desc: "Pick components, set dimensions, validate in real time.",
    },
    {
      icon: <MdBarChart size={15} />,
      step: "03",
      title: "Get an instant quote",
      desc: "Auto-generated PDF sent directly to your inbox.",
    },
    {
      icon: <MdShield size={15} />,
      step: "04",
      title: "Track your order",
      desc: "Full visibility from production floor to delivery.",
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

      {/* Headline */}
      <div className="space-y-6">
        <div>
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
            style={{ color: AMBER }}
          >
            Get started today
          </p>
          <h1
            className="text-white leading-[1.1] font-bold"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(2rem, 3.5vw, 2.9rem)",
            }}
          >
            Your Configurator
            <br />
            <span style={{ color: AMBER }}> Workspace,</span>
            <br />
            Ready In Minutes.
          </h1>
        </div>
        <p
          className="text-gray-400 leading-relaxed max-w-sm"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9375rem" }}
        >
          Join engineers across the industry who design, quote, and order
          electrical cabinets — faster than ever.
        </p>

        {/* Step list */}
        <ol className="space-y-3.5 pt-1">
          {steps.map((s) => (
            <li key={s.step} className="flex items-center gap-3 group">
              {/* Step number badge */}
              <div
                className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-colors duration-200"
                style={{
                  background: `${AMBER}18`,
                  border: `1px solid ${AMBER}33`,
                  color: AMBER,
                }}
              >
                {s.step}
              </div>
              <div className="flex items-start gap-2 min-w-0">
                <div>
                  <p
                    className="text-white text-sm font-medium leading-tight"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {s.title}
                  </p>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-3">
        <MdCheckCircle size={16} style={{ color: AMBER }} />
        <p className="text-gray-500 text-xs">
          Free to start ·{" "}
          <span className="text-gray-400">No credit card required</span>
        </p>
      </div>
    </div>
  );
}

/** Error banner — identical to Login */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm"
      style={{
        border: "1px solid rgba(239,68,68,0.3)",
        background: "rgba(239,68,68,0.08)",
        color: "#F87171",
      }}
    >
      <MdErrorOutline size={15} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/** Floating-label input — identical pattern to Login */
function InputField({
  id, label, type, name, value, onChange,
  required, icon, suffix, placeholder, autoComplete,
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div className="relative">
      {/* Left icon */}
      <div
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
        style={{ color: isActive ? AMBER : "#6B7280" }}
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
          color: focused ? AMBER : isActive ? "#9CA3AF" : "#6B7280",
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
          borderColor: focused ? AMBER : BORDER,
          boxShadow: focused ? `0 0 0 3px ${AMBER}1E` : "none",
          fontFamily: "'DM Sans', sans-serif",
        }}
      />

      {/* Suffix (eye toggle etc.) */}
      {suffix && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  );
}

// ─── Main Register Component ──────────────────────────────────────────────────

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/app");

      Swal.fire({
        title: "Account created",
        text: "Your account has been created successfully.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: AMBER,
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
        confirmButtonColor: AMBER,
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

  const strength = getPasswordStrength(form.password);
  const canSubmit = !loading && agreeTerms && form.name && form.email && form.password;

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      <div
        className="min-h-screen flex flex-col lg:flex-row"
        style={{ fontFamily: "'DM Sans', sans-serif", background: DARK_BG }}
      >
        {/* ── Left: Hero ──────────────────────────────────── */}
        <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] overflow-hidden">
          <IndustrialBackground />
          {/* Right-edge fade into card area */}
          <div
            className="absolute right-0 top-0 h-full w-24 z-10"
            style={{ background: `linear-gradient(to right, transparent, ${DARK_BG})` }}
          />
          <div className="anim-slide-r w-full">
            <HeroPanel />
          </div>
        </div>

        {/* ── Right: Registration form ─────────────────────── */}
        <div
          className="flex flex-1 items-center justify-center px-5 py-12 lg:px-12"
          style={{ background: DARK_BG }}
        >
          {/* Mobile logo */}
          <div className="absolute top-6 left-6 flex items-center gap-2.5 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-amber-500 overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <span
              className="text-white font-semibold text-sm tracking-wide uppercase"
            >
              Sofamel
            </span>
          </div>


          <div className="w-full max-w-[420px] space-y-6 mt-10">
            {/* Page header */}
            <div className="anim-fade-up d-100 space-y-1">
              <p
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ color: AMBER }}
              >
                Client Registration
              </p>
              <h2
                className="text-white font-bold"
                style={{ fontSize: "1.75rem", lineHeight: 1.2 }}
              >
                Create your account
              </h2>
              <p className="text-gray-500 text-sm pt-0.5">
                Start configuring cabinets in minutes.
              </p>
            </div>

            {/* Card */}
            <div
              className="anim-fade-up d-200 rounded-2xl border p-7 space-y-5"
              style={{
                background: CARD_BG,
                borderColor: BORDER,
                boxShadow: `0 0 0 1px ${AMBER}0D, 0 24px 48px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Error banner */}
              {error && (
                <div className="anim-fade-up">
                  <ErrorBanner message={error} />
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Full name */}
                <div className="anim-fade-up d-260">
                  <InputField
                    id="name"
                    label="Full name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    autoComplete="name"
                    icon={<MdPerson size={15} />}
                  />
                </div>

                {/* Email */}
                <div className="anim-fade-up d-320">
                  <InputField
                    id="email"
                    label="Work email address"
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

                {/* Password + strength meter */}
                <div className="anim-fade-up d-380">
                  <InputField
                    id="password"
                    label="Create a password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    icon={<MdLock size={15} />}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center justify-center w-7 h-7 rounded-md transition-all duration-150"
                        style={{ color: "#6B7280" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = AMBER;
                          e.currentTarget.style.background = `${AMBER}1A`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#6B7280";
                          e.currentTarget.style.background = "transparent";
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <IoMdEye size={14} /> : <IoMdEyeOff size={14} />}
                      </button>
                    }
                  />
                  {/* Strength bar */}
                  <PasswordStrengthBar password={form.password} />
                </div>

                {/* Terms agreement */}
                <div className="anim-fade-up d-440 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    {/* Custom checkbox */}
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="sr-only"
                        id="terms"
                      />
                      <div
                        className="w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center"
                        style={{
                          borderColor: agreeTerms ? AMBER : BORDER_MID,
                          background: agreeTerms ? AMBER : "transparent",
                        }}
                      >
                        {agreeTerms && (
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
                    <span className="text-xs leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors select-none">
                      I agree to the{" "}
                      <a
                        href="#"
                        className="font-medium transition-colors"
                        style={{ color: AMBER }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = AMBER_LITE)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = AMBER)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="#"
                        className="font-medium transition-colors"
                        style={{ color: AMBER }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = AMBER_LITE)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = AMBER)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="anim-fade-up d-500 pt-1">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group relative w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                    style={{
                      background: loading
                        ? AMBER_DARK
                        : `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                    }}
                  >
                    {/* Hover shimmer */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${AMBER_LITE} 0%, ${AMBER} 100%)`,
                      }}
                    />
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <>
                          <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                          Creating account…
                        </>
                      ) : (
                        <>
                          Create account
                          <MdArrowForward
                            size={14}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </>
                      )}
                    </span>
                  </button>

                  {/* Tooltip hint when terms not accepted */}
                  {!agreeTerms && (form.name || form.email || form.password) && (
                    <p className="mt-2 text-center text-[11px] text-gray-600">
                      Please accept the terms to continue
                    </p>
                  )}
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px" style={{ background: BORDER }} />
                <span className="text-gray-600 text-xs">Already registered?</span>
                <div className="flex-1 h-px" style={{ background: BORDER }} />
              </div>

              {/* Back to login */}
              <Link
                to="/login"
                className="group flex items-center justify-center gap-1.5 w-full rounded-xl border py-3 text-sm font-medium transition-all duration-200"
                style={{ borderColor: BORDER, color: "#9CA3AF" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = BORDER_MID;
                  e.currentTarget.style.color = "#F9FAFB";
                  e.currentTarget.style.background = "rgba(31,41,55,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = BORDER;
                  e.currentTarget.style.color = "#9CA3AF";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Sign in to existing account
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

export default Register;