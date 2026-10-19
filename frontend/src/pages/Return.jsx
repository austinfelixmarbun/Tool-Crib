import React, { useState } from "react";
import { api } from "../lib/api";

const Return = () => {
  const [searchNik, setSearchNik] = useState("");
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchNik.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await api.get(`/api/return/active/${searchNik.trim()}`);
      if (res?.data) {
        setActiveBorrows(res.data);
        if (res.data.length === 0) {
          setStatusMessage({
            type: "info",
            text: `No active borrowed tool units found for Employee ID (NIK) ${searchNik}.`,
          });
        }
      }
      setSelectedUnits({});
    } catch (err) {
      alert(err.message);
      setActiveBorrows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUnit = (item) => {
    setSelectedUnits((prev) => {
      const current = prev[item.toolUnitId];
      if (current?.selected) {
        const next = { ...prev };
        delete next[item.toolUnitId];
        return next;
      }
      return {
        ...prev,
        [item.toolUnitId]: {
          selected: true,
          status: "RETURNED",
          notes: "",
          transactionId: item.transactionId,
        },
      };
    });
  };

  const handleStatusChange = (unitId, status) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        status,
      },
    }));
  };

  const handleNotesChange = (unitId, notes) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        notes,
      },
    }));
  };

  const handleProcessReturn = async () => {
    const selectedEntries = Object.entries(selectedUnits).filter(
      ([_, val]) => val.selected
    );

    if (selectedEntries.length === 0) {
      alert("Please select at least one borrowed tool unit to return.");
      return;
    }

    const groupsByTx = {};
    for (const [unitIdStr, data] of selectedEntries) {
      const unitId = Number(unitIdStr);
      if (!groupsByTx[data.transactionId]) {
        groupsByTx[data.transactionId] = [];
      }
      groupsByTx[data.transactionId].push({
        toolUnitId: unitId,
        status: data.status,
        returnNotes: data.notes.trim() || undefined,
      });
    }

    setIsSubmitting(true);
    try {
      for (const [txId, details] of Object.entries(groupsByTx)) {
        await api.post(`/api/return/${txId}`, { details });
      }

      setStatusMessage({
        type: "success",
        text: `Successfully processed return for ${selectedEntries.length} tool unit(s)!`,
      });

      await handleSearch();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCount = Object.values(selectedUnits).filter(
    (u) => u.selected
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            assignment_return
          </span>
          Tool Return Processing
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Search borrowed tools by Borrower Employee ID (NIK), perform unit-level physical inspection checkoff, and record condition status.
        </p>

        {statusMessage && (
          <div
            className={`mt-4 p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                : "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}
          >
            <span className="material-symbols-outlined">
              {statusMessage.type === "success" ? "check_circle" : "info"}
            </span>
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400">
              badge
            </span>
            <input
              type="text"
              value={searchNik}
              onChange={(e) => setSearchNik(e.target.value)}
              placeholder="Enter Borrower Employee ID (NIK)..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchNik.trim()}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">search</span>
            {isLoading ? "Searching..." : "Find Active Borrows"}
          </button>
        </form>
      </div>

      {/* Borrowed Units Table */}
      {activeBorrows.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Borrowed Units ({activeBorrows.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check off items being returned and inspect condition
              </p>
            </div>

            <button
              type="button"
              onClick={handleProcessReturn}
              disabled={isSubmitting || selectedCount === 0}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">
                assignment_turned_in
              </span>
              {isSubmitting ? "Processing..." : `Process Return (${selectedCount})`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 w-10 text-center">Select</th>
                  <th className="p-3">Tool Part No</th>
                  <th className="p-3">Serial No</th>
                  <th className="p-3">Tool Name</th>
                  <th className="p-3">JID Reference</th>
                  <th className="p-3">Expected Return</th>
                  <th className="p-3">Condition Status</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                {activeBorrows.map((item) => {
                  const unitState = selectedUnits[item.toolUnitId];
                  const isChecked = Boolean(unitState?.selected);

                  return (
                    <tr
                      key={item.toolUnitId}
                      className={
                        isChecked
                          ? "bg-primary/5 dark:bg-primary/10"
                          : "hover:bg-slate-50/50 dark:hover:bg-slate-750"
                      }
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleUnit(item)}
                          className="w-4 h-4 text-primary rounded border-slate-300 dark:border-slate-600 focus:ring-primary"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-primary">
                        {item.toolNumber}
                      </td>
                      <td className="p-3 font-mono font-bold">
                        SN-{item.seqNo}
                      </td>
                      <td className="p-3 font-medium text-slate-900 dark:text-white">
                        {item.toolName}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {item.jidNo}
                      </td>
                      <td className="p-3 text-slate-500">
                        {item.expectedReturnDate
                          ? new Date(item.expectedReturnDate).toLocaleDateString()
                          : "---"}
                      </td>
                      <td className="p-3">
                        <select
                          disabled={!isChecked}
                          value={unitState?.status}
                          onChange={(e) =>
                            handleStatusChange(item.toolUnitId, e.target.value)
                          }
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                        >
                          <option value="RETURNED">RETURNED (Good)</option>
                          <option value="BROKEN">BROKEN (Maintenance)</option>
                          <option value="LOST">LOST (Scrapped)</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          disabled={!isChecked}
                          placeholder="Condition remarks..."
                          value={unitState?.notes}
                          onChange={(e) =>
                            handleNotesChange(item.toolUnitId, e.target.value)
                          }
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Return;
