// Central routes and API endpoints constants for the frontend application

export const DEFAULT_API_BASE_URL = '';
export const API_BASE_URL =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  typeof import.meta.env.VITE_API_URL === 'string'
    ? import.meta.env.VITE_API_URL
    : DEFAULT_API_BASE_URL;

export const APP_ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  BORROW: '/borrow',
  RETURN: '/return',
  BORROW_VERIFICATION: '/borrow-verification',
  INVENTORY: '/inventory',
  USER_MANAGEMENT: '/user-management',
};

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  DASHBOARD: {
    ROOT: '/api/dashboard',
    STATS: '/api/dashboard/stats',
    TRANSACTIONS: '/api/dashboard/transactions',
    MOVEMENT: '/api/dashboard/movement',
    MAINTENANCE_ALERTS: '/api/dashboard/maintenance-alerts',
    AUDIT_LOGS: '/api/dashboard/audit-logs',
  },
  INVENTORY: {
    BASE: '/api/inventory',
    TOOLS: '/api/inventory/tools',
    TOOL_BY_ID: (id) => `/api/inventory/tools/${id}`,
    TOOL_UNITS: (toolTypeId) => `/api/inventory/tools/${toolTypeId}/units`,
    UNITS: '/api/inventory/units',
    UNIT_STATUS: (unitId) => `/api/inventory/units/${unitId}/status`,
    UNIT_BY_ID: (unitId) => `/api/inventory/units/${unitId}`,
    CALIBRATION: '/api/inventory/calibration',
    BULK: '/api/inventory/bulk',
    BY_ID: (id) => `/api/inventory/${id}`,
    QC: (id) => `/api/inventory/${id}/qc`,
  },
  BORROW: {
    BASE: '/api/borrow',
    REQUESTS: '/api/borrow/requests',
    REQUEST_BY_ID: (id) => `/api/borrow/requests/${id}`,
    VERIFY_REQUEST: (id) => `/api/borrow/requests/${id}/verify`,
    REJECT_REQUEST: (id) => `/api/borrow/requests/${id}/reject`,
    APPROVE: (id) => `/api/borrow/${id}/approve`,
  },
  RETURN: {
    BASE: '/api/return',
    BY_TX_ID: (txId) => `/api/return/${txId}`,
    PROCESS: '/api/return/process',
    ACTIVE_BY_NIK: (nik) => `/api/return/active/${nik}`,
    ACTIVE_JIDS: '/api/return/active-jids',
    BULK_UPDATE_DUE_DATE: '/api/return/bulk-update-due-date',
  },
  USERS: {
    BASE: '/api/users',
    BY_ID: (id) => `/api/users/${id}`,
    BY_NIK: (nik) => `/api/users/by-nik/${nik}`,
    RESET_PASSWORD: (id) => `/api/users/${id}/reset-password`,
  },
  PROGRAMS: {
    BASE: '/api/programs',
    BY_ID: (id) => `/api/programs/${id}`,
  },
  WORK_CENTERS: {
    BASE: '/api/work-centers',
    BY_ID: (id) => `/api/work-centers/${id}`,
    BULK: '/api/work-centers/bulk',
  },
  WORK_AREAS: {
    BASE: '/api/work-areas',
    BY_ID: (id) => `/api/work-areas/${id}`,
    BULK: '/api/work-areas/bulk',
  },
};
