/**
 * Restaurant Hooks - React Query wrappers for restaurant APIs
 * 
 * Based on OpenAPI spec endpoints:
 * - GET /restaurants (public list)
 * - GET /restaurants/{id}
 * - GET /restaurants/search?name=
 * - GET /restaurants/name/{name}
 * - POST /restaurants (create)
 * - PUT /restaurants/{id}
 * - DELETE /restaurants/{id}
 * - PATCH /restaurants/{id}/toggle-status
 * - POST /restaurants/{id}/image
 * - DELETE /restaurants/{id}/image
 * - GET /restaurants/internal/exists/{id}
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Get All Public Restaurants ───

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants", "list"],
    queryFn: async () => {
      try {
        return await api.get("/restaurants");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Restaurant by ID ───

export function useRestaurantById(id, enabled = true) {
  return useQuery({
    queryKey: ["restaurants", "byId", id],
    enabled: enabled && !!id,
    queryFn: async () => {
      try {
        return await api.get(`/restaurants/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Search Restaurants by Name ───

export function useRestaurantSearch(name) {
  return useQuery({
    queryKey: ["restaurants", "search", name],
    enabled: !!name,
    queryFn: async () => {
      try {
        return await api.get("/restaurants/search", { query: { name } });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Restaurant by Name (exact) ───

export function useRestaurantByName(name) {
  return useQuery({
    queryKey: ["restaurants", "name", name],
    enabled: !!name,
    queryFn: async () => {
      try {
        return await api.get(`/restaurants/name/${encodeURIComponent(name)}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Check if Restaurant Exists (internal) ───

export function useRestaurantExists(id) {
  return useQuery({
    queryKey: ["restaurants", "exists", id],
    enabled: !!id,
    queryFn: async () => {
      try {
        return await api.get(`/restaurants/internal/exists/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Create Restaurant ───

export function useCreateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (restaurantData) => {
      try {
        return await api.post("/restaurants", restaurantData);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants", "list"] });
    },
  });
}

// ─── Update Restaurant ───

export function useUpdateRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        return await api.put(`/restaurants/${id}`, data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants", "list"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", "byId"] });
    },
  });
}

// ─── Delete Restaurant ───

export function useDeleteRestaurant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.del(`/restaurants/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants", "list"] });
    },
  });
}

// ─── Toggle Restaurant Status (open/closed) ───

export function useToggleRestaurantStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.patch(`/restaurants/${id}/toggle-status`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants", "list"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", "byId"] });
    },
  });
}

// ─── Upload Restaurant Image ───

export function useUploadRestaurantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        return await api.post(`/restaurants/${id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants", "list"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", "byId"] });
    },
  });
}

// ─── Delete Restaurant Image ───

export function useDeleteRestaurantImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.del(`/restaurants/${id}/image`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants", "list"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants", "byId"] });
    },
  });
}