import { useEffect, useState } from "react";
import { getTemplates } from "../api/configuratorApi";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedTemplate } from "../store/slices/configuratorSlice";
import { useNavigate } from "react-router-dom";
import ProgressStepper from "../components/ProgressStepper";
import IndustrialBackground from "../components/IndustrialBackground";

const SkeletonCard = () => (
  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="h-36 md:h-44 bg-gray-100" />
    <div className="p-4 md:p-5">
      <div className="flex justify-between mb-3">
        <div className="w-28 h-5 bg-gray-100 rounded" />
        <div className="w-16 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="w-20 h-5 bg-gray-100 rounded-full" />
        <div className="w-20 h-5 bg-gray-100 rounded-full" />
      </div>
      <div className="w-full h-3 bg-gray-100 rounded mb-1.5" />
      <div className="w-3/4 h-3 bg-gray-100 rounded" />
    </div>
  </div>
);

function InfoRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

function BoolBadge({ label, value }) {
  return (
    <div className="flex justify-between items-center gap-4 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${value ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
        {value ? "Yes" : "No"}
      </span>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2 mt-4 first:mt-0">
      {children}
    </p>
  );
}

function TemplateModal({ template, boxType, onClose, onConfirm }) {
  const [imgError, setImgError] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet / Modal */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[90vh] flex flex-col">

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* Image area */}
        <div className="relative h-44 sm:h-48 flex-shrink-0 bg-white border-b-2 border-gray-100 flex items-center justify-center rounded-t-3xl sm:rounded-t-2xl overflow-hidden">
          {!imgError && template.preview ? (
            <img
              src={template.preview}
              alt={template.code}
              className="w-full h-full object-contain p-5"
              onError={() => setImgError(true)}
            />
          ) : (
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          )}

          <div className="absolute top-3 right-3">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 text-gray-700 shadow-sm border border-gray-100">
              {template.max_total_items} slots
            </span>
          </div>

          {/* Close button — hidden on mobile (use drag-down or tap backdrop) */}
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

          {/* Template header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{template.code}</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">Configuration template</p>
            </div>
            {parseFloat(template.base_price) >= 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-gray-900">
                  {parseFloat(template.base_price).toFixed(2)}
                  <span className="text-xs font-normal text-gray-400 ml-1">DH</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">base price</p>
              </div>
            )}
          </div>

          {/* Template badges */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              {template.max_total_items} max items
            </span>
            {template.areas_count > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                {template.areas_count} areas
              </span>
            )}
            {template.allowed_items_count > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-violet-50 text-violet-700">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {template.allowed_items_count} item types
              </span>
            )}
          </div>

          {template.notes && (
            <p className="text-sm text-gray-500 leading-relaxed mb-4 pb-4 border-b border-gray-100">{template.notes}</p>
          )}

          {/* ── Template details ── */}
          <SectionTitle>Template details</SectionTitle>
          <div className="bg-gray-50 rounded-xl px-3 mb-4">
            <InfoRow label="Max total items" value={template.max_total_items} />
            <InfoRow label="Areas" value={template.areas_count ?? "—"} />
            <InfoRow label="Allowed item types" value={template.allowed_items_count ?? "—"} />
            <InfoRow label="Base price" value={`${parseFloat(template.base_price).toFixed(2)} DH`} />
          </div>

          {/* ── Box type ── */}
          {boxType && (
            <>
              <SectionTitle>Box type</SectionTitle>

              {/* Identity */}
              <div className="bg-gray-50 rounded-xl px-3 mb-3">
                <div className="flex justify-between items-center gap-4 py-2.5 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Code</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                    {boxType.code}
                  </span>
                </div>
                <InfoRow label="Family" value={boxType.family} />
                <InfoRow label="Variant" value={boxType.variant} />
              </div>

              {/* Description */}
              {boxType.description && (
                <div className="bg-gray-50 rounded-xl px-3 py-3 mb-3">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{boxType.description}</p>
                </div>
              )}

              {/* Physical */}
              <div className="bg-gray-50 rounded-xl px-3 mb-3">
                <InfoRow label="Material" value={boxType.material} />
                <InfoRow label="Color" value={boxType.color} />
                <InfoRow label="Mounting type" value={boxType.mounting_type} />
                <InfoRow label="IP rating" value={boxType.ip_rating} />
                {(boxType.width_mm || boxType.height_mm || boxType.depth_mm) && (
                  <InfoRow
                    label="Dimensions (W × H × D)"
                    value={`${parseFloat(boxType.width_mm)} × ${parseFloat(boxType.height_mm)} × ${parseFloat(boxType.depth_mm)} mm`}
                  />
                )}
              </div>

              {/* Electrical */}
              <div className="bg-gray-50 rounded-xl px-3 mb-3">
                <InfoRow label="Earth leakage rating" value={boxType.earth_leakage_rating} />
                <BoolBadge label="Has earth leakage" value={boxType.has_earth_leakage} />
                <BoolBadge label="Has overcurrent protection" value={boxType.has_overcurrent} />
                <InfoRow label="Branch cable count" value={boxType.branch_cable_count} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 flex-1 text-sm font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 justify-center flex-1 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            Use template
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const boxType = useSelector((s) => s.configurator.selectedBoxType);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);
  const [imgErrors, setImgErrors] = useState({});
  const [selectedTemplate, setSelectedTemplateState] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!boxType) { navigate("/app/new/box-types"); return; }
    setLoading(true);
    getTemplates(boxType.id)
      .then((res) => setTemplates(res.data.data))
      .finally(() => setLoading(false));
  }, [boxType]);

  const handleConfirm = () => {
    dispatch(setSelectedTemplate(selectedTemplate));
    navigate("/app/new/configurator");
  };

  return (
    <div className=" min-h-screen bg-gray-50/60">
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          boxType={boxType}
          onClose={() => setSelectedTemplateState(null)}
          onConfirm={handleConfirm}
        />
      )}

      {/* Header */}
      <div className="z-80 bg-white border-b border-gray-200 px-4 md:px-8">
        <div className="max-w-7xl mx-auto py-4 md:py-5">

          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-2">
            <button onClick={() => navigate("/app/new/box-types")} className="hover:text-amber-600 transition-colors inline">
              Configurator
            </button>
            <span className="inline">›</span>
            <button onClick={() => navigate("/app/new/box-types")} className="hover:text-amber-600 transition-colors">
              Box Type
            </button>
            <span>›</span>
            <span className="text-amber-600">Template</span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Select Template</h1>
                {boxType && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 flex-shrink-0">
                    {boxType.code}
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1 hidden sm:block">
                Choose a layout configuration for your selected box type.
              </p>
            </div>

            {!loading && (
              <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-900">{templates.length}</span>
                <span className="text-xs text-gray-500 hidden sm:inline">templates</span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-100">
          <ProgressStepper currentStep={2} />
        </div>
      </div>

      <div className="relative">
        <IndustrialBackground />
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-3 md:px-5 py-4 md:py-5 min-h-screen">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
              {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No templates available</p>
              <p className="text-gray-400 text-sm mt-1">for this box type</p>
              <button
                onClick={() => navigate("/app/new/box-types")}
                className="mt-4 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                ← Choose a different box type
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
              {templates.map((t) => {
                const isHovered = hoveredId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateState(t)}
                    onMouseEnter={() => setHoveredId(t.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`
                    bg-white border rounded-2xl overflow-hidden cursor-pointer
                    transition-all duration-200
                    ${isHovered
                        ? "border-gray-300 shadow-lg shadow-gray-100 -translate-y-0.5"
                        : "border-gray-100 shadow-sm"
                      }
                  `}
                  >
                    <div className="relative h-36 md:h-44 bg-white border-b border-gray-100 overflow-hidden">
                      {!imgErrors[t.id] && t.preview ? (
                        <img
                          src={t.preview}
                          alt={t.code}
                          className={`w-full h-full object-contain p-3 md:p-4 transition-transform duration-300 ${isHovered ? "scale-105" : "scale-100"}`}
                          onError={() => setImgErrors((e) => ({ ...e, [t.id]: true }))}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-sm border border-gray-100">
                          {t.max_total_items} slots
                        </span>
                      </div>
                    </div>

                    <div className="p-4 md:p-5">
                      <div className="flex items-start justify-between mb-2.5 gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm md:text-base tracking-tight truncate">{t.code}</h3>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">Configuration template</p>
                        </div>
                        {parseFloat(t.base_price) >= 0 && (
                          <span className="text-sm font-bold text-gray-900 flex-shrink-0">
                            {parseFloat(t.base_price).toFixed(2)} <span className="text-xs font-normal text-gray-400">DH</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" />
                            <line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
                          </svg>
                          {t.max_total_items} max
                        </span>
                        {t.areas_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="12 2 2 7 12 12 22 7 12 2" />
                              <polyline points="2 17 12 22 22 17" />
                              <polyline points="2 12 12 17 22 12" />
                            </svg>
                            {t.areas_count} areas
                          </span>
                        )}
                        {t.allowed_items_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="12" y1="8" x2="12" y2="12" />
                              <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {t.allowed_items_count} types
                          </span>
                        )}
                      </div>

                      {t.notes && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 hidden sm:block">{t.notes}</p>
                      )}

                      <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
                        <span className={`text-xs font-semibold flex items-center gap-1 transition-colors duration-200 ${isHovered ? "text-amber-600" : "text-gray-400"}`}>
                          View details
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-200 ${isHovered ? "translate-x-0.5" : ""}`}>
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}