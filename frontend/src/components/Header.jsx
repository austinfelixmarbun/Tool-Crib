import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { dashboardService } from "../services/dashboardService";

const Header = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, logout, isLoading: isAuthLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const user = authUser || {
    name: "Guest User",
    id: "",
    employeeId: "---",
    role: "Visitor",
  };

  if (isAuthLoading) {
    return (
      <div className="h-[73px] bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 z-30 sticky top-0">
        <div className="animate-pulse h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
      </div>
    );
  }

  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const [transactionsResponse, pendingResponse] = await Promise.all([
        dashboardService.getTransactions({ limit: 100 }),
        import("../services/borrowService").then((m) =>
          m.default.getRequests(),
        ),
      ]);

      console.log("NOTIFICATION FETCH:", {
        transactions: transactionsResponse,
        pending: pendingResponse,
      });

      let allNotifications = [];
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];

      const isSameDay = (dateString) => {
        if (!dateString) return false;
        const d = new Date(dateString);
        return d.toISOString().split("T")[0] === todayStr;
      };

      if (pendingResponse && Array.isArray(pendingResponse.requests)) {
        const pending = pendingResponse.requests
          .filter((r) => r.status === "Pending Verification")
          .map((r) => ({
            id: `req-${r.id}`,
            partNo: r.referenceType,
            toolName: `${r.items?.length || 0} Items Requested`,
            dueDate: r.borrowDate,
            status: "Delayed Verify",
            userId: r.requester?.name,
            type: "request",
            priority: 1,
          }));
        allNotifications = [...allNotifications, ...pending];
      }

      const maintenanceResponse = await dashboardService.getMaintenanceAlerts();
      if (maintenanceResponse && maintenanceResponse.alerts) {
        const maintenance = maintenanceResponse.alerts
          .filter((item) => isSameDay(item.nextMaintenanceDate))
          .map((item) => ({
            id: `maint-${item.id}`,
            partNo: item.toolNumber,
            toolName: item.toolName,
            dueDate: item.nextMaintenanceDate,
            status: "Maintenance",
            userId: "System",
            type: "maintenance",
            priority: 2,
          }));
        allNotifications = [...allNotifications, ...maintenance];
      }

      if (transactionsResponse.transactions) {
        const dueToday = transactionsResponse.transactions
          .filter(
            (t) =>
              (t.status === "Borrowed" || t.status === "Active") &&
              isSameDay(t.dueDate),
          )
          .map((t) => ({
            id: t.id,
            partNo: t.inventoryItem?.toolNumber || `PN-${t.inventoryItemId}`,
            toolName: t.inventoryItem?.toolName,
            dueDate: t.dueDate,
            status: "Due Today",
            userId: t.borrower?.employeeId,
            userName: t.borrower?.name,
            type: "transaction",
            priority: 3,
          }));

        allNotifications = [...allNotifications, ...dueToday];
      }

      allNotifications.sort((a, b) => a.priority - b.priority);

      const role = (user?.role || "").toUpperCase();
      if (role === "QUALITY CONTROL") {
        allNotifications = allNotifications.filter(
          (n) => n.type === "maintenance",
        );
      } else if (role === "PRODUCTION CONTROL") {
        allNotifications = allNotifications.filter(
          (n) => n.type === "transaction",
        );
      } else if (
        role !== "ADMIN" &&
        role !== "SUPER ADMIN" &&
        role !== "USER"
      ) {
        allNotifications = [];
      }

      setNotifications(allNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const notificationCount = notifications.length;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getDaysDiffDisplay = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateStr);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `+${diffDays} day${diffDays > 1 ? "s" : ""}`;
    if (diffDays === 0) return "due today";
    if (diffDays === -1) return "due tomorrow";
    return "";
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard Overview";
    if (path === "/borrow") return "Borrowing Transaction";
    if (path === "/return") return "Return Tool Transaction";
    if (path === "/inventory") return "Inventory Management";
    if (path === "/reporting") return "Reporting & Analytics";
    if (path === "/user-management") return "User Management";
    return "Dashboard Overview";
  };

  return (
    <header className="h-[73px] bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-8 z-50 sticky top-0">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Sidebar"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          title={
            theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          <span className="material-symbols-outlined">
            {theme === "dark" ? "light_mode" : "dark_mode"}
          </span>
        </button>

        <div className="relative">
          <button
            className="p-2 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-colors relative"
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowUserMenu(false);
            }}
          >
            <span className="material-symbols-outlined">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-surface-dark"></span>
            )}
          </button>

          {showNotificationMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotificationMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {notificationCount} Alerts
                  </span>
                </div>

                <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => {
                      const daysDisplay =
                        n.type === "request"
                          ? "Pending"
                          : getDaysDiffDisplay(n.dueDate);
                      const isOverdue =
                        n.type === "transaction" &&
                        new Date(n.dueDate) < new Date().setHours(0, 0, 0, 0);

                      return (
                        <div
                          key={n.id}
                          className="p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                          onClick={() => {
                            setShowNotificationMenu(false);
                            if (n.type === "request") {
                              navigate("/borrow-verification");
                            } else if (n.type === "maintenance") {
                              navigate(`/inventory?toolNumber=${n.partNo}`);
                            } else {
                              navigate(`/dashboard?partId=${n.partNo}`);
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-1 h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${
                                n.type === "request"
                                  ? "bg-orange-50 text-orange-500 dark:bg-orange-500/10"
                                  : n.type === "maintenance"
                                    ? "bg-purple-50 text-purple-500 dark:bg-purple-500/10"
                                    : isOverdue
                                      ? "bg-red-50 text-red-500 dark:bg-red-500/10"
                                      : "bg-blue-50 text-blue-500 dark:bg-blue-500/10"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {n.type === "request"
                                  ? "pending_actions"
                                  : n.type === "maintenance"
                                    ? "build"
                                    : isOverdue
                                      ? "error"
                                      : "event"}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">
                                  {n.toolName}
                                </p>
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap inline-flex items-center justify-center min-h-[22px] ${
                                    n.type === "request"
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                                      : n.type === "maintenance"
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30"
                                        : isOverdue
                                          ? "bg-red-100 text-red-700 dark:bg-red-900/30"
                                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30"
                                  }`}
                                >
                                  {n.type === "maintenance"
                                    ? "Maintenance"
                                    : daysDisplay}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                {n.type === "request"
                                  ? `Requested by: ${n.userId}`
                                  : `Part No: ${n.partNo}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center">
                      <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[40px]">
                        notifications_off
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        No urgent notifications
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/20 text-center border-t border-slate-100 dark:border-slate-700">
                  <button
                    className="text-[11px] font-bold text-primary hover:underline transition-all"
                    onClick={() => {
                      setShowNotificationMenu(false);
                      navigate("/dashboard");
                    }}
                  >
                    View All Transactions
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

        <div className="relative">
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotificationMenu(false);
            }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                {user.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {user.role}
              </p>
            </div>
            <div
              className="h-10 w-10 min-w-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center border-2 border-slate-100 dark:border-slate-600 shadow-sm"
              style={{
                backgroundImage:
                  "url('/person.svg')",
              }}
            ></div>
          </div>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-5 flex flex-col items-center text-center">
                  <div
                    className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center border-2 border-slate-100 dark:border-slate-600 shadow-md mb-3"
                    style={{
                      backgroundImage:
                        "url('/person.svg')",
                    }}
                  ></div>
                  <div className="w-full">
                    <p className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <div className="mt-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-widest">
                        Employee ID (NIK)
                      </p>
                      <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {user.employeeId || user.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 p-2 bg-slate-50/50 dark:bg-slate-800/30">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 rounded-lg font-bold"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      logout
                    </span>
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
