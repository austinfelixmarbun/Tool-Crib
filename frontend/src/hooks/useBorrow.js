import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { borrowService } from "../services/borrowService";
import { inventoryKeys } from "./useInventory";

export const borrowKeys = {
  all: ["borrow"],
  requests: () => [...borrowKeys.all, "requests"],
  request: (id) => [...borrowKeys.all, "request", id],
};

export function useBorrowRequests() {
  return useQuery({
    queryKey: borrowKeys.requests(),
    queryFn: () => borrowService.getRequests(),
  });
}

export function useBorrowRequest(id) {
  return useQuery({
    queryKey: borrowKeys.request(id),
    queryFn: () => borrowService.getRequest(id),
    enabled: !!id,
  });
}

export function useCreateBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => borrowService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.requests() });
    },
  });
}

export function useVerifyBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => borrowService.verifyRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.requests() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

export function useRejectBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => borrowService.rejectRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: borrowKeys.requests() });
    },
  });
}
