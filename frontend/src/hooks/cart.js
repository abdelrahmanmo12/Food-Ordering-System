

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Get Cart ───

export function useCart(userId) {
  return useQuery({
    queryKey: ["cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        return await api.get("/api/cart", {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Add to Cart ───

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, cartData }) => {
      try {
        return await api.post("/api/cart", cartData, {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

// ─── Remove from Cart ───

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, itemName }) => {
      try {
        return await api.del(`/api/cart/items/${encodeURIComponent(itemName)}`, {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}

// ─── Clear Cart ───

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      try {
        return await api.del("/api/cart", {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["cart", userId] });
    },
  });
}