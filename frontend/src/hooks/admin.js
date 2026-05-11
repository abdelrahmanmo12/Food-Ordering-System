

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Pending Accounts (Auth) ───

export function usePendingAccounts() {
  return useQuery({
    queryKey: ["admin", "pending-accounts"],
    queryFn: async () => {
      try {
        return await api.get("/auth/accounts/pending");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

export function useUpdateAccountStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      try {
        return await api.put(`/auth/accounts/${id}/status`, { status });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-accounts"] });
    },
  });
}

// ─── Pending Restaurants ───

export function usePendingRestaurants(userRole) {
  return useQuery({
    queryKey: ["admin", "pending-restaurants", userRole],
    enabled: !!userRole,
    queryFn: async () => {
      try {
        return await api.get("/restaurants/admin/requests", {
          headers: { "X-User-Role": userRole },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

export function useUpdateRestaurantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, userRole }) => {
      try {
        return await api.patch(`/restaurants/admin/requests/${id}/status`, null, {
          query: { status },
          headers: { "X-User-Role": userRole },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: (_, { userRole }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-restaurants", userRole] });
      queryClient.invalidateQueries({ queryKey: ["admin", "restaurants"] });
    },
  });
}

// ─── Restaurants with Owners (existing pattern) ───

export function useRestaurantsWithOwners() {
  return useQuery({
    queryKey: ["admin", "restaurants-with-owners"],
    queryFn: async () => {
      try {
        return await api.get("/admin/restaurants-with-owners");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

export function useAssignOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, ownerEmail }) => {
      try {
        return await api.post(`/admin/restaurants/${encodeURIComponent(restaurantId)}/owner`, {
          ownerEmail,
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restaurants-with-owners"] });
    },
  });
}

export function useRemoveOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantId) => {
      try {
        return await api.del(`/admin/restaurants/${encodeURIComponent(restaurantId)}/owner`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restaurants-with-owners"] });
    },
  });
}