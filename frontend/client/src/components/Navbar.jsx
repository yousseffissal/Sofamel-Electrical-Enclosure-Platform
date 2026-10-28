import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useRef, useEffect } from "react";
import { IoLogOut } from "react-icons/io5";
import { MdHistory, MdShoppingCart, MdSettings } from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import Swal from "sweetalert2";

const navItems = [
  { icon: IoFlash, label: "New Configuration", path: "/app/new", accent: "amber" },
  { icon: MdHistory, label: "My Configurations", path: "/app/configurations", accent: "blue" },
  { icon: MdShoppingCart, label: "My Orders", path: "/app/orders", accent: "emerald" },
];

const accentClasses = {
  amber: { bg: "bg-amber-500/15", icon: "text-amber-400", active: "bg-amber-500/20 border-amber-500/30" },
  blue: { bg: "bg-blue-500/15", icon: "text-blue-400", active: "bg-blue-500/20 border-blue-500/30" },
  emerald: { bg: "bg-emerald-500/15", icon: "text-emerald-400", active: "bg-emerald-500/20 border-emerald-500/30" },
  gray: { bg: "bg-gray-500/15", icon: "text-gray-400", active: "bg-gray-500/20 border-gray-500/30" },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const handleLogout = async () => {
    setDrawerOpen(false);
    const result = await Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F59E0B",
      cancelButtonColor: "#374151",
      confirmButtonText: "Logout",
      background: "#ffffff",
      color: "#000000",
      customClass: {
        popup: "swal-rounded"
      }
    });
    if (!result.isConfirmed) return;
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err?.message || "Something went wrong",
        confirmButtonColor: "#F59E0B",
        background: "#ffffff",
        color: "#000000",
        customClass: {
          popup: "swal-rounded"
        }
      });
    }

  };

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) setDrawerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      {/* ── Top bar ── */}
      <header
        className="h-full w-full flex items-center px-4"
        style={{ background: "#0D1117", borderBottom: "1px solid rgba(245,158,11,0.1)", fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="w-full flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/app/new" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <img src="/logo.png" alt="Sofamel" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none tracking-wide">Sofamel</p>
              <p className="text-[10px] mt-0.5 tracking-widest" style={{ color: "#F59E0B" }}>CONFIGURATOR</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Avatar */}
            <Link to="/app/settings" className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-amber-400"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
                {user?.pictureURL
                  ? <img src={user.pictureURL} alt={user.name} className="w-full h-full object-cover" />
                  : <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: "#22C55E", borderColor: "#0D1117" }} />
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex flex-col justify-center items-center w-9 h-9 rounded-lg gap-1.5 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
              aria-label="Open menu"
            >
              <span className="block w-4 h-px bg-gray-400 rounded-full" />
              <span className="block w-4 h-px bg-gray-400 rounded-full" />
              <span className="block w-2.5 h-px bg-gray-400 rounded-full self-start ml-[10px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Backdrop ── */}
      <div
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? "auto" : "none",
        }}
      />

      {/* ── Drawer ── */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 z-50 h-full w-[300px] flex flex-col transition-transform duration-300 ease-out"
        style={{
          background: "#0D1117",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-semibold text-amber-400 flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
              {user?.pictureURL
                ? <img src={user.pictureURL} alt={user.name} className="w-full h-full object-cover" />
                : <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Client"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "client@sofamel.com"}</p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const ac = accentClasses[item.accent];
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-all duration-150
                  ${isActive ? `${ac.active} border-opacity-100` : "border-transparent hover:bg-white/5"}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ac.bg} ${ac.icon}`}>
                  <Icon size={17} />
                </div>
                <span className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-gray-400"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div className="px-3 pb-6 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-150 group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
              <IoLogOut size={17} />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-red-400 transition-colors">
              Logout
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;