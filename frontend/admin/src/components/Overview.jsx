import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, CartesianGrid,
} from "recharts";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";

import {
    FiBox, FiZap, FiUsers, FiActivity, FiTrendingUp,
    FiClock, FiShoppingBag, FiLayers, FiDatabase,
    FiServer, FiHardDrive, FiCpu, FiWifi, FiPackage,
    FiRefreshCw, FiCheckCircle, FiAlertTriangle, FiXCircle,
} from "react-icons/fi";

import { useAuth } from "../context/AuthContext";

/* ================================================================
 *  CONSTANTS
 * ================================================================ */
const COLORS = ["#f97316", "#6366f1", "#22c55e", "#ec4899", "#06b6d4", "#eab308"];

const KPI_COLORS = [
    { glow: "bg-orange-100", gradient: "from-orange-400 to-red-400", badge: "bg-orange-50 text-orange-600 border-orange-100" },
    { glow: "bg-blue-100", gradient: "from-blue-400 to-indigo-500", badge: "bg-blue-50 text-blue-600 border-blue-100" },
    { glow: "bg-green-100", gradient: "from-green-400 to-emerald-500", badge: "bg-green-50 text-green-600 border-green-100" },
    { glow: "bg-purple-100", gradient: "from-purple-400 to-pink-500", badge: "bg-purple-50 text-purple-600 border-purple-100" },
    { glow: "bg-cyan-100", gradient: "from-cyan-400 to-blue-400", badge: "bg-cyan-50 text-cyan-600 border-cyan-100" },
    { glow: "bg-yellow-100", gradient: "from-yellow-400 to-orange-400", badge: "bg-yellow-50 text-yellow-600 border-yellow-100" },
    { glow: "bg-rose-100", gradient: "from-rose-400 to-pink-500", badge: "bg-rose-50 text-rose-600 border-rose-100" },
    { glow: "bg-teal-100", gradient: "from-teal-400 to-green-500", badge: "bg-teal-50 text-teal-600 border-teal-100" },
];

const BAR_COLORS = {
    orange: "bg-orange-400", blue: "bg-blue-400", green: "bg-green-400",
    purple: "bg-purple-400", cyan: "bg-cyan-400", yellow: "bg-yellow-400",
    rose: "bg-rose-400", teal: "bg-teal-400",
};

const BAR_COLORS_HEX = {
    orange: "#fb923c", blue: "#60a5fa", green: "#4ade80",
    purple: "#c084fc", cyan: "#22d3ee", yellow: "#facc15",
    rose: "#fb7185", teal: "#2dd4bf",
};

const STATUS_COLORS = {
    completed: "bg-green-50 text-green-600 border-green-100",
    pending: "bg-yellow-50 text-yellow-600 border-yellow-100",
    processing: "bg-blue-50 text-blue-600 border-blue-100",
    cancelled: "bg-red-50 text-red-600 border-red-100",
};

const ACTIVITY_CONFIG = {
    order: { color: "bg-orange-500", label: "Order" },
    user: { color: "bg-blue-500", label: "User" },
    admin: { color: "bg-purple-500", label: "Admin" },
    template: { color: "bg-green-500", label: "Template" },
    item: { color: "bg-yellow-500", label: "Item" },
    box: { color: "bg-cyan-500", label: "Box" },
    archived: { color: "bg-gray-500", label: "Archived" },
    restored: { color: "bg-teal-500", label: "Restored" },
};

/* ================================================================
 *  HEALTH HELPERS
 * ================================================================ */

/**
 * Returns Tailwind classes for bar, badge bg, badge text, and icon
 * based on a generic status string.
 */
function healthTheme(status) {
    const s = (status ?? "").toLowerCase();
    if (["online", "healthy", "normal", "light", "running", "stable"].includes(s)) {
        return {
            bar: "bg-green-500",
            badgeBg: "bg-green-50",
            badgeText: "text-green-700",
            badgeBorder: "border-green-200",
            dot: "bg-green-400",
            icon: <FiCheckCircle size={13} className="text-green-500" />,
        };
    }
    if (["slow", "warning", "medium", "high"].includes(s)) {
        return {
            bar: "bg-yellow-400",
            badgeBg: "bg-yellow-50",
            badgeText: "text-yellow-700",
            badgeBorder: "border-yellow-200",
            dot: "bg-yellow-400",
            icon: <FiAlertTriangle size={13} className="text-yellow-500" />,
        };
    }
    if (["critical", "heavy", "unhealthy", "offline", "degraded", "unreachable"].includes(s)) {
        return {
            bar: "bg-red-500",
            badgeBg: "bg-red-50",
            badgeText: "text-red-700",
            badgeBorder: "border-red-200",
            dot: "bg-red-400",
            icon: <FiXCircle size={13} className="text-red-500" />,
        };
    }
    return {
        bar: "bg-gray-300",
        badgeBg: "bg-gray-100",
        badgeText: "text-gray-500",
        badgeBorder: "border-gray-200",
        dot: "bg-gray-300",
        icon: <FiActivity size={13} className="text-gray-400" />,
    };
}

/* ================================================================
 *  SYSTEM HEALTH CARD  — standalone sub-component
 * ================================================================ */
function SystemHealthCard({ health, loading }) {

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-sm space-y-4">
                <div className="h-6 w-36 bg-gray-200 animate-pulse rounded-xl" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
                            <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 animate-pulse rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    const api = health?.api ?? {};
    const db = health?.database ?? {};
    const storage = health?.storage ?? {};
    const queue = health?.queue ?? {};
    const memory = health?.memory ?? {};
    const cpu = health?.cpu ?? {};
    const uptime = health?.uptime ?? {};
    const cache = health?.cache ?? {};

    /* Build a unified list of metrics to render */
    const metrics = [
        {
            icon: <FiWifi size={16} />,
            label: "API",
            status: api.status ?? "Unknown",
            pct: api.health_pct ?? null,
            sub: api.latency_ms != null ? `${api.latency_ms}ms latency` : null,
        },
        {
            icon: <FiDatabase size={16} />,
            label: "Database",
            status: db.status ?? "Unknown",
            pct: db.health_pct ?? null,
            sub: db.latency_ms != null
                ? `${db.latency_ms}ms · ${db.connections ?? "—"} conn.`
                : null,
        },
        {
            icon: <FiHardDrive size={16} />,
            label: "Storage",
            status: storage.status ?? "Unknown",
            pct: storage.health_pct ?? null,
            sub: storage.used_pct != null
                ? `${storage.used_pct}% used · ${storage.free_gb ?? "—"} GB free`
                : null,
            invertBar: true, // bar = free space remaining (health_pct)
        },
        {
            icon: <FiPackage size={16} />,
            label: "Queue",
            status: queue.status ?? "Unknown",
            pct: queue.health_pct ?? null,
            sub: queue.pending_jobs != null
                ? `${queue.pending_jobs} pending · ${queue.failed_jobs ?? 0} failed`
                : null,
        },
        {
            icon: <FiServer size={16} />,
            label: "Memory",
            status: memory.status ?? "Unknown",
            pct: memory.health_pct ?? null,
            sub: memory.used_mb != null
                ? `${memory.used_mb} MB / ${memory.total_mb ?? "?"} MB`
                : null,
        },
        {
            icon: <FiCpu size={16} />,
            label: "CPU",
            status: cpu.status ?? "Unknown",
            pct: cpu.health_pct ?? null,
            sub: cpu.used_pct != null
                ? `${cpu.used_pct}% · load ${cpu.load_1min ?? "—"}`
                : null,
        },
        {
            icon: <FiRefreshCw size={16} />,
            label: "Cache",
            status: cache.status ?? "Unknown",
            pct: cache.healthy ? 100 : 0,
            sub: cache.driver ? `Driver: ${cache.driver}` : null,
        },
        {
            icon: <FiActivity size={16} />,
            label: "Uptime",
            status: uptime.status ?? "Unknown",
            pct: uptime.status === "Running" ? 100 : 0,
            sub: uptime.human ?? null,
        },
    ];

    /* Overall health score — average of non-null pcts */
    const validPcts = metrics.map((m) => m.pct).filter((p) => p !== null);
    const overallPct = validPcts.length
        ? Math.round(validPcts.reduce((a, b) => a + b, 0) / validPcts.length)
        : null;

    const overallStatus = overallPct == null ? "Unknown"
        : overallPct >= 80 ? "Stable"
            : overallPct >= 50 ? "Degraded"
                : "Critical";

    const overallTheme = healthTheme(overallStatus);

    return (
        <div className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">System Health</h3>
                <div className="flex items-center gap-2">
                    {overallPct !== null && (
                        <span className="text-xs font-bold text-gray-500">{overallPct}%</span>
                    )}
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${overallTheme.badgeBg} ${overallTheme.badgeText} ${overallTheme.badgeBorder}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${overallTheme.dot} ${overallStatus === "Stable" ? "animate-pulse" : ""}`} />
                        {overallStatus}
                    </span>
                </div>
            </div>

            {/* Metric rows */}
            <div className="space-y-4">
                {metrics.map((m) => {
                    const theme = healthTheme(m.status);
                    const barPct = m.pct != null ? Math.min(100, Math.max(0, m.pct)) : null;

                    return (
                        <div key={m.label}>
                            <div className="flex items-center justify-between mb-1.5">
                                {/* Left: icon + label + sub-label */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${theme.badgeBg}`}>
                                        <span className={theme.badgeText}>{m.icon}</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-gray-700 leading-none">{m.label}</div>
                                        {m.sub && (
                                            <div className="text-[11px] text-gray-400 mt-0.5 leading-none">{m.sub}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: status badge */}
                                <div className="flex items-center gap-1.5">
                                    {/* Percentage */}
                                    <div className="flex justify-end mb-1">
                                        <span className={`text-[11px] font-bold ${theme.badgeText}`}>
                                            {barPct !== null ? `${Math.round(barPct)}%` : "—"}
                                        </span>
                                    </div>
                                    {theme.icon}
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                                        {m.status}
                                    </span>
                                </div>
                            </div>

                            {/* Progress section */}
                            <div className="mt-2">
                                {/* Progress bar */}
                                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden relative">
                                    {barPct !== null ? (
                                        <div
                                            className={`h-full rounded-full ${theme.bar} transition-all duration-700`}
                                            style={{ width: `${barPct}%` }}
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gray-200 animate-pulse rounded-full" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ================================================================
 *  SKELETON HELPERS
 * ================================================================ */
function SkeletonBox({ className }) {
    return <div className={`bg-gray-200 animate-pulse rounded-2xl ${className}`} />;
}
function KPICardSkeleton() {
    return (
        <div className="rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <SkeletonBox className="h-3 w-20" />
                    <SkeletonBox className="h-9 w-28" />
                    <SkeletonBox className="h-6 w-16 rounded-full" />
                </div>
                <SkeletonBox className="w-14 h-14 rounded-2xl" />
            </div>
        </div>
    );
}
function ChartSkeleton({ height = "h-72" }) {
    return (
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <SkeletonBox className="h-5 w-40" />
                    <SkeletonBox className="h-3 w-28" />
                </div>
                <SkeletonBox className="w-12 h-12 rounded-2xl" />
            </div>
            <SkeletonBox className={`w-full ${height}`} />
        </div>
    );
}
function TableSkeleton() {
    return (
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <SkeletonBox className="h-5 w-48 mb-4" />
            {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} className="h-12 w-full" />
            ))}
        </div>
    );
}
function ActivitySkeleton() {
    return (
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm space-y-3">
            <SkeletonBox className="h-5 w-40 mb-4" />
            {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonBox key={i} className="h-14 w-full" />
            ))}
        </div>
    );
}

const formatNumber = (num) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(".0", "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(".0", "") + "K";
    return num;
};

function formatMeta(meta) {
    if (!meta) return [];

    const result = [];

    Object.entries(meta).forEach(([key, value]) => {

        if (["preview", "pictureURL"].includes(key)) {
            result.push({ label: key === "pictureURL" ? "profile" : "preview", text: "Image updated" });
            return;
        }

        if (["preview_public_id", "imagePublicId", "archived_at"].includes(key)) {
            return; 
        }

        if (key === "order_id") {
            result.push({ label: "order", text: `#${value}` });
            return;
        }

        if (value && typeof value === "object" && ("from" in value || "to" in value)) {
            result.push({ label: key, text: `${value.from ?? "—"} → ${value.to ?? "—"}` });
            return;
        }

        result.push({ label: key, text: String(value) });
    });

    return result;
}

/* ================================================================
 *  MAIN COMPONENT
 * ================================================================ */
export default function Overview() {

    const [loadingAdmin, setLoadingAdmin] = useState(true);
    const [loadingData, setLoadingData] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const { user } = useAuth();
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [now, setNow] = useState(new Date());
    const time = now.toLocaleTimeString();
    const date = now.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const [activitySearch, setActivitySearch] = useState("");

    const getGreeting = (hour) => {
        if (hour < 12) return "Good Mornin";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        try {
            setLoadingAdmin(true);
            setAdmin(user);
        } catch {
            setAdmin(null);
        } finally {
            setLoadingAdmin(false);
        }
    }, [user]);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setLoadingData(true);
                setError(null);
                const res = await api.get(ENDPOINTS.DASHBOARD.OVERVIEW);
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchOverview();
    }, []);

    const counters = data?.counters ?? {};
    const analytics = data?.order_analytics ?? {};
    const recentOrders = data?.recent_orders ?? [];
    const weeklyOrders = data?.weekly_orders ?? [];
    const monthlyChart = data?.monthly_revenue_chart ?? [];
    const topBoxes = data?.top_boxes ?? [];
    const topItems = data?.top_items ?? [];
    const health = data?.system_health ?? {};
    const activity = data?.recent_activity ?? [];

    const kpis = [
        { label: "Total Orders", value: formatNumber(counters.total_orders ?? 0), trend: `${formatNumber(analytics.completed_orders ?? 0)} done`, icon: <FiShoppingBag /> },
        { label: "Revenue", value: `${formatNumber(analytics.total_revenue ?? 0)} DH`, trend: `${formatNumber(analytics.today_revenue ?? 0)} DH today`, icon: <FiTrendingUp /> },
        { label: "Users", value: formatNumber(counters.total_users ?? 0), trend: "Registered", icon: <FiUsers /> },
        { label: "Items", value: formatNumber(counters.total_items ?? 0), trend: "In system", icon: <FiZap /> },
        { label: "Boxes", value: formatNumber(counters.total_boxes ?? 0), trend: "Configurable", icon: <FiBox /> },
        { label: "Templates", value: formatNumber(counters.total_templates ?? 0), trend: "Box types", icon: <FiLayers /> },
        { label: "Pending Orders", value: formatNumber(analytics.pending_orders ?? 0), trend: "Awaiting", icon: <FiClock /> },
        { label: "Admins", value: formatNumber(counters.total_admins ?? 0), trend: "Active", icon: <FiDatabase /> },
    ];

    const pieData = [
        { name: "Completed", value: analytics.completed_orders ?? 0 },
        { name: "Pending", value: analytics.pending_orders ?? 0 },
        { name: "Processing", value: analytics.processing_orders ?? 0 },
        { name: "Cancelled", value: analytics.cancelled_orders ?? 0 },
    ];

    const filteredActivity = activity.filter((a) =>
        a.title?.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.user?.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.type?.toLowerCase().includes(activitySearch.toLowerCase())
    );

    const isNewOrder = (order) => {
        const created = new Date(order.created_at);
        const now = new Date();

        const diffInHours = (now - created) / (1000 * 60 * 60);

        return diffInHours <= 24 && order.status === "pending";
    };

    const newOrdersCount = data?.order_analytics.new_orders_count ?? 0;

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

            {/* ---- HERO STRIP ---- */}
            <div className="relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 shadow-lg shadow-orange-500/20">

                {/* GRID */}
                <div className="absolute inset-0 opacity-[0.11]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                {/* Glow blobs */}
                <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/10 blur-3xl" />

                {/* Content */}
                <div className="relative z-10 flex items-center justify-between px-8 py-7 gap-6 flex-wrap">

                    {/* LEFT: greeting */}
                    <div className="flex items-center gap-5">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center text-2xl font-black text-white shadow-inner overflow-hidden">
                                {user?.pictureURL ? (
                                    <img
                                        src={user.pictureURL}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <>
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow">
                                <div className="w-full h-full rounded-full bg-green-300 animate-ping opacity-75" />
                            </div>
                        </div>

                        {/* Text */}
                        <div>
                            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-0.5">
                                {getGreeting(now.getHours())}
                            </p>
                            <h2 className="text-white text-2xl font-bold leading-tight">
                                {user?.gender === "male" ? "Mr. " : "Ms. "} 
                                {user?.name || "Admin"}
                            </h2>
                            <p className="text-white/60 text-sm mt-1">
                                {date}
                            </p>
                        </div>

                    </div>

                    {/* RIGHT: clock + divider + status */}
                    <div className="flex items-center gap-5">

                        {/* Clock */}
                        <div className="text-right">
                            <div className="text-white text-3xl font-black font-mono tracking-tight leading-none">
                                {time}
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                                <span className="text-white/60 text-xs font-medium">Live</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-12 bg-white/20 hidden sm:block" />

                        {/* Status badges */}
                        <div className="hidden sm:flex flex-col gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                                <span className="text-white text-xs font-semibold">System Online</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-amber-300" />
                                <span className="text-white text-xs font-semibold">{user?.level_name ?? "Administrator"}</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            <div className="w-full h-px bg-gray-200 mb-7" />

            {/* ---- HEADER ---- */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-800">System Overview</h1>
                    <p className="text-gray-500 mt-2">Live analytics, system health and usage insights</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold shadow-sm">
                        {loadingData ? "—" : `${newOrdersCount} New Orders`}
                    </div>
                </div>
            </div>

            <div className="w-full h-0.5 bg-gray-200 mb-7" />

            {/* ---- KPI CARDS ---- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
                {loadingData
                    ? Array.from({ length: 8 }).map((_, i) => <KPICardSkeleton key={i} />)
                    : kpis.map((k, i) => {
                        const c = KPI_COLORS[i % KPI_COLORS.length];
                        const colorKey = c.gradient.includes("orange") ? "orange"
                            : c.gradient.includes("blue") ? "blue"
                                : c.gradient.includes("green") ? "green"
                                    : c.gradient.includes("cyan") ? "cyan"
                                        : c.gradient.includes("yellow") ? "yellow"
                                            : c.gradient.includes("rose") ? "rose"
                                                : c.gradient.includes("teal") ? "teal"
                                                    : "purple";
                        const barColor = BAR_COLORS[colorKey];
                        return (
                            <div
                                key={i}
                                className="group relative overflow-hidden rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                style={{ borderTop: `4px solid ${BAR_COLORS_HEX[colorKey]}` }}
                            >
                                <div className="absolute top-0 left-0 w-full flex gap-1 px-4 pt-3">
                                    <span className={`h-1 w-6 rounded-full ${barColor}`} />
                                    <span className={`h-1 w-4 rounded-full opacity-60 ${barColor}`} />
                                    <span className={`h-1 w-2 rounded-full opacity-40 ${barColor}`} />
                                </div>
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-70 transition ${c.glow}`} />
                                <div className="relative z-10 flex items-start justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500 font-medium">{k.label}</div>
                                        <div className="text-4xl font-black text-gray-800 mt-2">{k.value}</div>
                                        <div className={`inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold border ${c.badge}`}>
                                            <FiTrendingUp />
                                            {k.trend}
                                        </div>
                                    </div>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center text-2xl shadow-lg`}>
                                        {k.icon}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            <div className="w-full h-0.5 bg-gray-200 mb-7" />

            {/* ---- CHARTS ROW ---- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-7">
                {loadingData ? <ChartSkeleton /> : (
                    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
                                <p className="text-sm text-gray-500 mt-1">Distribution by status</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl"><FiBox /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={5}>
                                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-3">
                            {pieData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                                        <span className="text-sm text-gray-600">{item.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-800">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {loadingData ? <ChartSkeleton /> : (
                    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Weekly Orders</h2>
                                <p className="text-sm text-gray-500 mt-1">Orders in the last 7 days</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl"><FiActivity /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={weeklyOrders}>
                                <CartesianGrid vertical={false} stroke="#f3f4f6" strokeDasharray="4 4" />
                                <XAxis dataKey="day" axisLine tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12, fontWeight: 600 }} />
                                <YAxis axisLine tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                                    contentStyle={{ color: "#000", background: "#fff", borderRadius: "12px", boxShadow: "0 15px 40px rgba(0,0,0,0.15)" }}
                                    labelStyle={{ color: "#000", fontWeight: 700 }}
                                />
                                <Bar dataKey="orders" radius={[8, 8, 0, 0]} barSize={35}>
                                    {weeklyOrders.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {loadingData ? <ChartSkeleton /> : (
                    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Monthly Revenue</h2>
                                <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl"><FiTrendingUp /></div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyChart}>
                                <CartesianGrid stroke="#f3f4f6" strokeDasharray="4 4" />
                                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: "12px", boxShadow: "0 15px 40px rgba(0,0,0,0.15)" }} />
                                <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} dot={{ r: 5, fill: "#6366f1" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="w-full h-0.5 bg-gray-200 mb-7" />

            {/* ---- RECENT ORDERS TABLE ---- */}
            <div className="mb-7">
                {loadingData ? <TableSkeleton /> : (
                    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
                                <p className="text-sm text-gray-500 mt-1">Latest 5 orders in the system</p>
                            </div>
                            <button
                                onClick={() => navigate("/dashboard/orders")}
                                className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 text-sm font-semibold hover:bg-orange-100 transition"
                            >
                                View All
                            </button>
                        </div>
                        <div className="overflow-hidden rounded-2xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-4 text-left">Order</th>
                                        <th className="p-4 text-left">Customer</th>
                                        <th className="p-4 text-left">Status</th>
                                        <th className="p-4 text-left">Total</th>
                                        <th className="p-4 text-left">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length > 0 ? recentOrders.map((order) => (
                                        <tr key={order.id} className="border-t hover:bg-gray-50 transition">
                                            <td className="p-4 font-bold text-gray-800">
                                                <div className="flex items-center gap-7">
                                                    <span>#{order.id}</span>

                                                    {isNewOrder(order) && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200 rounded-full animate-pulse">
                                                            NEW
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 border flex items-center justify-center font-bold text-orange-700 text-xs">
                                                        {order.user?.name?.charAt(0) || "U"}
                                                    </div>
                                                    <span className="font-medium text-gray-800">{order.user?.name || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs rounded-full border capitalize ${STATUS_COLORS[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-800">{order.total_price} DH</td>
                                            <td className="p-4 text-gray-500 text-xs">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="p-10 text-center text-gray-500">No orders yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <div className="w-full h-0.5 bg-gray-200 mb-7" />

            {/* ---- LOWER GRID ---- */}
            <div
                className={`grid grid-cols-1 gap-6 mb-7 ${user?.level_id === 1
                    ? "xl:grid-cols-3"
                    : "xl:grid-cols-2"
                    }`}
            >

                {/* ACTIVITY */}
                {loadingData ? <ActivitySkeleton /> : (
                    <div className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiClock />
                                Activity Timeline
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-4 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-100 font-semibold">Live</span>
                                <button
                                    onClick={() => setShowActivityModal(true)}
                                    className="px-4 py-2 text-xs font-semibold rounded-full bg-green-50 text-green-600 border border-green-100 hover:bg-green-100 transition"
                                >
                                    View All
                                </button>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-2xl border">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="p-3 text-left">Type</th>
                                        <th className="p-3 text-left">Event</th>
                                        <th className="p-3 text-left">User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activity.length > 0 ? activity.slice(0, 8).map((a) => {
                                        const cfg = ACTIVITY_CONFIG[a.type] ?? { color: "bg-gray-400", label: a.type };
                                        return (
                                            <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                                                <td className="p-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold text-white ${cfg.color}`}>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                                                        {cfg.label}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="font-medium text-gray-800 text-xs max-w-[100px] truncate">{a.title}</div>
                                                    {formatMeta(a.meta)?.length > 0 && (
                                                        <div className="mt-1 space-y-1">
                                                            {formatMeta(a.meta).map((m, i) => (
                                                                <div key={i} className="text-[11px] text-gray-500 max-w-[100px] truncate">
                                                                    <span className="font-semibold text-gray-600">{m.label}:</span>{" "}
                                                                    <span className="text-gray-500">{m.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-gray-500 text-xs">{a.user}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400 text-sm">No activity yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* QUICK ACTIONS */}
                <div className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
                    <div className="space-y-4">
                        {[
                            { label: "Create Box", sub: "Generate a new configuration box", color: "purple", path: "/dashboard/catalogue/boxes" },
                            { label: "Create Template", sub: "Generate a new configuration template", color: "orange", path: "/dashboard/catalogue/templates" },
                            { label: "Create Item", sub: "Generate a new configuration item", color: "blue", path: "/dashboard/items" },
                            { label: "Create Configuration", sub: "Generate a new distribution", color: "red", path: "/dashboard/configurations" },
                            { label: "View Orders", sub: "Open orders management", color: "green", path: "/dashboard/orders", arrow: true },
                        ].map((action) => (
                            <button
                                key={action.label}
                                onClick={() => navigate(action.path)}
                                className={`w-full flex items-center justify-between rounded-2xl border border-${action.color}-100 bg-${action.color}-50 hover:bg-${action.color}-100 px-5 py-4 transition`}
                            >
                                <div className="text-left">
                                    <div className={`font-semibold text-${action.color}-700`}>{action.label}</div>
                                    <div className={`text-sm text-${action.color}-500 mt-1`}>{action.sub}</div>
                                </div>
                                <div className={`text-2xl text-${action.color}-500`}>{action.arrow ? "→" : "+"}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SYSTEM HEALTH — now real */}
                {user?.level_id === 1 && (
                    <SystemHealthCard health={health} loading={loadingData} />
                )}

            </div>

            {/* ---- TOP PERFORMING ---- */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {loadingData ? <ActivitySkeleton /> : (
                    <div className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Top Boxes</h3>
                                <p className="text-sm text-gray-500 mt-1">Most demanding configurable boxes</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl"><FiBox /></div>
                        </div>
                        <div className="space-y-3">
                            {topBoxes.length > 0 ? topBoxes.map((box, i) => (
                                <div key={i} className="flex items-center gap-4 rounded-2xl border bg-gray-50 hover:bg-orange-50 transition px-4 py-3">
                                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">#{i + 1}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 text-sm">{box.code}</div>
                                        <div className="h-2 rounded-full bg-gray-200 mt-2 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-700" style={{ width: `${topBoxes[0]?.usage_count ? (box.usage_count / topBoxes[0].usage_count) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 min-w-[40px] text-right">{box.usage_count}</span>
                                </div>
                            )) : <p className="text-sm text-gray-400 text-center py-6">No data yet</p>}
                        </div>
                    </div>
                )
                }
                {loadingData ? <ActivitySkeleton /> : (
                    <div className="bg-white border border-gray-200 rounded-[28px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Top Items</h3>
                                <p className="text-sm text-gray-500 mt-1">Most demanding items in configurations</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center text-xl"><FiZap /></div>
                        </div>
                        <div className="space-y-3">
                            {topItems.length > 0 ? topItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-4 rounded-2xl border bg-gray-50 hover:bg-indigo-50 transition px-4 py-3">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm">#{i + 1}</div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
                                        <div className="h-2 rounded-full bg-gray-200 mt-2 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-700" style={{ width: `${topItems[0]?.usage_count ? (item.usage_count / topItems[0].usage_count) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-700 min-w-[40px] text-right">{item.usage_count}</span>
                                </div>
                            )) : <p className="text-sm text-gray-400 text-center py-6">No data yet</p>}
                        </div>
                    </div>
                )
                }
            </div>

            {error && (
                <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>
            )}

            {/* ACTIVITY MODAL */}
            {showActivityModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowActivityModal(false)}>
                    <div className="modal-animate bg-white w-[900px] max-w-full rounded-3xl shadow-2xl overflow-hidden border max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-orange-500 via-orange-400 to-red-400 p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-white/80 text-sm">System Activity Log</div>
                                    <h2 className="text-white font-black text-3xl mt-1">All Activities</h2>
                                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                                        <span className="px-3 py-1 rounded-full text-xs border bg-white/20 text-white border-white/20">{activity.length} Events</span>
                                        <span className="px-3 py-1 rounded-full text-xs border bg-white/20 text-white border-white/20">Live Feed</span>
                                    </div>
                                </div>
                                <button onClick={() => setShowActivityModal(false)} className="w-11 h-11 rounded-xl bg-white/20 text-white hover:bg-white/30 transition flex items-center justify-center">✕</button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search activity by title, user or type..."
                                    value={activitySearch}
                                    onChange={(e) => setActivitySearch(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="overflow-hidden rounded-2xl border">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="p-3 text-left">Type</th>
                                            <th className="p-3 text-left">Event</th>
                                            <th className="p-3 text-left">User</th>
                                            <th className="p-3 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredActivity.length > 0 ? filteredActivity.map((a) => {
                                            const cfg = ACTIVITY_CONFIG[a.type] ?? { color: "bg-gray-400", label: a.type };
                                            return (
                                                <tr key={a.id} className="border-t hover:bg-gray-50 transition">
                                                    <td className="p-3">
                                                        <span className={`px-2 py-1 text-xs text-white rounded-full ${cfg.color}`}>{cfg.label}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="font-medium text-gray-800 text-xs">{a.title}</div>
                                                        {formatMeta(a.meta)?.length > 0 && (
                                                            <div className="mt-1 space-y-1">
                                                                {formatMeta(a.meta).map((m, i) => (
                                                                    <div key={i} className="text-[11px] text-gray-500">
                                                                        <span className="font-semibold text-gray-600">{m.label}:</span>{" "}
                                                                        <span className="text-gray-500">{m.text}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-600">{a.user}</td>
                                                    <td className="p-3 text-gray-400 whitespace-nowrap">{a.timestamp}</td>
                                                </tr>
                                            );
                                        }) : (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center text-gray-400">No activity found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}