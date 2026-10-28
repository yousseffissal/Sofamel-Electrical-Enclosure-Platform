import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { useNavigate } from "react-router-dom";
import { FiBox } from "react-icons/fi";
import Swal from "sweetalert2";
import { FiSearch } from "react-icons/fi";

export default function BoxTypes() {
  const [boxes, setBoxes] = useState([]);
  const [selectedBox, setSelectedBox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomModel, setZoomModel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [familyFilter, setFamilyFilter] = useState("all");
  const navigate = useNavigate();

  const [showAddModal, setShowAddModal] = useState(false);

  const [addData, setAddData] = useState({
    code: "",
    family: "",
    variant: "",
    material: "",
    mounting_type: "",
    ip_rating: "",
    color: "",
    width_mm: "",
    height_mm: "",
    depth_mm: "",
    has_overcurrent: false,
    has_earth_leakage: false,
    earth_leakage_rating: "",
    branch_cable_count: 1,
    description: "",
  });

  const [updateData, setUpdateData] = useState({
    code: "",
    family: "",
    variant: "",
    material: "",
    mounting_type: "",
    ip_rating: "",
    color: "",
    width_mm: "",
    height_mm: "",
    depth_mm: "",
    has_overcurrent: false,
    has_earth_leakage: false,
    earth_leakage_rating: "",
    branch_cable_count: 1,
    description: "",
  });


  const handleCreateBox = async () => {
    try {

      setCreating(true);

      await api.post(
        ENDPOINTS.BOX.CREATEBOXTYPE,
        addData
      );

      setShowAddModal(false);

      setAddData({
        code: "",
        family: "",
        variant: "",
        material: "",
        mounting_type: "",
        ip_rating: "",
        color: "",
        width_mm: "",
        height_mm: "",
        depth_mm: "",
        has_overcurrent: false,
        has_earth_leakage: false,
        earth_leakage_rating: "",
        branch_cable_count: 1,
        description: "",
      });

      fetchBoxes();

      Swal.fire({
        icon: "success",
        title: "Box Created",
        text: "The box type has been added successfully.",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

    } catch (err) {

      console.log(err);

      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text:
          err?.response?.data?.message ||
          "Failed to create box type.",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });

    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBox = async (id) => {
    if (deleting) return;
    setDeleting(true);
    try {
      const result = await Swal.fire({
        title: "Delete Box Type?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete",
        customClass: {
          popup: "swal-rounded"
        }
      });

      if (!result.isConfirmed) return;

      await api.delete(ENDPOINTS.BOX.DELETEBOXTYPE(id));

      // remove from UI instantly
      setBoxes((prev) => prev.filter((b) => b.id !== id));

      // close modal if deleted item is open
      if (selectedBox?.id === id) {
        setSelectedBox(null);
        setZoomModel(false);
      }

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Box type deleted successfully",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

    } catch (err) {
      console.log(err);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete box type",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });
    } finally {
      setDeleting(false);
    }
  };

  const [creating, setCreating] = useState(false);

  const fetchBoxes = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(ENDPOINTS.BOX.GETBOXTYPES);
      setBoxes(res?.data?.data ?? []);
    } catch (err) {
      setError("Failed to load box types");
      setBoxes([]);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (box) => {
    setUpdateData({
      code: box.code || "",
      family: box.family || "",
      variant: box.variant || "",
      material: box.material || "",
      mounting_type: box.mounting_type || "",
      ip_rating: box.ip_rating || "",
      color: box.color || "",
      width_mm: box.width_mm || "",
      height_mm: box.height_mm || "",
      depth_mm: box.depth_mm || "",
      has_overcurrent: box.has_overcurrent || false,
      has_earth_leakage: box.has_earth_leakage || false,
      earth_leakage_rating: box.earth_leakage_rating || "",
      branch_cable_count: box.branch_cable_count || 1,
      description: box.description || "",
    });

    setSelectedBox(box);
    setShowUpdateModal(true);
  };

  const handleUpdateBox = async () => {
    try {
      setUpdating(true);

      await api.patch(
        ENDPOINTS.BOX.UPDATEBOXTYPE(selectedBox.id),
        updateData
      );

      setShowUpdateModal(false);
      setSelectedBox(null);

      fetchBoxes();

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Box type updated successfully",
        confirmButtonColor: "#22c55e",
        customClass: {
          popup: "swal-rounded"
        }
      });

    } catch (err) {
      console.log(err);

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err?.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#ef4444",
        customClass: {
          popup: "swal-rounded"
        }
      });

    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const families = useMemo(() => {
    return ["all", ...new Set(boxes.map((b) => b.family))];
  }, [boxes]);

  const filtered = useMemo(() => {
    return boxes.filter((b) => {
      const matchSearch =
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.family.toLowerCase().includes(search.toLowerCase());

      const matchFamily =
        familyFilter === "all" ? true : b.family === familyFilter;

      return matchSearch && matchFamily;
    });
  }, [boxes, search, familyFilter]);

  const stats = useMemo(() => {
    return {
      total: boxes.length,
      el: boxes.filter((b) => b.has_earth_leakage).length,
      oc: boxes.filter((b) => b.has_overcurrent).length,
    };
  }, [boxes]);

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex justify-center items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              Boxes Dashboard
            </h1>
            <h1 className="text-3xl font-bold text-gray-800">
              <FiBox />
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Manage and analyze all box configurations
          </p>
        </div>

        <div className="flex gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="EL" value={stats.el} />
          <Stat label="OC" value={stats.oc} />
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="bg-white border rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center shadow-sm">

        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <FiSearch />
        </div>

        <input
          className="border px-3 py-2 rounded-xl text-sm w-72 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          placeholder="Search code / family..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border bg-gray-50 px-3 py-2 rounded-xl text-sm"
          value={familyFilter}
          onChange={(e) => setFamilyFilter(e.target.value)}
        >
          {families.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition font-medium"
        >
          + Add a Box
        </button>

        <div className="ml-auto text-sm text-gray-500">
          {filtered.length} results
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Family</th>
              <th className="p-4 text-left">Variant</th>
              <th className="p-4 text-left">Protection</th>
              <th className="p-4 text-left">Specs</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-4" colSpan="5">
                    <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  </td>
                </tr>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((box) => (
                <tr
                  key={box.id}
                  onClick={() => {
                    setSelectedBox(box);
                    setZoomModel(true);
                  }}
                  className="border-t hover:bg-gray-50 transition cursor-pointer"
                >

                  <td className="p-4 font-semibold text-gray-800">
                    {box.code}
                  </td>

                  <td className="p-4 text-gray-700">
                    {box.family}
                  </td>

                  <td className="p-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">
                      {box.variant}
                    </span>
                  </td>

                  <td className="p-4 flex gap-2 flex-wrap">
                    {box.has_overcurrent && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-50 text-green-600 border">
                        OC
                      </span>
                    )}

                    {box.has_earth_leakage ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-50 text-yellow-700 border">
                        {box.earth_leakage_rating}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No EL</span>
                    )}
                  </td>

                  <td className="p-4 text-xs text-gray-600">
                    {box.ip_rating}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {zoomModel && selectedBox && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => {
            setZoomModel(false);
            setSelectedBox(null);
          }}
        >

          <div
            className="modal-animate bg-white w-[720px] max-w-full rounded-2xl shadow-2xl border p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ORANGE HEADER STRIP */}
            <div className="absolute top-0 left-0 w-full h-14 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400"></div>

            {/* CLOSE */}
            <button
              onClick={() => setSelectedBox(null)}
              className="absolute top-4 right-6 text-white/80 hover:text-white transition z-20"
            >
              ✕
            </button>

            {/* HEADER */}
            <div className="mb-6 relative z-10 pt-14">

              <div className="flex justify-between items-stretch flex-grow gap-4 mb-3">

                <div className="flex-1">

                  <div className="flex items-center gap-3 mb-2">

                    <div className="w-14 h-14 rounded-2xl bg-red-50 shadow flex items-center justify-center font-bold text-lg text-orange-600">
                      {selectedBox.family?.charAt(0)}
                    </div>

                    <div>
                      <h2 className="text-2xl font-bold text-black">
                        Box #{selectedBox.id} • ( {selectedBox.family} )
                      </h2>

                      <p className="text-sm text-black/80">
                        Code: {selectedBox.code}
                      </p>
                    </div>

                  </div>

                  <div className="flex gap-2 flex-wrap mt-3">

                    <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-orange-600 border border-orange-100">
                      {selectedBox.variant}
                    </span>

                    {selectedBox.has_overcurrent && (
                      <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-green-600 border border-green-100">
                        Overcurrent
                      </span>
                    )}

                    {selectedBox.has_earth_leakage && (
                      <span className="px-3 py-1 text-xs rounded-full bg-white/90 text-yellow-600 border border-yellow-100">
                        {selectedBox.earth_leakage_rating}
                      </span>
                    )}

                  </div>

                </div>

                {/* IMAGE / PREVIEW */}
                <div className="w-20 self-stretch rounded-2xl bg-amber-50 shadow overflow-hidden flex items-center justify-center font-bold text-5xl text-yellow-600">

                  {selectedBox.preview ? (
                    <img
                      src={selectedBox.preview}
                      alt={selectedBox.family}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setZoomImage(selectedBox.preview)}
                    />
                  ) : (
                    <img
                      src={"/logo.png"}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  )}

                </div>

              </div>


              {/* Divider */}
              <div className="block h-px w-full bg-gray-200" />
            </div>

            {/* INFO GRID */}
            <div className="grid grid-cols-2 gap-4 mb-6">

              <Info label="Material" value={selectedBox.material} />
              <Info label="Mounting Type" value={selectedBox.mounting_type} />
              <Info label="IP Rating" value={selectedBox.ip_rating} />
              <Info label="Color" value={selectedBox.color} />

              <Info
                label="Dimensions"
                value={`${selectedBox.width_mm} × ${selectedBox.height_mm} × ${selectedBox.depth_mm} mm`}
              />

              <Info
                label="Branch Cables"
                value={selectedBox.branch_cable_count}
              />

            </div>

            {/* DESCRIPTION */}
            <div className="bg-gray-50 border rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">
                Description
              </p>

              <p className="text-sm text-gray-700 leading-relaxed">
                {selectedBox.description || "No description available"}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">

              <button
                onClick={() => openUpdateModal(selectedBox)}
                className="px-4 py-2 text-sm rounded-xl bg-blue-50 text-blue-600 border hover:bg-blue-100 transition"
              >
                Update
              </button>

              <button
                onClick={() => handleDeleteBox(selectedBox.id)}
                className="px-4 py-2 text-sm rounded-xl bg-red-50 text-red-600 border hover:bg-red-100 transition"
              >
                Delete
              </button>

              <button
                onClick={() => {
                  setSelectedBox(null);
                  navigate(`/dashboard/templates/${selectedBox.id}`);
                }}
                className="px-4 py-2 text-sm rounded-xl bg-green-50 text-green-700 border hover:bg-green-100 transition"
              >
                Manage Template
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ADD BOX MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="h-16 bg-gradient-to-r from-green-500 via-green-400 to-emerald-400 flex items-center justify-between px-6">

              <div>
                <h2 className="text-xl font-bold text-white">
                  Add New Box
                </h2>

                <p className="text-white/80 text-xs">
                  Create a new box configuration
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="text-white text-xl hover:scale-110 transition"
              >
                ✕
              </button>

            </div>

            {/* BODY */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">

              <div className="grid grid-cols-2 gap-4">

                <Input
                  label="Code"
                  value={addData.code}
                  onChange={(v) =>
                    setAddData({ ...addData, code: v })
                  }
                  mode="add"
                />

                <Input
                  label="Family"
                  value={addData.family}
                  onChange={(v) =>
                    setAddData({ ...addData, family: v })
                  }
                  mode="add"
                />

                <Input
                  label="Variant"
                  value={addData.variant}
                  onChange={(v) =>
                    setAddData({ ...addData, variant: v })
                  }
                  mode="add"
                />

                <Input
                  label="Material"
                  value={addData.material}
                  onChange={(v) =>
                    setAddData({ ...addData, material: v })
                  }
                  mode="add"
                />

                <Input
                  label="Mounting Type"
                  value={addData.mounting_type}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      mounting_type: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  label="IP Rating"
                  value={addData.ip_rating}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      ip_rating: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  label="Color"
                  value={addData.color}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      color: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  type="number"
                  label="Width (mm)"
                  value={addData.width_mm}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      width_mm: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  type="number"
                  label="Height (mm)"
                  value={addData.height_mm}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      height_mm: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  type="number"
                  label="Depth (mm)"
                  value={addData.depth_mm}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      depth_mm: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  type="number"
                  label="Branch Cable Count"
                  value={addData.branch_cable_count}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      branch_cable_count: v,
                    })
                  }
                  mode="add"
                />

                <Input
                  label="Earth Leakage Rating"
                  value={addData.earth_leakage_rating}
                  onChange={(v) =>
                    setAddData({
                      ...addData,
                      earth_leakage_rating: v,
                    })
                  }
                  mode="add"
                />

              </div>

              {/* CHECKBOXES */}
              <div className="flex gap-6 mt-6">

                <label className="flex items-center gap-2 text-sm text-gray-700">

                  <input
                    type="checkbox"
                    className="accent-blue-500"
                    checked={addData.has_overcurrent}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        has_overcurrent: e.target.checked,
                      })
                    }
                  />

                  Has Overcurrent

                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">

                  <input
                    type="checkbox"
                    className="accent-blue-500"
                    checked={addData.has_earth_leakage}
                    onChange={(e) =>
                      setAddData({
                        ...addData,
                        has_earth_leakage: e.target.checked,
                      })
                    }
                  />

                  Has Earth Leakage

                </label>

              </div>

              {/* DESCRIPTION */}
              <div className="mt-6">

                <label className="text-sm text-gray-600 mb-2 block">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={addData.description}
                  onChange={(e) =>
                    setAddData({
                      ...addData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none resize-none focus:ring-2 focus:ring-orange-500 transition"
                />

              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 mt-8">

                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  disabled={creating}
                  onClick={handleCreateBox}
                  className="px-5 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Box"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      {showUpdateModal && selectedBox && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowUpdateModal(false)}
        >
          <div
            className="modal-animate bg-white w-[900px] max-w-full rounded-2xl shadow-2xl border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}
            <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 flex items-center justify-between px-6">

              <div>
                <h2 className="text-xl font-bold text-white">
                  Update Box
                </h2>
                <p className="text-white/80 text-xs">
                  Edit box configuration
                </p>
              </div>

              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-white text-xl hover:scale-110 transition"
              >
                ✕
              </button>

            </div>

            {/* BODY */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">

              <div className="grid grid-cols-2 gap-4">

                <Input
                  label="Code"
                  value={updateData.code}
                  onChange={(v) =>
                    setUpdateData({ ...updateData, code: v })
                  }
                  mode="update"
                />

                <Input
                  label="Family"
                  value={updateData.family}
                  onChange={(v) =>
                    setUpdateData({ ...updateData, family: v })
                  }
                  mode="update"
                />

                <Input
                  label="Variant"
                  value={updateData.variant}
                  onChange={(v) =>
                    setUpdateData({ ...updateData, variant: v })
                  }
                  mode="update"
                />

                <Input
                  label="Material"
                  value={updateData.material}
                  onChange={(v) =>
                    setUpdateData({ ...updateData, material: v })
                  }
                  mode="update"
                />

                <Input
                  label="Mounting Type"
                  value={updateData.mounting_type}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      mounting_type: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  label="IP Rating"
                  value={updateData.ip_rating}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      ip_rating: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  label="Color"
                  value={updateData.color}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      color: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  type="number"
                  label="Width (mm)"
                  value={updateData.width_mm}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      width_mm: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  type="number"
                  label="Height (mm)"
                  value={updateData.height_mm}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      height_mm: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  type="number"
                  label="Depth (mm)"
                  value={updateData.depth_mm}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      depth_mm: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  type="number"
                  label="Branch Cable Count"
                  value={updateData.branch_cable_count}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      branch_cable_count: v,
                    })
                  }
                  mode="update"
                />

                <Input
                  label="Earth Leakage Rating"
                  value={updateData.earth_leakage_rating}
                  onChange={(v) =>
                    setUpdateData({
                      ...updateData,
                      earth_leakage_rating: v,
                    })
                  }
                  mode="update"
                />

              </div>

              {/* CHECKBOXES */}
              <div className="flex gap-6 mt-6">

                <label className="flex items-center gap-2 text-sm text-gray-700">

                  <input
                    type="checkbox"
                    checked={updateData.has_overcurrent}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        has_overcurrent: e.target.checked,
                      })
                    }
                  />

                  Has Overcurrent

                </label>

                <label className="flex items-center gap-2 text-sm text-gray-700">

                  <input
                    type="checkbox"
                    checked={updateData.has_earth_leakage}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        has_earth_leakage: e.target.checked,
                      })
                    }
                  />

                  Has Earth Leakage

                </label>

              </div>

              {/* DESCRIPTION */}
              <div className="mt-6">

                <label className="text-sm text-gray-600 mb-2 block">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={updateData.description}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded-2xl px-4 py-3 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />

              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 mt-8">

                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  disabled={updating}
                  onClick={handleUpdateBox}
                  className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
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
  );
}

/* STAT CARD */
function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-xl px-4 py-2 shadow-sm text-center min-w-[80px]">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="font-bold text-gray-800">{value}</div>
    </div>
  );
}

/* INFO CARD */
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
  mode = "add", // 👈 جديد
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