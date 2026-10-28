import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { PiUsers } from "react-icons/pi";
import { FiSearch, FiDownload } from "react-icons/fi";
import Swal from "sweetalert2";

function ClientsPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const [ordersModalOpen, setOrdersModalOpen] = useState(false);
  const [ordersUser, setOrdersUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(ENDPOINTS.USERS.CLIENTS);
      setUsers(res.data ?? []);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 120000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserOrders = async (userId) => {
    try {
      setLoadingOrders(true);
      const res = await api.get(ENDPOINTS.USERS.CLIENT_ORDERS(userId));
      setUserOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "This will permanently delete the user, all orders, and all related configurations. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      customClass: { popup: "swal-rounded" }
    });

    if (!result.isConfirmed) return;

    try {
      setDeletingUser(id);
      await api.delete(ENDPOINTS.USERS.DELETECLIENT(id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUser(null);
      await Swal.fire({ title: "Deleted!", text: "User has been deleted successfully.", icon: "success", confirmButtonColor: "#f97316", timer: 1800, showConfirmButton: false, customClass: { popup: "swal-rounded" } });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: "Error", text: "Failed to delete user.", icon: "error", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
    } finally {
      setDeletingUser(null);
    }
  };

  const downloadPdf = async (orderId) => {
    try {
      setDownloadingPdf(orderId);
      const response = await api.get(ENDPOINTS.ORDERS.DOWNLOAD_PDF(orderId), { responseType: "blob" });
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredUsers = useMemo(() =>
    users.filter((u) => (u.name + u.email).toLowerCase().includes(search.toLowerCase())),
    [users, search]);

  const stats = useMemo(() => ({ total: users.length }), [users]);

  return (
    <div className="p-6 bg-gray-50 min-h-full rounded-2xl border">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Clients Dashboard</h1>
            <PiUsers className="text-3xl text-gray-800" />
          </div>
          <p className="text-gray-500 text-sm">Manage and explore all registered users</p>
        </div>
        <div className="bg-white border px-4 py-2 rounded-xl text-center shadow-sm">
          <div className="text-xs text-gray-500">Total Users</div>
          <div className="font-bold text-gray-800">{stats.total}</div>
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>}

      {/* SEARCH */}
      <div className="bg-white border rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <FiSearch />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="border px-3 py-2 rounded-xl text-sm w-80 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />
        <div className="ml-auto text-sm text-gray-500">{filteredUsers.length} results</div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4" colSpan="4">
                    <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} onClick={() => setSelectedUser(user)} className="border-t hover:bg-gray-50 transition cursor-pointer">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-orange-100 flex items-center justify-center">
                        {user.pictureURL ? (
                          <img src={user.pictureURL} className="w-full h-full object-cover" alt={user.name} />
                        ) : (
                          <span className="font-semibold text-orange-700">{user.name?.charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-semibold text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-400 text-xs">#{user.id}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setOrdersUser(user);
                          setOrdersModalOpen(true);
                          await fetchUserOrders(user.id);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition"
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingUser === user.id}
                        className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition disabled:opacity-50"
                      >
                        {deletingUser === user.id ? (
                          <span className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin inline-block" />
                        ) : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-10 text-center text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="modal-animate bg-white w-[640px] max-w-full rounded-2xl shadow-2xl overflow-hidden border" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-400 to-red-400 h-24 relative">
              <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-4 text-white/80 hover:text-white text-xl">✕</button>
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-orange-100">
                  {selectedUser.pictureURL ? (
                    <img src={selectedUser.pictureURL} className="w-full h-full object-cover cursor-pointer" onClick={() => setZoomImage(selectedUser.pictureURL)} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-700">
                      {selectedUser.name?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-14 px-6 pb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <InfoCard label="User ID" value={selectedUser.id} />
                <InfoCard label="Email" value={selectedUser.email} />
                <InfoCard label="Name" value={selectedUser.name} />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => { setOrdersUser(selectedUser); setOrdersModalOpen(true); await fetchUserOrders(selectedUser.id); }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition text-sm"
                >
                  Orders
                </button>
                <button
                  onClick={() => deleteUser(selectedUser.id)}
                  disabled={deletingUser === selectedUser.id}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition disabled:opacity-50 text-sm min-w-[120px] flex items-center justify-center"
                >
                  {deletingUser === selectedUser.id ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS MODAL */}
      {ordersModalOpen && ordersUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setOrdersModalOpen(false)}>
          <div className="bg-white w-[900px] max-w-[95%] rounded-2xl shadow-2xl overflow-hidden modal-animate border" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold">Orders of {ordersUser.name}</h2>
                <p className="text-white/80 text-sm">{ordersUser.email}</p>
              </div>
              <button onClick={() => setOrdersModalOpen(false)} className="text-white text-2xl hover:scale-110 transition">✕</button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-white border rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="p-4 text-left">Order ID</th>
                      <th className="p-4 text-left">Total</th>
                      <th className="p-4 text-left">Status</th>
                      <th className="p-4 text-left">Date</th>
                      <th className="p-4 text-left">PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOrders ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}><td colSpan="5" className="p-4"><div className="h-4 bg-gray-200 animate-pulse rounded-xl" /></td></tr>
                      ))
                    ) : userOrders.length > 0 ? (
                      userOrders.map((order) => (
                        <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                          <td className="p-4 font-bold text-gray-800">#{order.id}</td>
                          <td className="p-4 font-semibold text-gray-700">{order.total_price} DH</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs border capitalize
                              ${order.status === "completed" ? "bg-green-50 text-green-600 border-green-100"
                                : order.status === "pending" ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                                : order.status === "processing" ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-red-50 text-red-600 border-red-100"}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-gray-500 text-xs">{new Date(order.created_at).toLocaleString()}</td>
                          <td className="p-4">
                            <button
                              onClick={(e) => { e.stopPropagation(); downloadPdf(order.id); }}
                              disabled={downloadingPdf === order.id}
                              className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition disabled:opacity-50"
                            >
                              {downloadingPdf === order.id ? (
                                <span className="w-3 h-3 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                              ) : <FiDownload />}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" className="text-center p-10 text-gray-400">No Orders Found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {zoomImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} className="max-w-[90%] max-h-[90%] rounded-xl shadow-xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border hover:bg-gray-100 transition">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-800 truncate">{value ?? "-"}</div>
    </div>
  );
}

export default ClientsPage;