import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import ENDPOINTS from "../tools/Endpoints";
import { FiBox, FiSearch, FiUpload, FiX, FiImage } from "react-icons/fi";
import Swal from "sweetalert2";

/* ====================================================================
   IMAGE UPLOAD PREVIEW — reusable sub-component
   ==================================================================== */
function ImageUploadField({ value, onChange, mode = "add" }) {
    const [preview, setPreview] = useState(null);

    const ringColor = mode === "update" ? "ring-blue-500" : "ring-green-500";
    const borderColor = mode === "update" ? "border-blue-200 hover:border-blue-400" : "border-green-200 hover:border-green-400";
    const iconColor = mode === "update" ? "text-blue-400" : "text-green-400";
    const labelColor = mode === "update" ? "text-blue-600" : "text-green-600";

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        onChange(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleClear = () => {
        onChange(null);
        setPreview(null);
    };

    return (
        <div>
            <label className="text-sm text-gray-600 mb-2 block font-medium">
                Image <span className="text-gray-400 font-normal">(optional)</span>
            </label>

            {preview ? (
                /* Preview state */
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5">
                            <FiUpload size={12} /> Change
                            <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
                        </label>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white hover:bg-red-600 transition flex items-center gap-1.5"
                        >
                            <FiX size={12} /> Remove
                        </button>
                    </div>
                </div>
            ) : (
                /* Upload state */
                <label className={`cursor-pointer flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed ${borderColor} bg-gray-50 hover:bg-white transition-all focus-within:ring-2 ${ringColor}`}>
                    <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 ${iconColor}`}>
                        <FiImage size={22} />
                    </div>
                    <p className={`text-sm font-semibold ${labelColor}`}>Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 4MB</p>
                    <input
                        type="file"
                        accept="image/jpg,image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleChange}
                    />
                </label>
            )}
        </div>
    );
}

function AddAreaModal({ onCreated }) {
    const [show, setShow] = useState(false);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) return;
        try {
            setSaving(true);
            await api.post(ENDPOINTS.AREAS.CREATE, { name: name.trim() });
            Swal.fire({
                icon: "success",
                title: "Area Created",
                text: `Area "${name}" has been added.`,
                confirmButtonColor: "#22c55e",
                customClass: { popup: "swal-rounded" },
            });
            setName("");
            setShow(false);
            onCreated?.();
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Failed",
                text: err?.response?.data?.message || "Could not create area.",
                confirmButtonColor: "#ef4444",
                customClass: { popup: "swal-rounded" },
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setShow(true)}
                className="text-xs px-3 py-1.5 rounded-xl bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition font-medium"
            >
                + New Area
            </button>

            {show && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]"
                    onClick={() => setShow(false)}
                >
                    <div
                        className="bg-white w-[420px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-14 bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-between px-5">
                            <h2 className="text-white font-bold text-base">Add New Area</h2>
                            <button onClick={() => setShow(false)} className="text-white/80 hover:text-white transition text-lg">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-sm text-gray-600 mb-2 block font-medium">Area Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                    placeholder="e.g. Main, Secondary, Top Rail..."
                                    className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShow(false)}
                                    className="px-4 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={saving || !name.trim()}
                                    onClick={handleSave}
                                    className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition text-sm disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Create Area"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function AreasSelector({ selected, onChange }) {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAreas = () => {
        setLoading(true);
        api.get(ENDPOINTS.BOX.GET_AREAS)
            .then(res => setAreas(res.data.data ?? []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchAreas(); }, []);

    const isSelected = (id) => selected.some(a => a.id === id);

    const toggle = (area) => {
        if (isSelected(area.id)) {
            onChange(selected.filter(a => a.id !== area.id));
        } else {
            onChange([...selected, { id: area.id, width_mm: "", height_mm: "", padding_mm: "" }]);
        }
    };

    const updateDimension = (id, field, value) => {
        onChange(selected.map(a => a.id === id ? { ...a, [field]: value } : a));
    };

    return (
        <div className="col-span-2">
            {/* Label row with + New Area button */}
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-600 font-medium">
                    Areas <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <AddAreaModal onCreated={fetchAreas} />
            </div>

            {loading ? (
                <div className="h-10 bg-gray-200 animate-pulse rounded-xl" />
            ) : areas.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-6 border rounded-2xl bg-gray-50">
                    No areas yet — create one with the button above.
                </div>
            ) : (
                <div className="space-y-2">
                    {areas.map(area => {
                        const sel = selected.find(a => a.id === area.id);
                        return (
                            <div key={area.id} className={`border rounded-2xl transition-all overflow-hidden ${sel ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                                <div
                                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                                    onClick={() => toggle(area)}
                                >
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition ${sel ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                                        {sel && (
                                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-sm font-medium text-gray-800">{area.name}</span>
                                    {sel && <span className="ml-auto text-xs text-green-600 font-semibold">Selected — set dimensions</span>}
                                </div>
                                {sel && (
                                    <div className="grid grid-cols-3 gap-3 px-4 pb-4">
                                        {["width_mm", "height_mm", "padding_mm"].map(field => (
                                            <div key={field}>
                                                <label className="text-xs text-gray-500 mb-1 block capitalize">
                                                    {field.replace("_mm", "").replace("_", " ")} (mm)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={sel[field]}
                                                    onClick={e => e.stopPropagation()}
                                                    onChange={e => updateDimension(area.id, field, e.target.value)}
                                                    className="w-full border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ====================================================================
   MAIN COMPONENT
   ==================================================================== */
export default function AllTemplates() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const navigate = useNavigate();

    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [addData, setAddData] = useState({
        code: "", max_total_items: "", base_price: "", notes: ""
    });
    const [addImage, setAddImage] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateData, setUpdateData] = useState({
        id: "", code: "", max_total_items: "", base_price: "", notes: ""
    });
    const [updateImage, setUpdateImage] = useState(null);

    const [addAreas, setAddAreas] = useState([]);
    const [updateAreas, setUpdateAreas] = useState([]);

    /* ------------------------------------------------------------------
       API CALLS
    ------------------------------------------------------------------ */
    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(ENDPOINTS.BOX.GETALLTEMPLATES);
            setTemplates(res?.data?.data ?? []);
        } catch {
            setError("Failed to load box templates");
            setTemplates([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTemplates(); }, []);

    /* CREATE — uses FormData because we may have a file */
    const handleCreateTemplate = async () => {
        try {
            setCreating(true);

            const form = new FormData();
            form.append("code", addData.code);
            form.append("max_total_items", addData.max_total_items);
            form.append("base_price", addData.base_price);
            form.append("notes", addData.notes);
            if (addImage) form.append("image", addImage);

            addAreas.forEach((area, i) => {
                form.append(`areas[${i}][id]`, area.id);
                form.append(`areas[${i}][width_mm]`, area.width_mm || 0);
                form.append(`areas[${i}][height_mm]`, area.height_mm || 0);
                form.append(`areas[${i}][padding_mm]`, area.padding_mm || 0);
            });
            // reset after success:
            setAddAreas([]);

            await api.post(ENDPOINTS.BOX.ADD_TEMPLATE(), form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Swal.fire({ icon: "success", title: "Template Created", text: "The template has been created successfully.", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            setShowAddModal(false);
            setAddData({ code: "", max_total_items: "", base_price: "", notes: "" });
            setAddImage(null);
            fetchTemplates();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Creation Failed", text: err?.response?.data?.message || "Something went wrong while creating the template.", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        } finally {
            setCreating(false);
        }
    };

    /* UPDATE — uses FormData for optional new image */
    const handleUpdateTemplate = async () => {
        try {
            setUpdating(true);

            const form = new FormData();
            form.append("_method", "PATCH");   // Laravel method spoofing
            form.append("code", updateData.code);
            form.append("max_total_items", updateData.max_total_items);
            form.append("base_price", updateData.base_price);
            form.append("notes", updateData.notes);
            if (updateImage) form.append("image", updateImage);

            updateAreas.forEach((area, i) => {
                form.append(`areas[${i}][id]`, area.id);
                form.append(`areas[${i}][width_mm]`, area.width_mm || 0);
                form.append(`areas[${i}][height_mm]`, area.height_mm || 0);
                form.append(`areas[${i}][padding_mm]`, area.padding_mm || 0);
            });
            // reset after success:
            setUpdateAreas([]);

            await api.post(
                ENDPOINTS.BOX.UPDATE_TEMPLATE(updateData.id),
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            Swal.fire({ icon: "success", title: "Updated!", text: "Template updated successfully", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            setShowUpdateModal(false);
            setUpdateImage(null);
            fetchTemplates();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Update Failed", text: err?.response?.data?.message || "Something went wrong", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        } finally {
            setUpdating(false);
        }
    };

    /* DELETE */
    const handleDeleteTemplate = async (template) => {
        try {
            const result = await Swal.fire({
                title: "Delete Template?",
                text: `Template "${template.code}" will be permanently deleted`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#9ca3af",
                confirmButtonText: "Delete",
                cancelButtonText: "Cancel",
                customClass: { popup: "swal-rounded" },
            });

            if (!result.isConfirmed) return;

            await api.delete(ENDPOINTS.BOX.DELETE_TEMPLATE, {
                data: { configurable_box_id: template.id },
            });

            Swal.fire({ icon: "success", title: "Deleted!", text: "Template deleted successfully", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            if (selectedTemplate?.id === template.id) setSelectedTemplate(null);
            fetchTemplates();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Delete Failed", text: err?.response?.data?.message || "Something went wrong", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        }
    };

    /* ------------------------------------------------------------------
       DERIVED STATE
    ------------------------------------------------------------------ */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return templates.filter((t) =>
            t.code?.toLowerCase().includes(q) ||
            t.notes?.toLowerCase().includes(q) ||
            String(t.id).includes(q)
        );
    }, [templates, search]);

    const stats = useMemo(() => ({
        total: templates.length,
        totalItems: templates.reduce((acc, t) => acc + (t.max_total_items || 0), 0),
    }), [templates]);

    /* ------------------------------------------------------------------
       RENDER
    ------------------------------------------------------------------ */
    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">All Configurable Templates</h1>
                        <FiBox className="text-3xl text-gray-800" />
                    </div>
                    <p className="text-sm text-gray-500">Global list of all templates</p>
                </div>
                <div className="flex gap-3">
                    <Stat label="Templates" value={stats.total} />
                    <Stat label="Total Items" value={stats.totalItems} />
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>
            )}

            {/* SEARCH + ADD */}
            <div className="bg-white border rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <FiSearch />
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by code / notes / id..."
                    className="border px-3 py-2 rounded-xl text-sm w-80 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <button
                    onClick={() => { setAddData({ code: "", max_total_items: "", base_price: "", notes: "" }); setAddImage(null); setShowAddModal(true); }}
                    className="px-4 py-2 text-sm rounded-xl bg-green-50 text-green-700 border hover:bg-green-100 transition font-medium"
                >
                    + Add a Template
                </button>
                <div className="ml-auto text-sm text-gray-500">{filtered.length} results</div>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            {["ID", "Preview", "Code", "Max Items", "Price", "Notes", "Actions"].map((h) => (
                                <th key={h} className="p-4 text-left">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i}><td className="p-4" colSpan="7"><div className="h-4 bg-gray-200 animate-pulse rounded" /></td></tr>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map((t) => (
                                <tr key={t.id} onClick={() => setSelectedTemplate(t)} className="border-t hover:bg-gray-50 transition cursor-pointer">
                                    <td className="p-4 font-medium text-gray-700">#{t.id}</td>
                                    <td className="p-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-green-200 border flex items-center justify-center shadow-sm">
                                            {(t.image_url || t.preview) ? (
                                                <img src={t.image_url || t.preview} alt={t.code} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                                            ) : (
                                                <span className="text-sm font-bold text-green-700">{t.code?.charAt(0) || "?"}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-gray-800">{t.code}</td>
                                    <td className="p-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">{t.max_total_items}</span></td>
                                    <td className="p-4 text-gray-700 font-medium">{t.base_price} DH</td>
                                    <td className="p-4 text-gray-500 text-sm max-w-[400px]">{t.notes || "-"}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    setUpdateData({ id: t.id, code: t.code || "", max_total_items: t.max_total_items || "", base_price: t.base_price || "", notes: t.notes || "" });
                                                    setUpdateImage(null);
                                                    try {
                                                        const res = await api.get(ENDPOINTS.BOX.GET_BOX_AREAS(t.id));
                                                        setUpdateAreas(res.data.data.map(a => ({
                                                            id: a.id,
                                                            width_mm: a.width_mm ?? "",
                                                            height_mm: a.height_mm ?? "",
                                                            padding_mm: a.padding_mm ?? "",
                                                        })));
                                                    } catch {
                                                        setUpdateAreas([]);
                                                    }
                                                    setShowUpdateModal(true);
                                                }}
                                                className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-600 border hover:bg-blue-100"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t); }}
                                                className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 border hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="p-10 text-center text-gray-500">No templates found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---- DETAIL MODAL ---- */}
            {selectedTemplate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedTemplate(null)}>
                    <div className="modal-animate bg-white w-[700px] max-w-full rounded-2xl shadow-2xl border p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-r from-green-500 via-green-400 to-emerald-400" />
                        <button onClick={() => setSelectedTemplate(null)} className="absolute top-4 right-6 text-white/80 hover:text-white transition z-20">✕</button>
                        <div className="mb-6 relative z-10 pt-14">
                            <div className="flex justify-between items-stretch flex-grow gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-14 h-14 rounded-2xl bg-green-50 shadow flex items-center justify-center font-bold text-lg text-green-600">
                                            {selectedTemplate.code?.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-black">Template #{selectedTemplate.id}</h2>
                                            <p className="text-sm text-black/80">Code: {selectedTemplate.code} {selectedTemplate.box_type ? `/ Box Type: ${selectedTemplate.box_type.code}` : ""}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap mt-3">
                                        <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-green-600 border border-green-100">
                                            Max Items: {selectedTemplate.max_total_items}
                                        </span>
                                    </div>
                                </div>
                                <div
                                    className="w-20 self-stretch rounded-2xl bg-green-50 shadow overflow-hidden flex items-center justify-center font-bold text-5xl text-green-600 cursor-pointer"
                                    onClick={() => { const img = selectedTemplate.image_url || selectedTemplate.preview; if (img) setZoomImage(img); }}
                                >
                                    {(selectedTemplate.image_url || selectedTemplate.preview) ? (
                                        <img src={selectedTemplate.image_url || selectedTemplate.preview} alt={selectedTemplate.code} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/logo.png" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>
                            <div className="block h-px w-full bg-gray-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Info label="Code" value={selectedTemplate.code} />
                            <Info label="Max Items" value={selectedTemplate.max_total_items} />
                            <Info label="Base Price" value={`${selectedTemplate.base_price} DH`} />
                            <Info label="Notes" value={selectedTemplate.notes} />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { if (!selectedTemplate?.id) return; setSelectedTemplate(null); navigate(`/dashboard/items/allowedItems/${selectedTemplate.id}`); }}
                                className="px-4 py-2 text-sm rounded-xl bg-green-50 text-green-700 border hover:bg-green-100 transition"
                            >
                                Manage Items
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- ADD MODAL ---- */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
                    <div className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="h-16 bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 flex items-center justify-between px-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Add Configurable Template</h2>
                                <p className="text-white/80 text-xs">Create a new template for this box type</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-white text-xl hover:scale-110 transition">✕</button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Code" value={addData.code} onChange={(v) => setAddData({ ...addData, code: v })} mode="add" />
                                <Input label="Max Items" value={addData.max_total_items} onChange={(v) => setAddData({ ...addData, max_total_items: v })} mode="add" />
                                <Input label="Base Price" value={addData.base_price} onChange={(v) => setAddData({ ...addData, base_price: v })} mode="add" />
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Notes</label>
                                    <textarea rows={4} value={addData.notes} onChange={(e) => setAddData({ ...addData, notes: e.target.value })} className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none resize-none focus:ring-2 focus:ring-green-500 transition" />
                                </div>
                                <AreasSelector selected={addAreas} onChange={setAddAreas} />
                                {/* IMAGE UPLOAD — spans full width */}
                                <div className="col-span-2">
                                    <ImageUploadField value={addImage} onChange={setAddImage} mode="add" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={creating} onClick={handleCreateTemplate} className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50">
                                    {creating ? "Creating..." : "Create Template"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- UPDATE MODAL ---- */}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowUpdateModal(false)}>
                    <div className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 flex items-center justify-between px-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">Update Template</h2>
                                <p className="text-white/80 text-xs">Edit configurable template</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} className="text-white text-xl hover:scale-110 transition">✕</button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Code" value={updateData.code} onChange={(v) => setUpdateData({ ...updateData, code: v })} mode="update" />
                                <Input label="Max Items" value={updateData.max_total_items} onChange={(v) => setUpdateData({ ...updateData, max_total_items: v })} mode="update" />
                                <Input label="Base Price" value={updateData.base_price} onChange={(v) => setUpdateData({ ...updateData, base_price: v })} mode="update" />
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Notes</label>
                                    <textarea rows={4} value={updateData.notes} onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })} className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none resize-none focus:ring-2 focus:ring-blue-500 transition" />
                                </div>
                                <AreasSelector selected={updateAreas} onChange={setUpdateAreas} />
                                {/* IMAGE UPLOAD */}
                                <div className="col-span-2">
                                    <ImageUploadField value={updateImage} onChange={setUpdateImage} mode="update" />
                                    {!updateImage && (
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                                            <FiImage size={12} />
                                            Leave empty to keep the existing image
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setShowUpdateModal(false)} className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={updating} onClick={handleUpdateTemplate} className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50">
                                    {updating ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* IMAGE ZOOM */}
            {zoomImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={() => setZoomImage(null)}>
                    <img src={zoomImage} className="max-w-[90%] max-h-[90%] rounded-xl shadow-xl modal-animate" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}

/* ====================================================================
   REUSABLE COMPONENTS
   ==================================================================== */
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
            <div className="font-medium text-gray-800">{value ?? "-"}</div>
        </div>
    );
}

function Input({ label, value, onChange, type = "text", mode = "add" }) {
    const ringColor = mode === "update" ? "focus:ring-blue-500" : "focus:ring-green-500";
    return (
        <div>
            <label className="text-sm text-gray-600 mb-2 block">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition ${ringColor}`}
            />
        </div>
    );
}