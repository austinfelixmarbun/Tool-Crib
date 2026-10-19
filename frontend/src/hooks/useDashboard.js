import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

// Query Keys
export const dashboardKeys = {
    all: ['dashboard'],
    stats: () => [...dashboardKeys.all, 'stats'],
    transactions: (filters) => [...dashboardKeys.all, 'transactions', filters],
    auditLogs: (filters) => [...dashboardKeys.all, 'audit-logs', filters],
};

/**
 * Hook to get dashboard statistics
 */
export function useDashboardStats() {
    return useQuery({
        queryKey: dashboardKeys.stats(),
        queryFn: () => dashboardService.getStats(),
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

/**
 * Hook to get transaction logs
 */
export function useTransactions(filters = {}) {
    return useQuery({
        queryKey: dashboardKeys.transactions(filters),
        queryFn: () => dashboardService.getTransactions(filters),
    });
}

/**
 * Hook to get audit logs
 */
export function useAuditLogs(filters = {}) {
    return useQuery({
        queryKey: dashboardKeys.auditLogs(filters),
        queryFn: () => dashboardService.getAuditLogs(filters),
    });
}
