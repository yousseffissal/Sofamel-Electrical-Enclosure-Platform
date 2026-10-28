import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdLock, MdArrowForward, MdErrorOutline } from "react-icons/md";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function InputField({ id, label, type, value, onChange, required, placeholder, suffix }) {
    const [focused, setFocused] = useState(false);
    const isActive = focused || value.length > 0;

    return (
        <div className="relative">
            <div
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200"
                style={{ color: isActive ? "#F59E0B" : "#6B7280" }}
            >
                <MdLock size={15} />
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
                value={value}
                onChange={onChange}
                required={required}
                placeholder={focused ? placeholder : ""}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full rounded-xl border bg-gray-900/60 pl-11 pr-11 pb-3 pt-6 text-sm text-white outline-none transition-all duration-200"
                style={{
                    borderColor: focused ? "#F59E0B" : "#374151",
                    boxShadow: focused ? "0 0 0 3px rgba(245,158,11,0.12)" : "none",
                    fontFamily: "'DM Sans', sans-serif",
                }}
            />
            {suffix && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{suffix}</div>
            )}
        </div>
    );
}

// ─── Main ResetPassword Component ────────────────────────────────────────────

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loading, setLoading } = useAuth();

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const [password, setPassword] = useState("");
    const [password_confirmation, setConfirm] = useState("");
    const [validToken, setValidToken] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const hasVerified = useRef(false);

    useEffect(() => {
        if (hasVerified.current) return;
        hasVerified.current = true;

        const verifyToken = async () => {
            setLoading(true);

            if (!token || !email) {
                await Swal.fire({
                    icon: "error",
                    title: "Invalid Link",
                    text: "Reset link is invalid",
                    confirmButtonColor: "#F59E0B",
                    background: "#ffffff",
                    color: "#000000",
                    customClass: {
                        popup: "swal-rounded"
                    }
                });
                navigate("/login");
                return;
            }

            try {
                await api.post(ENDPOINTS.AUTH.VERIFY_RESET_TOKEN, { token, email });
                setValidToken(true);
            } catch (err) {
                await Swal.fire({
                    icon: "error",
                    title: "Invalid Link",
                    text: err.response?.data?.message || "This reset link is invalid or expired",
                    confirmButtonColor: "#F59E0B",
                    background: "#ffffff",
                    color: "#000000",
                    customClass: {
                        popup: "swal-rounded"
                    }
                });
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [token, email, navigate, setLoading]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post(ENDPOINTS.AUTH.RESET, {
                token,
                email,
                password,
                password_confirmation,
            });

            Swal.fire({
                title: "Password Reset",
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
            const message = err.response?.data?.message || "Something went wrong";
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



    if (!validToken) return null;

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
                className="relative min-h-screen flex items-center justify-center px-5 py-12"
                style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1117" }}
            >
                <IndustrialBackground />

                {/* Logo — top left */}
                <div className="absolute top-6 left-6 flex items-center gap-2.5 z-10">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 overflow-hidden flex items-center justify-center">
                        <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-white font-semibold text-sm tracking-wide uppercase">
                        Sofamel
                    </span>
                    <span className="ml-1 text-[10px] font-medium text-amber-400 border border-amber-500/40 rounded px-1.5 py-0.5 tracking-widest uppercase">
                        Configurator
                    </span>
                </div>

                <div className="relative z-10 w-full max-w-[420px] space-y-8">
                    {/* Header */}
                    <div className="anim-fade-up d-100 space-y-1">
                        <p className="text-amber-400 text-[11px] font-semibold tracking-[0.2em] uppercase">
                            Account Security
                        </p>
                        <h2
                            className="text-white font-bold"
                            style={{ fontSize: "1.75rem", lineHeight: 1.2 }}
                        >
                            Set a new password
                        </h2>
                        <p className="text-gray-500 text-sm pt-0.5">
                            Choose a strong password for your account.
                        </p>
                    </div>

                    {/* Card */}
                    <div
                        className="anim-fade-up d-200 rounded-2xl border p-7 space-y-5"
                        style={{
                            background: "rgba(17,24,39,0.9)",
                            borderColor: "#1F2937",
                            boxShadow: "0 0 0 1px rgba(245,158,11,0.05), 0 24px 48px rgba(0,0,0,0.4)",
                        }}
                    >
                        {error && (
                            <div className="anim-fade-up">
                                <ErrorBanner message={error} />
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            {/* New Password */}
                            <div className="anim-fade-up d-280">
                                <InputField
                                    id="password"
                                    label="New Password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
                                    required
                                    placeholder="Enter new password"
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

                            {/* Confirm Password */}
                            <div className="anim-fade-up d-360">
                                <InputField
                                    id="password_confirmation"
                                    label="Confirm Password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={password_confirmation}
                                    onChange={(e) => { setConfirm(e.target.value); if (error) setError(""); }}
                                    required
                                    placeholder="Confirm new password"
                                    suffix={
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-150"
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                        >
                                            {showConfirmPassword ? <IoMdEye size={14} /> : <IoMdEyeOff size={14} />}
                                        </button>
                                    }
                                />
                            </div>

                            {/* Submit */}
                            <div className="anim-fade-up d-440 pt-1">
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
                                        style={{ background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" }}
                                    />
                                    <span className="relative flex items-center gap-2">
                                        {loading ? (
                                            <>
                                                <AiOutlineLoading3Quarters size={15} className="animate-spin" />
                                                Resetting…
                                            </>
                                        ) : (
                                            <>
                                                Reset Password
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
                    <div className="anim-fade-up d-520 flex items-center justify-center gap-5 text-xs text-gray-600">
                        <Link to="/" className="hover:text-gray-400 transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResetPassword;