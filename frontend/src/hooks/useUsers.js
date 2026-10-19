import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../services/usersService';

// Query Keys
export const usersKeys = {
    all: ['users'],
    lists: () => [...usersKeys.all, 'list'],
    list: (filters) => [...usersKeys.lists(), filters],
    details: () => [...usersKeys.all, 'detail'],
    detail: (id) => [...usersKeys.details(), id],
    byNik: (nik) => [...usersKeys.all, 'nik', nik],
};

/**
 * Hook to get all users
 */
export function useUsers(filters = {}) {
    return useQuery({
        queryKey: usersKeys.list(filters),
        queryFn: () => usersService.getAll(filters),
    });
}

/**
 * Hook to get user by ID
 */
export function useUser(id) {
    return useQuery({
        queryKey: usersKeys.detail(id),
        queryFn: () => usersService.getById(id),
        enabled: !!id,
    });
}

/**
 * Hook to get user by NIK
 */
export function useUserByNik(nik) {
    return useQuery({
        queryKey: usersKeys.byNik(nik),
        queryFn: () => usersService.getByNik(nik),
        enabled: !!nik,
    });
}

/**
 * Hook for creating user
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => usersService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}

/**
 * Hook for updating user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => usersService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
            queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
        },
    });
}

/**
 * Hook for deleting (deactivating) user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => usersService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        },
    });
}
