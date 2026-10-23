import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workCentersService } from "../services/workCentersService";

export const workCentersKeys = {
  all: ["workCenters"],
  list: () => [...workCentersKeys.all, "list"],
};

export function useWorkCenters() {
  return useQuery({
    queryKey: workCentersKeys.list(),
    queryFn: () => workCentersService.getAll(),
  });
}

export function useCreateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => workCentersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}

export function useBulkCreateWorkCenters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => workCentersService.bulkCreate(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}

export function useUpdateWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => workCentersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}

export function useDeleteWorkCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => workCentersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workCentersKeys.list() });
    },
  });
}
