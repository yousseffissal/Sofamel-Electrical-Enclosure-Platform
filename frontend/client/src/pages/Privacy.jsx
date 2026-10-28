import { MdShield, MdLock, MdInfoOutline, MdEmail } from "react-icons/md";

function IndustrialBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#F59E0B" fillOpacity="0.15" />
        </pattern>
        <pattern id="grid" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M120 0H0V120" fill="none" stroke="#F59E0B" strokeOpacity="0.06" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="#0D1117" />
      <rect width="100%" height="100%" fill="url(#dots)" />
      <rect width="100%" height="100%" fill="url(#grid)" />

      <radialGradient id="glow" cx="30%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>

      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40">
      <div className="flex items-center gap-2 mb-2 text-amber-400">
        {icon}
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

export default function Privacy() {
  return (
    <div
      className="min-h-screen relative text-white"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1117" }}
    >
      <IndustrialBackground />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-14 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <p className="text-amber-400 text-xs tracking-[0.25em] uppercase">
            Sofamel Platform
          </p>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">
            How we collect, use, and protect your data across the configurator platform.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-4">
          <Section icon={<MdShield size={18} />} title="Data Protection">
            We implement strong security measures to protect your personal data,
            configurations, and generated quotations from unauthorized access.
          </Section>

          <Section icon={<MdLock size={18} />} title="Information We Collect">
            We collect account information (email, password), configuration data,
            and usage analytics to improve platform performance and user experience.
          </Section>

          <Section icon={<MdInfoOutline size={18} />} title="How We Use Data">
            Your data is used to generate quotations, save configurations, track orders,
            and enhance system recommendations and compatibility checks.
          </Section>

          <Section icon={<MdEmail size={18} />} title="Contact & Support">
            If you have any questions regarding privacy or data usage, you can contact
            our support team for assistance at any time.
          </Section>
        </div>

        {/* Footer note */}
        <div className="pt-6 border-t border-gray-800 text-xs text-gray-600 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Sofamel</span>
          <span className="text-amber-400">Industrial Configurator Platform</span>
        </div>
      </div>
    </div>
  );
}