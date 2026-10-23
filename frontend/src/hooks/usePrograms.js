import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { programsService } from "../services/programsService";

export const programsKeys = {
  all: ["programs"],
  list: () => [...programsKeys.all, "list"],
};

export function usePrograms() {
  return useQuery({
    queryKey: programsKeys.list(),
    queryFn: () => programsService.getAll(),
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => programsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programsKeys.list() });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => programsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programsKeys.list() });
    },
  });
}
