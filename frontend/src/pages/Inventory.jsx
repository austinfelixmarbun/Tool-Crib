import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const UNIT_STATUSES = [
  "READY",
  "BORROWED",
  "INSPECTION",
  "MAINTANANCE",
  "SCRAPPED",
];

const Inventory = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER ADMIN";
  const isQC = user?.role === "QUALITY CONTROL" || isAdmin;

  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [tools, setTools] = useState([]);
  const [expandedToolId, setExpandedToolId] = useState(null);
  const [toolUnitsMap, setToolUnitsMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [toolModalMode, setToolModalMode] = useState("create");
  const [activeTool, setActiveTool] = useState(null);
  const [toolFormData, setToolFormData] = useState({
    toolNumber: "",
    name: "",
    programId: "",
    description: "",
    qcPeriode: "",
    location: "",
  });

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [targetToolForUnit, setTargetToolForUnit] = useState(null);
  const [unitFormData, setUnitFormData] = useState({
    seqNo: "",
    status: "READY",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      loadTools(selectedProgramId);
    }
  }, [selectedProgramId]);

  const loadPrograms = async () => {
    try {
      const res = await api.get("/api/programs");
      if (res?.data) {
        setPrograms(res.data);
        if (res.data.length > 0) {
          setSelectedProgramId(String(res.data[0].id));
        }
      }
    } catch (err) {
      console.error("Failed to load programs:", err);
    }
  };

  const loadTools = async (progId) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/inventory/tools?programId=${progId}`);
      if (res?.data) {
        setTools(res.data);
      }
    } catch (err) {
      console.error("Failed to load tools:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUnitsForTool = async (toolId) => {
    try {
      const res = await api.get(`/api/inventory/tools/${toolId}/units`);
      if (res?.data) {
        setToolUnitsMap((prev) => ({ ...prev, [toolId]: res.data }));
      }
    } catch (err) {
      console.error("Failed to load units:", err);
    }
  };

  const handleToggleExpand = (toolId) => {
    if (expandedToolId === toolId) {
      setExpandedToolId(null);
    } else {
      setExpandedToolId(toolId);
      loadUnitsForTool(toolId);
    }
  };

  const handleOpenCreateToolModal = () => {
    setToolModalMode("create");
    setActiveTool(null);
    setToolFormData({
      toolNumber: "",
      name: "",
      programId: selectedProgramId,
      description: "",
      qcPeriode: "6",
      location: "Tool Crib 01",
    });
    setIsToolModalOpen(true);
  };

  const handleOpenEditToolModal = (t) => {
    setToolModalMode("edit");
    setActiveTool(t);
    setToolFormData({
      toolNumber: t.toolNumber,
      name: t.name,
      programId: String(t.programId),
      description: t.description,
      qcPeriode: t.qcPeriode ? String(t.qcPeriode) : "",
      location: t.location,
    });
    setIsToolModalOpen(true);
  };

  const handleSaveToolType = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        toolNumber: toolFormData.toolNumber.trim(),
        name: toolFormData.name.trim(),
        programId: Number(toolFormData.programId),
        description: toolFormData.description.trim() || undefined,
        qcPeriode: toolFormData.qcPeriode ? Number(toolFormData.qcPeriode) : undefined,
        location: toolFormData.location.trim(),
      };

      if (toolModalMode === "create") {
        await api.post("/api/inventory/tools", payload);
      } else {
        await api.patch(`/api/inventory/tools/${activeTool.id}`, payload);
      }

      setIsToolModalOpen(false);
      await loadTools(selectedProgramId);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteToolType = async (tool) => {
    if (!isAdmin) return;
    if (!confirm(`Delete tool type "${tool.name}" (${tool.toolNumber})?`)) return;

    try {
      await api.delete(`/api/inventory/tools/${tool.id}`);
      await loadTools(selectedProgramId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenAddUnit = (tool) => {
    setTargetToolForUnit(tool);
    setUnitFormData({
      seqNo: "",
      status: "READY",
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!unitFormData.seqNo.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post("/api/inventory/units", {
        toolId: targetToolForUnit.id,
        seqNo: unitFormData.seqNo.trim(),
        status: unitFormData.status,
      });

      setIsUnitModalOpen(false);
      await loadUnitsForTool(targetToolForUnit.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUnitStatus = async (unitId, newStatus, toolId) => {
    try {
      await api.patch(`/api/inventory/units/${unitId}/status`, {
        status: newStatus,
      });
      await loadUnitsForTool(toolId);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUnit = async (unitId, toolId) => {
    if (!confirm("Are you sure you want to delete this tool unit?")) return;
    try {
      await api.delete(`/api/inventory/units/${unitId}`);
      await loadUnitsForTool(toolId);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredTools = tools.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      t.toolNumber?.toLowerCase().includes(q) ||
      t.name?.toLowerCase().includes(q) ||
      t.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              inventory_2
            </span>
            Tool Inventory Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse tool types, check physical unit availability, and monitor calibration intervals (in months) with non-locking advisory badges.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateToolModal}
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">add_box</span>
            <span>Add Tool Type</span>
          </button>
        )}
      </div>

      {/* Program Selector & Search Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-72">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Aircraft Program
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Search Inventory
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-base">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by part number, name, or crib location..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Tools Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="p-3.5 w-10"></th>
                <th className="p-3.5">Part Number</th>
                <th className="p-3.5">Tool Name</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">QC Period</th>
                <th className="p-3.5">Advisory Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    Loading inventory...
                  </td>
                </tr>
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    No tools found in this program.
                  </td>
                </tr>
              ) : (
                filteredTools.map((t) => {
                  const isExpanded = expandedToolId === t.id;
                  const units = toolUnitsMap[t.id] || [];

                  return (
                    <React.Fragment key={t.id}>
                      <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-750 transition-colors">
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleExpand(t.id)}
                            className="p-1 text-slate-400 hover:text-primary transition-colors"
                            title="Expand tool units"
                          >
                            <span className="material-symbols-outlined text-base">
                              {isExpanded ? "expand_less" : "expand_more"}
                            </span>
                          </button>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-primary">
                          {t.toolNumber}
                        </td>
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {t.name}
                          </p>
                          {t.description && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {t.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5">{t.location}</td>
                        <td className="p-3.5">
                          {t.qcPeriode ? (
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {t.qcPeriode} months
                            </span>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {t.qcPeriode ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <span className="material-symbols-outlined text-[13px]">
                                notification_important
                              </span>
                              QC Advisory
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <span className="material-symbols-outlined text-[13px]">
                                check_circle
                              </span>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenAddUnit(t)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                              title="Add physical serial unit"
                            >
                              <span className="material-symbols-outlined text-base">
                                add_circle
                              </span>
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => handleOpenEditToolModal(t)}
                                  className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                  title="Edit tool type"
                                >
                                  <span className="material-symbols-outlined text-base">
                                    edit
                                  </span>
                                </button>
                                <button
                                  onClick={() => handleDeleteToolType(t)}
                                  className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded transition-colors"
                                  title="Delete tool type"
                                >
                                  <span className="material-symbols-outlined text-base">
                                    delete
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Serial Units Sub-table */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                          <td colSpan="7" className="p-4 pl-12">
                            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-800">
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                  Physical Serial Units ({units.length})
                                </h5>
                                <button
                                  onClick={() => handleOpenAddUnit(t)}
                                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    add
                                  </span>
                                  Add Unit
                                </button>
                              </div>

                              {units.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3 text-center">
                                  No physical units added yet. Click "+ Add Unit" above to add serial numbers.
                                </p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                  {units.map((u) => (
                                    <div
                                      key={u.id}
                                      className="p-2.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between"
                                    >
                                      <div>
                                        <p className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                                          SN-{u.seqNo}
                                        </p>
                                        <select
                                          value={u.status}
                                          onChange={(e) =>
                                            handleUpdateUnitStatus(
                                              u.id,
                                              e.target.value,
                                              t.id
                                            )
                                          }
                                          disabled={!isQC}
                                          className="mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
                                        >
                                          {UNIT_STATUSES.map((st) => (
                                            <option key={st} value={st}>
                                              {st}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {isAdmin && u.status !== "BORROWED" && (
                                        <button
                                          onClick={() =>
                                            handleDeleteUnit(u.id, t.id)
                                          }
                                          className="text-slate-400 hover:text-rose-500 p-1"
                                          title="Delete Unit"
                                        >
                                          <span className="material-symbols-outlined text-sm">
                                            close
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tool Type Modal */}
      {isToolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {toolModalMode === "create" ? "Add New Tool Type" : "Edit Tool Type"}
              </h3>
              <button
                onClick={() => setIsToolModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveToolType} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Tool Part Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TL-1001-A"
                  value={toolFormData.toolNumber}
                  onChange={(e) =>
                    setToolFormData({ ...toolFormData, toolNumber: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Tool Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Torque Wrench 20-100 Nm"
                  value={toolFormData.name}
                  onChange={(e) =>
                    setToolFormData({ ...toolFormData, name: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Crib Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rack A-02"
                    value={toolFormData.location}
                    onChange={(e) =>
                      setToolFormData({ ...toolFormData, location: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    QC Period (Months)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 6 or 12"
                    value={toolFormData.qcPeriode}
                    onChange={(e) =>
                      setToolFormData({ ...toolFormData, qcPeriode: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional tool specifications..."
                  value={toolFormData.description}
                  onChange={(e) =>
                    setToolFormData({ ...toolFormData, description: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsToolModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Tool"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Unit Modal */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Unit for {targetToolForUnit?.toolNumber}
              </h3>
              <button
                onClick={() => setIsUnitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="p-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Serial Number (Seq No)
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="e.g. 001, 002..."
                  value={unitFormData.seqNo}
                  onChange={(e) =>
                    setUnitFormData({ ...unitFormData, seqNo: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Initial Status
                </label>
                <select
                  value={unitFormData.status}
                  onChange={(e) =>
                    setUnitFormData({ ...unitFormData, status: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {UNIT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
