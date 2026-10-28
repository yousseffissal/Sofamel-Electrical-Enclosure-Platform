import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { IoLogOut, IoSearch, IoNotificationsOutline } from "react-icons/io5";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../api/axios";
import { createEcho } from "../tools/echo";
import {
  adminLinks,
  managerLinks,
  RHLinks,
  SuperAdminLinks,
  roles,
} from "../tools/links/NavigationLinks.js";
import { makeSearchableLinks } from "../tools/searchHelpers.js";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupNotif, setPopupNotif] = useState(null);
  const notificationSound = new Audio("/notification.wav");

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const [search, setSearch] = useState("");

  const links =
    user?.level_id === roles.ADMIN
      ? adminLinks
      : user?.level_id === roles.MANAGER
        ? managerLinks
        : user?.level_id === roles.RH
          ? RHLinks
          : SuperAdminLinks;

  const searchableLinks = makeSearchableLinks(links);

  const filteredLinks = searchableLinks.filter((item) =>
    item.keywords.some((k) =>
      k.includes(search.toLowerCase())
    )
  );

  /* ================= FETCH NOTIFICATIONS ================= */
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/admin/Mynotifications");

      const data = (res.data.notifications ?? []).map((n) => ({
        ...n,
        data: typeof n.data === "string" ? JSON.parse(n.data) : n.data,
      }));

      setNotifications(data);

      const unread = data.filter((n) => !n.read_at).length;

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= POPUP ON CLICK ================= */
  const openNotification = async (notif) => {

    // mark as read
    if (!notif.read_at) {
      await markAsRead(notif.id);
    }

    Swal.fire({
      icon: "info",
      title: notif.data?.title || "Notification",
      text: notif.data?.message || "",
      confirmButtonColor: "#ea580c",
      customClass: {
        popup: "swal-rounded"
      }
    });
  };

  /* ================= MARK AS READ ================= */
  const markAsRead = async (id) => {
    try {

      await api.post(`/api/admin/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

      setNotificationCount((prev) =>
        prev > 0 ? prev - 1 : 0
      );

    } catch (err) {
      console.log(err);
    }
  };

  /* ================= CLOSE OUTSIDE ================= */
  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem("access-token-admin");
    const echo = createEcho(token);

    const channel = echo.private(`admins.${user.id}`);

    channel.subscribed(() => {
      console.log("Connected to notifications channel");
    });

    channel.notification((notification) => {
      console.log("REALTIME:", notification);
      notificationSound.currentTime = 0;
      notificationSound.play().catch((err) => {
        console.log("Sound blocked:", err);
      });


      const newNotif = {
        id: notification.id,
        read_at: null,
        data: {
          title: notification.title,
          message: notification.message,
        },
      };

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotif.id);
        if (exists) return prev;
        return [newNotif, ...prev];
      });

      setPopupNotif(newNotif);
      setShowPopup(true);

      setTimeout(() => setShowPopup(false), 4000);
    });

    return () => {
      echo.leave(`private-admins.${user.id}`);
      echo.disconnect();
    };
  }, [user?.id]);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Logout",
      text: "Are you sure you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Logout",
      customClass: {
        popup: "swal-rounded"
      }
    });

    if (!result.isConfirmed) return;

    try {
      await logout();

      Swal.fire({
        title: "Logged out",
        text: "You have been logged out successfully",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

      navigate("/");
    } catch (err) {
      Swal.fire({
        icon: "error",
        text: err?.message || "Something went wrong",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });
    }
  };

  return (
    <header className="h-full w-full bg-white">
      <div className="h-full px-6 flex items-center justify-between gap-4">

        {/* Left */}
        <div className="flex justify-center items-center gap-3 min-w-0 flex-shrink">

          <Link
            to="/dashboard/overview"
            className="flex justify-center items-center gap-3 min-w-0"
          >
            <img
              src="/logo.png"
              alt="Sofamel Logo"
              className="h-9 w-9 object-contain items-center flex justify-center flex-shrink-0 rounded-full"
            />

            <div className="min-w-0 hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 truncate">
                Sofamel
              </h1>

              <p className="text-xs text-gray-500 truncate">
                Administration Panel
              </p>
            </div>
          </Link>
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />

            {search && (
              <div className="absolute top-full max-h-[350px] overflow-y-auto left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50">

                {filteredLinks.length > 0 ? (
                  filteredLinks.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(`/dashboard/${item.path}`);
                        setSearch("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition border-b border-gray-100 last:border-0"
                    >
                      <div className="text-sm font-medium text-gray-800">
                        {item.name}
                      </div>

                      <div className="text-xs text-gray-400">
                        /dashboard/{item.path}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-400">
                    No results found
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4 flex-shrink-0">

          <button
            onClick={() => {
              window.open(import.meta.env.VITE_PLATFORM_URL, "_blank", "noopener,noreferrer");
            }}
            className="group flex font-semibold items-center gap-2 rounded-2xl px-4 py-2 bg-orange-400 text-white shadow-sm hover:bg-orange-600 hover:shadow-md active:scale-[0.98] transition-all duration-200"
          >
            Go Client
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>

          {/* 🔔 NOTIFICATIONS */}
          <div className="relative" ref={notifRef}>

            <button
              onClick={() => setOpenNotif(!openNotif)}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
            >
              <IoNotificationsOutline className="w-5 h-5" />

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN (UNCHANGED STYLE + SCROLL FIX ONLY) */}
            {openNotif && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-orange-100 z-50 overflow-hidden">

                {/* HEADER */}
                <div className="px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white flex items-center justify-between">
                  <button
                    onClick={async () => {
                      setOpenNotif(false)
                      const unread = notifications.filter(n => !n.read_at);

                      for (const notif of unread) {
                        await markAsRead(notif.id);
                      }
                    }}
                    className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full transition"
                  >
                    Mark all as read
                  </button>

                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                </div>

                {/* LIST (ONLY CHANGE: SCROLL BEHAVIOR) */}
                <div className="max-h-72 overflow-y-auto">

                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { openNotification(n); setOpenNotif(false); }}
                        className={`px-4 py-3 flex gap-3 items-start transition border-b border-gray-100 cursor-pointer
              
    ${n.read_at
                            ? "bg-white hover:bg-gray-50"
                            : "bg-orange-50 hover:bg-orange-100"
                          }
  `}
                      >

                        {/* DOT */}
                        <div
                          className={`w-2 h-2 mt-2 rounded-full shadow-sm
      ${n.read_at
                              ? "bg-gray-300"
                              : "bg-orange-500"
                            }
    `}
                        />

                        {/* TEXT */}
                        <div className="flex-1 min-w-0">

                          <div className="flex items-center justify-between gap-2">

                            <div
                              className={`text-sm truncate
          ${n.read_at
                                  ? "text-gray-700 font-medium"
                                  : "text-gray-900 font-semibold"
                                }
        `}
                            >
                              {n.data?.title}
                            </div>

                            {/* STATUS */}
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap
          ${n.read_at
                                  ? "bg-gray-100 text-gray-500"
                                  : "bg-orange-500 text-white"
                                }
        `}
                            >
                              {n.read_at ? "Read" : "New"}
                            </span>

                          </div>

                          <div className="text-xs text-gray-500 truncate max-w-[220px]">
                            {n.data?.message}
                          </div>

                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          🔔
                        </div>
                        <span>No notifications</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* FOOTER */}
                {/* FOOTER */}
                {notifications.length > 0 ? (
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                    {unreadCount > 0 ? (
                      <>
                        You have {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
                      </>
                    ) : (
                      <>No new notifications</>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 text-center">
                    No notifications
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-gray-200" />

          {/* User (UNCHANGED COMPLETELY) */}
          <div className="flex items-center gap-3">

            <div className="relative">

              <Link to={"/dashboard/settings"}>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-orange-100">

                  {user?.pictureURL ? (
                    <img
                      src={user.pictureURL}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-700 font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                </div>
              </Link>

              <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-green-600 border-2 border-white shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-300 animate-pulse" />
              </div>

            </div>

            <div className="hidden lg:flex flex-col leading-tight max-w-[180px]">
              <span className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "Jhon Doe"}
              </span>

              <span className="text-xs text-gray-500 truncate">
                {user?.email || "admin@sofamel.com"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <IoLogOut className="w-5 h-5" />
            </button>

          </div>

        </div>

        {showPopup && popupNotif && (
          <div className="fixed top-16 right-6 z-[9999] animate-slide-side">
            <div className="w-80 bg-white/95 backdrop-blur-md shadow-2xl border border-orange-100 rounded-2xl overflow-hidden">

              {/* HEADER (same style as dropdown) */}
              <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white flex items-center justify-between">

                <span className="text-xs font-medium">
                  New Notification
                </span>

              </div>

              {/* BODY */}
              <div className="p-4 flex gap-3 items-start">

                {/* ICON */}
                <div className="relative mt-1">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-orange-600 text-lg">🔔</span>
                  </div>

                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {popupNotif.data?.title}
                  </p>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {popupNotif.data?.message}
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </header >
  );
};

export default Navbar;