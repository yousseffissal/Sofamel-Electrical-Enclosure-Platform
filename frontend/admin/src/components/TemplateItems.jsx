import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { FiZap, FiSearch, FiImage, FiUpload, FiX, FiAlertTriangle } from "react-icons/fi";
import Swal from "sweetalert2";

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

export default function TemplateItems() {
    const { id } = useParams();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [templateData, setTemplateData] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedItem, setSelectedItem] = useState(null);
    const [error, setError] = useState(null);
    const [zoomImage, setZoomImage] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);
    const [creating, setCreating] = useState(false);

    const [showSelectModal, setShowSelectModal] = useState(false);
    const [availableItems, setAvailableItems] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(false);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [attachQuantities, setAttachQuantities] = useState({});
    const [attachAreas, setAttachAreas] = useState({});

    const [addImage, setAddImage] = useState(null);

    const [addData, setAddData] = useState({
        configurable_box_id: id,
        code: "",
        name: "",
        category: "",
        amperage: "",
        poles: "",
        voltage: "",
        price: "",
        max_quantity: 1,
        area_id: "",
        width: "", height: "", depth: "",
    });

    const [updateData, setUpdateData] = useState({
        id: null,
        code: "",
        name: "",
        category: "",
        amperage: "",
        poles: "",
        voltage: "",
        price: "",
        area_id: "",
        max_quantity: 1,
        width: "", height: "", depth: "",
    });

    const [updateImage, setUpdateImage] = useState(null);

    /* FETCH */
    const fetchItems = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(ENDPOINTS.BOX.GETTEMPLATEITEMS(id));

            setItems(res?.data?.data ?? []);
            setTemplateData(res?.data?.template ?? null);
        } catch (err) {
            setError("Failed to load box items");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [id]);

    const fetchAvailableItems = async () => {
        try {


            setLoadingAvailable(true);

            const res = await api.get(
                ENDPOINTS.ITEMS.AVAILABLE_ITEMS(id)
            );

            setAvailableItems(res?.data?.data ?? []);

        } catch (err) {

            console.log(err);

        } finally {

            setLoadingAvailable(false);

        }


    };

    /* CREATE */
    const handleCreateItem = async () => {
        try {
            setCreating(true);

            const form = new FormData();
            form.append("configurable_box_id", id); 
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
            if (addData.area_id) form.append("area_id", addData.area_id);

            await api.post(ENDPOINTS.ITEMS.CONFIGURABLE_BOX_ITEMS(id), form, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Swal.fire({ icon: "success", title: "Item Created", text: "Item created successfully", confirmButtonColor: "#22c55e", customClass: { popup: "swal-rounded" } });

            setShowAddModal(false);
            setAddData({ code: "", name: "", category: "", amperage: "", poles: "", voltage: "", price: "", width: "", height: "", depth: "", max_quantity: 1, area_id: "" });
            setAddImage(null);
            fetchItems();

        } catch (err) {
            Swal.fire({ icon: "error", title: "Creation Failed", text: err?.response?.data?.message || "Could not create item", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
        } finally {
            setCreating(false);
        }
    };

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
            form.append("configurable_box_id", id);
            form.append("max_quantity", updateData.max_quantity);
            if (updateData.area_id) form.append("area_id", updateData.area_id);
            if (updateImage) form.append("image", updateImage);

            await api.post(
                ENDPOINTS.ITEMS.UPDATE_ITEM(updateData.id),
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Item updated successfully",
                confirmButtonColor: "#22c55e",
                customClass: { popup: "swal-rounded" }
            });

            setShowUpdateModal(false);
            setUpdateImage(null);
            fetchItems();

        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Update Failed",
                text: err?.response?.data?.message || "Could not update item",
                confirmButtonColor: "#ef4444",
                customClass: { popup: "swal-rounded" }
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleAttachItem = async (itemId) => {
        try {
            await api.post(
                ENDPOINTS.ITEMS.ATTACH_ITEM_TO_BOX(id),
                {
                    item_id: itemId,
                    area_id: attachAreas[itemId] || null,
                    max_quantity: attachQuantities[itemId] || 1,
                }
            );
            Swal.fire({
                icon: "success",
                title: "Attached!",
                text: "Item attached successfully",
                confirmButtonColor: "#22c55e",
                customClass: {
                    popup: "swal-rounded"
                }
            });

            setShowSelectModal(false);

            fetchItems();

        } catch (err) {

            Swal.fire({
                icon: "error",
                title: "Attach Failed",
                text:
                    err?.response?.data?.message ||
                    "Could not attach item",
                confirmButtonColor: "#ef4444",
                customClass: {
                    popup: "swal-rounded"
                }
            });

        }
    };

    const handleRemoveItem = async (itemId) => {
        try {

            const result = await Swal.fire({
                title: "Remove Item?",
                text: "This item will be detached from this template.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#ef4444",
                cancelButtonColor: "#9ca3af",
                confirmButtonText: "Yes, remove it",
                cancelButtonText: "Cancel",
                customClass: {
                    popup: "swal-rounded"
                }
            });

            if (!result.isConfirmed) return;

            await api.delete(
                ENDPOINTS.ITEMS.CONFIGURABLE_BOX_ITEMS(id),
                {
                    data: {
                        item_id: itemId,
                    },
                }
            );

            Swal.fire({
                icon: "success",
                title: "Removed!",
                text: "Item detached successfully",
                confirmButtonColor: "#22c55e",
                customClass: {
                    popup: "swal-rounded"
                }
            });

            setSelectedItem(null);

            fetchItems();

        } catch (err) {

            Swal.fire({
                icon: "error",
                title: "Remove Failed",
                text:
                    err?.response?.data?.message ||
                    "Could not detach item",
                confirmButtonColor: "#ef4444",
                customClass: {
                    popup: "swal-rounded"
                }
            });

        }


    };

    const [boxAreas, setBoxAreas] = useState([]);

    // add inside useEffect or a separate fetch
    const fetchBoxAreas = async () => {
        try {
            const res = await api.get(ENDPOINTS.BOX.GET_BOX_AREAS(id));
            setBoxAreas(res?.data?.data ?? []);
        } catch (err) {
            console.error("Failed to load areas", err);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchBoxAreas();
    }, [id]);


    /* FILTER */
    const filtered = useMemo(() => {
        const q = search.toLowerCase();

        return items.filter((i) => {
            return (
                i.code?.toLowerCase().includes(q) ||
                i.name?.toLowerCase().includes(q) ||
                i.category?.toLowerCase().includes(q) ||
                String(i.id).includes(q)
            );
        });
    }, [items, search]);

    /* STATS */
    const stats = useMemo(() => {
        return {
            total: items.length,
            totalQty: items.reduce((acc, i) => acc + (i.max_quantity || 0), 0),
        };
    }, [items]);

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border min-h-full flex flex-col gap-6">

            <div>

                {/* HEADER */}
                <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col gap-1">

                        {/* TITLE */}
                        {loading ? (
                            <div className="space-y-3">
                                <div className="h-8 w-80 bg-gray-200 animate-pulse rounded-lg" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-800">
                                    {templateData ? (
                                        <>
                                            Items of{" "}
                                            <span className="text-orange-600">
                                                {templateData.code}
                                            </span>
                                        </>
                                    ) : (
                                        "Templates Items"
                                    )}
                                </h1>
                                <h1 className="text-3xl font-bold text-gray-800">
                                    <FiZap />
                                </h1>
                            </div>
                        )}

                        {/* SUBTITLE 1 */}
                        {loading ? (
                            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded-lg" />
                        ) : (
                            <p className="text-gray-500 text-sm">
                                {templateData?.box_type_family} • {templateData?.box_type_code} • template ID #{templateData?.id}
                            </p>
                        )}

                        {/* SUBTITLE 2 */}
                        {loading ? (
                            <div className="h-4 w-64 bg-gray-200 animate-pulse rounded-lg" />
                        ) : (
                            <p className="text-gray-500 text-sm">
                                Manage all items for configurable templates #{templateData?.id}
                            </p>
                        )}

                    </div>

                    <div className="flex gap-3">
                        <Stat label="Items" value={stats.total} />
                        <Stat label="Total Qty" value={stats.totalQty} />
                    </div>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                        {error}
                    </div>
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
                        onClick={() => {
                            Swal.fire({
                                title: "Associate Item",
                                text: "Choose an action",
                                icon: "question",
                                showCancelButton: true,
                                confirmButtonText: "Use existing",
                                cancelButtonText: "Create new",
                                confirmButtonColor: "#22c55e",
                                cancelButtonColor: "#3b82f6",
                                customClass: {
                                    popup: "swal-rounded"
                                }
                            }).then((result) => {

                                if (result.isConfirmed) {

                                    fetchAvailableItems();
                                    setShowSelectModal(true);

                                } else if (
                                    result.dismiss === Swal.DismissReason.cancel
                                ) {

                                    setShowAddModal(true);

                                }
                            });
                        }}
                        className="px-4 py-2 text-sm rounded-xl bg-green-50 text-green-700 border hover:bg-green-100 transition font-medium"


                    >

                        + Associate an Item

                    </button>



                    <div className="ml-auto text-sm text-gray-500">
                        {filtered.length} results
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">

                    <table className="w-full text-sm">

                        {/* HEADER */}
                        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                            <tr>
                                <th className="p-4 text-left">ID</th>
                                <th className="p-4 text-left">Preview</th>
                                <th className="p-4 text-left">Code</th>
                                <th className="p-4 text-left">Name</th>
                                <th className="p-4 text-left">Max Qty</th>
                                <th className="p-4 text-left">Price</th>
                                <th className="p-4 text-left">Category</th>
                                <th className="p-4 text-left">Actions</th>
                            </tr>
                        </thead>

                        {/* BODY */}
                        <tbody>

                            {/* LOADING */}
                            {/* LOADING */}
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-4" colSpan="8">
                                            <div className="h-4 bg-gray-200 animate-pulse rounded" />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="border-t hover:bg-gray-50 cursor-pointer transition"
                                    >

                                        {/* ID */}
                                        <td className="p-4 font-medium text-gray-700">
                                            #{item.id}
                                        </td>

                                        {/* PREVIEW */}
                                        <td className="p-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-amber-100 to-yellow-200 border flex items-center justify-center shadow-sm">

                                                {item.preview ? (
                                                    <img
                                                        src={item.preview}
                                                        alt={item.code}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-yellow-700">
                                                        {item.code?.charAt(0) || "?"}
                                                    </span>
                                                )}

                                            </div>
                                        </td>

                                        {/* CODE */}
                                        <td className="p-4 font-semibold text-gray-800">
                                            {item.code}
                                        </td>

                                        {/* NAME */}
                                        <td className="p-4 text-gray-700">
                                            {item.name}
                                        </td>

                                        {/* MAX QTY */}
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-700 border">
                                                {item.max_quantity}
                                            </span>
                                        </td>

                                        {/* PRICE */}
                                        <td className="p-4 text-gray-700 font-medium">
                                            {item.price} DH
                                        </td>

                                        {/* CATEGORY */}
                                        <td className="p-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">
                                                {item.category}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
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
                                                            area_id: item.area_id || "",
                                                            max_quantity: item.max_quantity || 1,
                                                        });
                                                        setUpdateImage(null);
                                                        setShowUpdateModal(true);

                                                        setShowUpdateModal(true);
                                                    }}
                                                    className="px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-600 border hover:bg-blue-100"
                                                >
                                                    Update
                                                </button>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveItem(item.id);
                                                    }}
                                                    className="px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 border hover:bg-red-100"
                                                >
                                                    Remove
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="p-10 text-center text-gray-500">
                                        No items found
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>

                {/* MODAL */}
                {selectedItem && (

                    <div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={() => setSelectedItem(null)}   // click outside closes modal
                    >

                        <div
                            className="modal-animate bg-white w-[700px] max-w-full rounded-2xl shadow-2xl border p-6 relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                        >

                            {/* HEADER STRIP (blue gradient for items) */}
                            <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400"></div>

                            {/* CLOSE */}
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-6 text-white/80 hover:text-white transition z-20"
                            >
                                ✕
                            </button>

                            {/* HEADER */}
                            <div className="mb-6 relative z-10 pt-14">

                                <div className="flex justify-between items-stretch flex-grow gap-4 mb-3">

                                    {/* LEFT */}
                                    <div className="flex-1">

                                        <div className="flex items-center gap-3 mb-2">

                                            <div className="w-14 h-14 rounded-2xl bg-amber-50 shadow flex items-center justify-center font-bold text-lg text-yellow-600">
                                                {selectedItem.code?.charAt(0)}
                                            </div>

                                            <div>
                                                <h2 className="text-2xl font-bold text-black">
                                                    Item #{selectedItem.id} • ({selectedItem.name})
                                                </h2>

                                                <p className="text-sm text-black/80">
                                                    Code: {selectedItem.code}
                                                </p>
                                            </div>

                                        </div>

                                        {/* TAGS */}
                                        <div className="flex gap-2 flex-wrap mt-3">

                                            <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-amber-600 border border-amber-100">
                                                {selectedItem.category}
                                            </span>

                                            <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-green-600 border border-green-100">
                                                Max Qty: {selectedItem.max_quantity}
                                            </span>

                                            {selectedItem.amperage && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-blue-600 border border-blue-100">
                                                    {selectedItem.amperage}A
                                                </span>
                                            )}

                                            {selectedItem.poles && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-purple-600 border border-purple-100">
                                                    {selectedItem.poles}P
                                                </span>
                                            )}

                                            {selectedItem.voltage && (
                                                <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-cyan-600 border border-cyan-100">
                                                    {selectedItem.voltage}V
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                    {/* IMAGE / PREVIEW */}
                                    <div className="w-20 self-stretch rounded-2xl bg-amber-50 shadow overflow-hidden flex items-center justify-center font-bold text-5xl text-yellow-600">

                                        {selectedItem.preview ? (
                                            <img
                                                src={selectedItem.preview}
                                                alt={selectedItem.name}
                                                className="w-full h-full object-cover cursor-pointer"
                                                onClick={() => setZoomImage(selectedItem.preview)}
                                            />
                                        ) : (
                                            <img
                                                src={"/logo.png"}
                                                className="w-full h-full object-cover cursor-pointer"
                                            />
                                        )}

                                    </div>

                                </div>

                                <div className="block h-px w-full bg-gray-200" />

                            </div>

                            {/* INFO */}
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
                                <Info
                                    label="Area"
                                    value={
                                        selectedItem.area_id
                                            ? boxAreas.find((a) => a.id === Number(selectedItem.area_id))?.name ?? "-"
                                            : "-"
                                    }
                                />
                            </div>

                        </div>
                    </div>
                )}

                {/* SELECT ITEM MODAL */}
                {showSelectModal && (
                    <div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={() => setShowSelectModal(false)}
                    >
                        <div
                            className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-16 bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 flex items-center justify-between px-6">

                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Select Existing Item
                                    </h2>

                                    <p className="text-white/80 text-xs">
                                        Attach an available item to this template
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowSelectModal(false)}
                                    className="text-white text-xl hover:scale-110 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 max-h-[80vh] overflow-y-auto">
                                {loadingAvailable ? (
                                    <div className="space-y-3">
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between items-center border rounded-xl p-4"
                                            >
                                                <div className="space-y-2 w-full">
                                                    <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                                                    <div className="h-3 w-64 bg-gray-100 animate-pulse rounded" />
                                                </div>

                                                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                ) : availableItems.length > 0 ? (
                                    <div className="space-y-3">

                                        {availableItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between items-center border rounded-2xl p-4 hover:bg-gray-50 transition"
                                            >

                                                <div className="flex items-center gap-4">

                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border bg-amber-50 flex items-center justify-center shadow-sm">
                                                        {item.preview ? (
                                                            <img
                                                                src={item.preview}
                                                                alt={item.code}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-amber-50 flex items-center justify-center font-bold text-xl text-yellow-600">
                                                                {item.code?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div>

                                                        <div className="flex items-center gap-2 mb-1">

                                                            <p className="font-semibold text-gray-800">
                                                                {item.name}
                                                            </p>

                                                            <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-500 border">
                                                                #{item.id}
                                                            </span>

                                                        </div>

                                                        <p className="text-xs text-gray-500">
                                                            {item.code}
                                                        </p>

                                                        <div className="flex gap-2 mt-2">

                                                            <span className="px-2 py-1 text-[11px] rounded-full bg-blue-50 text-blue-600 border">
                                                                {item.category}
                                                            </span>

                                                            <span className="px-2 py-1 text-[11px] rounded-full bg-green-50 text-green-600 border">
                                                                {item.price} DH
                                                            </span>

                                                        </div>

                                                    </div>

                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* Area selector */}
                                                    <select
                                                        value={attachAreas[item.id] || ""}
                                                        onChange={(e) =>
                                                            setAttachAreas({
                                                                ...attachAreas,
                                                                [item.id]: e.target.value,
                                                            })
                                                        }
                                                        className="border rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition text-sm"
                                                    >
                                                        <option value="">No area</option>
                                                        {boxAreas.map((area) => (
                                                            <option key={area.id} value={area.id}>
                                                                {area.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* existing max quantity input */}
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={attachQuantities[item.id] || 1}
                                                        onChange={(e) =>
                                                            setAttachQuantities({
                                                                ...attachQuantities,
                                                                [item.id]: e.target.value,
                                                            })
                                                        }
                                                        className="w-24 border rounded-xl px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                                    />

                                                    <button
                                                        onClick={() => handleAttachItem(item.id)}
                                                        className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition shadow-sm"
                                                    >
                                                        Attach
                                                    </button>
                                                </div>

                                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-10">
                                        No available items found
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>

                )}

                {/* CREATE ITEM MODAL */}
                {showAddModal && (
                    <div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <div
                            className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >

                            <div className="h-16 bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 flex items-center justify-between px-6">

                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Add Item
                                    </h2>

                                    <p className="text-white/80 text-xs">
                                        Create a new item for this template
                                    </p>
                                </div>

                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-white text-xl hover:scale-110 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 max-h-[80vh] overflow-y-auto">

                                <div className="grid grid-cols-2 gap-4">

                                    <Input mode="add" label="Code" value={addData.code} onChange={(v) => setAddData({ ...addData, code: v })} />
                                    <Input mode="add" label="Name" value={addData.name} onChange={(v) => setAddData({ ...addData, name: v })} />
                                    <Input mode="add" label="Category" value={addData.category} onChange={(v) => setAddData({ ...addData, category: v })} />
                                    <Input mode="add" label="Amperage" value={addData.amperage} onChange={(v) => setAddData({ ...addData, amperage: v })} />
                                    <Input mode="add" label="Poles" value={addData.poles} onChange={(v) => setAddData({ ...addData, poles: v })} />
                                    <Input mode="add" label="Voltage" value={addData.voltage} onChange={(v) => setAddData({ ...addData, voltage: v })} />
                                    <Input mode="add" label="Price" value={addData.price} onChange={(v) => setAddData({ ...addData, price: v })} />
                                    <Input mode="add" label="Width" value={addData.width} onChange={(v) => setAddData({ ...addData, width: v })} />
                                    <Input mode="add" label="Height" value={addData.height} onChange={(v) => setAddData({ ...addData, height: v })} />
                                    <Input mode="add" label="Depth" value={addData.depth} onChange={(v) => setAddData({ ...addData, depth: v })} />
                                    <Input mode="add" label="Max Quantity" value={addData.max_quantity} onChange={(v) => setAddData({ ...addData, max_quantity: v })} />
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-600 mb-2 block font-medium">
                                            Area
                                        </label>
                                        <select
                                            value={addData.area_id || ""}
                                            onChange={(e) => setAddData({ ...addData, area_id: e.target.value })}
                                            className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                                        >
                                            <option value="">No area</option>
                                            {boxAreas.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* IMAGE */}
                                    <div className="col-span-2">
                                        <ImageUploadField value={addImage} onChange={setAddImage} mode="add" />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8">

                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        disabled={creating}
                                        onClick={handleCreateItem}
                                        className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50"
                                    >
                                        {creating ? "Creating..." : "Create Item"}
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>


                )}

                {/* UPDATE ITEM MODAL */}
                {showUpdateModal && (
                    <div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        onClick={() => setShowUpdateModal(false)}
                    >
                        <div
                            className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 flex items-center justify-between px-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Update Item</h2>
                                    <p className="text-white/80 text-xs">Edit item information</p>
                                </div>
                                <button
                                    onClick={() => setShowUpdateModal(false)}
                                    className="text-white text-xl hover:scale-110 transition"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-6 max-h-[80vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">

                                    <Input mode="update" label="Code" value={updateData.code} onChange={(v) => setUpdateData({ ...updateData, code: v })} />
                                    <Input mode="update" label="Name" value={updateData.name} onChange={(v) => setUpdateData({ ...updateData, name: v })} />
                                    <Input mode="update" label="Category" value={updateData.category} onChange={(v) => setUpdateData({ ...updateData, category: v })} />
                                    <Input mode="update" label="Amperage" value={updateData.amperage} onChange={(v) => setUpdateData({ ...updateData, amperage: v })} />
                                    <Input mode="update" label="Poles" value={updateData.poles} onChange={(v) => setUpdateData({ ...updateData, poles: v })} />
                                    <Input mode="update" label="Voltage" value={updateData.voltage} onChange={(v) => setUpdateData({ ...updateData, voltage: v })} />
                                    <Input mode="update" label="Price" value={updateData.price} onChange={(v) => setUpdateData({ ...updateData, price: v })} />
                                    <Input mode="update" label="Width" value={updateData.width} onChange={(v) => setUpdateData({ ...updateData, width: v })} />
                                    <Input mode="update" label="Height" value={updateData.height} onChange={(v) => setUpdateData({ ...updateData, height: v })} />
                                    <Input mode="update" label="Depth" value={updateData.depth} onChange={(v) => setUpdateData({ ...updateData, depth: v })} />
                                    {/* ADD */}
                                    <Input mode="update" label="Max Quantity" value={updateData.max_quantity} onChange={(v) => setUpdateData({ ...updateData, max_quantity: v })} />

                                    {/* ADD */}
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-600 mb-2 block font-medium">
                                            Area
                                        </label>
                                        <select
                                            value={updateData.area_id || ""}
                                            onChange={(e) => setUpdateData({ ...updateData, area_id: e.target.value })}
                                            className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                        >
                                            {boxAreas.map((area) => (
                                                <option key={area.id} value={area.id}>
                                                    {area.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* ADD — after area selector */}
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
                                    <button
                                        onClick={() => {
                                            setShowUpdateModal(false);
                                            setUpdateImage(null);
                                        }}
                                        className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={updating}
                                        onClick={handleUpdateItem}
                                        className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition disabled:opacity-50"
                                    >
                                        {updating ? "Updating..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* IMAGE ZOOM OVERLAY */}
                {zoomImage && (
                    <div
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
                        onClick={() => setZoomImage(null)}
                    >
                        <img
                            src={zoomImage}
                            className="max-w-[90%] max-h-[90%] rounded-xl shadow-xl modal-animate"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}


            </div>

            <div className="w-full p-4 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100">
                <div className="flex items-start gap-3">
                    <FiAlertTriangle className="mt-0.5 shrink-0 text-orange-500" size={18} />
                    <div>
                        <p className="font-semibold text-orange-700 mb-2">
                            Multi-area item assignment — fix required
                        </p>
                        <ul className="space-y-1.5 text-sm text-orange-600 leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                An item can belong to multiple areas within the same template, but the current implementation only allows one area per item.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                <span><strong className="text-orange-700">UI:</strong> The area select field should support multiple selections instead of a single value.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                <span><strong className="text-orange-700">Backend:</strong> The controller should insert one row per selected area into <code className="bg-orange-100 px-1 py-0.5 rounded text-xs font-mono">box_allowed_items</code> instead of a single record.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                                <span><strong className="text-orange-700">Modal:</strong> The detail popup should list all areas linked to the item within the template, not just one.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
}

/* STAT */
function Stat({ label, value }) {
    return (
        <div className="bg-white border rounded-xl px-4 py-2 shadow-sm text-center min-w-[90px]">
            <div className="text-gray-500 text-xs">{label}</div>
            <div className="font-bold text-gray-800">{value}</div>
        </div>
    );
}

/* INFO */
function Info({ label, value }) {
    return (
        <div className="bg-gray-50 border rounded-xl p-3">
            <div className="text-xs text-gray-400">{label}</div>
            <div className="font-medium text-gray-800">{value ?? "-"}</div>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = "text",
    mode = "add",
}) {
    const ringColor =
        mode === "update"
            ? "focus:ring-blue-500"
            : "focus:ring-green-500";

    return (
        <div>
            <label className="text-sm text-gray-600 mb-2 block">
                {label}
            </label>

            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition ${ringColor}`}
            />
        </div>
    );
}
