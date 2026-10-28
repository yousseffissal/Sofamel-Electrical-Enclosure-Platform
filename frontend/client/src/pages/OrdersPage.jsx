import { useEffect, useState, useCallback } from "react";
import { getOrders, downloadOrderPdf } from "../api/configuratorApi.js";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import IndustrialBackground from "../components/IndustrialBackground.jsx";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STEPS = ["pending", "processing", "completed"];

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  processing: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  cancelled: "bg-red-50 text-red-800 ring-1 ring-red-200",
};

const FILTERS = ["all", "pending", "processing", "completed", "cancelled"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price) {
  return Number(price).toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " DH";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function StatusTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl px-4 py-3 animate-fade-in">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Order cancelled
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);
  const isCompleted = status === "completed";

  return (
    <div className="flex items-start select-none">
      {STATUS_STEPS.map((step, i) => {
        const isDone = isCompleted ? true : i < currentIndex;
        const isCurrent = isCompleted
          ? i === STATUS_STEPS.length - 1
          : i === currentIndex;

        return (
          <div key={step} className="flex-1 flex flex-col items-center relative group">
            {i > 0 && (
              <div className="absolute top-[10px] right-1/2 w-full h-[3px] bg-gray-200 overflow-hidden rounded-full">
                <div
                  className={`h-full transition-all duration-700 ease-out rounded-full ${isDone ? "w-full bg-emerald-500" : "w-0 bg-emerald-500"}`}
                />
              </div>
            )}
            <div
              className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${isDone
                  ? "bg-emerald-500 border-emerald-500"
                  : isCurrent
                    ? "bg-white border-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.15)] scale-110"
                    : "bg-white border-gray-200"
                }
              group-hover:scale-110`}
            >
              {isDone && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {!isCompleted && isCurrent && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <p
              className={`text-xs mt-2 capitalize transition-all duration-300 ${isDone
                ? "text-emerald-600 font-medium"
                : isCurrent
                  ? "text-emerald-700 font-semibold"
                  : "text-gray-400"
                }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function InfoCell({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 break-words">{value}</p>
    </div>
  );
}

// ─── Box Panel Summary ────────────────────────────────────────────────────────

function BoxSummary({ configuration }) {
  const box = configuration?.configurable_box;
  if (!box) return null;

  const boxType = box.box_type;

  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      {box.preview ? (
        <div className="w-full h-44 bg-white border-b-2 border-gray-1200 flex items-center justify-center overflow-hidden">
          <img src={box.preview} alt={box.code} className="h-full w-full object-contain p-4" />
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-50 flex items-center justify-center">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7L12 3 4 7m16 0v10l-8 4m0-14L4 7m8 4v10" />
          </svg>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{box.code}</p>
            {boxType && (
              <p className="text-xs text-gray-400 mt-0.5">
                {[boxType.family, boxType.variant, boxType.material].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-gray-900">{formatPrice(configuration.box_price_snapshot)}</p>
          </div>
        </div>

        {boxType && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              boxType.ip_rating,
              boxType.mounting_type,
              boxType.color,
              boxType.has_earth_leakage && `Earth leakage${boxType.earth_leakage_rating ? `: ${boxType.earth_leakage_rating}` : ""}`,
              boxType.has_overcurrent && "Overcurrent",
            ]
              .filter(Boolean)
              .map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5">{tag}</span>
              ))}
          </div>
        )}

        {boxType && (
          <p className="text-xs text-gray-400">
            {boxType.width_mm} × {boxType.height_mm} × {boxType.depth_mm} mm
            {boxType.branch_cable_count > 1 && ` · ${boxType.branch_cable_count} branches`}
          </p>
        )}

        {boxType?.description && (
          <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-100 pt-2">{boxType.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Configuration Items grouped by area ─────────────────────────────────────

function ConfigurationItems({ items }) {
  if (!items?.length) return null;

  const grouped = items.reduce((acc, ci) => {
    const areaName = ci.area?.name ?? "Unassigned";
    if (!acc[areaName]) acc[areaName] = [];
    acc[areaName].push(ci);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([area, areaItems]) => (
        <div key={area}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{area}</p>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="space-y-2">
            {areaItems.map((ci) => {
              const item = ci.item;
              return (
                <div key={ci.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                  <div className="w-14 h-14 rounded-xl bg-white shrink-0 overflow-hidden flex items-center justify-center border-2 border-gray-100">
                    {item?.preview ? (
                      <img src={item.preview} alt={item.name} className="w-full h-full object-contain p-1.5" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item?.name ?? "—"}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                      {item?.code && <span className="text-xs text-gray-400">{item.code}</span>}
                      {item?.category && <span className="text-xs text-gray-400">{item.category}</span>}
                      {item?.amperage && <span className="text-xs text-gray-400">{item.amperage}A</span>}
                      {item?.poles && <span className="text-xs text-gray-400">{item.poles}P</span>}
                      {item?.voltage && <span className="text-xs text-gray-400">{item.voltage}V</span>}
                    </div>
                  </div>

                  <div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-400 mt-0.5">{Number(ci.price_snapshot).toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH / item</p>
                    </div>
                    <div className="flex gap-2">
                      <p className="text-sm font-semibold text-gray-800">(×{ci.quantity})</p>
                      <p className="text-sm font-semibold text-green-600">{Number(ci.price_snapshot * ci.quantity).toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Download Devis Button ────────────────────────────────────────────────────

function DownloadDevisButton({ orderId, fullWidth = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await downloadOrderPdf(orderId);
      const file = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `devis-order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error(err);
      setError("Download failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${fullWidth ? "w-full" : "items-end"}`}>
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 border
          ${fullWidth ? "w-full py-3.5" : ""}
          ${loading
            ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed"
            : fullWidth
              ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800 shadow-sm"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 shadow-sm"
          }`}
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17a2 2 0 002 2h14a2 2 0 002-2v-3H3v3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10V7a5 5 0 0110 0v3" />
            </svg>
            {fullWidth ? "Download Devis PDF" : "Devis PDF"}
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Order Modal / Drawer ─────────────────────────────────────────────────────

function OrderModal({ order, onClose }) {
  const cfg = order.configuration;
  const items = cfg?.configuration_items ?? [];

  const itemsTotal = items.reduce(
    (sum, ci) => sum + Number(ci.price_snapshot) * ci.quantity,
    0
  );
  const boxTotal = cfg ? Number(cfg.box_price_snapshot) : 0;

  const pricingBlock = (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
      {cfg && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Template</span>
          <span>{formatPrice(boxTotal)}</span>
        </div>
      )}
      {itemsTotal > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Items ({items.length})</span>
          <span>{formatPrice(itemsTotal)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
        <span>Unit price</span>
        <span>{formatPrice(itemsTotal + boxTotal)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Quantity</span>
        <span>× {cfg?.quantity}</span>
      </div>
      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider">Final total</p>
        <div className="text-2xl font-bold text-green-500">
          {formatPrice(order.total_price)}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP: centered modal ── */}
      <div
        className="hidden md:flex fixed inset-0 bg-black/60 items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-900">Order #{order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-3">
              <DownloadDevisButton orderId={order.id} />
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-6 space-y-7 flex-1">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <StatusTimeline status={order.status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoCell label="Order date" value={formatDate(order.created_at)} />
              <InfoCell label="Phone" value={order.phone} />
              <div className="col-span-2">
                <InfoCell label="Delivery address" value={order.address} />
              </div>
            </div>
            {cfg && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Electrical template</p>
                <BoxSummary configuration={cfg} />
              </div>
            )}
            {items.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Installed items</p>
                <ConfigurationItems items={items} />
              </div>
            )}
            {pricingBlock}
          </div>
        </div>
      </div>

      {/* ── MOBILE: bottom drawer ── */}
      <div className="md:hidden">
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
          style={{ maxHeight: "92vh" }}
        >
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          <div className="flex justify-between items-center px-5 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-gray-900">Order #{order.id}</h2>
              <StatusBadge status={order.status} />
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6 pb-8">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <StatusTimeline status={order.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCell label="Order date" value={formatDate(order.created_at)} />
              <InfoCell label="Phone" value={order.phone} />
              <div className="col-span-2">
                <InfoCell label="Delivery address" value={order.address} />
              </div>
            </div>
            {cfg && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Electrical template</p>
                <BoxSummary configuration={cfg} />
              </div>
            )}
            {items.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Installed items</p>
                <ConfigurationItems items={items} />
              </div>
            )}
            {pricingBlock}
            <DownloadDevisButton orderId={order.id} fullWidth />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order, onClick }) {
  const boxPreview = order.configuration?.configurable_box?.preview;
  const itemCount = order.configuration?.configuration_items?.length ?? 0;

  return (
    <button
      onClick={() => onClick(order)}
      className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
    >
      <div className="flex gap-4 items-center">
        <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
          {boxPreview ? (
            <img src={boxPreview} alt="panel" className="w-full h-full object-contain p-1.5" />
          ) : (
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7L12 3 4 7m16 0v10l-8 4m0-14L4 7m8 4v10" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm">Order #{order.id}</p>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-sm font-medium text-gray-800">{formatPrice(order.total_price)}</p>
            {itemCount > 0 && (
              <p className="text-xs text-gray-400">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            )}
          </div>
        </div>

        <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 animate-pulse bg-white flex gap-4">
      <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-28 bg-gray-100 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch {
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") setSelectedOrder(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-5">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
            <span>Configurator</span>
            <span>›</span>
            <span className="text-amber-600">Orders</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">My Orders</h1>
              {!loading && (
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-semibold text-gray-900">{filteredOrders.length}</span>
                  <span className="text-xs text-gray-500">{filteredOrders.length === 1 ? "order" : "orders"}</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xl hidden sm:block">
            Manage your orders and track their status.
          </p>
        </div>
      </div>

      <div className="relative bg-gray-50/60 py-3">
        <IndustrialBackground />
        <div className="relative max-w-7xl mx-auto px-3 md:px-5 py-4 md:py-5 min-h-screen">
          <div className="flex gap-2 flex-wrap mb-5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full capitalize transition-colors ${filter === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {f}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-between bg-red-50 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
              <span>{error}</span>
              <button onClick={loadOrders} className="font-medium underline">Retry</button>
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center px-6">
                <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900">No orders found</h3>
                <p className="text-gray-500 text-sm mt-1.5">
                  {filter === "all" ? "You don't have any orders yet." : `No ${filter} orders available.`}
                </p>
                {filter === "all" && (
                  <button
                    onClick={() => navigate("/app/new/box-types")}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Create New Order
                  </button>
                )}
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderCard key={order.id} order={order} onClick={setSelectedOrder} />
              ))
            )}
          </div>

          {selectedOrder && (
            <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          )}
        </div>
      </div>
    </div>
  );
}