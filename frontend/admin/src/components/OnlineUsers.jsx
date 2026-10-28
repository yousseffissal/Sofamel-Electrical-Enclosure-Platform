import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import ENDPOINTS from "../tools/Endpoints";
import { useAuth } from "../context/AuthContext";
import { RiAdminLine } from "react-icons/ri";
import { FiSearch, FiPlus, FiUpload, FiX, FiImage } from "react-icons/fi";
import Swal from "sweetalert2";

function ImageUploadField({ onChange, mode = "add", existingUrl = null }) {
  const [preview, setPreview] = useState(null);

  const isUpdate = mode === "update";
  const ring = isUpdate ? "ring-blue-500" : "ring-orange-500";
  const border = isUpdate ? "border-blue-200 hover:border-blue-400" : "border-orange-200 hover:border-orange-400";
  const iconClr = isUpdate ? "text-blue-400" : "text-orange-400";
  const labelClr = isUpdate ? "text-blue-600" : "text-orange-600";

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onChange(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClear = () => { onChange(null); setPreview(null); };
  const displaySrc = preview ?? (isUpdate ? existingUrl : null);

  return (
    <div>
      <label className="text-sm text-gray-600 mb-2 block font-medium">
        Profile Picture <span className="text-gray-400 font-normal">(optional)</span>
      </label>
      {displaySrc ? (
        <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group">
          <img src={displaySrc} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100 transition flex items-center gap-1.5">
              <FiUpload size={12} /> Change
              <input type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
            </label>
            <button type="button" onClick={handleClear}
              className="px-3 py-1.5 bg-red-500 rounded-lg text-xs font-semibold text-white hover:bg-red-600 transition flex items-center gap-1.5">
              <FiX size={12} /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className={`cursor-pointer flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed ${border} bg-gray-50 hover:bg-white transition-all focus-within:ring-2 ${ring}`}>
          <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3 ${iconClr}`}>
            <FiImage size={22} />
          </div>
          <p className={`text-sm font-semibold ${labelClr}`}>Click to upload image</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · max 4 MB</p>
          <input type="file" accept="image/jpg,image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
        </label>
      )}
      {isUpdate && !preview && existingUrl && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
          <FiImage size={12} /> Leave as-is to keep the existing picture
        </p>
      )}
    </div>
  );
}

function DeleteModal({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div className="bg-white w-[440px] border max-w-full rounded-2xl shadow-2xl overflow-hidden modal-animate" onClick={(e) => e.stopPropagation()}>
        <div className="h-16 bg-gradient-to-r from-red-400 to-red-500 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-bold text-white">Delete Admin</h2>
            <p className="text-white/70 text-xs">This action cannot be undone</p>
          </div>
          <button onClick={onCancel} className="text-white/80 hover:text-white text-xl">✕</button>
        </div>
        <div className="px-6 py-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border mb-5">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 border flex-shrink-0">
              {user?.pictureURL ? (
                <img src={user.pictureURL} className="w-full h-full object-cover" alt={user.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-orange-700 text-lg">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
              <div className="text-xs text-gray-400 mt-0.5">{user?.level?.name || "No Level"}</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-800">{user?.name}</span>?
            Their profile picture and all associated data will be removed.
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={onCancel} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition">
              {loading ? "Deleting…" : "Yes, Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_CREATE = { name: "", email: "", password: "", level_id: "", gender: "" };
const EMPTY_UPDATE = { name: "", email: "", password: "", level_id: "", gender: "" };

export default function OnlineUsers() {
  const { user: authUser } = useAuth();
  const isSuperAdmin = authUser?.level?.name === "1" || authUser?.level_id === 1;

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [zoomImage, setZoomImage] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState(EMPTY_CREATE);
  const [createImg, setCreateImg] = useState(null);
  const [createErrs, setCreateErrs] = useState({});
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [updateData, setUpdateData] = useState(EMPTY_UPDATE);
  const [updateImg, setUpdateImg] = useState(null);
  const [updateErrs, setUpdateErrs] = useState({});
  const [updating, setUpdating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(ENDPOINTS.AUTH.USERS);
      setAdmins(res.data ?? []);
    } catch {
      setError("Failed to load admins.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    const iv = setInterval(fetchAdmins, 120_000);
    return () => clearInterval(iv);
  }, []);

  const filtered = useMemo(() =>
    admins.filter((u) =>
      (u.name + u.email).toLowerCase().includes(search.toLowerCase())
    ), [admins, search]);

  const stats = useMemo(() => ({
    total: admins.length,
    online: admins.filter((u) => u.status === "online").length,
    offline: admins.filter((u) => u.status !== "online").length,
  }), [admins]);

  const flattenErrors = (errors) =>
    Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

  const swalError = (err) =>
    Swal.fire({ icon: "error", title: "Something went wrong", text: err?.response?.data?.message || "An unexpected error occurred.", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });

  const openCreate = () => { setCreateData(EMPTY_CREATE); setCreateImg(null); setCreateErrs({}); setShowCreate(true); };

  const handleCreate = async () => {
    setCreating(true); setCreateErrs({});
    try {
      const form = new FormData();
      form.append("name", createData.name);
      form.append("email", createData.email);
      form.append("password", createData.password);
      form.append("level_id", createData.level_id);
      form.append("gender", createData.gender);
      if (createImg) form.append("image", createImg);
      await api.post(ENDPOINTS.ADMINS.CREATE, form, { headers: { "Content-Type": "multipart/form-data" } });
      Swal.fire({ icon: "success", title: "Admin Created", text: "The new admin has been created successfully.", confirmButtonColor: "#f97316", customClass: { popup: "swal-rounded" } });
      setShowCreate(false);
      fetchAdmins();
    } catch (err) {
      const errs = err?.response?.data?.errors;
      if (errs) setCreateErrs(flattenErrors(errs));
      else swalError(err);
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (admin, e) => {
    e?.stopPropagation();
    setSelectedUser(null);
    setUpdateData({ name: admin.name ?? "", email: admin.email ?? "", password: "", level_id: String(admin.level_id ?? admin.level?.id ?? ""), gender: admin.gender ?? "" });
    setUpdateImg(null); setUpdateErrs({}); setEditTarget(admin);
  };

  const handleUpdate = async () => {
    setUpdating(true); setUpdateErrs({});
    try {
      const form = new FormData();
      form.append("_method", "PATCH");
      form.append("name", updateData.name);
      form.append("email", updateData.email);
      if (updateData.password) form.append("password", updateData.password);
      form.append("level_id", updateData.level_id);
      form.append("gender", updateData.gender);
      if (updateImg) form.append("image", updateImg);
      await api.post(ENDPOINTS.ADMINS.UPDATE(editTarget.id), form, { headers: { "Content-Type": "multipart/form-data" } });
      Swal.fire({ icon: "success", title: "Updated!", text: "Admin updated successfully.", confirmButtonColor: "#f97316", customClass: { popup: "swal-rounded" } });
      setEditTarget(null);
      fetchAdmins();
    } catch (err) {
      const errs = err?.response?.data?.errors;
      if (errs) setUpdateErrs(Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])));
      else Swal.fire({ icon: "error", title: "Update Failed", text: err?.response?.data?.message || "Something went wrong", confirmButtonColor: "#ef4444", customClass: { popup: "swal-rounded" } });
    } finally {
      setUpdating(false);
    }
  };

  const openDelete = (admin, e) => { e?.stopPropagation(); setSelectedUser(null); setDeleteTarget(admin); };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(ENDPOINTS.ADMINS.DELETE, { data: { admin_id: deleteTarget.id } });
      Swal.fire({ icon: "success", title: "Deleted!", text: `${deleteTarget.name} has been removed.`, confirmButtonColor: "#f97316", customClass: { popup: "swal-rounded" } });
      setDeleteTarget(null);
      fetchAdmins();
    } catch (err) {
      swalError(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-2xl border min-h-full">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">Admin Live Status</h1>
            <RiAdminLine className="text-3xl text-gray-800" />
          </div>
          <p className="text-gray-500 text-sm">Real-time monitoring of admin activity</p>
        </div>
        <div className="flex gap-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Online" value={stats.online} />
          <Stat label="Offline" value={stats.offline} />
        </div>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{error}</div>}

      {/* CONTROLS */}
      <div className="bg-white border rounded-2xl p-4 mb-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
          <FiSearch />
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search admin…"
          className="border px-3 py-2 rounded-xl text-sm w-64 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />
        {isSuperAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 border-orange-200 border text-orange-700 text-sm font-medium hover:bg-orange-100 transition">
            <FiPlus /> Add Admin
          </button>
        )}
        <div className="text-xs text-gray-500 ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live (refresh every 2 m)
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl p-5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((admin) => (
            <div
              key={admin.id}
              onClick={() => setSelectedUser(admin)}
              className="bg-white border rounded-2xl p-5 hover:shadow-sm hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-orange-100">
                    {admin?.pictureURL ? (
                      <img src={admin.pictureURL} alt={admin.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-700 font-semibold">
                        {admin?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {admin.status === "online" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{admin.name}</h2>
                  <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">
                  {admin.level?.name || "No Level"}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1.5
                  ${admin.status === "online" ? "bg-green-50 text-green-700 border-green-100" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${admin.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                  {admin.status}
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-400">ID #{admin.id}</div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-500">No admins found</div>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedUser && !editTarget && !deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSelectedUser(null)}>
          <div className="bg-white border w-[640px] max-w-full rounded-2xl shadow-2xl overflow-hidden modal-animate" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-orange-400 to-red-400 h-24 relative">
              <button onClick={() => setSelectedUser(null)} className="absolute top-3 right-4 text-white/80 hover:text-white text-xl">✕</button>
              <div className="absolute -bottom-10 left-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-orange-100">
                    {selectedUser?.pictureURL ? (
                      <img src={selectedUser.pictureURL} className="w-full h-full object-cover cursor-pointer" onClick={() => setZoomImage(selectedUser.pictureURL)} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-orange-700">
                        {selectedUser?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  {selectedUser.status === "online" && (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
            <div className="pt-14 px-6 pb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <div className="flex gap-2 mb-5">
                <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border">{selectedUser.level?.name || "No Level"}</span>
                <span className={`px-3 py-1 text-xs rounded-full border flex items-center gap-2 ${selectedUser.status === "online" ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500"}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedUser.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                  {selectedUser.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <InfoCard label="User ID" value={selectedUser.id} />
                <InfoCard label="Email" value={selectedUser.email} />
                <InfoCard label="Level" value={selectedUser.level?.name || "-"} />
                <InfoCard label="Status" value={selectedUser.status} />
                <InfoCard label="Gender" value={selectedUser.gender} />
              </div>
              {isSuperAdmin && (
                <div className="flex justify-end gap-3">
                  <button onClick={(e) => openEdit(selectedUser, e)} className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition text-sm">Edit Admin</button>
                  <button onClick={(e) => openDelete(selectedUser, e)} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-sm">Delete</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white border w-[620px] max-w-full rounded-2xl shadow-2xl overflow-hidden modal-animate" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-between px-6">
              <div>
                <h2 className="text-xl font-bold text-white">New Admin</h2>
                <p className="text-white/70 text-xs">Fill in the details below</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="text-white/80 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <ModalInput label="Name" value={createData.name} onChange={(v) => setCreateData({ ...createData, name: v })} error={createErrs.name} placeholder="Full name" />
                <ModalInput label="Email" type="email" value={createData.email} onChange={(v) => setCreateData({ ...createData, email: v })} error={createErrs.email} placeholder="admin@example.com" />
                <ModalInput label="Password" type="password" value={createData.password} onChange={(v) => setCreateData({ ...createData, password: v })} error={createErrs.password} placeholder="Min. 6 characters" />
                <ModalSelect label="Gender" value={createData.gender} onChange={(v) => setCreateData({ ...createData, gender: v })} error={createErrs.gender}>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </ModalSelect>
                <ModalInput label="Level ID" type="number" value={createData.level_id} onChange={(v) => setCreateData({ ...createData, level_id: v })} error={createErrs.level_id} placeholder="e.g. 1" />
                <div className="col-span-2">
                  <ImageUploadField onChange={setCreateImg} mode="add" />
                  {createErrs.pictureURL && <p className="text-xs text-red-500 mt-1">{createErrs.pictureURL}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowCreate(false)} className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 text-sm transition">Cancel</button>
                <button onClick={handleCreate} disabled={creating} className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium disabled:opacity-50 transition">
                  {creating ? "Creating…" : "Create Admin"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE MODAL */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditTarget(null)}>
          <div className="bg-white w-[620px] border max-w-full rounded-2xl shadow-2xl overflow-hidden modal-animate" onClick={(e) => e.stopPropagation()}>
            <div className="h-16 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-400 flex items-center justify-between px-6">
              <div>
                <h2 className="text-xl font-bold text-white">Edit Admin</h2>
                <p className="text-white/70 text-xs">Leave a field blank to keep its current value</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-white/80 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <ModalInput label="Name" value={updateData.name} onChange={(v) => setUpdateData({ ...updateData, name: v })} error={updateErrs.name} placeholder="Full name" mode="update" />
                <ModalInput label="Email" type="email" value={updateData.email} onChange={(v) => setUpdateData({ ...updateData, email: v })} error={updateErrs.email} placeholder="admin@example.com" mode="update" />
                <ModalInput label="New Password" type="text" value={updateData.password} onChange={(v) => setUpdateData({ ...updateData, password: v })} error={updateErrs.password} placeholder="Leave blank to keep" mode="update" />
                <ModalSelect label="Gender" value={updateData.gender} onChange={(v) => setUpdateData({ ...updateData, gender: v })} error={updateErrs.gender} mode="update">
                  <option value="">— keep current —</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </ModalSelect>
                <ModalInput label="Level ID" type="number" value={updateData.level_id} onChange={(v) => setUpdateData({ ...updateData, level_id: v })} error={updateErrs.level_id} placeholder="Leave blank to keep" mode="update" />
                <div className="col-span-2">
                  <ImageUploadField onChange={setUpdateImg} mode="update" existingUrl={editTarget?.pictureURL} />
                  {updateErrs.pictureURL && <p className="text-xs text-red-500 mt-1">{updateErrs.pictureURL}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setEditTarget(null)} className="px-5 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 text-sm transition">Cancel</button>
                <button onClick={handleUpdate} disabled={updating} className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium disabled:opacity-50 transition">
                  {updating ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteModal user={deleteTarget} loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      {zoomImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} className="max-w-[90%] max-h-[90%] rounded-xl shadow-xl modal-animate" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-xl px-3 py-2 text-center min-w-[70px] shadow-sm">
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="font-bold text-gray-800">{value}</div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border hover:bg-gray-100 transition">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-800 truncate">{value ?? "—"}</div>
    </div>
  );
}

function ModalInput({ label, type = "text", value, onChange, error, placeholder, mode = "add" }) {
  const ring = mode === "update" ? "focus:ring-blue-500" : "focus:ring-orange-500";
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1.5 font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full border rounded-2xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${ring} ${error ? "border-red-400" : "border-gray-200"}`} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function ModalSelect({ label, value, onChange, error, children, mode = "add" }) {
  const ring = mode === "update" ? "focus:ring-blue-500" : "focus:ring-orange-500";
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1.5 font-medium">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-2xl px-4 py-3 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 transition-all ${ring} ${error ? "border-red-400" : "border-gray-200"}`}>
        {children}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}