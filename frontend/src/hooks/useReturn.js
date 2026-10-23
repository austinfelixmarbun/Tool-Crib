import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { returnService } from "../services/returnService";
import { inventoryKeys } from "./useInventory";

export const returnKeys = {
  all: ["return"],
  activeBorrows: (nik) => [...returnKeys.all, "active", nik],
};

export function useActiveBorrows(nik) {
  return useQuery({
    queryKey: returnKeys.activeBorrows(nik),
    queryFn: () => returnService.getActiveBorrows(nik),
    enabled: !!nik,
  });
}

export function useProcessReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (logIds) => returnService.processReturn(logIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: returnKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
