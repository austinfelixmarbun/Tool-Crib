import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workCentersService } from "../services/workCentersService";

// Query Keys
export const workCentersKeys = {
  all: ["workCenters"],
  list: () => [...workCentersKeys.all, "list"],
};

/**
 * Hook to get all work centers
 */
export function useWorkCenters() {
  return useQuery({
    queryKey: workCentersKeys.list(),
    queryFn: () => workCentersService.getAll(),
  });
}

/**
 * Hook for creating work center
 */
export function useCreateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => workCentersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}

/**
 * Hook for bulk creating work centers
 */
export function useBulkCreateWorkCenters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => workCentersService.bulkCreate(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}

/**
 * Hook for updating work center
 */
export function useUpdateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => workCentersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}

/**
 * Hook for deleting work center
 */
export function useDeleteWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => workCentersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}
