import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import {
  FiBell,
  FiSend,
  FiMail,
} from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { FiSearch } from "react-icons/fi";

dayjs.extend(relativeTime);

function NotificationsPage() {

  const [notifications, setNotifications] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [levels, setLevels] = useState([]);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorType, setSelectorType] = useState(null);

  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "all",
  });

  /* ================= FETCH ================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res1 = await api.get("/api/admin/notifications/sent");
      const res2 = await api.get("/api/admin/notifications/meta");

      setNotifications(res1.data.sent_notifications ?? []);
      setAdmins(res2.data.admins ?? []);
      setLevels(res2.data.levels ?? []);

    } catch (err) {
      setError("Failed to load notifications");

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ================= DELETE ================= */
  const deleteNotification = async (id) => {
    const confirm = await Swal.fire({
      title: "Delete notification?",
      text: "This will remove it for everyone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      customClass: {
        popup: "swal-rounded"
      }
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/api/admin/notifications/${id}/delete`);

      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );

      Swal.fire({
        title: "Notification Deleted",
        text: "The notification has been deleted successfully",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not delete notification",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });
    }
  };

  /* ================= SEND ================= */
  const sendNotification = async () => {
    if (!form.title || !form.message) {
      Swal.fire({
        icon: "warning",
        title: "Missing fields",
        text: "Title and message are required",
        customClass: {
          popup: "swal-rounded"
        }
      });
      return;
    }

    try {
      Swal.fire({
        didOpen: () => Swal.showLoading(),
        title: "Sending...",
        allowOutsideClick: false,
        customClass: {
          popup: "swal-rounded"
        }
      });

      await api.post("/api/admin/notifications/send", form);

      Swal.fire({
        icon: "success",
        title: "Sent!",
        text: "Notification sent successfully",
        confirmButtonText: "OK",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

      setForm({
        title: "",
        message: "",
        target: "all",
      });

      fetchData();

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not send notification",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });
    }
  };

  /* ================= OPEN ================= */
  const openNotif = (notif) => {
    setSelectedNotif(notif);
  };

  /* ================= FILTER (FIXED FOR API DATA) ================= */
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) =>
      (
        (n.title || "") +
        (n.message || "")
      )
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [notifications, search]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const today = new Date().toDateString();

    return {
      total: notifications.length,

      unread: notifications.filter(
        n => !n.read_at && n.target !== "All Admins"
      ).length,

      sentToday: notifications.filter(
        n => new Date(n.created_at).toDateString() === today
      ).length,
    };
  }, [notifications]);

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">

        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Notifications
            </h1>
            <FiBell className="text-2xl text-gray-700" />
          </div>

          <p className="text-gray-500 text-sm">
            Send and manage internal admin alerts
          </p>
        </div>

        <div className="flex gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Unread" value={stats.unread} />
          <Stat label="Today" value={stats.sentToday} />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* SEND FORM */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden mb-5">

        <div className="h-14 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400" />

        <div className="p-5">

          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
              <FiSend />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Send Notification
              </h2>
              <p className="text-sm text-gray-500">
                Broadcast alerts to admins
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">

            <input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Notification title..."
              className="w-full border px-4 py-3 rounded-xl bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
            />

            <select
              value={
                String(form.target).startsWith("level:")
                  ? "selected-level"
                  : form.target !== "all" && !isNaN(form.target)
                    ? "selected-admin"
                    : form.target
              }
              onChange={(e) => {
                const value = e.target.value;

                if (value === "admins") {
                  setSelectorType("admins");
                  setShowSelector(true);
                  return;
                }

                if (value === "levels") {
                  setSelectorType("levels");
                  setShowSelector(true);
                  return;
                }

                setForm({ ...form, target: value });
              }}
              className="w-full border px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500"
            >

              <option value="all">All Admins</option>

              {/* CURRENT ADMIN */}
              {form.target !== "all" &&
                !String(form.target).startsWith("level:") &&
                !isNaN(form.target) && (
                  <option value="selected-admin">
                    Selected Admin : {
                      admins.find(a => a.id == form.target)?.name || "Admin"
                    }
                  </option>
                )}

              {/* CURRENT LEVEL */}
              {String(form.target).startsWith("level:") && (
                <option value="selected-level">
                  Selected Level : {
                    levels.find(
                      l => `level:${l.id}` === form.target
                    )?.name || "Level"
                  }
                </option>
              )}

              <option value="admins">Select Admin</option>
              <option value="levels">Select Level</option>

            </select>

          </div>

          <textarea
            rows="5"
            value={form.message}
            onChange={(e) =>
              setForm({ ...form, message: e.target.value })
            }
            placeholder="Write your notification..."
            className="w-full border px-4 py-3 rounded-2xl bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 resize-none mb-4"
          />

          <div className="flex justify-end">
            <button
              onClick={sendNotification}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-2"
            >
              <FiSend />
              Send Notification
            </button>
          </div>

        </div>
      </div>


      {/* SEARCH */}
      <div className="bg-white border rounded-2xl p-4 mb-6 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <FiSearch />
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="border px-3 py-2 rounded-xl w-full bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="p-4 text-left">Notification</th>
              <th className="p-4 text-left">Sender</th>
              <th className="p-4 text-left">Send To</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>

            {/* SKELETON */}
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6" className="p-4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded"></div>
                  </td>
                </tr>
              ))
            ) : filteredNotifications.length > 0 ? (

              filteredNotifications.map((notif) => (
                <tr
                  key={notif.id}
                  onClick={() => openNotif(notif)}
                  className="border-t hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="p-4 w-[300px] max-w-[300px]">
                    <div className="flex items-center gap-3 overflow-hidden">

                      <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <FiBell />
                      </div>

                      <div className="overflow-hidden">
                        <div className="font-semibold truncate">
                          {notif.title}
                        </div>

                        <div className="text-xs text-gray-400 truncate max-w-[180px]">
                          {notif.message}
                        </div>
                      </div>

                    </div>
                  </td>

                  <td className="p-4 text-gray-600">
                    <div className="flex items-center gap-2">

                      <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100">
                        {notif.sender?.pictureURL ? (
                          <img
                            src={notif.sender.pictureURL}
                            alt={notif.sender.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-orange-700">
                            {notif.sender?.name?.charAt(0)}
                          </div>
                        )}
                      </div>

                      <span>
                        {notif.sender?.name}
                      </span>

                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">
                      {notif.target}
                    </span>
                  </td>

                  <td className="p-4">
                    {notif.target === "All Admins" ? (
                      <span className="px-3 py-1 text-xs rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                        Broadcast
                      </span>
                    ) : notif.target?.startsWith("Level") ? (
                      <span className="px-3 py-1 text-xs rounded-full border bg-pink-50 text-pink-700 border-pink-200">
                        {notif.target}
                      </span>
                    ) : (
                      <div className="flex flex-col gap-1">

                        {/* STATUS */}
                        <span
                          className={`px-3 py-1 text-xs rounded-full border w-fit flex gap-1
        ${notif.read_at
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                        >
                          {notif.read_at ? "Read" : "Unread"}
                          {/* READ TIME */}
                          {notif.read_at && (
                            <span className="text-[11px] bg-green-50 text-green-700 border-green-200">
                              {dayjs(notif.read_at).add(1, "hour").fromNow()}
                            </span>
                          )}
                        </span>

                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">

                      {/* DELETE BUTTON */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="px-5 py-2 text-xs rounded-md bg-red-600 text-white"
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))

            ) : (
              <tr>
                <td colSpan="5" className="p-10 text-center text-gray-500">
                  No notifications found
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedNotif(null)}>

          <div className="modal-animate bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in duration-200 border border-white">

            {/* HEADER */}
            <div className="relative bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 px-6 py-5">

              <button
                onClick={() => setSelectedNotif(null)}
                className="absolute top-4 right-4 w-10 h-10 transition flex items-center justify-center text-white text-lg"
              >
                ✕
              </button>

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl shadow">
                  <FiMail />
                </div>

                <div className="text-white">
                  <p className="text-sm opacity-90">
                    Notification Details
                  </p>

                  <h2 className="text-2xl font-bold max-w-[450px] leading-snug">
                    {selectedNotif.title}
                  </h2>
                </div>

              </div>
            </div>

            {/* BODY */}
            <div className="p-6">

              {loading ? (
                <div className="animate-pulse">

                  <div className="h-6 w-60 bg-gray-200 rounded mb-6"></div>

                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
                    <div className="h-4 w-3/5 bg-gray-200 rounded"></div>
                  </div>

                </div>
              ) : (
                <>

                  {/* INFO */}
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border border-orange-100">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>

                      <span className="text-sm font-medium text-orange-700">
                        {selectedNotif.target}
                      </span>
                    </div>

                    <div className="text-sm text-gray-400">
                      {new Date(selectedNotif.created_at).toLocaleString()}
                    </div>

                  </div>

                  {/* MESSAGE */}
                  <div className="bg-gray-50 border rounded-2xl p-5">

                    <p className="text-gray-700 whitespace-pre-wrap leading-8 text-[15px]">
                      {selectedNotif.message}
                    </p>

                  </div>

                </>
              )}

            </div>

          </div>

        </div>
      )}

      {showSelector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowSelector(false)}>

          <div className="modal-animate bg-white w-[500px] rounded-2xl shadow-2xl overflow-hidden border border-white">

            {/* HEADER */}
            <div className="p-4 pr-6 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 text-white flex justify-between items-center">
              <h2 className="font-semibold">
                {selectorType === "admins" ? "Select Admin" : "Select Level"}
              </h2>

              <button
                onClick={() => setShowSelector(false)}
                className="text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* LIST */}
            <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">

              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200"></div>

                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                ))
              ) : (
                <>

                  {selectorType === "admins" &&
                    admins.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setForm({ ...form, target: a.id });
                          setShowSelector(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                          {a?.pictureURL ? (
                            <img
                              src={a.pictureURL}
                              alt={a.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-orange-700">
                              {a?.name?.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-medium">{a.name}</div>
                          <div className="text-xs text-gray-400">
                            {a.level?.name}
                          </div>
                        </div>
                      </div>
                    ))}

                  {selectorType === "levels" &&
                    levels.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setForm({ ...form, target: `level:${l.id}` });
                          setShowSelector(false);
                        }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-orange-50 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          {l?.name?.charAt(0)}
                        </div>

                        <div>
                          <div className="font-medium">{l.name}</div>
                          <div className="text-xs text-gray-400">
                            Level
                          </div>
                        </div>
                      </div>
                    ))}

                </>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* STAT */
function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-xl px-3 py-2 text-center min-w-[80px] shadow-sm">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="font-bold text-gray-800">{value}</div>
    </div>
  );
}

export default NotificationsPage;