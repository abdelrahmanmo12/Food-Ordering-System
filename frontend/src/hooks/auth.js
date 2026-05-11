
import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Login ───

export function useLogin() {
  return useMutation({
    mutationFn: async (loginData) => {
      try {
        return await api.post("/auth/login", loginData);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Register Customer ───

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: async (registerData) => {
      try {
        return await api.post("/auth/register/customer", registerData);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Register Owner ───

export function useRegisterOwner() {
  return useMutation({
    mutationFn: async (registerData) => {
      try {
        return await api.post("/auth/register/owner", registerData);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Register Delivery ───

export function useRegisterDelivery() {
  return useMutation({
    mutationFn: async (registerData) => {
      try {
        return await api.post("/auth/register/delivery", registerData);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// Convenience: single hook that routes by role
export function useRegister() {
  const customerMutation = useRegisterCustomer();
  const ownerMutation = useRegisterOwner();
  const deliveryMutation = useRegisterDelivery();

  return {
    mutate: (data) => {
      const role = data.role || "user";
      if (role === "owner") return ownerMutation.mutate(data);
      if (role === "delivery") return deliveryMutation.mutate(data);
      return customerMutation.mutate(data);
    },
    mutateAsync: async (data) => {
      const role = data.role || "user";
      if (role === "owner") return await ownerMutation.mutateAsync(data);
      if (role === "delivery") return await deliveryMutation.mutateAsync(data);
      return await customerMutation.mutateAsync(data);
    },
    isPending: customerMutation.isPending || ownerMutation.isPending || deliveryMutation.isPending,
    isLoading: customerMutation.isLoading || ownerMutation.isLoading || deliveryMutation.isLoading,
    data: customerMutation.data || ownerMutation.data || deliveryMutation.data,
    error: customerMutation.error || ownerMutation.error || deliveryMutation.error,
  };
}

// ─── Logout ───

export function useLogout() {
  return useMutation({
    mutationFn: async ({ userId }) => {
      try {
        return await api.post("/auth/logout", null, {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Refresh Token ───

export function useRefreshToken() {
  return useMutation({
    mutationFn: async (refreshData) => {
      try {
        return await api.post("/auth/refresh", refreshData);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Change Password ───

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ userId, passwordData }) => {
      try {
        return await api.put("/auth/change-password", passwordData, {
          headers: { "X-User-Id": userId },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}