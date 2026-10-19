import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';

// Query Keys
export const authKeys = {
    all: ['auth'],
    me: () => [...authKeys.all, 'me'],
};

/**
 * Hook to get current authenticated user
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: authKeys.me(),
        queryFn: () => authService.me(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for login mutation
 */
export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ employeeId, password }) =>
            authService.login(employeeId, password),
        onSuccess: (data) => {
            // Update the current user cache
            queryClient.setQueryData(authKeys.me(), data);
            // Store user in localStorage for quick access
            localStorage.setItem('user', JSON.stringify(data.user));
        },
    });
}

/**
 * Hook for logout mutation
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            // Clear all queries
            queryClient.clear();
            // Clear localStorage
            localStorage.removeItem('user');
        },
    });
}
