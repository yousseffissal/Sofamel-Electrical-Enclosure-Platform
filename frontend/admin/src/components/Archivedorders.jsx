import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import Swal from "sweetalert2";

import {
    FiArchive,
    FiSearch,
    FiEye,
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiPackage,
    FiUser,
    FiCheckCircle,
    FiBox,
    FiLayers,
    FiDownload,
    FiRotateCcw,
} from "react-icons/fi";

export default function ArchivedOrders() {

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(null);
    const [restoringId, setRestoringId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArchived();
    }, []);

    const fetchArchived = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(ENDPOINTS.ORDERS.GET_ARCHIVED);
            setOrders(res.data.orders || []);
        } catch (err) {
            setError("Failed to load archived orders");
        } finally {
            setLoading(false);
        }
    };

    const openOrder = async (id) => {
        try {
            setLoadingOrderDetails(true);
            setSelectedOrder({});
            const res = await api.get(ENDPOINTS.ORDERS.GET_ONE(id));
            setSelectedOrder(res.data.order);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingOrderDetails(false);
        }
    };

    const downloadPdf = async (id) => {
        try {
            setDownloadingPdf(id);
            const response = await api.get(ENDPOINTS.ORDERS.DOWNLOAD_PDF(id), {
                responseType: "blob",
            });
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = fileURL;
            link.download = `order-${id}.pdf`;
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

    const restoreOrder = async (id, e) => {
        e?.stopPropagation();

        const result = await Swal.fire({
            title: "Restore this order?",
            text: "It will be moved back to active orders.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, restore it",
            cancelButtonText: "Cancel",
            confirmButtonColor: "#F97316",
            cancelButtonColor: "#6B7280",
            customClass: { popup: "swal-rounded" }
        });

        if (!result.isConfirmed) return;

        try {
            setRestoringId(id);
            await api.patch(ENDPOINTS.ORDERS.UNARCHIVE(id));
            setOrders((prev) => prev.filter((o) => o.id !== id));
            if (selectedOrder?.id === id) setSelectedOrder(null);

            Swal.fire({
                title: "Restored!",
                text: "The order has been restored successfully.",
                icon: "success",
                confirmButtonColor: "#f97316",
                confirmButtonText: "OK",
                customClass: { popup: "swal-rounded" }
            });
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: "Error",
                text: "Something went wrong. Please try again.",
                icon: "error",
                confirmButtonColor: "#ef4444",
                confirmButtonText: "OK",
                customClass: { popup: "swal-rounded" }
            });
        } finally {
            setRestoringId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(
            (o) =>
                o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                String(o.id).includes(search)
        );
    }, [search, orders]);

    const stats = useMemo(() => ({
        total: orders.length,
        completed: orders.filter((o) => o.status === "completed").length,
        cancelled: orders.filter((o) => o.status === "cancelled").length,
    }), [orders]);

    const statusConfig = {
        pending: "bg-yellow-50 text-yellow-600 border-yellow-100",
        processing: "bg-blue-50 text-blue-600 border-blue-100",
        completed: "bg-green-50 text-green-600 border-green-100",
        cancelled: "bg-red-50 text-red-600 border-red-100",
    };

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">Archived Orders</h1>
                        <FiArchive className="text-gray-800 text-2xl" />
                    </div>
                    <p className="text-gray-500 text-sm">Archived orders / restore them to make them active again</p>
                </div>
                <div className="flex gap-3">
                    <Stat label="Archived" value={stats.total} />
                    <Stat label="Completed" value={stats.completed} />
                    <Stat label="Cancelled" value={stats.cancelled} />
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* SEARCH */}
            <div className="bg-white border rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <FiSearch />
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search archived orders..."
                    className="border px-3 py-2 rounded-xl text-sm w-72 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                />
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="p-4 text-left">Order</th>
                            <th className="p-4 text-left">Customer</th>
                            <th className="p-4 text-left">Total</th>
                            <th className="p-4 text-left">Status</th>
                            <th className="p-4 text-left">Archived on</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="p-4" colSpan="6">
                                        <div className="h-4 bg-gray-200 animate-pulse rounded-xl"></div>
                                    </td>
                                </tr>
                            ))
                        ) : filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-t hover:bg-gray-50 transition cursor-pointer opacity-80 hover:opacity-100"
                                    onClick={() => openOrder(order.id)}
                                >
                                    <td className="p-4 font-bold text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <FiArchive className="text-gray-300 text-xs" />
                                            #{order.id}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border flex items-center justify-center font-bold text-gray-500">
                                                {order.user?.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-700">
                                                    {order.user?.name || "Unknown"}
                                                </div>
                                                <div className="text-xs text-gray-400">{order.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-bold text-gray-600">{order.total_price} DH</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs rounded-full border capitalize ${statusConfig[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs">
                                        {order.archived_at
                                            ? new Date(order.archived_at).toLocaleDateString()
                                            : "-"}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openOrder(order.id); }}
                                                className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
                                            >
                                                <FiEye />
                                            </button>
                                            <button
                                                onClick={(e) => restoreOrder(order.id, e)}
                                                disabled={restoringId === order.id}
                                                title="Restore order"
                                                className="w-9 h-9 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-500 flex items-center justify-center transition disabled:opacity-50"
                                            >
                                                {restoringId === order.id ? (
                                                    <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <FiRotateCcw />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-16 text-center">
                                    <FiArchive className="text-4xl text-gray-400 mx-auto mb-3" />
                                    <div className="text-gray-500 font-medium">No archived orders</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {selectedOrder && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedOrder(null)}
                >
                    <div
                        className="bg-white w-[900px] max-w-full rounded-3xl shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* TOP — gray theme for archived */}
                        <div className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 p-6">
                            {loadingOrderDetails ? (
                                <div className="animate-pulse flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="h-3 w-24 bg-white/30 rounded mb-4"></div>
                                        <div className="h-10 w-40 bg-white/40 rounded-xl mb-4"></div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-11 h-11 rounded-xl bg-white/30"></div>
                                        <div className="w-11 h-11 rounded-xl bg-white/30"></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 text-white/70 text-sm mb-1">
                                            <FiArchive className="text-xs" />
                                            Archived Order
                                        </div>
                                        <h2 className="text-white font-black text-3xl mt-1">#{selectedOrder.id}</h2>
                                        <div className="flex items-center gap-2 mt-4 flex-wrap">
                                            <span className="px-3 py-1 rounded-full text-xs border bg-white/20 text-white border-white/20 capitalize">
                                                {selectedOrder.status}
                                            </span>
                                            <span className="px-3 py-1 rounded-full text-xs border bg-white/20 text-white border-white/20">
                                                {selectedOrder.total_price} DH
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => downloadPdf(selectedOrder.id)}
                                            disabled={downloadingPdf === selectedOrder.id}
                                            className="w-11 h-11 rounded-xl bg-white/20 text-white hover:bg-white/30 transition flex items-center justify-center disabled:opacity-50"
                                        >
                                            {downloadingPdf === selectedOrder.id ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FiDownload />
                                            )}
                                        </button>
                                        <button
                                            onClick={(e) => restoreOrder(selectedOrder.id, e)}
                                            disabled={restoringId === selectedOrder.id}
                                            title="Restore this order"
                                            className="w-11 h-11 rounded-xl bg-white/20 text-white hover:bg-white/30 transition flex items-center justify-center disabled:opacity-50"
                                        >
                                            {restoringId === selectedOrder.id ? (
                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <FiRotateCcw />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setSelectedOrder(null)}
                                            className="w-11 h-11 rounded-xl bg-white/20 text-white hover:bg-white/30 transition flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BODY */}
                        <div className="p-6 overflow-y-auto">
                            {loadingOrderDetails ? (
                                <OrderDetailsSkeleton />
                            ) : (
                                <>
                                    {/* ARCHIVED NOTICE */}
                                    <div className="mb-5 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500">
                                        <FiArchive className="text-gray-400" />
                                        <span>
                                            Archived on{" "}
                                            <strong className="text-gray-700">
                                                {selectedOrder.archived_at
                                                    ? new Date(selectedOrder.archived_at).toLocaleString()
                                                    : "-"}
                                            </strong>
                                        </span>
                                        <button
                                            onClick={(e) => restoreOrder(selectedOrder.id, e)}
                                            disabled={restoringId === selectedOrder.id}
                                            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-100 text-xs font-semibold transition disabled:opacity-50"
                                        >
                                            <FiRotateCcw className="text-xs" />
                                            Restore order
                                        </button>
                                    </div>

                                    {/* CUSTOMER */}
                                    <div className="rounded-2xl border bg-gray-50 p-5 mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-2xl font-bold border-4 border-white shadow">
                                                {selectedOrder.user?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-xl font-bold text-gray-800">
                                                    {selectedOrder.user?.name}
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">Customer account</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* INFO */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <Info icon={<FiUser />} label="Customer" value={selectedOrder.user?.name} />
                                        <Info icon={<FiPhone />} label="Phone" value={selectedOrder.phone} />
                                        <Info icon={<FiMapPin />} label="Address" value={selectedOrder.address} />
                                        <Info icon={<FiCalendar />} label="Date" value={new Date(selectedOrder.created_at).toLocaleString()} />
                                        <Info icon={<FiCheckCircle />} label="Total" value={`${selectedOrder.total_price} DH`} />
                                        <Info icon={<FiPackage />} label="Status" value={selectedOrder.status} />
                                    </div>

                                    {/* CONFIGURATION */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FiBox className="text-gray-400" />
                                            <h3 className="font-bold text-lg text-gray-800">Configuration</h3>
                                        </div>
                                        {selectedOrder?.configuration ? (
                                            <div className="rounded-2xl border overflow-hidden">
                                                <div className="p-5 border-b bg-gray-50">
                                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                                        <div>
                                                            <div className="text-lg font-bold text-gray-800">
                                                                Template :{" "}
                                                                {selectedOrder.configuration.configurable_box?.code
                                                                    || `Box #${selectedOrder.configuration.configurable_box?.id || ""}`
                                                                    || "No box"}
                                                            </div>
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                Order Quantity: {selectedOrder.configuration.quantity || 0}
                                                            </div>
                                                        </div>
                                                        <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 border text-sm font-semibold">
                                                            {selectedOrder.configuration.box_price_snapshot || 0} DH / Unit
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                                        <FiLayers /> Configuration Items
                                                    </div>
                                                    <div className="space-y-3">
                                                        {selectedOrder.configuration.configuration_items?.length > 0 ? (
                                                            selectedOrder.configuration.configuration_items.map((item) => (
                                                                <div key={item.id} className="flex items-center justify-between rounded-2xl border bg-gray-50 px-4 py-4">
                                                                    <div>
                                                                        <div className="font-semibold text-gray-800">{item.item?.name}</div>
                                                                        <div className="text-xs text-gray-400 mt-1">Item Quantity: {item.quantity}</div>
                                                                    </div>
                                                                    <div className="font-bold text-gray-600">{item.price_snapshot} DH / Item</div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="rounded-2xl border bg-gray-50 p-6 text-center text-gray-500">No items found</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border bg-gray-50 p-6 text-center text-gray-500">No configuration found</div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-white border rounded-xl px-3 py-2 text-center min-w-[80px] shadow-sm">
            <div className="text-gray-500 text-xs">{label}</div>
            <div className="font-bold text-gray-800">{value}</div>
        </div>
    );
}

function Info({ label, value, icon }) {
    return (
        <div className="p-4 bg-gray-50 border rounded-2xl hover:bg-gray-100 transition">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                {icon}
                {label}
            </div>
            <div className="font-semibold text-gray-800 break-words">{value ?? "-"}</div>
        </div>
    );
}

function OrderDetailsSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="rounded-2xl border p-5 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200"></div>
                    <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-40"></div>
                        <div className="h-3 bg-gray-100 rounded w-28"></div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 rounded-2xl border bg-gray-50">
                        <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
                        <div className="h-5 bg-gray-300 rounded w-40"></div>
                    </div>
                ))}
            </div>
            <div className="rounded-2xl border overflow-hidden">
                <div className="p-5 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <div className="h-5 bg-gray-300 rounded w-48"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
                    </div>
                </div>
                <div className="p-5 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border bg-gray-50 px-4 py-4 flex justify-between">
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                            <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}