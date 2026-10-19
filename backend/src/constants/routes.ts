export const API_PREFIX = "/api" as const;

export const ROUTES = {
  HEALTH: "/health",
  AUTH: "/auth",
  USERS: "/users",
  BORROW: "/borrow",
  BORROWS: "/borrows",
  RETURN: "/return",
  RETURNS: "/returns",
  INVENTORY: "/inventory",
  PROGRAMS: "/programs",
  WORK_CENTERS: "/work-centers",
  WORK_AREAS: "/work-areas",
  DASHBOARD: "/dashboard",
} as const;

export const SUB_ROUTES = {
  AUTH: {
    LOGIN: "/login",
    LOGOUT: "/logout",
    ME: "/me",
  },
  USERS: {
    ROOT: "/",
    BY_ID: "/:id",
    BY_NIK: "/by-nik/:nik",
    RESET_PASSWORD: "/:id/reset-password",
  },
  BORROW: {
    ROOT: "/",
    REQUESTS: "/requests",
    PENDING: "/pending",
    APPROVE: "/:id/approve",
    BY_ID: "/:id",
  },
  RETURN: {
    ROOT: "/",
    PROCESS: "/process",
    ACTIVE_BY_NIK: "/active/:nik",
    BY_ID: "/:id",
  },
  INVENTORY: {
    ROOT: "/",
    TOOLS: "/tools",
    TOOL_BY_ID: "/tools/:id",
    TOOL_UNITS: "/tools/:toolTypeId/units",
    UNITS: "/units",
    UNIT_STATUS: "/units/:id/status",
    UNIT_BY_ID: "/units/:id",
    CALIBRATION: "/calibration",
  },
  PROGRAMS: {
    ROOT: "/",
    BY_ID: "/:id",
  },
  WORK_CENTERS: {
    ROOT: "/",
    BY_ID: "/:id",
  },
  WORK_AREAS: {
    ROOT: "/",
    BY_ID: "/:id",
  },
  DASHBOARD: {
    ROOT: "/",
    STATS: "/stats",
    TRANSACTIONS: "/transactions",
    MOVEMENT: "/movement",
    MAINTENANCE_ALERTS: "/maintenance-alerts",
    AUDIT_LOGS: "/audit-logs",
  },
} as const;
