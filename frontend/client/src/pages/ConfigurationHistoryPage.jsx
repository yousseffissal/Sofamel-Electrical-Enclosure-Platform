import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConfigurations, checkoutConfiguration, deleteConfiguration } from "../api/configuratorApi.js";
import IndustrialBackground from "../components/IndustrialBackground.jsx";

// ── Icons ──────────────────────────────────────────────────────────
const XIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const ChevronIcon = ({ down }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        className={`transition-transform duration-200 ${down ? "rotate-180" : ""}`}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
    </svg>
);
const EyeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const SendIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);
const LayersIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
);

// ── Modal shell ────────────────────────────────────────────────────
const Modal = ({ open, onClose, children, maxWidth = "max-w-lg" }) => {
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className={`relative bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col`}>
                <div className="justify-center pt-3 pb-1 flex sm:hidden">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>
                {children}
            </div>
        </div>
    );
};

// ── Details modal ──────────────────────────────────────────────────
const DetailsModal = ({ config, open, onClose, onSendOrder }) => {
    if (!config) return null;

    const itemsPrice = config.configuration_items.reduce(
        (sum, i) => sum + i.quantity * i.price_snapshot, 0
    );
    const unitPrice = Number(config.box_price_snapshot) + itemsPrice;
    const estimatedTotal = unitPrice * config.quantity;

    const byArea = config.configuration_items.reduce((acc, item) => {
        const areaName = item.area?.name || `Area ${item.area_id}`;
        if (!acc[areaName]) acc[areaName] = [];
        acc[areaName].push(item);
        return acc;
    }, {});

    const boxType = config.configurable_box?.box_type;

    return (
        <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                    <h2 className="text-base font-bold text-gray-900">{config.configurable_box?.code}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Saved on {new Date(config.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <XIcon />
                </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Electrical template</p>
                    <div className="rounded-2xl border-2 border-gray-100 overflow-hidden">
                        {config.configurable_box?.preview && (
                            <div className="w-full h-44 border-b-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                                <img src={config.configurable_box.preview} alt={config.configurable_box.code} className="h-full w-full object-contain p-4" />
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{config.configurable_box?.code}</p>
                                    {boxType && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {[boxType.family, boxType.variant, boxType.material].filter(Boolean).join(" · ")}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-semibold text-gray-900">{Number(config.box_price_snapshot).toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</p>
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
                                    ].filter(Boolean).map((tag) => (
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

                            {boxType.description && (
                                <p className="text-xs text-gray-500 mt-2 italic border-t border-gray-100 pt-2">{boxType.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Items by area */}
                <div>
                    {config.configuration_items.length > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Installed items</p>
                            {(() => {
                                const grouped = config.configuration_items.reduce((acc, ci) => {
                                    const areaName = ci.area?.name ?? `Area ${ci.area_id}`;
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
                                                    {areaItems.map((ci) => (
                                                        <div key={ci.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:bg-gray-50 transition-colors">
                                                            <div className="w-14 h-14 rounded-xl bg-white shrink-0 overflow-hidden flex items-center justify-center border-2 border-gray-100">
                                                                {ci.item?.preview ? (
                                                                    <img src={ci.item.preview} alt={ci.item.name} className="w-full h-full object-contain p-1.5" />
                                                                ) : (
                                                                    <div className="w-6 h-6 bg-gray-200 rounded" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{ci.item?.name ?? "—"}</p>
                                                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                                    {ci.item?.code && <span className="text-xs text-gray-400">{ci.item.code}</span>}
                                                                    {ci.item?.category && <span className="text-xs text-gray-400">{ci.item.category}</span>}
                                                                    {ci.item?.amperage && <span className="text-xs text-gray-400">{ci.item.amperage}A</span>}
                                                                    {ci.item?.poles && <span className="text-xs text-gray-400">{ci.item.poles}P</span>}
                                                                    {ci.item?.voltage && <span className="text-xs text-gray-400">{ci.item.voltage}V</span>}
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
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* ── Pricing — OrderModal style ── */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    {/* Template base */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Template base</span>
                        <span className="font-semibold text-gray-700">{Number(config.box_price_snapshot).toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
                    </div>

                    {/* Items subtotal */}
                    {itemsPrice > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Items ({config.configuration_items.length})</span>
                            <span className="font-semibold text-gray-700">{itemsPrice.toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
                        </div>
                    )}

                    {/* Unit price (divider) */}
                    <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                        <span>Unit price</span>
                        <span className="font-semibold text-gray-700">{unitPrice.toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
                    </div>

                    {/* Quantity */}
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Quantity</span>
                        <span>× {config.quantity}</span>
                    </div>

                    {/* Final total */}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Estimated total</p>
                        <div className="text-2xl font-bold text-red-600">
                            {estimatedTotal.toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={onClose} className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors">
                    Close
                </button>
                <button
                    onClick={() => { onClose(); onSendOrder(config); }}
                    className="flex-1 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <SendIcon /> Send Order
                </button>
            </div>
        </Modal>
    );
};

// ── Checkout modal ─────────────────────────────────────────────────
const CheckoutModal = ({ config, open, onClose, onConfirm, sending }) => {
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!phone.trim()) e.phone = "Phone number is required";
        else if (!/^[0-9+\s\-()]{7,15}$/.test(phone.trim())) e.phone = "Enter a valid phone number";
        if (!address.trim()) e.address = "Delivery address is required";
        return e;
    };

    const handleSubmit = () => {
        const e = validate();
        if (Object.keys(e).length > 0) { setErrors(e); return; }
        onConfirm({ phone, address });
    };

    useEffect(() => {
        if (open) { setPhone(""); setAddress(""); setErrors({}); }
    }, [open]);

    if (!config) return null;

    const itemsPrice = config.configuration_items.reduce((sum, i) => sum + i.quantity * i.price_snapshot, 0);
    const totalPrice = (Number(config.box_price_snapshot) + itemsPrice) * config.quantity;

    return (
        <Modal open={open} onClose={onClose} maxWidth="max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Confirm Order</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{config.configurable_box?.code}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                    <XIcon />
                </button>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-emerald-600 font-medium">Order Total</p>
                        <p className="text-xl font-black text-emerald-700 mt-0.5">{totalPrice.toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-emerald-600">Qty: {config.quantity}</p>
                        <p className="text-xs text-emerald-600">{config.configuration_items.reduce((s, i) => s + i.quantity, 0)} items</p>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors(v => ({ ...v, phone: undefined })); }}
                        placeholder="e.g. +212 6 00 00 00 00"
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all
                            ${errors.phone ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"}`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); setErrors(v => ({ ...v, address: undefined })); }}
                        placeholder="Street, city, postal code..."
                        rows={3}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none
                            ${errors.address ? "border-red-300 bg-red-50 focus:border-red-400" : "border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"}`}
                    />
                    {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
                <button onClick={onClose} disabled={sending} className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors disabled:opacity-50">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={sending}
                    className="flex-1 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {sending ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                    ) : (
                        <><SendIcon /> Place Order</>
                    )}
                </button>
            </div>
        </Modal>
    );
};

// ── Delete confirm modal ───────────────────────────────────────────
const DeleteModal = ({ config, open, onClose, onConfirm, deleting }) => (
    <Modal open={open} onClose={onClose} maxWidth="max-w-sm">
        <div className="px-5 py-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <TrashIcon />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Delete Configuration?</h2>
            <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{config?.configurable_box?.code}</span> will be permanently deleted. This cannot be undone.
            </p>
        </div>
        <div className="flex gap-3 px-5 pb-5 flex-shrink-0">
            <button onClick={onClose} disabled={deleting} className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors">
                Cancel
            </button>
            <button
                onClick={onConfirm}
                disabled={deleting}
                className="flex-1 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {deleting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                ) : (
                    <><TrashIcon /> Delete</>
                )}
            </button>
        </div>
    </Modal>
);

// ── Toast ──────────────────────────────────────────────────────────
const Toast = ({ message, type, visible }) => (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white
            ${type === "success" ? "bg-emerald-600" : "bg-red-500"}`}>
            {type === "success" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            ) : (
                <XIcon />
            )}
            {message}
        </div>
    </div>
);

// ── Config card ────────────────────────────────────────────────────
const ConfigCard = ({ config, onView, onDelete, onSendOrder }) => {
    const [expanded, setExpanded] = useState(false);

    const itemsCount = config.configuration_items.reduce((s, i) => s + i.quantity, 0);
    const itemsPrice = config.configuration_items.reduce((s, i) => s + i.quantity * i.price_snapshot, 0);
    const totalPrice = (Number(config.box_price_snapshot) + itemsPrice) * config.quantity;
    const boxType = config.configurable_box?.box_type;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-base font-bold text-gray-900 truncate">{config.configurable_box?.code}</h3>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 flex-shrink-0">
                                Draft
                            </span>
                        </div>
                        {boxType && (
                            <p className="text-xs text-gray-400 mb-2">{boxType.family} · {boxType.variant} · {boxType.material}</p>
                        )}
                        <p className="text-xs text-gray-400">
                            Saved {new Date(config.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{itemsCount} items</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">Qty ×{config.quantity}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                {config.configuration_items.length} type{config.configuration_items.length !== 1 ? "s" : ""}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400">Estimated</p>
                            <p className="text-lg font-black text-emerald-600 leading-tight">{totalPrice.toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs font-normal text-gray-400">DH</span></p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button onClick={() => onView(config)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors" title="View details">
                                <EyeIcon />
                            </button>
                            <button onClick={() => onDelete(config)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-gray-600 transition-colors" title="Delete">
                                <TrashIcon />
                            </button>
                            <button onClick={() => onSendOrder(config)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                                <SendIcon />
                                <span className="hidden sm:inline">Order</span>
                            </button>
                        </div>
                    </div>
                </div>

                {config.configuration_items.length > 0 && (
                    <button
                        onClick={() => setExpanded(v => !v)}
                        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ChevronIcon down={expanded} />
                        {expanded ? "Hide items" : `Show ${config.configuration_items.length} item type${config.configuration_items.length !== 1 ? "s" : ""}`}
                    </button>
                )}
            </div>

            {expanded && (
                <div className="border-t border-gray-100 px-4 md:px-5 pb-4">
                    <div className="mt-3 space-y-1.5">
                        {config.configuration_items.map((ci) => (
                            <div key={ci.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {ci.item?.preview ? (
                                        <img src={ci.item.preview} alt={ci.item.name} className="w-7 h-7 object-contain rounded bg-white border border-gray-100 flex-shrink-0" />
                                    ) : (
                                        <div className="w-7 h-7 bg-gray-200 rounded flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">{ci.item?.name || `Item ${ci.item_id}`}</p>
                                        <p className="text-[10px] text-gray-400">{ci.area?.name || `Area ${ci.area_id}`}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                    <span className="text-xs text-gray-500">({ci.price_snapshot} DH / Unit × {ci.quantity})</span>
                                    <span className="text-xs font-bold text-emerald-600">{(ci.quantity * ci.price_snapshot).toLocaleString("en-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const formatCompactNumber = (value) => {
    if (!value && value !== 0) return "0";

    const abs = Math.abs(value);

    if (abs >= 1_000_000_000)
        return `${(value / 1_000_000_000).toFixed(1).replace(".0", "")}B`;

    if (abs >= 1_000_000)
        return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;

    if (abs >= 1_000)
        return `${(value / 1_000).toFixed(1).replace(".0", "")}K`;

    return value.toLocaleString("en-MA");
};

// ── Main page ──────────────────────────────────────────────────────
export default function ConfigurationHistoryPage() {
    const navigate = useNavigate();

    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [detailsConfig, setDetailsConfig] = useState(null);
    const [checkoutConfig, setCheckoutConfig] = useState(null);
    const [deleteConfig, setDeleteConfig] = useState(null);
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

    const showToast = (message, type = "success") => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(v => ({ ...v, visible: false })), 3000);
    };

    const loadConfigurations = async () => {
        try {
            setLoading(true);
            const res = await getConfigurations();
            setConfigs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadConfigurations(); }, []);

    const handleSendOrder = async ({ phone, address }) => {
        try {
            setSending(true);
            await checkoutConfiguration(checkoutConfig.id, { phone, address });
            setCheckoutConfig(null);
            showToast("Order placed successfully!");
            loadConfigurations();
        } catch (err) {
            showToast(err?.response?.data?.message || "Failed to create order", "error");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await deleteConfiguration(deleteConfig.id);
            setDeleteConfig(null);
            showToast("Configuration deleted");
            loadConfigurations();
        } catch (err) {
            showToast("Failed to delete configuration", "error");
        } finally {
            setDeleting(false);
        }
    };

    const totalConfigs = configs.length;
    const totalValue = configs.reduce((sum, c) => {
        const ip = c.configuration_items.reduce((s, i) => s + i.quantity * i.price_snapshot, 0);
        return sum + (Number(c.box_price_snapshot) + ip) * c.quantity;
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 md:px-8">
                <div className="max-w-7xl mx-auto py-4 md:py-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
                        <span>Configurator</span><span>›</span>
                        <span className="text-amber-600">Configuration History</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Configurations</h1>
                                {!loading && (
                                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200">
                                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                        <span className="text-sm font-semibold text-gray-900">{totalConfigs}</span>
                                        <span className="text-xs text-gray-500">saved</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 hidden sm:block">
                                Manage and submit your saved electrical panel configurations.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/app/new/box-types")}
                            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold transition-colors shadow-sm self-start sm:self-auto"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            New Config
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative">
                <IndustrialBackground />

                <div className="relative">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 space-y-5 min-h-screen">

                        {/* Stats */}
                        {!loading && totalConfigs > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: "Saved", value: totalConfigs, color: "text-gray-900" },
                                    { label: "Est. Value", value: `${formatCompactNumber(totalValue)} DH`, color: "text-emerald-600" },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-400 mb-1">{label}</p>
                                        <p className={`text-xl md:text-2xl font-black ${color} leading-tight`}>{value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Skeleton */}
                        {loading && (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                                        <div className="flex justify-between mb-3">
                                            <div className="h-5 w-40 bg-gray-200 rounded" />
                                            <div className="h-5 w-20 bg-gray-100 rounded-full" />
                                        </div>
                                        <div className="h-3 w-32 bg-gray-100 rounded mb-3" />
                                        <div className="flex gap-2">
                                            <div className="h-6 w-16 bg-gray-100 rounded-full" />
                                            <div className="h-6 w-16 bg-gray-100 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && configs.length === 0 && (
                            <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center px-6">
                                <div className="w-14 h-14 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                                    <LayersIcon />
                                </div>
                                <h3 className="text-base font-bold text-gray-900">No saved configurations</h3>
                                <p className="text-gray-500 text-sm mt-1.5">Create a new configuration and save it to see it here.</p>
                                <button
                                    onClick={() => navigate("/app/new/box-types")}
                                    className="mt-5 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Create Configuration
                                </button>
                            </div>
                        )}

                        {/* List */}
                        {!loading && configs.length > 0 && (
                            <div className="space-y-3">
                                {configs.map((config) => (
                                    <ConfigCard
                                        key={config.id}
                                        config={config}
                                        onView={(c) => setDetailsConfig(c)}
                                        onDelete={(c) => setDeleteConfig(c)}
                                        onSendOrder={(c) => setCheckoutConfig(c)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    <DetailsModal
                        config={detailsConfig}
                        open={!!detailsConfig}
                        onClose={() => setDetailsConfig(null)}
                        onSendOrder={(c) => { setDetailsConfig(null); setCheckoutConfig(c); }}
                    />
                    <CheckoutModal
                        config={checkoutConfig}
                        open={!!checkoutConfig}
                        onClose={() => setCheckoutConfig(null)}
                        onConfirm={handleSendOrder}
                        sending={sending}
                    />
                    <DeleteModal
                        config={deleteConfig}
                        open={!!deleteConfig}
                        onClose={() => setDeleteConfig(null)}
                        onConfirm={handleDelete}
                        deleting={deleting}
                    />

                    <Toast {...toast} />
                </div>
            </div>
        </div>
    );
}