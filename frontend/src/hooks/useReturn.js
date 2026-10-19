import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { returnService } from '../services/returnService';
import { inventoryKeys } from './useInventory';

// Query Keys
export const returnKeys = {
    all: ['return'],
    activeBorrows: (nik) => [...returnKeys.all, 'active', nik],
};

/**
 * Hook to get active borrows for a user
 */
export function useActiveBorrows(nik) {
    return useQuery({
        queryKey: returnKeys.activeBorrows(nik),
        queryFn: () => returnService.getActiveBorrows(nik),
        enabled: !!nik,
    });
}

/**
 * Hook for processing return
 */
export function useProcessReturn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (logIds) => returnService.processReturn(logIds),
        onSuccess: () => {
            // Invalidate active borrows and inventory
            queryClient.invalidateQueries({ queryKey: returnKeys.all });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
    });
}
