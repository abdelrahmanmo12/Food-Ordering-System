/**
 * Order Hooks - React Query wrappers for order APIs
 * 
 * Based on OpenAPI spec endpoints:
 * - POST /api/orders (create order)
 * - POST /api/orders/checkout
 * - GET /api/orders/me (my orders)
 * - GET /api/orders/admin/all (all orders for admin)
 * - GET /api/orders/restaurant/{restaurantId}
 * - GET /api/orders/track/{orderNumber}
 * - PATCH /api/orders/{orderNumber}/cancel
 * - PATCH /api/orders/restaurant/{orderNumber}/status
 * - PATCH /api/orders/admin/{orderNumber}/status
 * - DELETE /api/orders/admin/{orderNumber}
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Get My Orders (Customer) ───

export function useMyOrders(userId) {
  return useQuery({
    queryKey: ["orders", "me", userId],
    enabled: !!userId,
    queryFn: async () => {
      try {
        return await api.get("/api/orders/me", {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// Alias for backward compatibility
export function useOrders(userId) {
  return useMyOrders(userId);
}

// ─── Get All Orders (Admin) ───

export function useAllOrders({ userId, userRole, userStatus }) {
  return useQuery({
    queryKey: ["orders", "admin", "all", userId, userRole, userStatus],
    enabled: !!userId && !!userRole && !!userStatus,
    queryFn: async () => {
      try {
        return await api.get("/api/orders/admin/all", {
          headers: {
            "X-User-Id": userId,
            "X-User-Role": userRole,
            "X-User-Status": userStatus,
          },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get Orders by Restaurant (Owner) ───

export function useOrdersByRestaurant({ userId, userRole, userStatus, restaurantId }) {
  return useQuery({
    queryKey: ["orders", "restaurant", restaurantId, userId, userRole, userStatus],
    enabled: !!restaurantId && !!userId && !!userRole && !!userStatus,
    queryFn: async () => {
      try {
        return await api.get(`/api/orders/restaurant/${restaurantId}`, {
          headers: {
            "X-User-Id": userId,
            "X-User-Role": userRole,
            "X-User-Status": userStatus,
          },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Track Order ───

export function useOrderTrack(orderNumber) {
  return useQuery({
    queryKey: ["orders", "track", orderNumber],
    enabled: !!orderNumber,
    queryFn: async () => {
      try {
        return await api.get(`/api/orders/track/${orderNumber}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Create Order ───

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, orderData }) => {
      try {
        return await api.post("/api/orders", orderData, {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
    },
  });
}

// ─── Checkout ───

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, checkoutData }) => {
      try {
        return await api.post("/api/orders/checkout", checkoutData, {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

// ─── Cancel Order ───

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderNumber) => {
      try {
        return await api.patch(`/api/orders/${orderNumber}/cancel`);
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "me"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "track"] });
    },
  });
}

// ─── Update Order Status (Restaurant/Owner) ───

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderNumber, status, userId, userRole, userStatus }) => {
      try {
        return await api.patch(`/api/orders/restaurant/${orderNumber}/status`, null, {
          query: { status },
          headers: {
            "X-User-Id": userId,
            "X-User-Role": userRole,
            "X-User-Status": userStatus,
          },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "restaurant"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "track"] });
    },
  });
}

// ─── Update Order Status (Admin) ───

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderNumber, status, userId, userRole, userStatus }) => {
      try {
        return await api.patch(`/api/orders/admin/${orderNumber}/status`, null, {
          query: { status },
          headers: {
            "X-User-Id": userId,
            "X-User-Role": userRole,
            "X-User-Status": userStatus,
          },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "admin", "all"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "track"] });
    },
  });
}

// ─── Delete Order (Admin) ───

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderNumber, userId, userRole, userStatus }) => {
      try {
        return await api.del(`/api/orders/admin/${orderNumber}`, {
          headers: {
            "X-User-Id": userId,
            "X-User-Role": userRole,
            "X-User-Status": userStatus,
          },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", "admin", "all"] });
    },
  });
}