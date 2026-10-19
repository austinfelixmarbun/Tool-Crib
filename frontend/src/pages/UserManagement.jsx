import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { APP_ROUTES, API_ROUTES } from "../constants/routes";

const ALL_ROLES = ["SUPER ADMIN", "ADMIN", "QUALITY CONTROL", "USER"];
const ASSIGNABLE_ROLES = ["ADMIN", "QUALITY CONTROL", "USER"];

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [workCenters, setWorkCenters] = useState([]);
  const [workAreas, setWorkAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userModalMode, setUserModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    department: "",
    role: "USER",
    workCenterId: "",
    workAreaId: "",
    status: "ACTIVE",
    password: "",
  });

  useEffect(() => {
    if (currentUser) {
      const role = (currentUser.role).toUpperCase();
      if (role !== "SUPER ADMIN") {
        alert("Access Denied: Only Super Admin can manage user accounts.");
        navigate(APP_ROUTES.DASHBOARD);
      }
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, wcRes, waRes] = await Promise.all([
        api.get(API_ROUTES.USERS.BASE),
        api.get(API_ROUTES.WORK_CENTERS.BASE),
        api.get(API_ROUTES.WORK_AREAS.BASE),
      ]);

      const usersList = usersRes?.data || (Array.isArray(usersRes) ? usersRes : []);
      const wcList = wcRes?.data || (Array.isArray(wcRes) ? wcRes : []);
      const waList = waRes?.data || (Array.isArray(waRes) ? waRes : []);

      setUsers(usersList);
      setWorkCenters(wcList);
      setWorkAreas(waList);

      if (wcList.length > 0 && !formData.workCenterId) {
        setFormData((f) => ({ ...f, workCenterId: String(wcList[0].id) }));
      }
      if (waList.length > 0 && !formData.workAreaId) {
        setFormData((f) => ({ ...f, workAreaId: String(waList[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load user management data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setUserModalMode("create");
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      employeeId: "",
      department: "Production",
      role: "USER",
      workCenterId: workCenters[0] ? String(workCenters[0].id) : "1",
      workAreaId: workAreas[0] ? String(workAreas[0].id) : "1",
      status: "ACTIVE",
      password: "",
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setUserModalMode("edit");
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      employeeId: String(user.employeeId),
      department: user.department,
      role: user.role,
      workCenterId: String(user.workCenterId || workCenters[0]?.id),
      workAreaId: String(user.workAreaId || workAreas[0]?.id),
      status: user.status,
      password: "",
    });
    setIsUserModalOpen(true);
  };

  const handleOpenResetModal = (user) => {
    setResetTargetUser(user);
    setNewPassword("");
    setIsResetPasswordModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (userModalMode === "create") {
        if (!formData.password || formData.password.length < 8) {
          alert("Password must be at least 8 characters long.");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          employeeId: Number(formData.employeeId),
          department: formData.department.trim(),
          role: formData.role,
          workCenterId: Number(formData.workCenterId),
          workAreaId: Number(formData.workAreaId),
          password: formData.password,
        };

        await api.post(API_ROUTES.USERS.BASE, payload);
      } else {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          employeeId: Number(formData.employeeId),
          department: formData.department.trim(),
          role: formData.role,
          workCenterId: Number(formData.workCenterId),
          workAreaId: Number(formData.workAreaId),
          status: formData.status,
        };

        await api.patch(API_ROUTES.USERS.BY_ID(selectedUser.id), payload);
      }

      setIsUserModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(API_ROUTES.USERS.RESET_PASSWORD(resetTargetUser.id), {
        newPassword,
      });
      alert(`Password successfully reset for ${resetTargetUser.name}!`);
      setIsResetPasswordModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.role === "SUPER ADMIN") {
      alert("Cannot delete the Super Admin account.");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete user "${user.name}" (NIK: ${user.employeeId})?`
      )
    ) {
      return;
    }

    try {
      await api.delete(API_ROUTES.USERS.BY_ID(user.id));
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.employeeId).includes(searchTerm) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              manage_accounts
            </span>
            User Account Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Super Admin Control Center: create and manage staff accounts, update roles, assign work center & areas, and reset user passwords.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          <span>Add New User</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, NIK, email, department..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="w-full md:w-56">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">All Roles</option>
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5">User Details</th>
                <th className="p-3.5">Employee ID (NIK)</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Last Updated</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-colors"
                    >
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {u.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-primary">
                        {u.employeeId}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === "SUPER ADMIN"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30"
                              : u.role === "ADMIN"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                              : u.role === "QUALITY CONTROL"
                              ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5">{u.department}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                              : "bg-rose-100 text-rose-700 dark:bg-rose-900/30"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {u.updatedAt
                          ? new Date(u.updatedAt).toLocaleString()
                          : "---"}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                            title="Update User Information"
                          >
                            <span className="material-symbols-outlined text-base">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleOpenResetModal(u)}
                            className="p-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                            title="Reset User Password"
                          >
                            <span className="material-symbols-outlined text-base">
                              key
                            </span>
                          </button>
                          {u.role !== "SUPER ADMIN" && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                              title="Delete User"
                            >
                              <span className="material-symbols-outlined text-base">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {userModalMode === "create"
                  ? "Create New User Account"
                  : `Update User: ${selectedUser?.name}`}
              </h3>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID (NIK)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.employeeId}
                    onChange={(e) =>
                      setFormData({ ...formData, employeeId: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Work Center
                  </label>
                  <select
                    value={formData.workCenterId}
                    onChange={(e) =>
                      setFormData({ ...formData, workCenterId: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {workCenters.map((wc) => (
                      <option key={wc.id} value={wc.id}>
                        {wc.name} ({wc.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Work Area
                  </label>
                  <select
                    value={formData.workAreaId}
                    onChange={(e) =>
                      setFormData({ ...formData, workAreaId: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {workAreas.map((wa) => (
                      <option key={wa.id} value={wa.id}>
                        {wa.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    disabled={selectedUser?.role === "SUPER ADMIN"}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {selectedUser?.role === "SUPER ADMIN" ? (
                      <option value="SUPER ADMIN">SUPER ADMIN (Single-seat Account)</option>
                    ) : (
                      ASSIGNABLE_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {userModalMode === "edit" ? (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Account Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Initial Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {userModalMode === "edit" && (
                <p className="text-[11px] text-slate-400 italic">
                  Note: Passwords cannot be edited here. Use the Key icon on the table to reset this user's password.
                </p>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">
                  key
                </span>
                Reset Password
              </h3>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleExecuteResetPassword} className="p-4 space-y-4">
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  Reset password for user{" "}
                  <strong className="text-slate-900 dark:text-white">
                    {resetTargetUser?.name}
                  </strong>{" "}
                  (NIK: {resetTargetUser?.employeeId})
                </p>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
