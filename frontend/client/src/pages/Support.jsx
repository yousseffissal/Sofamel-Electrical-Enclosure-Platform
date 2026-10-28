import {
  MdEmail,
  MdChat,
  MdPhone,
  MdHelpOutline,
  MdSupportAgent,
  MdSend,
} from "react-icons/md";
import { useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";

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

      <radialGradient id="glow" cx="40%" cy="45%" r="60%">
        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.06" />
        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
      </radialGradient>

      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}

function Card({ icon, title, desc }) {
  return (
    <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 hover:border-gray-700 transition">
      <div className="flex items-center gap-2 text-amber-400 mb-2">
        {icon}
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

export default function Support() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post(ENDPOINTS.REPPORTS.SEND_REPPORT, {
        name: form.name,
        email: form.email,
        issue: form.message,
      });

      setSuccess(
        "Your support request has been submitted successfully."
      );

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Failed to submit your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative text-white"
      style={{ fontFamily: "'DM Sans', sans-serif", background: "#0D1117" }}
    >
      <IndustrialBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 space-y-10">
        {/* Header */}
        <div>
          <p className="text-amber-400 text-xs tracking-[0.25em] uppercase">
            Sofamel Support
          </p>
          <h1 className="text-3xl font-bold">How can we help you?</h1>
          <p className="text-gray-500 text-sm mt-2">
            Get help with configurations, orders, quotations, or technical issues.
          </p>
        </div>

        {/* Contact options */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card
            icon={<MdEmail size={18} />}
            title="Email Support"
            desc="sofamel@sofamel.com - We reply within 48h."
          />
          <Card
            icon={<MdChat size={18} />}
            title="Live Chat"
            desc="Talk with our technical team in real time."
          />
          <Card
            icon={<MdPhone size={18} />}
            title="Phone Support"
            desc="+212 522 718 832 (Mon–Fri)"
          />
        </div>

        {/* Form + FAQ layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-xl border border-gray-800 bg-gray-900/40 space-y-4"
          >
            <div className="flex items-center gap-2 text-amber-400">
              <MdSupportAgent size={18} />
              <h2 className="text-white font-semibold text-sm">
                Send a request
              </h2>
            </div>
            {success && (
              <div className="px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-sm text-white outline-none focus:border-amber-500"
            />

            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
              className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-sm text-white outline-none focus:border-amber-500"
            />

            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your issue..."
              rows={5}
              className="w-full px-4 py-3 rounded-lg bg-gray-950 border border-gray-800 text-sm text-white outline-none focus:border-amber-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              <MdSend size={16} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          {/* FAQ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <MdHelpOutline size={18} />
              <h2 className="text-white font-semibold text-sm">FAQ</h2>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/40">
                <p className="text-white text-sm font-medium">
                  How do I create a configuration?
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Go to configurator and select components step by step.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/40">
                <p className="text-white text-sm font-medium">
                  Can I export a quotation?
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Yes, you can generate PDF quotations instantly.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/40">
                <p className="text-white text-sm font-medium">
                  How do I track my order?
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Use the orders dashboard for real-time tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-800 text-xs text-gray-600 flex justify-between">
          <span>© {new Date().getFullYear()} Sofamel</span>
          <span className="text-amber-400">Industrial Support System</span>
        </div>
      </div>
    </div>
  );
}