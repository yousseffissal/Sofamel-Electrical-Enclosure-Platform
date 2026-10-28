import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiSearch, FiTrash2, FiMail } from "react-icons/fi";
import Swal from "sweetalert2";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [search, setSearch] = useState("");

    const fetchReports = async () => {
        try {
            setLoading(true);

            const res = await api.get(
                ENDPOINTS.REPORTS.GET_ALL
            );

            setReports(res.data.data || res.data);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Report?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Delete",
            customClass: {
                popup: "swal-rounded"
            }
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(
                ENDPOINTS.REPORTS.DELETE(id)
            );

            Swal.fire({
                icon: "success",
                title: "Deleted",
                confirmButtonColor: "#22c55e",
                customClass: {
                    popup: "swal-rounded"
                }
            });

            fetchReports();

        } catch {
            Swal.fire({
                icon: "error",
                title: "Delete failed",
                customClass: {
                    popup: "swal-rounded"
                }
            });
        }
    };

    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return reports.filter(
            (r) =>
                r.name?.toLowerCase().includes(q) ||
                r.email?.toLowerCase().includes(q) ||
                r.issue?.toLowerCase().includes(q)
        );
    }, [reports, search]);

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">

                <div>

                    <div className="flex items-center gap-3">

                        <h1 className="text-3xl font-bold text-gray-800">
                            Support Reports
                        </h1>

                        <FiAlertCircle
                            size={28}
                        />

                    </div>

                    <p className="text-gray-500 text-sm mt-2">
                        Manage customer support requests
                    </p>

                </div>

                <Stat
                    label="Reports"
                    value={reports.length}
                />

            </div>

            {/* SEARCH */}

            <div className="bg-white border rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">

                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <FiSearch />
                </div>

                <input
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                    placeholder="Search reports..."
                    className="border px-3 py-2 rounded-xl text-sm w-80 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <div className="ml-auto text-sm text-gray-500">
                    {filtered.length} results
                </div>

            </div>

            {/* TABLE */}

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

                <table className="w-full text-sm">

                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">

                        <tr>
                            <th className="p-4 text-left">ID</th>
                            <th className="p-4 text-left">Name</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-left">Message</th>
                            <th className="p-4 text-left">Date</th>
                            <th className="p-4 text-left">Actions</th>
                        </tr>

                    </thead>

                    <tbody>

                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan="6" className="p-4">
                                        <div className="h-4 bg-gray-200 animate-pulse rounded" />
                                    </td>
                                </tr>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((report) => (
                                <tr
                                    key={report.id}
                                    onClick={() =>
                                        setSelectedReport(report)
                                    }
                                    className="border-t hover:bg-gray-50 cursor-pointer"
                                >

                                    <td className="p-4">
                                        #{report.id}
                                    </td>

                                    <td className="p-4 font-medium">
                                        {report.name}
                                    </td>

                                    <td className="p-4">
                                        {report.email}
                                    </td>

                                    <td className="p-4 max-w-[200px]">
                                        <span className="block truncate">
                                            {report.issue}
                                        </span>
                                    </td>

                                    <td className="p-4">
                                        {new Date(
                                            report.created_at
                                        ).toLocaleDateString()}
                                    </td>

                                    <td className="p-4">

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(report.id);
                                            }}
                                            className="px-3 py-1 rounded-lg bg-red-50 border text-red-600 hover:bg-red-100"
                                        >
                                            <FiTrash2 />
                                        </button>

                                    </td>

                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="p-10 text-center text-gray-500"
                                >
                                    No reports found
                                </td>
                            </tr>
                        )}

                    </tbody>

                </table>

            </div>

            {/* DETAILS MODAL */}

            {selectedReport && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setSelectedReport(null)}
                >

                    <div
                        className="modal-animate bg-white w-[700px] rounded-2xl shadow-2xl overflow-hidden border border-white"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="h-16 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 flex items-center justify-between px-6">

                            <h2 className="text-xl font-bold text-white">
                                Report #{selectedReport.id}
                            </h2>

                            <button
                                onClick={() =>
                                    setSelectedReport(null)
                                }
                                className="text-white text-xl"
                            >
                                ✕
                            </button>

                        </div>

                        <div className="p-6">

                            <div className="grid grid-cols-2 gap-4 mb-6">

                                <Info
                                    label="Name"
                                    value={selectedReport.name}
                                />

                                <Info
                                    label="Email"
                                    value={selectedReport.email}
                                />

                                <Info
                                    label="Created"
                                    value={new Date(
                                        selectedReport.created_at
                                    ).toLocaleString()}
                                />

                            </div>

                            <div className="bg-gray-50 border rounded-xl p-4">

                                <div className="text-xs text-gray-400 mb-2">
                                    Message
                                </div>

                                <p className="text-gray-700 whitespace-pre-line break-words">
                                    {selectedReport.issue}
                                </p>
                            </div>

                            <a
                                href={`mailto:${selectedReport.email}`}
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                            >
                                <FiMail />
                                Reply by Email
                            </a>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}

function Stat({ label, value }) {
    return (
        <div className="bg-white border rounded-xl px-4 py-2 shadow-sm text-center min-w-[90px]">
            <div className="text-gray-500 text-xs">{label}</div>
            <div className="font-bold text-gray-800">{value}</div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-400">{label}</div>
            <div className="font-medium text-gray-800">{value}</div>
        </div>
    );
}