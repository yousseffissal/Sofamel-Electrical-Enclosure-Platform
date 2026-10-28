import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  MdDashboard,
  MdBuild,
  MdHistory,
  MdShoppingCart,
  MdRequestQuote,
  MdSettings,
  MdLogout,
  MdChevronRight,
} from "react-icons/md";
import { IoFlash } from "react-icons/io5";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { IoLogOut } from "react-icons/io5";

const navGroups = [
  {
    label: "Configurations",
    items: [
      {
        icon: <IoFlash size={17} />,
        label: "New Configuration",
        path: "/app/new",
        badge: null,
      },
      {
        icon: <MdHistory size={18} />,
        label: "My Configurations",
        path: "/app/configurations",
        badge: null,
      },
    ],
  },
  {
    label: "Orders",
    items: [
      {
        icon: <MdShoppingCart size={18} />,
        label: "My Orders",
        path: "/app/orders",
        badge: null,
      },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
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

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      <aside className="cs-sidebar">

        {/* ── Header ── */}
        <div
          className="cs-dot-bg px-5 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(245,158,11,0.1)" }}
        >
          <Link to="/app/dashboard" className="flex items-center gap-3 no-underline">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <img src="/logo.png" alt="Sofamel" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Sofamel</p>
              <p
                className="mt-1 text-[10px] font-semibold tracking-widest uppercase leading-none"
                style={{ color: "#F59E0B" }}
              >
                Configurator
              </p>
            </div>
          </Link>
        </div>

        {/* ── Navigation ── */}
        <nav className="cs-scrollable flex-1 px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="cs-group-label mb-2">{group.label}</p>
              <ul className="space-y-0.5 list-none p-0 m-0">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`cs-nav-item ${active ? "active" : ""} ${item.highlight && !active ? "highlight-item" : ""}`}
                      >
                        {active && <span className="cs-active-indicator" />}
                        <span className="cs-item-icon">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.badge && !active && (
                          <span className="cs-badge">{item.badge}</span>
                        )}
                        {!item.badge && (
                          <MdChevronRight size={14} className="cs-chevron" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── User footer ── */}
        <div
          className="px-3 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(245,158,11,0.1)" }}
        >
          {/* User card */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
            style={{
              background: "rgba(245,158,11,0.05)",
              border: "1px solid rgba(245,158,11,0.1)",
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="cs-avatar shrink-0">
                {user?.pictureURL ? (
                  <img
                    src={user.pictureURL}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium truncate leading-none text-white">
                  {user?.name || "Client"}
                </p>

                <p className="text-xs truncate mt-1 text-gray-400">
                  {user?.email || "client@sofamel.com"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="cn-icon-btn danger flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
              aria-label="Logout"
            >
              <IoLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;