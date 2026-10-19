// Re-export all hooks for easy imports

// Auth
export { useCurrentUser, useLogin, useLogout, authKeys } from './useAuth';

// Users
export {
    useUsers,
    useUser,
    useUserByNik,
    useCreateUser,
    useUpdateUser,
    useDeleteUser,
    usersKeys
} from './useUsers';

// Inventory
export {
    useInventory,
    useInventoryItem,
    useCreateInventoryItem,
    useBulkCreateInventoryItems,
    useUpdateInventoryItem,
    useUpdateStamp,
    useDeleteInventoryItem,
    inventoryKeys
} from './useInventory';

// Borrow
export {
    useBorrowRequests,
    useBorrowRequest,
    useCreateBorrowRequest,
    useVerifyBorrowRequest,
    useRejectBorrowRequest,
    borrowKeys
} from './useBorrow';

// Return
export { useActiveBorrows, useProcessReturn, returnKeys } from './useReturn';

// Programs
export { usePrograms, useCreateProgram, useDeleteProgram, programsKeys } from './usePrograms';

// Work Centers
export {
    useWorkCenters,
    useCreateWorkCenter,
    useBulkCreateWorkCenters,
    useUpdateWorkCenter,
    useDeleteWorkCenter,
    workCentersKeys
} from './useWorkCenters';

// Dashboard
export { useDashboardStats, useTransactions, useAuditLogs, dashboardKeys } from './useDashboard';
