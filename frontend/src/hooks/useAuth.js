import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/authService";

export const authKeys = {
  all: ["auth"],
  me: () => [...authKeys.all, "me"],
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authService.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ employeeId, password }) =>
      authService.login(employeeId, password),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me(), data);
      localStorage.setItem("user", JSON.stringify(data.user));
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      localStorage.removeItem("user");
    },
  });
}
