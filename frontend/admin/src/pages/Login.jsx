import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import {
  FiShield,
  FiZap,
  FiLock,
  FiArrowRight,
} from "react-icons/fi";

function Login() {
  const { login, token, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (token) logout();

      await login(form);

      setSuccess("Login successful");

      Swal.fire({
        title: "Login successful",
        text: "You have been logged in successfully",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

      navigate("/dashboard/overview");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Something went wrong";

      setError(message);

      Swal.fire({
        text: message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative flex items-center justify-center bg-gradient-to-r from-orange-400 to-red-400 px-6 py-10">


      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.11]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-3xl"></div>

      {/* MAIN CARD */}
      <div className="relative w-full max-w-6xl rounded-[35px] overflow-hidden shadow-lg backdrop-blur-xl bg-white border border-white/20 flex flex-col md:flex-row">

        {/* ================= LEFT SIDE ================= */}
        <div
          className="md:w-1/2 p-5 pr-0 relative overflow-hidden min-h-[750px]"
          style={{
            backgroundImage: "url('/logo2.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-bl from-black/10 via-black/20 to-black/30"></div>

          {/* LIGHT EFFECTS */}
          <div className="absolute top-10 left-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

          {/* FLOATING DOTS */}
          <div className="absolute top-20 right-20 w-3 h-3 bg-white rounded-full opacity-70"></div>
          <div className="absolute top-40 right-40 w-2 h-2 bg-orange-300 rounded-full opacity-70"></div>
          <div className="absolute bottom-32 left-20 w-2 h-2 bg-white rounded-full opacity-60"></div>

          {/* INNER CONTAINER */}
          <div className="
            relative z-10
            h-full
            p-10
            border border-white
            border-r-transparent
            rounded-bl-[30px]
            rounded-tl-[30px]
            flex flex-col justify-around
            text-white
            backdrop-blur-[1px]
          ">

            {/* TOP */}
            <div className="flex flex-col gap-9 justify-center items-center text-center mb-3">

              {/* LOGO */}
              <div className="w-28 h-28 rounded-3xl bg-white shadow-2xl overflow-hidden flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Company Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* TEXT */}
              <div className="space-y-1">

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Smart Management Platform
                </div>

                <h1 className="text-5xl font-black leading-tight">
                  Welcome Back
                </h1>

                <p className="text-white leading-5 text-sm max-w-md">
                  Access your dashboard and manage your users,
                  systems and operations with a modern and secure
                  experience designed for performance.
                </p>

              </div>

            </div>

            {/* FEATURES */}
            <div className="space-y-6">

              <Feature
                icon={<FiShield />}
                title="Secure Access"
                text="Advanced authentication and protected sessions."
              />

              <Feature
                icon={<FiZap />}
                title="Fast Performance"
                text="Optimized dashboard for better workflow."
              />

              <Feature
                icon={<FiLock />}
                title="Reliable System"
                text="Stable architecture with trusted infrastructure."
              />

            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between mt-3 pt-6 border-t border-white/40">

              <div>
                <div className="text-sm font-semibold">
                  Sofamel Dashboard
                </div>

                <div className="text-xs text-white">
                  Modern Administration System
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <FiArrowRight />
              </div>

            </div>

          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div className="md:w-1/2 p-5 pl-0 bg-white">

          <div className="
            relative
            h-full
            p-8 md:p-10
            border-2 border-orange-500
            border-l-transparent
            rounded-br-[30px]
            rounded-tr-[30px]
            bg-white
          ">

            {/* HEADER */}
            <div className="mb-6 text-center">

              <h1 className="
                text-5xl
                font-black
                bg-clip-text
                text-transparent
                bg-gradient-to-r
                from-orange-500
                to-red-500
                p-2
              ">
                Login
              </h1>
            </div>

            <div
              className={`
    mb-6 rounded-2xl px-5 py-4 transition-all duration-300
    ${error
                  ? "bg-red-50 border border-red-200"
                  : success
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }
  `}
            >

              <div
                className={`
      flex items-center justify-center gap-3 text-sm font-medium
      ${error
                    ? "text-red-600 p-1"
                    : success
                      ? "text-green-600 p-1"
                      : "text-gray-600"
                  }
    `}
              >

                {!error && !success && (
                  <div className="
        w-10 h-10 rounded-xl
        bg-gray-200
        flex items-center justify-center
      ">
                    <FiLock className="text-lg" />
                  </div>
                )}

                <span className="leading-6 text-center">
                  {error
                    ? error
                    : success
                      ? success
                      : "Enter your credentials to continue accessing your dashboard"}
                </span>

              </div>
            </div>
            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="
                    w-full px-4 py-4 rounded-2xl
                    border border-gray-200
                    bg-gray-50
                    focus:ring-2 focus:ring-orange-500
                    focus:border-orange-500
                    outline-none
                    transition-all duration-200
                  "
                />
              </div>

              {/* PASSWORD */}
              <div>

                <div className="flex justify-between items-center mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="
                      w-full px-4 py-4 rounded-2xl
                      border border-gray-200
                      bg-gray-50
                      focus:ring-2 focus:ring-orange-500
                      focus:border-orange-500
                      outline-none
                      transition-all duration-200
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-4 top-1/2 -translate-y-1/2
                      text-gray-400 hover:text-orange-600 transition
                    "
                  >
                    {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                  </button>

                </div>
              </div>

              {/* REMEMBER */}
              <div className="flex items-center justify-between text-sm">

                <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                  <input type="checkbox" className="accent-orange-500" />
                  Remember me
                </label>

                <span className="text-gray-400">
                  Secure Login
                </span>

              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  bg-gradient-to-r from-orange-500 to-red-500
                  text-white
                  font-semibold
                  py-4 px-6
                  rounded-2xl
                  hover:scale-[1.01]
                  hover:shadow-2xl
                  transition-all duration-300
                  shadow-lg shadow-orange-500/20
                  disabled:opacity-70
                  disabled:cursor-not-allowed
                "
              >
                {loading ? "Logging in..." : "Login"}
              </button>

            </form>

            {/* FOOTER */}
            <div className="text-center">

              <p className="text-gray-400 text-xs py-6">
                If you encounter any issues during login or any technical problems, please contact the technical team for assistance.
              </p>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;

/* ================= FEATURE ITEM ================= */

function Feature({ icon, title, text }) {
  return (
    <div className="
      flex items-start gap-4
      p-4 rounded-2xl
      bg-black/10
      border border-white
      hover:bg-black/10
      transition
      backdrop-blur-[2px]
      ">

      <div className="
        w-12 h-12 rounded-2xl
        bg-white/20
        flex items-center justify-center
        text-xl
      ">
        {icon}
      </div>

      <div>
        <div className="font-semibold">
          {title}
        </div>

        <div className="text-sm font-semibold text-white leading-6">
          {text}
        </div>
      </div>

    </div>
  );
}