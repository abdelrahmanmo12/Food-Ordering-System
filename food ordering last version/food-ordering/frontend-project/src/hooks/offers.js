/**
 * Offer Hooks - React Query wrappers for offers/promotions APIs
 * 
 * Based on OpenAPI spec endpoints:
 * - GET /offers/{id}
 * - GET /offers/restaurant/{restaurantId}
 * - GET /offers/active
 * - POST /offers/restaurant/{restaurantId} (create)
 * - PUT /offers/{id}
 * - DELETE /offers/{id}
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Get Offer by ID ───

export function useOfferById(id, enabled = true) {
  return useQuery({
    queryKey: ["offers", "byId", id],
    enabled: enabled && !!id,
    queryFn: async () => {
      try {
        return await api.get(`/offers/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Offers by Restaurant ───

export function useOffersByRestaurant(restaurantId) {
  return useQuery({
    queryKey: ["offers", "byRestaurant", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      try {
        return await api.get(`/offers/restaurant/${restaurantId}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Active Offers ───

export function useActiveOffers() {
  return useQuery({
    queryKey: ["offers", "active"],
    queryFn: async () => {
      try {
        return await api.get("/offers/active");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// Convenience: alias for useActiveOffers
export function useOffers() {
  return useActiveOffers();
}

// ─── Create Offer ───

export function useCreateOffer(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (offerData) => {
      try {
        return await api.post(`/offers/restaurant/${restaurantId}`, offerData);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "byRestaurant", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["offers", "active"] });
    },
  });
}

// ─── Update Offer ───

export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        return await api.put(`/offers/${id}`, data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "byId"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "byRestaurant"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "active"] });
    },
  });
}

// ─── Delete Offer ───

export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.del(`/offers/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers", "byId"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "byRestaurant"] });
      queryClient.invalidateQueries({ queryKey: ["offers", "active"] });
    },
  });
}