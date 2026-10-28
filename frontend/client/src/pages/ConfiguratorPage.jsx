import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAreas, getAreaItems } from "../api/configuratorApi";
import { FiTrash2 } from "react-icons/fi";
import IndustrialBackground from "../components/IndustrialBackground";
import {
  setAreas,
  setAreaItems,
  addItemToArea,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
} from "../store/slices/configuratorSlice";
import { useNavigate } from "react-router-dom";
import ProgressStepper from "../components/ProgressStepper";

const ChevronIcon = ({ down }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className={`transition-transform duration-200 ${down ? "rotate-180" : ""}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LoadingDots = () => (
  <div className="flex items-center gap-1 py-4 justify-center">
    {[0, 1, 2].map(i => (
      <div key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

// ── Item Info Row helper ───────────────────────────────────────────
function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === "" || value === "0.00" && label.includes("mm")) return null;
  return (
    <div className="flex justify-between items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

// ── Item Info Modal ───────────────────────────────────────────────
function ItemInfoModal({ item, onClose }) {
  const [imgError, setImgError] = useState(false);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const width = parseFloat(item.width_mm);
  const height = parseFloat(item.height_mm);
  const depth = parseFloat(item.depth_mm);
  const padding = parseFloat(item.padding_mm);
  const hasDimensions = width > 0 || height > 0 || depth > 0;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Image area */}
        <div className="relative h-48 sm:h-52 flex-shrink-0 bg-white border-b-2 border-gray-100 flex items-center justify-center rounded-t-3xl sm:rounded-t-2xl overflow-hidden">
          {!imgError && item.preview ? (
            <img
              src={item.preview}
              alt={item.name}
              className="w-full h-full object-contain p-6"
              onError={() => setImgError(true)}
            />
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          )}

          {/* Category badge */}
          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-700 shadow-sm border border-gray-100">
              {item.category}
            </span>
          </div>

          {/* Close button — desktop only */}
          <button
            onClick={onClose}
            className="flex absolute top-3 left-3 w-8 h-8 items-center justify-center rounded-full bg-white/90 border border-gray-100 shadow-sm text-gray-500 hover:text-gray-800 hover:bg-white transition-colors"
            aria-label="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{item.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">{item.code}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-gray-900">
                {parseFloat(item.price).toFixed(2)}
                <span className="text-xs font-normal text-gray-400 ml-1">DH</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">unit price</p>
            </div>
          </div>

          {/* Quick badges */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              Max {item.max_quantity}
            </span>
            {item.amperage && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                {item.amperage}A
              </span>
            )}
            {item.voltage && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                {item.voltage}V
              </span>
            )}
            {item.poles && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                {item.poles} poles
              </span>
            )}
          </div>

          {/* Identity */}
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Details</p>
          <div className="bg-gray-50 rounded-xl px-3 mb-4">
            <InfoRow label="Code" value={item.code} />
            <InfoRow label="Category" value={item.category} />
            <InfoRow label="Dimensions (W × H × D)" value={`${Number(item.width_mm)} × ${Number(item.height_mm)} × ${Number(item.depth_mm)} mm`} />
            <InfoRow label="Max quantity" value={item.max_quantity} />
            <InfoRow label="Unit price" value={`${parseFloat(item.price).toFixed(2)} DH`} />
          </div>

          {/* Electrical */}
          {(item.amperage || item.voltage || item.poles) && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Electrical</p>
              <div className="bg-gray-50 rounded-xl px-3 mb-4">
                <InfoRow label="Amperage" value={item.amperage ? `${item.amperage} A` : null} />
                <InfoRow label="Voltage" value={item.voltage ? `${item.voltage} V` : null} />
                <InfoRow label="Poles" value={item.poles} />
              </div>
            </>
          )}

          {/* Physical */}
          {(hasDimensions || padding > 0) && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">Physical</p>
              <div className="bg-gray-50 rounded-xl px-3">
                {hasDimensions && (
                  <InfoRow
                    label="Dimensions (W × H × D)"
                    value={`${width} × ${height} × ${depth} mm`}
                  />
                )}
                {padding > 0 && <InfoRow label="Padding" value={`${padding} mm`} />}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 flex-1 text-sm font-semibold text-gray-600 hover:text-gray-800 border border-gray-200 rounded-xl transition-colors hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mobile summary drawer ──────────────────────────────────────────
const SummaryDrawer = ({ open, onClose, template, areas, selectedItems, allAreasSummary, totalSelected, templatePrice, itemsTotal, grandTotal, usedItems, maxItems, progress, onContinue }) => (
  <>
    <div
      onClick={onClose}
      className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
    />
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out lg:hidden"
      style={{ transform: open ? "translateY(0)" : "translateY(100%)", maxHeight: "85vh", overflowY: "auto" }}
    >
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-200 rounded-full" />
      </div>
      <div className="px-5 pb-8 pt-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Summary</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-gray-900 text-sm">{template?.code}</p>
              <p className="text-xs text-gray-400">Max {template?.max_total_items} items</p>
            </div>
            <p className="font-bold text-gray-900 text-sm">{template?.base_price} DH</p>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${progress >= 100 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>{usedItems} used</span><span>{maxItems} max</span>
          </div>
        </div>
        {allAreasSummary.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selection</p>
            {allAreasSummary.map(([areaId, items]) => {
              const area = areas.find(a => a.id === parseInt(areaId));
              return (
                <div key={areaId}>
                  <p className="text-xs font-semibold text-gray-500 mb-1.5">{area?.name || `Area ${areaId}`}</p>
                  <div className="space-y-1">
                    {items.map((s) => (
                      <div key={s.item.id} className="flex items-center justify-between">
                        <div className="flex gap-2 min-w-0">
                          <p className="text-xs text-gray-600 truncate">{s.item.name}</p>
                          <span className="text-xs font-bold text-gray-500 flex-shrink-0">×{s.quantity}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 ml-2 flex-shrink-0">{s.quantity * s.unitPrice} DH</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Template</span><span className="font-semibold text-gray-700">{templatePrice} DH</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Items</span><span className="font-semibold text-gray-700">{itemsTotal.toFixed(2)} DH</span></div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold"><span>Total</span><span className="text-amber-600">{grandTotal.toFixed(2)} DH</span></div>
        </div>
        <button
          onClick={onContinue}
          disabled={totalSelected === 0}
          className={`w-full font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all
            ${totalSelected === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"}`}
        >
          Review Summary
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  </>
);

export default function ConfiguratorPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const template = useSelector((s) => s.configurator.selectedTemplate);
  const areas = useSelector((s) => s.configurator.areas);
  const areaItems = useSelector((s) => s.configurator.areaItems);
  const selectedItems = useSelector((s) => s.configurator.selectedItemsByArea);

  const [activeArea, setActiveArea] = useState(null);
  const [loadingArea, setLoadingArea] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);

  useEffect(() => {
    if (!template) { navigate("/app/new/box-types"); return; }
    getAreas(template.id).then((res) => dispatch(setAreas(res.data.data)));
  }, [template]);

  const loadItems = async (areaId) => {
    if (activeArea === areaId) { setActiveArea(null); return; }
    setActiveArea(areaId);
    if (areaItems[areaId]) return;
    setLoadingArea(areaId);
    const res = await getAreaItems(template.id, areaId);
    dispatch(setAreaItems({ areaId, items: res.data.data }));
    setLoadingArea(null);
  };

  const totalSelected = Object.values(selectedItems).reduce(
    (acc, items) => acc + items.reduce((s, i) => s + i.quantity, 0), 0
  );
  const allAreasSummary = Object.entries(selectedItems).filter(([, items]) => items.length > 0);
  const itemsTotal = useMemo(() =>
    Object.values(selectedItems).reduce(
      (acc, items) => acc + items.reduce((sum, i) => sum + i.quantity * (i.unitPrice || 0), 0), 0
    ), [selectedItems]);

  const templatePrice = Number(template?.base_price || 0);
  const grandTotal = templatePrice + itemsTotal;
  const usedItems = totalSelected;
  const maxItems = template?.max_total_items || 1;
  const progress = Math.min((usedItems / maxItems) * 100, 100);

  const summaryProps = { template, areas, selectedItems, allAreasSummary, totalSelected, templatePrice, itemsTotal, grandTotal, usedItems, maxItems, progress };

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col">

      {/* Item info modal */}
      {inspectedItem && (
        <ItemInfoModal
          item={inspectedItem}
          onClose={() => setInspectedItem(null)}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="py-4 md:py-5 max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-1.5">
              <button onClick={() => navigate("/app/new/box-types")} className="hover:text-amber-600 transition-colors">Box Type</button>
              <span>›</span>
              <button onClick={() => navigate("/app/new/templates")} className="hover:text-amber-600 transition-colors">Template</button>
              <span>›</span>
              <span className="text-amber-600">Add Items</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Configure Your Box</h1>
              {template && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  {template.code}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1 hidden sm:block">Add items and customize your configuration template.</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-gray-100">
          <ProgressStepper currentStep={3} />
        </div>
      </div>

      <div className="relative">
        <IndustrialBackground />
        <div className="relative">
          {/* Main layout */}
          <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-5 flex gap-6 flex-1 pb-28 lg:pb-6 min-h-screen">

            {/* LEFT: Areas + Items */}
            <div className="flex-1 space-y-3 min-w-0">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Areas & Items</h2>

              {areas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-3 text-gray-300"><LayersIcon /></div>
                  <p className="text-gray-400 text-sm">Loading areas...</p>
                </div>
              ) : areas.map((area) => {
                const isOpen = activeArea === area.id;
                const isLoading = loadingArea === area.id;
                const areaSelected = selectedItems[area.id] || [];
                const areaCount = areaSelected.reduce((s, i) => s + i.quantity, 0);

                return (
                  <div key={area.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      className="w-full flex items-center justify-between px-4 md:px-5 py-4 hover:bg-gray-50/60 transition-colors duration-150"
                      onClick={() => loadItems(area.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${isOpen ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"}`}>
                          <LayersIcon />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-800 text-sm">{area.name}</p>
                          <p className="text-xs text-gray-400">{area.width_mm}×{area.height_mm} mm</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        {areaCount > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            {areaCount} added
                          </span>
                        )}
                        <span className="text-gray-400"><ChevronIcon down={isOpen} /></span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 md:px-5 pb-5">
                        {isLoading ? <LoadingDots />
                          : (areaItems[area.id] || []).length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-6">No items available for this area</p>
                          ) : (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Items</p>
                              {(areaItems[area.id] || []).map((item) => {
                                const alreadyAdded = (selectedItems[area.id] || []).find(s => s.item.id === item.id);
                                const existing = (selectedItems[area.id] || []).find(s => s.item.id === item.id);
                                const currentTotal = Object.values(selectedItems).flat().reduce((sum, i) => sum + i.quantity, 0);
                                const templateMax = template?.max_total_items || 0;
                                const disableAdd = (!existing && currentTotal >= templateMax) || (existing && existing.quantity >= item.max_quantity);
                                const itemSelected = selectedItems[area.id]?.find(s => s.item.id === item.id);
                                const itemQty = itemSelected?.quantity || 0;
                                const itemMax = item.max_quantity || 1;
                                const itemProgress = Math.min((itemQty / itemMax) * 100, 100);

                                return (
                                  <div key={item.id} className="flex items-center justify-between p-3 md:p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-all duration-150 gap-3">
                                    {/* Item info */}
                                    <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                      {/* Image — clicking opens modal */}
                                      <button
                                        onClick={() => setInspectedItem(item)}
                                        className="flex-shrink-0 bg-white relative group focus:outline-none"
                                        aria-label={`View details for ${item.name}`}
                                      >
                                        {item.preview ? (
                                          <img
                                            src={item.preview}
                                            alt={item.name}
                                            className="w-12 h-12  bg-white  md:w-16 md:h-16 object-contain rounded-lg border border-gray-100 transition-opacity group-hover:opacity-70"
                                            onError={e => { e.target.style.display = "none"; }}
                                          />
                                        ) : (
                                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 group-hover:bg-gray-200 transition-colors">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                                          </div>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <div className="bg-black/40 rounded-lg absolute inset-0" />
                                          <svg className="relative z-10" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                          </svg>
                                        </div>
                                      </button>

                                      <div className="min-w-0">
                                        {/* Name — also clickable */}
                                        <button
                                          onClick={() => setInspectedItem(item)}
                                          className="text-left focus:outline-none group"
                                        >
                                          <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-amber-600 transition-colors">{item.name}</p>
                                        </button>
                                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                          <span className="text-xs text-gray-400 truncate">{item.category}</span>
                                          <span className="w-0.5 h-0.5 bg-gray-300 rounded-full flex-shrink-0" />
                                          <span className={`text-xs font-semibold flex-shrink-0 ${itemQty >= itemMax ? "text-red-500" : "text-gray-400"}`}>
                                            Max {item.max_quantity}
                                          </span>
                                        </div>
                                        <span className="text-xs text-gray-400">{item.price} DH</span>
                                      </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex flex-col gap-1.5 flex-shrink-0 w-16 md:w-20">
                                      {alreadyAdded ? (
                                        <span className="px-2 py-1.5 text-xs font-semibold rounded-lg text-center bg-emerald-50 text-emerald-600 whitespace-nowrap">
                                          Added
                                        </span>
                                      ) : (
                                        <button
                                          disabled={disableAdd}
                                          onClick={() => dispatch(addItemToArea({ areaId: area.id, item }))}
                                          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-lg border transition-all justify-center
                                      ${disableAdd ? "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed" : "border-gray-200 text-gray-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700"}`}
                                        >
                                          <PlusIcon />
                                          <span className="hidden sm:inline">Add</span>
                                        </button>
                                      )}
                                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full transition-all duration-300 ${itemQty >= itemMax ? "bg-red-500" : "bg-emerald-500"}`}
                                          style={{ width: `${itemProgress}%` }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-[10px] text-gray-400">
                                        <span>{itemQty}</span><span>{itemMax} max</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        {areaSelected.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Selected</p>
                            {areaSelected.map((s) => (
                              <div key={s.item.id} className="flex items-center justify-between py-2 px-3 bg-emerald-50/60 border border-emerald-100 rounded-xl gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0"><CheckIcon /></div>
                                  {/* Name clickable in selected section too */}
                                  <button
                                    onClick={() => setInspectedItem(s.item)}
                                    className="text-left focus:outline-none group"
                                  >
                                    <span className="text-sm font-medium text-gray-700 truncate group-hover:text-amber-600 transition-colors">{s.item.name}</span>
                                  </button>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button onClick={() => dispatch(decreaseQuantity({ areaId: area.id, itemId: s.item.id }))} className="px-2 py-1 hover:bg-gray-100 text-gray-600 text-sm">−</button>
                                    <span className="px-2 md:px-3 text-sm font-semibold">{s.quantity}</span>
                                    <button onClick={() => dispatch(increaseQuantity({ areaId: area.id, itemId: s.item.id }))} className="px-2 py-1 hover:bg-gray-100 text-gray-600 text-sm">+</button>
                                  </div>
                                  <button onClick={() => dispatch(removeItem({ areaId: area.id, itemId: s.item.id }))} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                                    <FiTrash2 size={15} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT: Preview panel — desktop only */}
            <div className="hidden lg:flex w-80 flex-shrink-0 flex-col space-y-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Configuration Preview</h2>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Template</p>
                {template?.preview ? (
                  <img src={template.preview} alt={template.code} className="w-full h-36 object-contain rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 bg-gray-50 rounded-xl mb-3 flex items-center justify-center text-gray-200">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{template?.code}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Max {template?.max_total_items} items</p>
                    <div className="mt-3">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${progress >= 100 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                        <span>{usedItems} used</span><span>{maxItems} max</span>
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 text-sm ml-3">{template?.base_price} DH</p>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Total Summary</p>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Template</span><span className="font-semibold text-gray-700">{templatePrice} DH</span></div>
                <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Items</span><span className="font-semibold text-gray-700">{itemsTotal.toFixed(2)} DH</span></div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold"><span>Total</span><span className="text-amber-600">{grandTotal.toFixed(2)} DH</span></div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Selection</p>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${totalSelected > 0 ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-400"}`}>{totalSelected} total</span>
                </div>
                {allAreasSummary.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-gray-300 text-2xl mb-2">○</p>
                    <p className="text-xs text-gray-400">No items selected yet</p>
                    <p className="text-xs text-gray-300 mt-1">Click an area to start adding</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allAreasSummary.map(([areaId, items]) => {
                      const area = areas.find(a => a.id === parseInt(areaId));
                      return (
                        <div key={areaId}>
                          <p className="text-xs font-semibold text-gray-500 mb-2">{area?.name || `Area ${areaId}`}</p>
                          <div className="space-y-1.5">
                            {items.map((s) => (
                              <div key={s.item.id} className="flex items-center justify-between">
                                <div className="flex gap-2 min-w-0"><p className="text-xs text-gray-600 truncate">{s.item.name}</p><span className="text-xs font-bold text-gray-500 flex-shrink-0">×{s.quantity}</span></div>
                                <span className="text-xs font-bold text-gray-500 ml-2 flex-shrink-0">{s.quantity * s.unitPrice} DH</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate("/app/new/summary")}
                disabled={totalSelected === 0}
                className={`w-full font-semibold py-3.5 px-5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 text-sm
              ${totalSelected === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md"}`}
              >
                Review Summary
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </button>
            </div>
          </div>

          {/* Mobile sticky footer bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-3 lg:hidden shadow-lg">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-medium truncate">{template?.code}</span>
                <span className="flex-shrink-0 ml-2 font-semibold text-amber-600">{grandTotal.toFixed(2)} DH</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${progress >= 100 ? "bg-red-500" : "bg-amber-400"}`} style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                <span>{usedItems}/{maxItems} items</span>
                {totalSelected > 0 && <span className="text-amber-600 font-semibold">{totalSelected} selected</span>}
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 flex-shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Summary
            </button>
            <button
              onClick={() => navigate("/app/new/summary")}
              disabled={totalSelected === 0}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 transition-all
            ${totalSelected === 0 ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"}`}
            >
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>

          {/* Mobile summary drawer */}
          <SummaryDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            {...summaryProps}
            onContinue={() => { setDrawerOpen(false); navigate("/app/new/summary"); }}
          />
        </div>

      </div>

    </div>
  );
}