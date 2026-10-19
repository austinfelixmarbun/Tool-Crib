import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ROUTES, APP_ROUTES } from "../constants/routes";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const Borrow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [toolTypes, setToolTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTools, setSelectedTools] = useState([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get(API_ROUTES.PROGRAMS.BASE);
        if (res?.data) {
          setPrograms(res.data);
          if (res.data.length > 0) {
            setSelectedProgramId(String(res.data[0].id));
          }
        }
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      }
    };
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (!selectedProgramId) return;
    const fetchTools = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `${API_ROUTES.INVENTORY.TOOLS}?programId=${selectedProgramId}`,
        );
        if (res?.data) {
          setToolTypes(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch tools:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTools();
  }, [selectedProgramId]);

  const filteredTools = useMemo(() => {
    if (!searchQuery) return toolTypes;
    const q = searchQuery.toLowerCase();
    return toolTypes.filter(
      (t) =>
        t.toolNumber?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q),
    );
  }, [toolTypes, searchQuery]);

  const handleAddTool = (tool) => {
    setSelectedTools((prev) => {
      const exists = prev.find((item) => item.id === tool.id);
      if (exists) {
        return prev.map((item) =>
          item.id === tool.id
            ? { ...item, requestedQty: item.requestedQty + 1 }
            : item,
        );
      }
      return [...prev, { ...tool, requestedQty: 1 }];
    });
  };

  const handleUpdateQty = (toolId, qty) => {
    const validQty = Math.max(1, parseInt(qty, 10) || 1);
    setSelectedTools((prev) =>
      prev.map((item) =>
        item.id === toolId ? { ...item, requestedQty: validQty } : item,
      ),
    );
  };

  const handleRemoveTool = (toolId) => {
    setSelectedTools((prev) => prev.filter((item) => item.id !== toolId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgramId) {
      alert("Please select a program");
      return;
    }
    if (selectedTools.length === 0) {
      alert("Please select at least one tool type");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const payload = {
        programId: Number(selectedProgramId),
        notes: notes.trim() || undefined,
        items: selectedTools.map((t) => ({
          toolTypeId: t.id,
          requestedQty: t.requestedQty,
        })),
      };

      const res = await api.post(API_ROUTES.BORROW.BASE, payload);
      setSuccessMessage(
        "Borrow request submitted successfully! Please proceed to the Tool Crib counter for verification and tool pickup.",
      );
      setSelectedTools([]);
      setNotes("");

      setTimeout(() => {
        navigate(APP_ROUTES.DASHBOARD);
      }, 2500);
    } catch (err) {
      alert(err.message || "Failed to submit borrow request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Tool Borrow Request
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Select aircraft program, choose required tool types and quantities.
          Administrative details and physical tool unit assignment will be
          verified at the counter by the Tool Crib Storekeeper.
        </p>

        {successMessage && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">
              check_circle
            </span>
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Aircraft Program
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {programs.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Search Tools
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by part number, name..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Available Tool Types
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filteredTools.length} tools available
              </span>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-slate-400">
                Loading tools...
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                No tools found for this program.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                {filteredTools.map((tool) => {
                  const isSelected = selectedTools.some(
                    (t) => t.id === tool.id,
                  );
                  return (
                    <div
                      key={tool.id}
                      className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850 hover:border-primary/50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">
                            {tool.toolNumber}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Loc: {tool.location || "Crib"}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                          {tool.name}
                        </h4>
                        {tool.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {tool.description}
                          </p>
                        )}
                        {tool.qcPeriode && (
                          <span className="inline-block mt-2 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                            QC Interval: {tool.qcPeriode} mo
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleAddTool(tool)}
                          className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">
                            add
                          </span>
                          {isSelected ? "Add Another" : "Select Tool"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between min-h-[400px]"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    shopping_basket
                  </span>
                  Requested Tools
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {selectedTools.reduce((s, t) => s + t.requestedQty, 0)} Units
                </span>
              </div>

              {selectedTools.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300 dark:text-slate-600">
                    handyman
                  </span>
                  <p className="text-sm">No tools selected yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Select tool types from catalog
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/60 my-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-mono font-bold text-primary">
                          {tool.toolNumber}
                        </p>
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {tool.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={tool.requestedQty}
                          onChange={(e) =>
                            handleUpdateQty(tool.id, e.target.value)
                          }
                          className="w-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-center text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTool(tool.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <span className="material-symbols-outlined text-base">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Request Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. For routine structural inspection, Station 3..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
              <button
                type="submit"
                disabled={isSubmitting || selectedTools.length === 0}
                className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">send</span>
                {isSubmitting ? "Submitting..." : "Submit Borrow Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Borrow;
