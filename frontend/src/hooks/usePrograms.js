import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programsService } from '../services/programsService';

// Query Keys
export const programsKeys = {
    all: ['programs'],
    list: () => [...programsKeys.all, 'list'],
};

/**
 * Hook to get all programs
 */
export function usePrograms() {
    return useQuery({
        queryKey: programsKeys.list(),
        queryFn: () => programsService.getAll(),
    });
}

/**
 * Hook for creating program
 */
export function useCreateProgram() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => programsService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: programsKeys.list() });
        },
    });
}

/**
 * Hook for deleting program
 */
export function useDeleteProgram() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => programsService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: programsKeys.list() });
        },
    });
}
