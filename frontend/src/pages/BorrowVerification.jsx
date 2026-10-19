import { useEffect, useState } from "react";
import ScannerModal from "../components/ScannerModal";
import { api } from "../lib/api";
import { API_ROUTES } from "../constants/routes";

const BorrowVerification = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [workCenters, setWorkCenters] = useState([]);
  const [workAreas, setWorkAreas] = useState([]);
  const [availableUnitsMap, setAvailableUnitsMap] = useState({});
  const [assignedUnits, setAssignedUnits] = useState({});

  const [referenceType, setReferenceType] = useState("Process Sheet");
  const [jidNo, setJidNo] = useState("");
  const [workCenterId, setWorkCenterId] = useState("");
  const [workAreaId, setWorkAreaId] = useState("");
  const [checkoutDate, setCheckoutDate] = useState(
    () => new Date().toISOString().slice(0, 16)
  );
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanTarget, setScanTarget] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, wcRes, waRes] = await Promise.all([
        api.get(API_ROUTES.BORROW.BASE),
        api.get(API_ROUTES.WORK_CENTERS.BASE),
        api.get(API_ROUTES.WORK_AREAS.BASE),
      ]);

      if (reqRes?.data) {
        const pending = reqRes.data.filter((r) => r.status === "PENDING");
        setRequests(pending);
      }
      if (wcRes?.data) {
        setWorkCenters(wcRes.data);
        if (wcRes.data.length > 0) setWorkCenterId(String(wcRes.data[0].id));
      }
      if (waRes?.data) {
        setWorkAreas(waRes.data);
        if (waRes.data.length > 0) setWorkAreaId(String(waRes.data[0].id));
      }
    } catch (err) {
      console.error("Failed to load counter data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = async (req) => {
    setSelectedRequest(req);
    setStatusMessage(null);
    setAssignedUnits({});

    try {
      const unitMap = {};
      const initialAssignments = {};

      for (const item of req.items) {
        const res = await api.get(`/api/inventory/tools/${item.toolTypeId}/units`);
        if (res?.data) {
          const readyUnits = res.data.filter((u) => u.status === "READY");
          unitMap[item.toolTypeId] = readyUnits;

          const preSelected = readyUnits
            .slice(0, item.requestedQty)
            .map((u) => u.id);
          initialAssignments[item.id] = preSelected;
        }
      }

      setAvailableUnitsMap(unitMap);
      setAssignedUnits(initialAssignments);
    } catch (err) {
      console.error("Failed to fetch available units for request:", err);
    }
  };

  const handleToggleUnit = (itemId, unitId, requestedQty) => {
    setAssignedUnits((prev) => {
      const current = prev[itemId] || [];
      if (current.includes(unitId)) {
        return { ...prev, [itemId]: current.filter((id) => id !== unitId) };
      } else {
        if (current.length >= requestedQty) {
          alert(`You can only assign ${requestedQty} unit(s) for this tool.`);
          return prev;
        }
        return { ...prev, [itemId]: [...current, unitId] };
      }
    });
  };

  const handleOpenScanner = (target) => {
    setScanTarget(target);
    setIsScannerOpen(true);
  };

  const handleScanComplete = (scannedCode) => {
    if (scanTarget === "jid") {
      setJidNo(scannedCode);
    }
    setIsScannerOpen(false);
    setScanTarget(null);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    if (!jidNo.trim()) {
      alert("Please enter or scan JID Number");
      return;
    }
    if (!workCenterId || !workAreaId) {
      alert("Please select Work Center and Work Area");
      return;
    }

    for (const item of selectedRequest.items) {
      const assigned = assignedUnits[item.id] || [];
      if (assigned.length !== item.requestedQty) {
        alert(
          `Please assign exactly ${item.requestedQty} unit(s) for ${item.toolType?.name || "tool"}. Currently assigned: ${assigned.length}`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        referenceType,
        jidNo: jidNo.trim(),
        workCenterId: Number(workCenterId),
        workAreaId: Number(workAreaId),
        checkoutDate: new Date(checkoutDate).toISOString(),
        expectedReturnDate: new Date(expectedReturnDate).toISOString(),
        itemAssignments: selectedRequest.items.map((item) => ({
          transactionItemId: String(item.id),
          toolUnitIds: assignedUnits[item.id] || [],
        })),
      };

      await api.post(`/api/borrow/${selectedRequest.id}/approve`, payload);

      setStatusMessage({
        type: "success",
        text: `Checkout approved successfully for Transaction #${selectedRequest.id}!`,
      });

      setSelectedRequest(null);
      setJidNo("");
      await loadData();
    } catch (err) {
      alert(err.message || "Failed to approve borrow checkout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                verified
              </span>
              Tool Crib Counter & Borrow Verification
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Storekeeper station: verify user requests, assign physical tool units, record JID and work area, and approve tool checkout.
            </p>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-primary transition-colors"
            title="Refresh requests"
          >
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-sm font-medium">{statusMessage.text}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Requests Queue */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Pending Requests</span>
            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
              {requests.length} Pending
            </span>
          </h3>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-3xl mb-1 text-slate-300 dark:text-slate-600">
                task_alt
              </span>
              <p className="text-sm">No pending borrow requests</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {requests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-sm"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary">
                        TX #{req.id}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {req.user?.name || "Requester"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        NIK: {req.user?.employeeId || "---"} • Dept: {req.user?.department || "---"}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-slate-600 dark:text-slate-300">
                        {req.program?.name}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                        {req.totalRequestedItems} units requested
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Counter Verification Station */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          {!selectedRequest ? (
            <div className="py-24 text-center text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2 text-slate-300 dark:text-slate-600">
                assignment_turned_in
              </span>
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Select a pending borrow request
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Choose a request from the queue to start counter verification and unit assignment.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Requester Info Card */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Requester Information
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedRequest.user?.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    NIK: {selectedRequest.user?.employeeId} • Program: {selectedRequest.program?.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 bg-primary/10 rounded">
                    TX #{selectedRequest.id}
                  </span>
                </div>
              </div>

              {/* Administrative Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Reference Type
                  </label>
                  <select
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Process Sheet">Process Sheet</option>
                    <option value="Work Order">Work Order</option>
                    <option value="Other Docs">Other Docs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    JID Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={jidNo}
                      onChange={(e) => setJidNo(e.target.value)}
                      placeholder="e.g. JID-2026-9901"
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenScanner("jid")}
                      className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                      title="Scan JID Barcode"
                    >
                      <span className="material-symbols-outlined text-lg">
                        barcode_scanner
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Work Center
                  </label>
                  <select
                    value={workCenterId}
                    onChange={(e) => setWorkCenterId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {workCenters.map((wc) => (
                      <option key={wc.id} value={wc.id}>
                        {wc.name} ({wc.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Work Area
                  </label>
                  <select
                    value={workAreaId}
                    onChange={(e) => setWorkAreaId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {workAreas.map((wa) => (
                      <option key={wa.id} value={wa.id}>
                        {wa.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Checkout Date
                  </label>
                  <input
                    type="datetime-local"
                    value={checkoutDate}
                    onChange={(e) => setCheckoutDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Expected Return Date
                  </label>
                  <input
                    type="datetime-local"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Physical Tool Unit Assignment */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Assign Physical Tool Units
                </h4>

                <div className="space-y-4">
                  {selectedRequest.items?.map((item) => {
                    const units = availableUnitsMap[item.toolTypeId] || [];
                    const assigned = assignedUnits[item.id] || [];
                    const isFullyAssigned = assigned.length === item.requestedQty;

                    return (
                      <div
                        key={item.id}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-850"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-mono font-bold text-primary">
                              {item.toolType?.toolNumber}
                            </span>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                              {item.toolType?.name}
                            </h5>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded ${
                              isFullyAssigned
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30"
                            }`}
                          >
                            Assigned: {assigned.length} / {item.requestedQty}
                          </span>
                        </div>

                        {units.length === 0 ? (
                          <p className="text-xs text-red-500 mt-2">
                            No physical units currently in READY status for this tool type!
                          </p>
                        ) : (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {units.map((unit) => {
                              const isChecked = assigned.includes(unit.id);
                              return (
                                <button
                                  key={unit.id}
                                  type="button"
                                  onClick={() =>
                                    handleToggleUnit(
                                      item.id,
                                      unit.id,
                                      item.requestedQty
                                    )
                                  }
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                                    isChecked
                                      ? "bg-primary text-white border-primary shadow-sm"
                                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-primary"
                                  }`}
                                >
                                  <span>SN-{unit.seqNo}</span>
                                  {isChecked && (
                                    <span className="material-symbols-outlined text-sm">
                                      check
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Checkout */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    check_circle
                  </span>
                  {isSubmitting ? "Processing..." : "Approve & Complete Checkout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {isScannerOpen && (
        <ScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScan={handleScanComplete}
        />
      )}
    </div>
  );
};

export default BorrowVerification;
