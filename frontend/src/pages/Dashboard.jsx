import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { dashboardService } from "../services/dashboardService";
import { inventoryService } from "../services/inventoryService";
import { workCentersService } from "../services/workCentersService";

const Dashboard = () => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);

  const [logs, setLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [apiStats, setApiStats] = useState(null);
  const [movementData, setMovementData] = useState({
    fastMoving: [],
    slowMoving: [],
  });
  const [workCenters, setWorkCenters] = useState([]);

  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [groupBy, setGroupBy] = useState("none");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          statsResponse,
          transactionsResponse,
          inventoryResponse,
          auditResponse,
          movementResponse,
          workCentersResponse,
        ] = await Promise.allSettled([
          dashboardService.getStats(),
          dashboardService.getTransactions({ limit: 100 }),
          inventoryService.getAll({ limit: 1000 }),
          dashboardService.getAuditLogs({ limit: 100 }),
          dashboardService.getMovement(),
          workCentersService.getAll(),
        ]);

        console.log("DASHBOARD STATS RAW:", statsResponse);

        if (statsResponse.status === "fulfilled") {
          const statsData = statsResponse.value?.data ?? statsResponse.value;
          console.log("SETTING API STATS:", statsData);
          setApiStats(statsData);
        }

        const formatDateForTable = (dateString) => {
          if (!dateString) return "-";
          try {
            const date = new Date(dateString);

            return (
              date.toLocaleDateString("en-GB") +
              " " +
              date.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })
            );
          } catch (e) {
            return dateString;
          }
        };

        let fetchedWorkCenters = [];
        const rawWcPayload =
          workCentersResponse.status === "fulfilled"
            ? (workCentersResponse.value?.data ?? workCentersResponse.value)
            : null;
        const rawWc = Array.isArray(rawWcPayload)
          ? rawWcPayload
          : rawWcPayload?.workCenters || rawWcPayload?.data || rawWcPayload;
        if (Array.isArray(rawWc)) {
          fetchedWorkCenters = rawWc;
          setWorkCenters(fetchedWorkCenters);
        }

        const rawTxPayload =
          transactionsResponse.status === "fulfilled"
            ? (transactionsResponse.value?.data ?? transactionsResponse.value)
            : null;
        const rawTx = Array.isArray(rawTxPayload)
          ? rawTxPayload
          : rawTxPayload?.transactions || rawTxPayload?.data || rawTxPayload;
        if (Array.isArray(rawTx)) {
          const apiLogs = rawTx.map((t, i) => {
            let status = t.status || "Active";
            if (status === "Borrowed" || status === "APPROVED")
              status = "Active";
            if (status === "Returned" || status === "RETURNED")
              status = "Returned";

            const checkoutDate = t.checkoutDate || t.createdAt || "";
            const dueDate =
              t.expectedReturnDate ||
              t.dueDate ||
              t.checkoutDate ||
              t.createdAt ||
              "";
            const returnDate = t.returnDate || null;

            const rawWC =
              t.workCenter?.name ||
              t.borrowRequest?.workCenterArea ||
              t.location ||
              "N/A";
            const wcMatch = fetchedWorkCenters.find(
              (w) => w.name === rawWC || String(w.id) === String(rawWC),
            );
            const displayWCCode = wcMatch ? wcMatch.code || wcMatch.id : rawWC;

            const firstTool =
              t.items?.[0]?.toolType ||
              t.inventoryItem ||
              t.details?.[0]?.toolUnit?.tool;

            return {
              no: i + 1,
              partId:
                firstTool?.toolNumber ||
                t.inventoryItem?.toolNumber ||
                `TX-${t.id}`,
              toolId: firstTool?.toolNumber || `TX-${t.id}`,
              toolName:
                firstTool?.name || t.inventoryItem?.toolName,
              userId: t.user?.employeeId || t.borrower?.employeeId,
              userName: t.user?.name || t.borrower?.name,
              jid: t.jidNo || t.borrowRequest?.jidNo,
              nik: String(t.user?.employeeId || t.borrower?.employeeId),
              workCenter: displayWCCode,
              workArea:
                t.workArea?.name || t.borrowRequest?.workingArea,
              refTitle: t.referenceType || t.borrowRequest?.refTitle,
              checkout: checkoutDate,
              dueDate: dueDate,
              returnDate: returnDate,
              formattedCheckout: formatDateForTable(checkoutDate),
              formattedDueDate: formatDateForTable(dueDate),
              status: status,
              overdueDays: 0,
              movement: "Fast",
            };
          });
          setLogs(apiLogs);
        } else {
          const stored = localStorage.getItem("transactionLogs");
          if (stored) setLogs(JSON.parse(stored));
        }

        let fetchedInventory = [];
        const rawInvPayload =
          inventoryResponse.status === "fulfilled"
            ? (inventoryResponse.value?.data ?? inventoryResponse.value)
            : null;
        const rawInv = Array.isArray(rawInvPayload)
          ? rawInvPayload
          : rawInvPayload?.items || rawInvPayload?.data || rawInvPayload;
        if (Array.isArray(rawInv)) {
          fetchedInventory = rawInv;
          setInventory(fetchedInventory);
        } else {
          const stored = localStorage.getItem("inventoryItems");
          if (stored) fetchedInventory = JSON.parse(stored);
          setInventory(fetchedInventory);
        }

        let rawAuditLogs = [];
        if (auditResponse.status === "fulfilled") {
          const auditPayload = auditResponse.value?.data ?? auditResponse.value;
          if (auditPayload?.auditLogs) {
            rawAuditLogs = auditPayload.auditLogs;
          } else if (Array.isArray(auditPayload)) {
            rawAuditLogs = auditPayload;
          }
        }
        if (rawAuditLogs.length === 0) {
          const stored = localStorage.getItem("auditLogs");
          if (stored) rawAuditLogs = JSON.parse(stored);
        }

        if (rawAuditLogs.length > 0) {
          const apiAuditLogs = rawAuditLogs.map((log) => {
            const item = fetchedInventory.find(
              (i) => String(i.id) === String(log.entityId),
            );

            let displayToolName = item
              ? item.toolName
              : log.action === "DELETE"
                ? "Deleted Item"
                : "Unknown Tool";
            let displayToolId = item ? item.toolNumber : log.entityId;

            try {
              if (
                typeof displayToolName === "string" &&
                (displayToolName.trim().startsWith("[") ||
                  displayToolName.trim().startsWith("{"))
              ) {
                const parsed = JSON.parse(displayToolName);
                if (
                  Array.isArray(parsed) &&
                  parsed.length > 0 &&
                  parsed[0]?.toolName
                ) {
                  displayToolName =
                    parsed[0].toolName +
                    (parsed.length > 1 ? ` (+${parsed.length - 1} more)` : "");
                  if (parsed[0].toolNumber)
                    displayToolId = parsed[0].toolNumber;
                } else if (parsed.toolName) {
                  displayToolName = parsed.toolName;
                  if (parsed.toolNumber) displayToolId = parsed.toolNumber;
                }
              }
            } catch (e) {}

            return {
              id: log.id,
              timestamp: log.timestamp,
              action: log.action,
              toolName: displayToolName,
              toolId: displayToolId,

              userId:
                log.user && log.user.name
                  ? log.user.name
                  : log.userName || log.userId,
              userRole: log.user && log.user.role ? log.user.role : "Unknown",
              field: log.field,
              oldValue: log.oldValue ?? "-",
              newValue: log.newValue ?? "-",
              reason: log.reason ?? "-",
            };
          });
          setAuditLogs(apiAuditLogs);
        }

        if (movementResponse.status === "fulfilled") {
          const movPayload =
            movementResponse.value?.data ?? movementResponse.value;
          if (movPayload) {
            const normArr = (arr) =>
              (arr || []).map((t) => ({
                name: t.name || t.toolName,
                count: t.count ?? t.turnover ?? 0,
                code: t.code || t.partNumber,
              }));
            setMovementData({
              fastMoving: normArr(movPayload.fastMoving),
              slowMoving: normArr(movPayload.slowMoving),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        const storedLogs = localStorage.getItem("transactionLogs");
        const storedInventory = localStorage.getItem("inventoryItems");
        const storedAudit = localStorage.getItem("auditLogs");
        if (storedLogs) setLogs(JSON.parse(storedLogs));
        if (storedInventory) setInventory(JSON.parse(storedInventory));
        if (storedAudit) setAuditLogs(JSON.parse(storedAudit));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const dashboardStats = useMemo(() => {
    const active = logs.filter((l) => l.status === "Active");
    const overdue = logs.filter((l) => l.status === "Overdue");
    const today = new Date().toISOString().split("T")[0];
    const dueToday = active.filter(
      (l) => l.dueDate && String(l.dueDate).startsWith(today),
    );

    return {
      borrowed: apiStats?.borrowed ?? active.length,
      dueToday: apiStats?.dueToday ?? dueToday.length,
      overdue: apiStats?.overdue ?? overdue.length,
      pendingRequests: apiStats?.pendingRequests ?? 0,
    };
  }, [logs, apiStats]);

  const dashboardRecent = useMemo(() => {
    return logs.slice(0, 5);
  }, [logs]);

  const digitalization = useMemo(() => {
    const totalTools = inventory.length;
    return {
      current: totalTools,
    };
  }, [inventory]);

  const displayedAuditLogs = useMemo(() => {
    if (user?.role === "Quality Control") {
      return auditLogs.filter((log) => log.userRole === "Quality Control");
    }
    return auditLogs;
  }, [auditLogs, user]);

  const [reportType, setReportType] = useState("all");

  const [exportStatus, setExportStatus] = useState("idle");
  const [searchParams] = useSearchParams();
  const [selectedPartId, setSelectedPartId] = useState("all");

  const uniquePartIds = useMemo(() => {
    const parts = logs.map((item) => item.partId);
    return ["all", ...new Set(parts)];
  }, [logs]);

  const [columnFilters, setColumnFilters] = useState({
    partId: searchParams.get("partId") ?? "",
    toolId: "",
    userId: "",
    nik: "",
    workCenter: "",
    workArea: "",
    refTitle: "",
    status: "all",
    checkout: "",
    dueDate: "",

    movement: "all",
  });

  useEffect(() => {
    const partId = searchParams.get("partId");
    if (partId !== null) {
      setColumnFilters((prev) => ({ ...prev, partId }));
    }
  }, [searchParams]);

  const filteredData = useMemo(() => {
    return logs.filter((item) => {
      if (selectedPartId !== "all" && item.partId !== selectedPartId)
        return false;

      const checkoutDate = item.checkout ? String(item.checkout) : "";
      const itemYear = checkoutDate.substring(0, 4);
      const itemMonth = checkoutDate.substring(5, 7);

      if (selectedYear !== "all" && itemYear !== selectedYear) return false;
      if (selectedMonth !== "all" && itemMonth !== selectedMonth) return false;

      if (
        reportType !== "all" &&
        reportType !== "transaction" &&
        reportType !== "audit"
      ) {
        if (reportType === "active" && item.status !== "Active") return false;
        if (reportType === "returned" && item.status !== "Returned")
          return false;
        if (reportType === "overdue" && item.status !== "Overdue") return false;
      }

      if (
        columnFilters.partId &&
        !(item.partId || "")
          .toLowerCase()
          .includes(columnFilters.partId.toLowerCase())
      )
        return false;
      if (columnFilters.toolId) {
        const term = columnFilters.toolId.toLowerCase();
        if (
          !(item.toolId || "").toLowerCase().includes(term) &&
          !(item.toolName || "").toLowerCase().includes(term)
        )
          return false;
      }
      if (columnFilters.userId) {
        const term = columnFilters.userId.toLowerCase();
        if (
          !(item.userId || "").toLowerCase().includes(term) &&
          !(item.userName || "").toLowerCase().includes(term)
        )
          return false;
      }
      if (
        columnFilters.nik &&
        !(item.nik || "")
          .toLowerCase()
          .includes(columnFilters.nik.toLowerCase())
      )
        return false;
      if (
        columnFilters.workCenter &&
        !(item.workCenter || "")
          .toLowerCase()
          .includes(columnFilters.workCenter.toLowerCase())
      )
        return false;
      if (
        columnFilters.workArea &&
        !(item.workArea || "")
          .toLowerCase()
          .includes(columnFilters.workArea.toLowerCase())
      )
        return false;
      if (
        columnFilters.refTitle &&
        !(item.refTitle || "")
          .toLowerCase()
          .includes(columnFilters.refTitle.toLowerCase())
      )
        return false;
      if (
        columnFilters.status !== "all" &&
        item.status !== columnFilters.status
      )
        return false;
      if (
        columnFilters.checkout &&
        !(item.checkout || "")
          .toLowerCase()
          .includes(columnFilters.checkout.toLowerCase())
      )
        return false;
      if (
        columnFilters.dueDate &&
        !(item.dueDate || "")
          .toLowerCase()
          .includes(columnFilters.dueDate.toLowerCase())
      )
        return false;
      if (
        columnFilters.returnDate &&
        !(item.returnDate || "")
          .toLowerCase()
          .includes(columnFilters.returnDate.toLowerCase())
      )
        return false;
      if (
        columnFilters.movement !== "all" &&
        item.movement !== columnFilters.movement
      )
        return false;

      return true;
    });
  }, [
    columnFilters,
    reportType,
    selectedPartId,
    logs,
    selectedYear,
    selectedMonth,
  ]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [currentPage, itemsPerPage, filteredData]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const reportingStats = useMemo(() => {
    const periodData = logs.filter((item) => {
      const checkoutDate = item.checkout ? String(item.checkout) : "";
      const itemYear = checkoutDate.substring(0, 4);
      const itemMonth = checkoutDate.substring(5, 7);

      if (selectedYear !== "all" && itemYear !== selectedYear) return false;
      if (selectedMonth !== "all" && itemMonth !== selectedMonth) return false;
      return true;
    });

    const statusCounts = periodData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: periodData.length,
      statusCounts: statusCounts,
    };
  }, [logs, selectedMonth, selectedYear]);

  const chartData = useMemo(() => {
    if (selectedMonth === "all") {
      const monthlyCounts = new Array(12).fill(0);
      logs.forEach((item) => {
        const checkoutDate = item.checkout ? String(item.checkout) : "";
        const itemYear = checkoutDate.substring(0, 4);
        const itemMonth = parseInt(checkoutDate.substring(5, 7), 10);

        if (selectedYear === "all" || itemYear === selectedYear) {
          if (!isNaN(itemMonth) && itemMonth >= 1 && itemMonth <= 12) {
            monthlyCounts[itemMonth - 1]++;
          }
        }
      });
      return monthlyCounts;
    }

    const daysInMonth = 31;
    const dailyCounts = new Array(daysInMonth).fill(0);
    logs.forEach((item) => {
      const checkoutStr = item.checkout ? String(item.checkout) : "";
      const itemYear = checkoutStr.substring(0, 4);
      const itemMonth = checkoutStr.substring(5, 7);
      const itemDay = parseInt(checkoutStr.substring(8, 10), 10);

      if (
        (selectedYear === "all" || itemYear === selectedYear) &&
        itemMonth === selectedMonth
      ) {
        if (itemDay > 0 && itemDay <= daysInMonth) dailyCounts[itemDay - 1]++;
      }
    });
    return dailyCounts;
  }, [logs, selectedMonth, selectedYear]);

  const handleColumnFilterChange = (key, value) =>
    setColumnFilters((prev) => ({ ...prev, [key]: value }));

  const getStatusColor = (status) => {
    switch (status) {
      case "Returned":
        return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      case "Active":
        return "bg-blue-50 text-blue-700 ring-blue-700/10";
      case "Overdue":
        return "bg-red-50 text-red-700 ring-red-600/10";
      default:
        return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

  const getReportingCardClass = (type) => {
    const base =
      "rounded-xl border p-5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md";
    const activeRing =
      "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 shadow-lg";
    const isActive = reportType === type;

    if (type === "transaction")
      return `${base} border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a202c] ${isActive ? activeRing : ""}`;
    if (type === "active")
      return `${base} border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 ${isActive ? activeRing : ""}`;
    if (type === "returned")
      return `${base} border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 ${isActive ? activeRing : ""}`;
    if (type === "overdue")
      return `${base} border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 ${isActive ? activeRing : ""}`;
    if (type === "audit")
      return `${base} border-purple-100 dark:border-purple-900/30 bg-purple-50/50 dark:bg-purple-900/10 ${isActive ? activeRing : ""}`;
  };

  const renderLogValue = (val) => {
    if (
      typeof val === "string" &&
      (val.trim().startsWith("[") || val.trim().startsWith("{"))
    ) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.toolName) {
          return (
            parsed[0].toolName +
            (parsed.length > 1 ? ` (+${parsed.length - 1})` : "")
          );
        }
        if (parsed.toolName) return parsed.toolName;
      } catch (e) {}
    }

    if (typeof val === "object" && val !== null) {
      if (Array.isArray(val) && val.length > 0 && val[0]?.toolName) {
        return (
          val[0].toolName + (val.length > 1 ? ` (+${val.length - 1})` : "")
        );
      }

      if (val.toolName) return val.toolName;

      return JSON.stringify(val);
    }
    return val;
  };

  const toggleReportType = (type) =>
    setReportType((prev) => (prev === type ? "all" : type));

  const handleExportExcel = () => {
    setExportStatus("exporting");
    const exportData = filteredData.map((item) => ({
      No: item.no,
      "Part ID": item.partId,
      "Tool ID": item.toolId,
      "Tool Name": item.toolName,
      "User ID": item.userId,
      "User Name": item.userName,
      "Work Center Code": item.workCenter,
      "Work Area": item.workArea,
      Reference: item.refTitle,
      "Check Out": item.checkout,
      "Due Date": item.dueDate,
      Movement: item.movement,
      Status: item.status,
    }));

    setTimeout(() => {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reports");
      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `ToolCrib_Report_${date}.xlsx`);
      setExportStatus("success");
      setTimeout(() => setExportStatus("idle"), 2000);
    }, 500);
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* =====================================================================================

               ===================================================================================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Requests Card */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl border border-orange-200 dark:border-orange-900/30 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px] text-orange-500">
              pending_actions
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <p className="text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Pending Requests
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {dashboardStats.pendingRequests || 0}
              </p>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                requests
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">
              Waiting for admin approval
            </p>
          </div>
        </div>

        {/* Active Borrowed Card */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px] text-primary">
              inventory_2
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Active Borrowed
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {dashboardStats.borrowed}
              </p>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                items
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">
              Currently out in production
            </p>
          </div>
        </div>

        {/* Due Today Card */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px] text-sky-500">
              event
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Due Today
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {dashboardStats.dueToday}
              </p>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                items
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">
              Expected back by end of shift
            </p>
          </div>
        </div>

        {/* Overdue Card */}
        <div className="bg-white dark:bg-[#161b22] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[100px] text-red-500">
              warning
            </span>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                Overdue
              </p>
              {dashboardStats.overdue > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                {dashboardStats.overdue}
              </p>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                items
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">
              Requires follow-up
            </p>
          </div>
        </div>
      </section>

      {/* Total Tools Registered Card */}
      <section className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">
              Total Tools Registered
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time status of tool inventory registration.
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-black text-primary">
              {digitalization.current.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-400 ml-2">TOOLS</span>
          </div>
        </div>
      </section>

      {/* Tool Movement Analytics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fast Moving */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-orange-500">
              local_fire_department
            </span>
            Fast Moving Tools
          </h3>
          <div className="flex flex-col gap-3">
            {movementData.fastMoving.length > 0 ? (
              movementData.fastMoving.map((tool, idx) => (
                <div
                  key={idx}
                  className="relative"
                >
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">
                      {tool.name}{" "}
                    </span>
                    <span className="text-slate-500">{tool.count} Borrows</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                      style={{
                        width: `${(tool.count / Math.max(...movementData.fastMoving.map((m) => m.count), 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {tool.code}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">
                No data available.
              </p>
            )}
          </div>
        </div>

        {/* Slow Moving */}
        <div className="bg-white dark:bg-[#161b22] rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-blue-400">
              ac_unit
            </span>
            Slow Moving Tools
          </h3>
          <div className="flex flex-col gap-3">
            {movementData.slowMoving.length > 0 ? (
              movementData.slowMoving.map((tool, idx) => (
                <div
                  key={idx}
                  className="relative"
                >
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-700 dark:text-slate-300">
                      {tool.name}
                    </span>
                    <span className="text-slate-500">{tool.count} Borrows</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400"
                      style={{
                        width: `${Math.max((tool.count / Math.max(...movementData.fastMoving.map((m) => m.count), 1)) * 100, 2)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {tool.code}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 italic">
                No data available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity (Original Dashboard Table) */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Recent Activity
          </h2>
          <button
            onClick={() =>
              document
                .getElementById("reporting-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-xs font-black text-primary hover:text-blue-700 uppercase tracking-widest transition-colors flex items-center gap-1"
          >
            View Full Analytics
            <span className="material-symbols-outlined text-[16px]">
              arrow_downward
            </span>
          </button>
        </div>
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Transaction
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Action
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Personnel
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {dashboardRecent.length > 0 ? (
                  dashboardRecent.map((activity, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[20px]">
                              handyman
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                              {activity.partId}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono uppercase">
                              {activity.toolName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            activity.status === "Active"
                              ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
                              : "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${activity.status === "Active" ? "bg-blue-500" : "bg-emerald-500"}`}
                          ></span>
                          {activity.status === "Active"
                            ? "Borrowed"
                            : "Returned"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-slate-400">
                              person
                            </span>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {activity.userName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right text-[10px] text-slate-500 font-mono font-bold">
                        {activity.checkout
                          ? new Date(activity.checkout).toLocaleTimeString(
                              "en-GB",
                              { hour: "2-digit", minute: "2-digit" },
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-20 text-center text-slate-400"
                    >
                      <p className="font-bold">No recent activity found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SEPARATOR */}
      <div
        className="flex items-center gap-4 my-8"
        id="reporting-section"
      >
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Detailed Analytics & Reports
        </span>
        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
      </div>

      {/* =====================================================================================

               ===================================================================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-500">
        <div
          onClick={() => toggleReportType("transaction")}
          className={getReportingCardClass("transaction")}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Items
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {reportingStats.total}
            </h3>
            <div className="h-10 w-24 flex items-end gap-1">
              <div className="w-1/3 bg-slate-200 dark:bg-slate-700 h-[40%] rounded-t-sm"></div>
              <div className="w-1/3 bg-slate-300 dark:bg-slate-600 h-[70%] rounded-t-sm"></div>
              <div className="w-1/3 bg-primary h-[100%] rounded-t-sm"></div>
            </div>
          </div>
        </div>

        <div
          onClick={() => toggleReportType("active")}
          className={getReportingCardClass("active")}
        >
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
            Active Borrowed
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-blue-700 dark:text-blue-300">
              {reportingStats.statusCounts["Active"] || 0}
            </h3>
            <div className="h-2 w-full max-w-[100px] bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{
                  width: `${((reportingStats.statusCounts["Active"] || 0) / reportingStats.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div
          onClick={() => toggleReportType("returned")}
          className={getReportingCardClass("returned")}
        >
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
            Returned
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
              {reportingStats.statusCounts["Returned"] || 0}
            </h3>
            <div className="h-2 w-full max-w-[100px] bg-emerald-200 dark:bg-emerald-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${((reportingStats.statusCounts["Returned"] || 0) / reportingStats.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div
          onClick={() => toggleReportType("overdue")}
          className={getReportingCardClass("overdue")}
        >
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
            Overdue
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-red-700 dark:text-red-300">
              {reportingStats.statusCounts["Overdue"] || 0}
            </h3>
            <div className="h-2 w-full max-w-[100px] bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${((reportingStats.statusCounts["Overdue"] || 0) / reportingStats.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div
          onClick={() => toggleReportType("audit")}
          className={getReportingCardClass("audit")}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Update Logs
          </p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {displayedAuditLogs.length}
            </h3>
            <div className="h-10 w-24 flex items-end gap-1">
              <div className="w-1/3 bg-purple-200 dark:bg-purple-700 h-[30%] rounded-t-sm"></div>
              <div className="w-1/3 bg-purple-300 dark:bg-purple-600 h-[50%] rounded-t-sm"></div>
              <div className="w-1/3 bg-purple-500 h-[80%] rounded-t-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {reportType === "audit" && (
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-500">
                history
              </span>
              Inventory Update History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Time
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Action
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Tool
                  </th>
                  <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    User
                  </th>
                  {user?.role !== "Quality Control" && (
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Details
                    </th>
                  )}
                  {user?.role !== "Quality Control" && (
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Reason
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {displayedAuditLogs.length > 0 ? (
                  displayedAuditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-xs font-mono text-slate-500">
                        {log.timestamp
                          ? new Date(log.timestamp).toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                            log.action === "CREATE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10"
                              : log.action === "UPDATE"
                                ? "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10"
                                : "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10"
                          }`}
                        >
                          {renderLogValue(log.action)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {renderLogValue(log.toolName)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {renderLogValue(log.toolId)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {renderLogValue(log.userId)}
                        </span>
                      </td>
                      {user?.role !== "Quality Control" && (
                        <td className="py-4 px-6 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[10px] uppercase text-slate-400">
                              {renderLogValue(log.field)}:
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                              {log.oldValue && log.oldValue !== "-" && (
                                <>
                                  <span
                                    className="line-through text-red-400 opacity-70 max-w-[150px] truncate"
                                    title={String(log.oldValue)}
                                  >
                                    {String(log.oldValue).startsWith("{")
                                      ? "JSON Data"
                                      : renderLogValue(log.oldValue)}
                                  </span>
                                  <span className="material-symbols-outlined text-[12px] text-slate-300">
                                    arrow_forward
                                  </span>
                                </>
                              )}
                              <span
                                className="font-bold text-emerald-600 dark:text-emerald-400 max-w-[150px] truncate"
                                title={String(log.newValue)}
                              >
                                {String(log.newValue).startsWith("{")
                                  ? "JSON Data"
                                  : renderLogValue(log.newValue)}
                              </span>
                            </div>
                          </div>
                        </td>
                      )}
                      {user?.role !== "Quality Control" && (
                        <td className="py-4 px-6 text-xs italic text-slate-500">
                          {renderLogValue(log.reason)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-8 text-center text-slate-400 text-sm"
                    >
                      No update history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Transaction Volume
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Daily transaction trends for the selected period.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All Months</option>
                <option value="01">January</option>
                <option value="02">February</option>
                <option value="03">March</option>
                <option value="04">April</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                calendar_month
              </span>
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 pr-10 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">All Years</option>
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                event
              </span>
            </div>
          </div>
        </div>

        <div className="h-[200px] w-full mt-2 relative group">
          <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
            {chartData.map((count, i) => {
              const maxCount = Math.max(...chartData, 5);
              const heightPercent = (count / maxCount) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full gap-2 group/bar"
                >
                  <div
                    className="w-full bg-primary/20 dark:bg-primary/10 rounded-t-sm transition-all duration-500 relative flex items-end"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  >
                    <div
                      className={`w-full bg-primary rounded-t-sm transition-all duration-300 ${count > 0 ? "opacity-100" : "opacity-0"}`}
                      style={{ height: "100%" }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                      {selectedMonth === "all"
                        ? `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i]}: ${count} tx`
                        : `Day ${i + 1}: ${count} tx`}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden sm:block">
                    {selectedMonth === "all"
                      ? [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ][i]
                      : i + 1}
                  </span>
                </div>
              );
            })}
          </div>
          {chartData.every((c) => c === 0) && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 rounded-lg">
              <p className="text-sm text-slate-500 font-medium">
                No transactions found for this period.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#161b22] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col min-h-[500px] transition-all duration-300">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Data Logs
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Group by:
              </span>
              <div className="relative">
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 pr-8 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[160px]"
                >
                  <option value="none">All Tools (Default)</option>
                  <option value="jid">JID No</option>
                  <option value="nik">NIK</option>
                  <option value="partId">Tool Number</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleExportExcel}
            disabled={exportStatus !== "idle"}
            className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
              exportStatus === "success"
                ? "text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg"
                : exportStatus === "exporting"
                  ? "text-primary opacity-70 cursor-wait"
                  : "text-primary hover:text-blue-700"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${exportStatus === "exporting" ? "animate-spin" : ""}`}
            >
              {exportStatus === "success"
                ? "check_circle"
                : exportStatus === "exporting"
                  ? "progress_activity"
                  : "download"}
            </span>
            {exportStatus === "success"
              ? "Downloaded!"
              : exportStatus === "exporting"
                ? "Generating..."
                : "Export Excel"}
          </button>
        </div>

        <div className="max-h-[600px] overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">
                  No
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  JID No
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  Tool ID
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tool (ID/Name)
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  User (ID/Name)
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  NIK
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  Work Center Code
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  Work Area
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  Ref
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
                  Check Out
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
                  Due Date
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[120px]">
                  Returned
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[100px]">
                  Movement
                </th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-24">
                  Status
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-gray-700">
                <th className="px-2 py-2"></th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Filter JID..."
                    value={columnFilters.jid || ""}
                    onChange={(e) =>
                      handleColumnFilterChange("jid", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Filter..."
                    value={columnFilters.partId}
                    onChange={(e) =>
                      handleColumnFilterChange("partId", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Search Tool..."
                    value={columnFilters.toolId}
                    onChange={(e) =>
                      handleColumnFilterChange("toolId", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Search User..."
                    value={columnFilters.userId}
                    onChange={(e) =>
                      handleColumnFilterChange("userId", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="NIK..."
                    value={columnFilters.nik}
                    onChange={(e) =>
                      handleColumnFilterChange("nik", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Code..."
                    value={columnFilters.workCenter}
                    onChange={(e) =>
                      handleColumnFilterChange("workCenter", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Area..."
                    value={columnFilters.workArea}
                    onChange={(e) =>
                      handleColumnFilterChange("workArea", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Ref..."
                    value={columnFilters.refTitle}
                    onChange={(e) =>
                      handleColumnFilterChange("refTitle", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Date..."
                    value={columnFilters.checkout}
                    onChange={(e) =>
                      handleColumnFilterChange("checkout", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Date..."
                    value={columnFilters.dueDate}
                    onChange={(e) =>
                      handleColumnFilterChange("dueDate", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <input
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                    placeholder="Date..."
                    value={columnFilters.returnDate || ""}
                    onChange={(e) =>
                      handleColumnFilterChange("returnDate", e.target.value)
                    }
                  />
                </th>
                <th className="px-2 py-2">
                  <select
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none appearance-none"
                    value={columnFilters.movement}
                    onChange={(e) =>
                      handleColumnFilterChange("movement", e.target.value)
                    }
                  >
                    <option value="all">All</option>
                    <option value="Fast">Fast Moving</option>
                    <option value="Slow">Slow Moving</option>
                  </select>
                </th>
                <th className="px-2 py-2 text-right">
                  <select
                    className="w-full h-8 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1a202c] rounded px-2 focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none appearance-none"
                    value={columnFilters.status}
                    onChange={(e) =>
                      handleColumnFilterChange("status", e.target.value)
                    }
                  >
                    <option value="all">All</option>
                    <option value="Active">Active</option>
                    <option value="Returned">Returned</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {groupBy !== "none"
                ?
                  Object.entries(
                    currentData.reduce((acc, item) => {
                      let key = "";
                      if (groupBy === "jid") key = item.jid;
                      else if (groupBy === "nik") key = item.nik;
                      else if (groupBy === "partId") key = item.partId;

                      if (!key) key = "Unknown";

                      if (!acc[key]) acc[key] = [];
                      acc[key].push(item);
                      return acc;
                    }, {}),
                  ).map(([groupKey, items]) => (
                    <React.Fragment key={groupKey}>
                      <tr className="bg-slate-100 dark:bg-slate-800/50">
                        <td
                          colSpan="12"
                          className="px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200"
                        >
                          {groupBy === "jid" && `JID No: ${groupKey}`}
                          {groupBy === "nik" && `NIK: ${groupKey}`}
                          {groupBy === "partId" && `Tool Number: ${groupKey}`}
                          <span className="text-xs font-normal text-slate-500 ml-2">
                            ({items.length} Items)
                          </span>
                        </td>
                      </tr>
                      {items.map(
                        (
                          item,
                        ) => (
                          <tr
                            key={item.no}
                            className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                          >
                            <td className="px-4 py-3 text-xs text-slate-400 group-hover:text-primary transition-colors text-center font-medium">
                              {(currentPage - 1) * itemsPerPage +
                                currentData.indexOf(item) +
                                1}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold font-mono text-slate-700 dark:text-gray-200">
                              {item.jid}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-gray-200">
                              {item.partId}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                                {item.toolName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono tracking-tighter">
                                {item.toolId}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                                {item.userName}
                              </p>
                              <p className="text-xs text-slate-400 font-mono tracking-tighter">
                                {item.userId}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono">
                              {item.nik}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                              {item.workCenter}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                              {item.workArea}
                            </td>
                            <td
                              className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono text-[11px] truncate max-w-[120px]"
                              title={item.refTitle}
                            >
                              {item.refTitle}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                              {item.formattedCheckout}
                            </td>
                            <td
                              className={`px-4 py-3 text-sm font-mono text-[11px] ${item.status === "Overdue" ? "text-red-600 font-bold" : "text-slate-500 dark:text-gray-400"}`}
                            >
                              {item.formattedDueDate}
                              {reportType === "overdue" &&
                                item.overdueDays > 0 && (
                                  <span className="block text-xs font-bold text-red-500">
                                    +{item.overdueDays} Days
                                  </span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                              {item.formattedReturnDate}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${item.movement === "Fast" ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"}`}
                              >
                                {item.movement}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(item.status)}`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </React.Fragment>
                  ))
                :
                  currentData.map((item, index) => (
                    <tr
                      key={item.no}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group"
                    >
                      <td className="px-4 py-3 text-xs text-slate-400 group-hover:text-primary transition-colors text-center font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold font-mono text-slate-700 dark:text-gray-200">
                        {item.jid}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-700 dark:text-gray-200">
                        {item.partId}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                          {item.toolName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono tracking-tighter">
                          {item.toolId}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">
                          {item.userName}
                        </p>
                        <p className="text-xs text-slate-400 font-mono tracking-tighter">
                          {item.userId}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono">
                        {item.nik}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                        {item.workCenter}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400">
                        {item.workArea}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono text-[11px] truncate max-w-[120px]"
                        title={item.refTitle}
                      >
                        {item.refTitle}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                        {item.formattedCheckout}
                      </td>
                      <td
                        className={`px-4 py-3 text-sm font-mono text-[11px] ${item.status === "Overdue" ? "text-red-600 font-bold" : "text-slate-500 dark:text-gray-400"}`}
                      >
                        {item.formattedDueDate}
                        {reportType === "overdue" && item.overdueDays > 0 && (
                          <span className="block text-xs font-bold text-red-500">
                            +{item.overdueDays} Days
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 dark:text-gray-400 font-mono text-[11px]">
                        {item.formattedReturnDate}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${item.movement === "Fast" ? "bg-orange-50 text-orange-600 ring-1 ring-orange-200" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200"}`}
                        >
                          {item.movement}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span>Showing</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>
              <span>of</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredData.length}
              </span>
              <span>items</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, startPage + 4);
              if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
              return startPage + i;
            })
              .filter((page) => page > 0 && page <= totalPages)
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`size-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-primary text-white shadow-sm font-semibold"
                      : "border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
