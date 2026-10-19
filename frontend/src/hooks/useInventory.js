import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

// Query Keys
export const inventoryKeys = {
    all: ['inventory'],
    lists: () => [...inventoryKeys.all, 'list'],
    list: (filters) => [...inventoryKeys.lists(), filters],
    details: () => [...inventoryKeys.all, 'detail'],
    detail: (id) => [...inventoryKeys.details(), id],
};

/**
 * Hook to get all inventory items
 */
export function useInventory(filters = {}) {
    return useQuery({
        queryKey: inventoryKeys.list(filters),
        queryFn: () => inventoryService.getAll(filters),
    });
}

/**
 * Hook to get inventory item by ID
 */
export function useInventoryItem(id) {
    return useQuery({
        queryKey: inventoryKeys.detail(id),
        queryFn: () => inventoryService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook for creating inventory item
 */
export function useCreateInventoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => inventoryService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
    });
}

/**
 * Hook for bulk creating inventory items
 */
export function useBulkCreateInventoryItems() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (items) => inventoryService.bulkCreate(items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
    });
}

/**
 * Hook for updating inventory item
 */
export function useUpdateInventoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => inventoryService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
        },
    });
}

/**
 * Hook for updating stamp status (QC)
 */
export function useUpdateStamp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, stamp, reason }) =>
            inventoryService.updateStamp(id, stamp, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
            queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
        },
    });
}

/**
 * Hook for deleting inventory item
 */
export function useDeleteInventoryItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => inventoryService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
        },
    });
}
