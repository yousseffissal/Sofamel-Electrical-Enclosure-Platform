import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { FiZap, FiSearch, FiImage, FiUpload, FiX } from "react-icons/fi";
import Swal from "sweetalert2";

/* ====================================================================
   IMAGE UPLOAD FIELD
   ==================================================================== */
function ImageUploadField({ value, onChange, mode = "add" }) {
    const [preview, setPreview] = useState(null);

    const ringColor = mode === "update" ? "ring-blue-500" : "ring-green-500";
    const borderColor = mode === "update"
        ? "border-blue-200 hover:border-blue-400"
        : "border-green-200 hover:border-green-400";
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
                <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
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

/* ====================================================================
   MAIN COMPONENT
   ==================================================================== */
export default function AllItems() {

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [addData, setAddData] = useState({
        code: "", name: "", category: "", amperage: "",
        poles: "", voltage: "", price: "", width: "", height: "", depth: ""
    });
    const [addImage, setAddImage] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateData, setUpdateData] = useState({
        id: "", code: "", name: "", category: "",
        amperage: "", poles: "", voltage: "", price: "", width: "", height: "", depth: ""
    });
    const [updateImage, setUpdateImage] = useState(null);

    /* ------------------------------------------------------------------
       API CALLS
    ------------------------------------------------------------------ */
    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(ENDPOINTS.ITEMS.ALL_ITEMS);
            setItems(res?.data?.data ?? []);
        } catch (err) {
            console.log(err);
            setError("Failed to load items");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchItems(); }, []);

    /* CREATE */
    const handleCreateItem = async () => {
        try {
            setCreating(true);

            const form = new FormData();
            form.append("code", addData.code);
            form.append("name", addData.name);
            form.append("category", addData.category);
            form.append("amperage", addData.amperage);
            form.append("poles", addData.poles);
            form.append("voltage", addData.voltage);
            form.append("price", addData.price);
            form.append("width_mm", addData.width);
            form.append("height_mm", addData.height);
            form.append("depth_mm", addData.depth);
            form.append("max_quantity", addData.max_quantity);
            if (addImage) form.append("image", addImage);

            await api.post(ENDPOINTS.ITEMS.CONFIGURABLE_BOX_ITEMS(), form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Swal.fire({ icon: "success", title: "Item Created", text: "Item created successfully", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            setShowAddModal(false);
            setAddData({ code: "", name: "", category: "", amperage: "", poles: "", voltage: "", price: "", width: "", height: "", depth: "", max_quantity: 1 });
            setAddImage(null);
            fetchItems();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Creation Failed", text: err?.response?.data?.message || "Could not create item", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        } finally {
            setCreating(false);
        }
    };

    /* UPDATE */
    const handleUpdateItem = async () => {
        try {
            setUpdating(true);

            const form = new FormData();
            form.append("_method", "PATCH");
            form.append("code", updateData.code);
            form.append("name", updateData.name);
            form.append("category", updateData.category);
            form.append("amperage", updateData.amperage);
            form.append("poles", updateData.poles);
            form.append("voltage", updateData.voltage);
            form.append("price", updateData.price);
            form.append("width_mm", updateData.width);
            form.append("height_mm", updateData.height);
            form.append("depth_mm", updateData.depth);
            if (updateImage) form.append("image", updateImage);

            await api.post(
                ENDPOINTS.ITEMS.UPDATE_ITEM(updateData.id),
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            Swal.fire({ icon: "success", title: "Updated!", text: "Item updated successfully", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            setShowUpdateModal(false);
            setUpdateImage(null);
            fetchItems();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Update Failed", text: err?.response?.data?.message || "Could not update item", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        } finally {
            setUpdating(false);
        }
    };

    /* DELETE */
    const handleDeleteItem = async (item) => {
        try {
            const result = await Swal.fire({
                title: "Delete Item?", text: `Item "${item.name}" will be permanently deleted`, icon: "warning",
                showCancelButton: true, confirmButtonColor: "#ef4444", cancelButtonColor: "#9ca3af",
                confirmButtonText: "Delete", cancelButtonText: "Cancel", customClass: { popup: "swal-rounded" },
            });

            if (!result.isConfirmed) return;

            await api.delete(ENDPOINTS.ITEMS.DELETE_ITEM(item.id));

            Swal.fire({ icon: "success", title: "Deleted!", text: "Item deleted successfully", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            if (selectedItem?.id === item.id) setSelectedItem(null);
            fetchItems();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Delete Failed", text: err?.response?.data?.message || "Something went wrong", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        }
    };

    /* ------------------------------------------------------------------
       DERIVED STATE
    ------------------------------------------------------------------ */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return items.filter((item) =>
            item.code?.toLowerCase().includes(q) ||
            item.name?.toLowerCase().includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            String(item.id).includes(q)
        );
    }, [items, search]);

    const stats = useMemo(() => ({
        total: items.length,
        sockets: items.filter((i) => i.category === "SOCKET").length,
        modules: items.filter((i) => i.category === "MODULE").length,
    }), [items]);

    /* ------------------------------------------------------------------
       RENDER
    ------------------------------------------------------------------ */
    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

            {/* HEADER */}
            <div className="flex justify-between items-end mb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800">All System Items</h1>
                        <FiZap className="text-3xl text-gray-800" />
                    </div>
                    <p className="text-sm text-gray-500">Global list of all configurable items</p>
                </div>
                <div className="flex gap-3">
                    <Stat label="Items" value={stats.total} />
                    <Stat label="Sockets" value={stats.sockets} />
                    <Stat label="Modules" value={stats.modules} />
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>
            )}

            {/* SEARCH */}
            <div className="bg-white border rounded-2xl p-4 mb-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <FiSearch />
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by code / name / category..."
                    className="border px-3 py-2 rounded-xl text-sm w-80 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <button
                    onClick={() => { setAddData({ code: "", name: "", category: "", amperage: "", poles: "", voltage: "", price: "", max_quantity: 1 }); setAddImage(null); setShowAddModal(true); }}
                    className="px-4 py-2 text-sm rounded-xl bg-green-50 text-green-700 border hover:bg-green-100 transition font-medium"
                >
                    + Add an Item
                </button>
                <div className="ml-auto text-sm text-gray-500">{filtered.length} results</div>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            {["ID", "Preview", "Code", "Name", "Price", "Category", "Actions"].map((h) => (
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
                            filtered.map((item) => (
                                <tr key={item.id} onClick={() => setSelectedItem(item)} className="border-t hover:bg-gray-50 cursor-pointer transition">
                                    <td className="p-4 font-medium text-gray-700">#{item.id}</td>
                                    <td className="p-4">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-yellow-200 border flex items-center justify-center shadow-sm">
                                            {(item.image_url || item.preview) ? (
                                                <img src={item.image_url || item.preview} alt={item.code} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                                            ) : (
                                                <span className="text-sm font-bold text-yellow-700">{item.code?.charAt(0) || "?"}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-gray-800">{item.code}</td>
                                    <td className="p-4 text-gray-700">{item.name}</td>
                                    <td className="p-4 text-gray-700 font-medium">{item.price} DH</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">{item.category}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUpdateData({
                                                        id: item.id,
                                                        code: item.code || "",
                                                        name: item.name || "",
                                                        category: item.category || "",
                                                        amperage: item.amperage || "",
                                                        poles: item.poles || "",
                                                        voltage: item.voltage || "",
                                                        price: item.price || "",
                                                        width: item.width_mm || "",
                                                        height: item.height_mm || "",
                                                        depth: item.depth_mm || "",
                                                    });
                                                    setUpdateImage(null);
                                                    setShowUpdateModal(true);
                                                }}
                                                className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-600 border hover:bg-blue-100"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteItem(item); }}
                                                className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 border hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="7" className="p-10 text-center text-gray-500">No items found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ---- DETAIL MODAL ---- */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedItem(null)}>
                    <div className="modal-animate bg-white w-[700px] max-w-full rounded-2xl shadow-2xl border p-6 relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400" />
                        <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-6 text-white/80 hover:text-white transition z-20">✕</button>
                        <div className="mb-6 relative z-10 pt-14">
                            <div className="flex justify-between items-stretch flex-grow gap-4 mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-50 shadow flex items-center justify-center font-bold text-lg text-yellow-600">
                                            {selectedItem.code?.charAt(0)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-black">Item #{selectedItem.id} • ({selectedItem.name})</h2>
                                            <p className="text-sm text-black/80">Code: {selectedItem.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-wrap mt-3">
                                        <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-amber-600 border border-amber-100">{selectedItem.category}</span>
                                        {selectedItem.amperage && <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-blue-600 border border-blue-100">{selectedItem.amperage}A</span>}
                                        {selectedItem.poles && <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-purple-600 border border-purple-100">{selectedItem.poles}P</span>}
                                        {selectedItem.voltage && <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-green-600 border border-green-100">{selectedItem.voltage}V</span>}
                                    </div>
                                </div>
                                <div
                                    className="w-20 self-stretch rounded-2xl bg-amber-50 shadow overflow-hidden flex items-center justify-center cursor-pointer"
                                    onClick={() => { const img = selectedItem.image_url || selectedItem.preview; if (img) setZoomImage(img); }}
                                >
                                    {(selectedItem.image_url || selectedItem.preview) ? (
                                        <img src={selectedItem.image_url || selectedItem.preview} alt={selectedItem.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/logo.png" className="w-full h-full object-cover" />
                                    )}
                                </div>
                            </div>
                            <div className="block h-px w-full bg-gray-200" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <Info label="Code" value={selectedItem.code} />
                            <Info label="Name" value={selectedItem.name} />
                            <Info label="Category" value={selectedItem.category} />
                            <Info label="Price" value={`${selectedItem.price} DH`} />
                            <Info label="Amperage" value={selectedItem.amperage ? `${selectedItem.amperage}A` : "-"} />
                            <Info label="Poles" value={selectedItem.poles ? `${selectedItem.poles}P` : "-"} />
                            <Info label="Voltage" value={selectedItem.voltage ? `${selectedItem.voltage}V` : "-"} />
                            <Info label="Width" value={selectedItem.width_mm ? `${selectedItem.width_mm} mm` : "-"} />
                            <Info label="Height" value={selectedItem.height_mm ? `${selectedItem.height_mm} mm` : "-"} />
                            <Info label="Depth" value={selectedItem.depth_mm ? `${selectedItem.depth_mm} mm` : "-"} />
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
                                <h2 className="text-xl font-bold text-white">Add Item</h2>
                                <p className="text-white/80 text-xs">Create a new configurable item</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-white text-xl hover:scale-110 transition">✕</button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Code" value={addData.code} onChange={(v) => setAddData({ ...addData, code: v })} mode="add" />
                                <Input label="Name" value={addData.name} onChange={(v) => setAddData({ ...addData, name: v })} mode="add" />
                                <Input label="Category" value={addData.category} onChange={(v) => setAddData({ ...addData, category: v })} mode="add" />
                                <Input label="Price" value={addData.price} onChange={(v) => setAddData({ ...addData, price: v })} mode="add" />
                                <Input label="Amperage" value={addData.amperage} onChange={(v) => setAddData({ ...addData, amperage: v })} mode="add" />
                                <Input label="Poles" value={addData.poles} onChange={(v) => setAddData({ ...addData, poles: v })} mode="add" />
                                <Input label="Voltage" value={addData.voltage} onChange={(v) => setAddData({ ...addData, voltage: v })} mode="add" />
                                <Input label="Width" value={addData.width} onChange={(v) => setAddData({ ...addData, width: v })} mode="add" />
                                <Input label="Height" value={addData.height} onChange={(v) => setAddData({ ...addData, height: v })} mode="add" />
                                <Input label="Depth" value={addData.depth} onChange={(v) => setAddData({ ...addData, depth: v })} mode="add" />
                                {/* IMAGE */}
                                <div className="col-span-2">
                                    <ImageUploadField value={addImage} onChange={setAddImage} mode="add" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button onClick={() => setShowAddModal(false)} className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition">Cancel</button>
                                <button disabled={creating} onClick={handleCreateItem} className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50">
                                    {creating ? "Creating..." : "Create Item"}
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
                                <h2 className="text-xl font-bold text-white">Update Item</h2>
                                <p className="text-white/80 text-xs">Edit configurable item</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} className="text-white text-xl hover:scale-110 transition">✕</button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Code" value={updateData.code} onChange={(v) => setUpdateData({ ...updateData, code: v })} mode="update" />
                                <Input label="Name" value={updateData.name} onChange={(v) => setUpdateData({ ...updateData, name: v })} mode="update" />
                                <Input label="Category" value={updateData.category} onChange={(v) => setUpdateData({ ...updateData, category: v })} mode="update" />
                                <Input label="Price" value={updateData.price} onChange={(v) => setUpdateData({ ...updateData, price: v })} mode="update" />
                                <Input label="Amperage" value={updateData.amperage} onChange={(v) => setUpdateData({ ...updateData, amperage: v })} mode="update" />
                                <Input label="Poles" value={updateData.poles} onChange={(v) => setUpdateData({ ...updateData, poles: v })} mode="update" />
                                <Input label="Voltage" value={updateData.voltage} onChange={(v) => setUpdateData({ ...updateData, voltage: v })} mode="update" />
                                <Input label="Width" value={updateData.width} onChange={(v) => setUpdateData({ ...updateData, width: v })} mode="update" />
                                <Input label="Height" value={updateData.height} onChange={(v) => setUpdateData({ ...updateData, height: v })} mode="update" />
                                <Input label="Depth" value={updateData.depth} onChange={(v) => setUpdateData({ ...updateData, depth: v })} mode="update" />
                                {/* IMAGE */}
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
                                <button disabled={updating} onClick={handleUpdateItem} className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50">
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