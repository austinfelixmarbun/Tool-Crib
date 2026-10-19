import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowService } from '../services/borrowService';
import { inventoryKeys } from './useInventory';

// Query Keys
export const borrowKeys = {
    all: ['borrow'],
    requests: () => [...borrowKeys.all, 'requests'],
    request: (id) => [...borrowKeys.all, 'request', id],
};

/**
 * Hook to get all borrow requests
 */
export function useBorrowRequests() {
    return useQuery({
        queryKey: borrowKeys.requests(),
        queryFn: () => borrowService.getRequests(),
    });
}

/**
 * Hook to get single borrow request
 */
export function useBorrowRequest(id) {
    return useQuery({
        queryKey: borrowKeys.request(id),
        queryFn: () => borrowService.getRequest(id),
        enabled: !!id,
    });
}

/**
 * Hook for creating borrow request
 */
export function useCreateBorrowRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => borrowService.createRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: borrowKeys.requests() });
        },
    });
}

/**
 * Hook for verifying (approving) borrow request
 */
export function useVerifyBorrowRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => borrowService.verifyRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: borrowKeys.requests() });
            // Also invalidate inventory as stock changes
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
    });
}

/**
 * Hook for rejecting borrow request
 */
export function useRejectBorrowRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }) => borrowService.rejectRequest(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: borrowKeys.requests() });
        },
    });
}
