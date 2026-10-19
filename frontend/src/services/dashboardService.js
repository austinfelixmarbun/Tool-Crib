import { API_ROUTES } from "../constants/routes";
import { api } from "../lib/api";

export const dashboardService = {
  getStats: () => api.get(API_ROUTES.DASHBOARD.STATS),

  /**
    @param {Object} params
     */
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(
      `${API_ROUTES.DASHBOARD.TRANSACTIONS}${query ? `?${query}` : ""}`,
    );
  },

  /**
    @param {Object} params
   */
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(
      `${API_ROUTES.DASHBOARD.AUDIT_LOGS}${query ? `?${query}` : ""}`,
    );
  },

  getMovement: () => api.get(API_ROUTES.DASHBOARD.MOVEMENT),

  getMaintenanceAlerts: () => api.get(API_ROUTES.DASHBOARD.MAINTENANCE_ALERTS),
};

export default dashboardService;
