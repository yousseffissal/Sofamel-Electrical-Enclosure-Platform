import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetConfigurator } from "../store/slices/configuratorSlice";
import ProgressStepper from "../components/ProgressStepper";
import { sendOrder, saveConfiguration } from "../api/configuratorApi.js";
import IndustrialBackground from "../components/IndustrialBackground";


// ── Icons ──────────────────────────────────────────────────────────
const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const LayoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const LayersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
  </svg>
);
const XIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SendIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);


// ── Toast ──────────────────────────────────────────────────────────
const Toast = ({ message, type, visible }) => (
  <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg sm:text-sm text-xs font-semibold text-white
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


// ── Modal shell (bottom-sheet on mobile, centered on desktop) ──────
const Modal = ({ open, onClose, children, maxWidth = "max-w-md" }) => {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col`}>
        {/* Drag handle (mobile only) */}
        <div className="justify-center pt-3 pb-1 flex sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
};


// ── Checkout / Order Modal ─────────────────────────────────────────
const CheckoutModal = ({ open, onClose, onConfirm, sending, unitTotal, orderQty, grandTotal }) => {
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

  // Reset fields every time the modal opens
  useEffect(() => {
    if (open) { setPhone(""); setAddress(""); setErrors({}); }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div>
          <h2 className="text-base font-bold text-gray-900">Confirm Order</h2>
          <p className="text-xs text-gray-400 mt-0.5">Review your order before confirmation</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          <XIcon />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
        {/* Order summary banner */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">Order Total</p>
            <p className="text-xl font-black text-emerald-700 mt-0.5">{grandTotal.toFixed(2)} DH</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-600">Unit · {unitTotal.toFixed(2)} DH</p>
            <p className="text-xs text-emerald-600">Qty × {orderQty}</p>
          </div>
        </div>

        {/* Phone */}
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
              ${errors.phone
                ? "border-red-300 bg-red-50 focus:border-red-400"
                : "border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              }`}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* Address */}
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
              ${errors.address
                ? "border-red-300 bg-red-50 focus:border-red-400"
                : "border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              }`}
          />
          {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-5 py-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onClose}
          disabled={sending}
          className="flex-1 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={sending}
          className="flex-1 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <><SendIcon /> Place Order</>
          )}
        </button>
      </div>
    </Modal>
  );
};


// ── Main Page ──────────────────────────────────────────────────────
export default function SummaryPage() {
  const state = useSelector((s) => s.configurator);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.selectedBoxType || !state.selectedTemplate) {
      dispatch(resetConfigurator());
      navigate("/app/new/box-types");
    }
  }, []);

  // ─── Derived totals ──────────────────────────────────────────────
  const allItems = Object.entries(state.selectedItemsByArea);
  const filledAreas = allItems.filter(([, v]) => v.length > 0);
  const totalItems = allItems.reduce((acc, [, items]) => acc + items.reduce((s, i) => s + i.quantity, 0), 0);
  const itemsTotal = Object.values(state.selectedItemsByArea).reduce(
    (acc, items) => acc + items.reduce((sum, i) => sum + i.quantity * (i.unitPrice || 0), 0), 0
  );
  const templatePrice = Number(state.selectedTemplate?.base_price || 0);
  const unitTotal = templatePrice + itemsTotal;

  // ─── Order quantity ──────────────────────────────────────────────
  const [orderQty, setOrderQty] = useState(1);
  const grandTotal = unitTotal * orderQty;

  // ─── Modal state ─────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSend, setIsSend] = useState(false);

  const isLoading = sending || saving;

  // ─── Toast state ─────────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  const showToast = (message, type = "success", duration = 1500) => {
    return new Promise((resolve) => {
      setToast({
        visible: true,
        message,
        type,
      });

      setTimeout(() => {
        setToast((prev) => ({
          ...prev,
          visible: false,
        }));

        resolve();
      }, duration);
    });
  };

  // ─── Ref / date ──────────────────────────────────────────────────
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const refId = `CFG-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // ─── Submit order ────────────────────────────────────────────────
  const submitOrder = async ({ phone, address }) => {
    try {
      setSending(true);
      const payload = {
        configurable_box_id: state.selectedTemplate.id,
        template_quantity: orderQty,
        total_price: grandTotal,
        phone,
        address,
        areas: Object.entries(state.selectedItemsByArea).map(([areaId, items]) => ({
          area_id: Number(areaId),
          items: items.map((item) => ({
            item_id: item.item.id,
            quantity: item.quantity,
            x_position: item.x ?? item.x_position ?? 0,
            y_position: item.y ?? item.y_position ?? 0,
          })),
        })),
      };
      await sendOrder(payload);
      setShowModal(false);
      setIsSend(true);
      await showToast("Order sent successfully!");
      dispatch(resetConfigurator());
      navigate("/app/new/box-types");
    } catch (error) {
      setShowModal(false);
      await showToast(error?.response?.data?.message || "Failed to send order", "error");
    } finally {
      setSending(false);
    }
  };

  // ─── Save configuration ──────────────────────────────────────────
  const saveCurrentConfiguration = async () => {
    try {
      setSaving(true);

      const payload = {
        configurable_box_id: state.selectedTemplate.id,
        template_quantity: orderQty,
        areas: Object.entries(state.selectedItemsByArea).map(([areaId, items]) => ({
          area_id: Number(areaId),
          items: items.map((item) => ({
            item_id: item.item.id,
            quantity: item.quantity,
            x_position: item.x ?? 0,
            y_position: item.y ?? 0,
          })),
        })),
      };

      await saveConfiguration(payload);
      setIsSaved(true);
      await showToast("Configuration saved!");
    } catch (error) {
      await showToast(
        error?.response?.data?.message || "Failed to save configuration",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/60 pb-10">

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="py-4 md:py-5 max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2 flex-wrap">
                <button onClick={() => navigate("/app/new/box-types")} className="hover:text-amber-600 transition-colors inline">Box Type</button>
                <span className="inline">›</span>
                <button onClick={() => navigate("/app/new/templates")} className="hover:text-amber-600 transition-colors inline">Template</button>
                <span className="inline">›</span>
                <button onClick={() => navigate("/app/new/configurator")} className="hover:text-amber-600 transition-colors">Add Items</button>
                <span>›</span>
                <span className="text-amber-600">Summary</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Configuration Summary</h1>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">Review your configuration and set the quantity before ordering.</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0 pt-1">
              <button
                onClick={() => navigate("/app/new/configurator")}
                className="text-sm font-medium text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl border border-gray-200 hover:border-gray-300 transition-all"
              >
                ← Edit Config
              </button>
              <button
                onClick={() => { dispatch(resetConfigurator()); navigate("/app/new/box-types"); }}
                className="text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-xl transition-all shadow-sm whitespace-nowrap"
              >
                New Config
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100">
          <ProgressStepper currentStep={4} />
        </div>
      </div>

      <div className="relative">
        <IndustrialBackground />
        <div className="relative">
          {/* ─── Content ────────────────────────────────────────────────── */}
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-5 space-y-4 min-h-screen">

            {/* Status banner */}
            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3.5">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                <CheckCircleIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-800"><span className="hidden md:inline">Configuration</span> Complete</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} · {filledAreas.length} area{filledAreas.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-emerald-600 font-mono font-semibold">{refId}</p>
                <p className="text-xs text-emerald-500 hidden sm:block">{dateStr}</p>
              </div>
            </div>

            {/* Box Type + Template */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Box Type */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600"><BoxIcon /></div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Box Type</p>
                </div>
                <p className="text-xl font-bold text-gray-900 tracking-tight">{state.selectedBoxType?.code}</p>
                <p className="text-sm text-gray-500 mb-3">{state.selectedBoxType?.family} · {state.selectedBoxType?.variant}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Material", value: state.selectedBoxType?.material },
                    { label: "Mounting", value: state.selectedBoxType?.mounting_type },
                    { label: "IP Rating", value: state.selectedBoxType?.ip_rating },
                    { label: "Color", value: state.selectedBoxType?.color },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-xs font-semibold text-gray-700 truncate">{value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {state.selectedBoxType?.has_earth_leakage && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      Earth Leakage {state.selectedBoxType?.earth_leakage_rating}
                    </span>
                  )}
                  {state.selectedBoxType?.has_overcurrent && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                      Overcurrent Protection
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-1">
                  {[
                    { label: "W", value: `${parseFloat(state.selectedBoxType?.width_mm || 0).toFixed(0)} mm` },
                    { label: "H", value: `${parseFloat(state.selectedBoxType?.height_mm || 0).toFixed(0)} mm` },
                    { label: "D", value: `${parseFloat(state.selectedBoxType?.depth_mm || 0).toFixed(0)} mm` },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-xs font-bold text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center text-violet-600"><LayoutIcon /></div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Template</p>
                </div>
                {state.selectedTemplate?.preview && (
                  <div className="mb-3 rounded-xl overflow-hidden bg-white border border-gray-100 h-28 md:h-32 flex items-center justify-center">
                    <img src={state.selectedTemplate.preview} alt={state.selectedTemplate.code} className="h-full w-full object-contain p-3" />
                  </div>
                )}
                <p className="text-xl font-bold text-gray-900 tracking-tight">{state.selectedTemplate?.code}</p>
                <p className="text-sm text-gray-500 mt-0.5 mb-3">Layout Configuration</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Max Items</p>
                    <p className="text-sm font-bold text-gray-700">{state.selectedTemplate?.max_total_items}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-gray-400 mb-0.5">Areas</p>
                    <p className="text-sm font-bold text-gray-700">{state.selectedTemplate?.areas_count || "—"}</p>
                  </div>
                </div>
                {state.selectedTemplate?.notes && (
                  <p className="text-xs text-gray-400 mt-3 leading-relaxed line-clamp-3">{state.selectedTemplate.notes}</p>
                )}
              </div>
            </div>

            {/* Selected Items */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500"><LayersIcon /></div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selected Items</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">{totalItems} total</span>
              </div>

              {filledAreas.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-300 text-3xl mb-2">○</p>
                  <p className="text-sm text-gray-400">No items were selected</p>
                  <button onClick={() => navigate("/app/new/configurator")} className="mt-3 text-xs font-semibold text-amber-600 hover:text-amber-700">
                    Go back and add items →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filledAreas.map(([areaId, items]) => {
                    const area = state.areas?.find(a => a.id === parseInt(areaId));
                    return (
                      <div key={areaId} className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                            {area?.name?.charAt(0) || areaId}
                          </div>
                          <p className="font-semibold text-gray-700 text-sm">{area?.name || `Area ${areaId}`}</p>
                          <span className="text-xs text-gray-400">· {items.length} type{items.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="space-y-2">
                          {items.map((s) => {
                            const itemTotal = s.quantity * (s.unitPrice || s.item.price || 0);
                            return (
                              <div key={s.item.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors gap-3">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <div className="w-9 h-9 md:w-10 md:h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                                    {s.item.preview ? (
                                      <img src={s.item.preview} alt={s.item.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = "none"; }} />
                                    ) : (
                                      <span className="text-xs font-bold text-gray-500">{s.item.name?.charAt(0)}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{s.item.name}</p>
                                    <p className="text-xs text-gray-400">{s.item.category}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                                  <div className="text-right hidden md:block">
                                    <p className="text-xs text-gray-400">Unit</p>
                                    <p className="text-sm font-semibold text-gray-700">{Number(s.unitPrice ?? s.item.price ?? 0).toFixed(2)} DH</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-gray-400">Qty</p>
                                    <p className="text-sm font-bold text-gray-900">×{s.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="text-sm font-bold text-emerald-600">{itemTotal.toFixed(2)} DH</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalItems > 0 && (
                <div className="flex items-center justify-between px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-600">Total items selected</p>
                  <span className="text-base font-bold text-gray-900">{totalItems}</span>
                </div>
              )}
            </div>

            {/* ─── Pricing + Quantity ──────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Order Summary</p>

              {/* Unit price breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Template (base price)</span>
                  <span className="font-semibold text-gray-700">{templatePrice.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Items</span>
                  <span className="font-semibold text-gray-700">{itemsTotal.toFixed(2)} DH</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Unit price</span>
                  <span className="font-bold text-gray-800">{unitTotal.toFixed(2)} DH</span>
                </div>
              </div>

              {/* Quantity selector */}
              <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Order quantity</p>
                  <p className="text-xs text-gray-400 mt-0.5">Quantity to order</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all text-lg font-medium disabled:opacity-30"
                    disabled={orderQty <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="text-lg font-bold text-gray-900 min-w-[2rem] text-center tabular-nums">
                    {orderQty}
                  </span>
                  <button
                    onClick={() => setOrderQty((q) => q + 1)}
                    className="w-8 h-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-all text-lg font-medium"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Grand total */}
              <div className="flex items-center justify-between bg-amber-50 rounded-2xl px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Grand total</p>
                  {orderQty > 1 && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      {unitTotal.toFixed(2)} DH × {orderQty}
                    </p>
                  )}
                </div>
                <p className="text-2xl font-bold text-amber-600 tabular-nums">
                  {grandTotal.toFixed(2)} <span className="text-base font-semibold">DH</span>
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                disabled={isLoading}
                className="flex-1 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    {!isSend ? (

                      <>Place Order</>

                    ) : (
                      <span className="text-sm font-semibold text-emerald-600">
                        Order sent
                      </span>
                    )
                    }
                  </>
                )}
              </button>

              <button
                onClick={saveCurrentConfiguration}
                disabled={isLoading || isSaved}
                className="flex-1 text-sm font-semibold bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {!isSaved ? (

                      <>Save <span className="hidden md:inline">Configuration</span></>

                    ) : (
                      <span className="text-sm font-semibold text-emerald-600">
                        Saved
                      </span>
                    )
                    }
                  </>
                )}
              </button>

            </div>

            <div className="flex items-center justify-between pt-1 pb-4 gap-3">
              <button
                onClick={() => { dispatch(resetConfigurator()); navigate("/app/new/box-types"); }}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-xl transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
                </svg>
                Start over
              </button>
              <button
                onClick={() => navigate("/app/new/configurator")}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 px-4 py-2.5 rounded-xl transition-all"
              >
                ← Edit
              </button>
            </div>
          </div>

          {/* ─── Checkout Modal ──────────────────────────────────────────── */}
          <CheckoutModal
            open={showModal}
            onClose={() => !sending && setShowModal(false)}
            onConfirm={submitOrder}
            sending={sending}
            unitTotal={unitTotal}
            orderQty={orderQty}
            grandTotal={grandTotal}
          />

          {/* ─── Toast ──────────────────────────────────────────────────── */}
          <Toast {...toast} />
        </div>
      </div>

    </div>
  );
}