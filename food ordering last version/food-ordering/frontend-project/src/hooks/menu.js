/**
 * Menu Hooks - React Query wrappers for menu/item APIs
 * 
 * Based on OpenAPI spec endpoints:
 * - GET /menu/{restaurantId} (list items)
 * - GET /menu/{restaurantId}/menu (full menu grouped by category)
 * - GET /menu/item?restaurantId=&itemId=
 * - GET /menu/item/{id}
 * - GET /menu/item/by-name?restaurantId=&itemName=
 * - POST /menu/{restaurantId} (add item)
 * - PUT /menu/{id}
 * - DELETE /menu/{id}
 * - POST /menu/{id}/image
 * - POST /menu/bulk/{restaurantId}
 * - GET /menu/discounts
 * - GET /menu/category/{category}
 * - GET /menu/categories/restaurant/{restaurantId}
 * - POST /menu/categories/{restaurantId}
 * - PUT /menu/categories/{id}
 * - DELETE /menu/categories/{id}
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Menu Items by Restaurant ───

export function useMenu(restaurantId) {
  return useQuery({
    queryKey: ["menu", "items", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      try {
        return await api.get(`/menu/${restaurantId}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Full Menu (grouped by category) ───

export function useFullMenu(restaurantId) {
  return useQuery({
    queryKey: ["menu", "full", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      try {
        return await api.get(`/menu/${restaurantId}/menu`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Single Menu Item (by restaurant + item query params) ───

export function useMenuItem(restaurantId, itemId) {
  return useQuery({
    queryKey: ["menu", "item", restaurantId, itemId],
    enabled: !!restaurantId && !!itemId,
    queryFn: async () => {
      try {
        return await api.get("/menu/item", { query: { restaurantId, itemId } });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Single Menu Item by ID (path param) ───

export function useMenuItemById(id, enabled = true) {
  return useQuery({
    queryKey: ["menu", "itemById", id],
    enabled: enabled && !!id,
    queryFn: async () => {
      try {
        return await api.get(`/menu/item/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Menu Item by Name ───

export function useMenuItemByName(restaurantId, itemName) {
  return useQuery({
    queryKey: ["menu", "itemByName", restaurantId, itemName],
    enabled: !!restaurantId && !!itemName,
    queryFn: async () => {
      try {
        return await api.get("/menu/item/by-name", { query: { restaurantId, itemName } });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── All Menu Items ───

export function useAllMenuItems() {
  return useQuery({
    queryKey: ["menu", "allItems"],
    queryFn: async () => {
      try {
        return await api.get("/menu/items");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Create Menu Item ───

export function useCreateMenuItem(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData) => {
      try {
        return await api.post(`/menu/${restaurantId}`, itemData);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["menu", "full", restaurantId] });
    },
  });
}

// ─── Update Menu Item ───

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        return await api.put(`/menu/${id}`, data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: (updatedItem) => {
      // Invalidate based on the restaurantId if available in response
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "itemById", id] });
    },
  });
}

// ─── Delete Menu Item ───

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.del(`/menu/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "full"] });
    },
  });
}

// ─── Upload Menu Item Image ───

export function useUploadMenuItemImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        return await api.post(`/menu/${id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "itemById"] });
    },
  });
}

// ─── Bulk Create Items ───

export function useBulkCreateItems(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items) => {
      try {
        return await api.post(`/menu/bulk/${restaurantId}`, items);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["menu", "full", restaurantId] });
    },
  });
}

// ─── Discounts ───

export function useDiscounts() {
  return useQuery({
    queryKey: ["menu", "discounts"],
    queryFn: async () => {
      try {
        return await api.get("/menu/discounts");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Items by Category ───

export function useItemsByCategory(category) {
  return useQuery({
    queryKey: ["menu", "byCategory", category],
    enabled: !!category,
    queryFn: async () => {
      try {
        return await api.get(`/menu/category/${encodeURIComponent(category)}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Menu Categories by Restaurant ───

export function useMenuCategories(restaurantId) {
  return useQuery({
    queryKey: ["menu", "categories", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      try {
        return await api.get(`/menu/categories/restaurant/${restaurantId}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Create Category ───

export function useCreateCategory(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryData) => {
      try {
        return await api.post(`/menu/categories/${restaurantId}`, categoryData);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categories", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["menu", "full", restaurantId] });
    },
  });
}

// ─── Update Category ───

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      try {
        return await api.put(`/menu/categories/${id}`, data);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "full"] });
    },
  });
}

// ─── Delete Category ───

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.del(`/menu/categories/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu", "full"] });
    },
  });
}