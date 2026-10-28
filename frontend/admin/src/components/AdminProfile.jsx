import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import ENDPOINTS from "../tools/Endpoints";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { FiAlertTriangle } from "react-icons/fi"

export default function AdminProfile() {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logoutAll } = useAuth();
    const navigate = useNavigate();

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const [showSessionsModal, setShowSessionsModal] = useState(false);
    const [loggingOutAll, setLoggingOutAll] = useState(false);

    useEffect(() => {
        try {
            setLoading(true);
            setAdmin(user);
        } catch (err) {
            console.error(err);
            setAdmin(null);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleChangePassword = async () => {
        if (!passwordData.current_password || !passwordData.new_password || !passwordData.new_password_confirmation) {
            Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Please fill in all password fields.",
                confirmButtonColor: "#f97316",
                customClass: {
                    popup: "swal-rounded"
                }
            });
            return;
        }

        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            Swal.fire({
                icon: "error",
                title: "Password Mismatch",
                text: "New password and confirmation do not match.",
                confirmButtonColor: "#ef4444",
                customClass: {
                    popup: "swal-rounded"
                }
            });
            return;
        }

        try {
            setChangingPassword(true);

            await api.post(ENDPOINTS.AUTH.RESET, passwordData);

            Swal.fire({
                icon: "success",
                title: "Password Changed",
                text: "Your password has been updated successfully.",
                confirmButtonColor: "#22c55e",
                customClass: {
                    popup: "swal-rounded"
                }
            });

            setShowPasswordModal(false);
            setPasswordData({
                current_password: "",
                new_password: "",
                new_password_confirmation: "",
            });

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    err?.response?.data?.message ||
                    "Could not change password. Please try again.",
                confirmButtonColor: "#ef4444",
                customClass: {
                    popup: "swal-rounded"
                }
            });
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogoutAllDevices = async () => {
        const result = await Swal.fire({
            title: "Logout from all devices?",
            text: "You will be signed out from all active sessions.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Logout All",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "swal-rounded"
            }
        });

        if (!result.isConfirmed) return;

        try {
            setLoggingOutAll(true);

            await logoutAll();

            navigate("/");

            Swal.fire({
                icon: "success",
                title: "Logged Out",
                text: "You have been logged out from all devices.",
                confirmButtonColor: "#22c55e",
                customClass: {
                    popup: "swal-rounded"
                }
            });



        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text:
                    err?.response?.data?.message ||
                    "Could not logout from all devices.",
                confirmButtonColor: "#ef4444",
                customClass: {
                    popup: "swal-rounded"
                }
            });
        } finally {
            setLoggingOutAll(false);
        }
    };

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full flex flex-col gap-6">
            <div className="w-full flex gap-2 p-4 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100">
                <FiAlertTriangle className="mt-0.5 shrink-0 text-orange-500" size={18} />
                I didn't know what to show in this section so I tried to put anything that cames to my mind (The page UI can be improved in the futur).
            </div>
            {/* CONTENT */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* LEFT SIDEBAR */}
                <div className="flex flex-col gap-6">

                    {/* PROFILE CARD */}
                    <div className="bg-white rounded-[28px] border shadow-sm overflow-hidden">

                        <div className="h-28 bg-gradient-to-r from-orange-400 to-red-400" />

                        <div className="px-6 pb-6 relative">

                            {loading ? (
                                <div className="-mt-12 w-24 h-24 rounded-3xl bg-gray-200 border-4 border-white" />
                            ) : (
                                <div className="-mt-12 w-24 h-24 rounded-3xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                                    {admin?.pictureURL ? (
                                        <img
                                            src={admin.pictureURL}
                                            alt={admin.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white">
                                            {admin?.name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-4">
                                {loading ? (
                                    <>
                                        <div className="h-6 w-44 bg-gray-200 animate-pulse rounded-lg mb-2" />
                                        <div className="h-4 w-52 bg-gray-200 animate-pulse rounded-lg" />
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            {admin?.name}
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {admin?.email}
                                        </p>
                                    </>
                                )}
                            </div>

                            {!loading && (
                                <div className="mt-6 flex flex-col gap-3">
                                    <SidebarItem
                                        label="Administrator"
                                        value={admin?.level_name}
                                    />
                                    <SidebarItem
                                        label="Account Status"
                                        value="Active"
                                    />
                                    <SidebarItem
                                        label="Authentication"
                                        value="Secure"
                                    />
                                </div>
                            )}

                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="bg-white rounded-[28px] border shadow-sm p-6">

                        <h2 className="text-lg font-bold text-gray-800 mb-5">
                            Quick Actions
                        </h2>

                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-12 bg-gray-200 animate-pulse rounded-2xl" />
                                <div className="h-12 bg-gray-200 animate-pulse rounded-2xl" />
                                <div className="h-12 bg-gray-200 animate-pulse rounded-2xl" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">

                                <button
                                    onClick={() =>
                                        document
                                            .getElementById("account-info-section")
                                            ?.scrollIntoView({ behavior: "smooth" })
                                    }
                                    className="w-full px-4 py-3 rounded-2xl bg-orange-50 hover:bg-orange-100 border text-orange-700 font-semibold transition-all"
                                >
                                    See Account Info
                                </button>

                                <button
                                    onClick={() => {
                                        setPasswordData({
                                            current_password: "",
                                            new_password: "",
                                            new_password_confirmation: "",
                                        });
                                        setShowPasswordModal(true);
                                    }}
                                    className="w-full px-4 py-3 rounded-2xl bg-blue-50 hover:bg-blue-100 border text-blue-700 font-semibold transition-all"
                                >
                                    Change Password
                                </button>

                                <button
                                    disabled={loggingOutAll}
                                    onClick={handleLogoutAllDevices}
                                    className="w-full px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 border text-red-600 font-semibold transition-all disabled:opacity-50"
                                >
                                    {loggingOutAll ? "Logging out..." : "Logout from all devices"}
                                </button>

                            </div>
                        )}

                    </div>

                </div>

                {/* RIGHT CONTENT */}
                <div className="xl:col-span-2 flex flex-col gap-6">

                    {/* ACCOUNT INFO */}
                    <div
                        id="account-info-section"
                        className="bg-white rounded-[28px] border shadow-sm p-6"
                    >

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Account Information
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Overview of your administrator account
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-gray-50 border rounded-2xl p-5"
                                    >
                                        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-4" />
                                        <div className="h-6 w-full bg-gray-200 animate-pulse rounded" />
                                    </div>
                                ))
                            ) : (
                                <>
                                    <Info label="Full Name" value={admin?.name} />
                                    <Info label="Email Address" value={admin?.email} />
                                    <Info label="Role" value={admin?.level_name} />
                                    <Info label="User ID" value={`#${admin?.id}`} />
                                    <Info label="Account Type" value="Administrator" />
                                    <Info label="Status" value="Active" />
                                </>
                            )}
                        </div>

                    </div>

                    {/* SECURITY PANEL */}
                    <div className="bg-white rounded-[28px] border shadow-sm p-6">

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                Security Center
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Protect and manage your administrator account
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-32 rounded-3xl bg-gray-100 animate-pulse border"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <SecurityCard
                                    title="Password"
                                    desc="Update your password regularly"
                                    onClick={() => {
                                        setPasswordData({
                                            current_password: "",
                                            new_password: "",
                                            new_password_confirmation: "",
                                        });
                                        setShowPasswordModal(true);
                                    }}
                                />

                                <SecurityCard
                                    title="Sessions"
                                    desc="Manage connected devices"
                                    onClick={() => setShowSessionsModal(true)}
                                />

                                <SecurityCard
                                    title="Permissions"
                                    desc="Administrator full access"
                                    onClick={null}
                                />

                            </div>
                        )}

                    </div>

                </div>
            </div>

            {/* CHANGE PASSWORD MODAL */}
            {showPasswordModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setShowPasswordModal(false)}
                >
                    <div
                        className="modal-animate bg-white w-[500px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 flex items-center justify-between px-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Change Password
                                </h2>
                                <p className="text-white/80 text-xs">
                                    Update your administrator password
                                </p>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-white text-xl hover:scale-110 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6">
                            <div className="flex flex-col gap-4">

                                <PasswordInput
                                    label="Current Password"
                                    value={passwordData.current_password}
                                    onChange={(v) =>
                                        setPasswordData({ ...passwordData, current_password: v })
                                    }
                                />

                                <PasswordInput
                                    label="New Password"
                                    value={passwordData.new_password}
                                    onChange={(v) =>
                                        setPasswordData({ ...passwordData, new_password: v })
                                    }
                                />

                                <PasswordInput
                                    label="Confirm New Password"
                                    value={passwordData.new_password_confirmation}
                                    onChange={(v) =>
                                        setPasswordData({
                                            ...passwordData,
                                            new_password_confirmation: v,
                                        })
                                    }
                                />

                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    onClick={() => setShowPasswordModal(false)}
                                    className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={changingPassword}
                                    onClick={handleChangePassword}
                                    className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50"
                                >
                                    {changingPassword ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SESSIONS MODAL */}
            {showSessionsModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => setShowSessionsModal(false)}
                >
                    <div
                        className="modal-animate bg-white w-[500px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* HEADER */}
                        <div className="h-16 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-between px-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Active Sessions
                                </h2>
                                <p className="text-white/80 text-xs">
                                    Manage your connected devices
                                </p>
                            </div>
                            <button
                                onClick={() => setShowSessionsModal(false)}
                                className="text-white text-xl hover:scale-110 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="p-6">

                            <div className="bg-gray-50 border rounded-2xl p-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                        💻
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            Current Session
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Active right now
                                        </div>
                                    </div>
                                    <span className="ml-auto px-2 py-1 text-xs rounded-full bg-green-50 text-green-600 border">
                                        Active
                                    </span>
                                </div>
                            </div>

                            <p className="text-sm text-gray-500 mb-2">
                                To sign out from all other devices, use the logout button below.
                                This will invalidate all existing sessions.
                            </p>

                            <p className="text-xs text-red-500 mb-6 text-center">
                                (This section dosn't show the true sessions in the real time because we didn't use a session methode we used tokens so if we switch to sessions they will show up.)
                            </p>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSessionsModal(false)}
                                    className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                                >
                                    Close
                                </button>
                                <button
                                    disabled={loggingOutAll}
                                    onClick={() => {
                                        setShowSessionsModal(false);
                                        handleLogoutAllDevices();
                                    }}
                                    className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition disabled:opacity-50"
                                >
                                    {loggingOutAll ? "Logging out..." : "Logout All Devices"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

/* GLASS STAT */
function GlassStat({ label, value }) {
    return (
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-white min-w-[130px]">
            <div className="text-xs text-white/70">{label}</div>
            <div className="text-xl font-black mt-1">{value}</div>
        </div>
    );
}

/* INFO CARD */
function Info({ label, value }) {
    return (
        <div className="bg-gray-50 border rounded-2xl p-5 hover:shadow-sm transition-all">
            <div className="text-xs uppercase tracking-wide text-gray-400 mb-2 font-semibold">
                {label}
            </div>
            <div className="font-bold text-gray-800 text-lg break-words">
                {value ?? "-"}
            </div>
        </div>
    );
}

/* SIDEBAR ITEM */
function SidebarItem({ label, value }) {
    return (
        <div className="flex items-center justify-between border rounded-2xl px-4 py-3 bg-gray-50">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800">{value}</span>
        </div>
    );
}

/* SECURITY CARD */
function SecurityCard({ title, desc, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`border rounded-3xl p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-all ${onClick ? "cursor-pointer hover:border-orange-200" : ""}`}
        >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-lg mb-4">
                🔒
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">{desc}</p>
        </div>
    );
}

/* PASSWORD INPUT */
function PasswordInput({ label, value, onChange }) {
    const [show, setShow] = useState(false);

    return (
        <div>
            <label className="text-sm text-gray-600 mb-2 block">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-12"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-sm"
                >
                    {show ? "Hide" : "Show"}
                </button>
            </div>
        </div>
    );
}