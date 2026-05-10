/**
 * User Hooks - React Query wrappers for user/profile APIs
 * 
 * Based on OpenAPI spec endpoints:
 * - GET /users/{id}
 * - GET /users/profiles
 * - GET /users/profiles/me
 * - PUT /users/profiles/{id}
 * - GET /users/profiles/favourites
 * - POST /users/profiles/favourites/{restaurantId}
 * - DELETE /users/profiles/favourites/{restaurantId}
 * - POST /users/internal/create
 * - POST /owner/request
 * - POST /admin/approve/{id}
 * - POST /admin/reject/{id}
 * - GET /admin/owner-requests
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { toApiError } from "../api/errors";

// ─── Get User by ID ───

export function useUserProfile(id, enabled = true) {
  return useQuery({
    queryKey: ["users", "profile", id],
    enabled: enabled && !!id,
    queryFn: async () => {
      try {
        return await api.get(`/users/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Get My Profile ───

export function useMyProfile({ userId, userRole, userStatus }) {
  return useQuery({
    queryKey: ["users", "profile", "me", userId, userRole, userStatus],
    enabled: !!userId && !!userRole && !!userStatus,
    queryFn: async () => {
      try {
        return await api.get("/users/profiles/me", {
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

// ─── Get All Profiles ───

export function useAllProfiles({ userId, userRole, userStatus }) {
  return useQuery({
    queryKey: ["users", "profiles", "all", userId, userRole, userStatus],
    enabled: !!userId && !!userRole && !!userStatus,
    queryFn: async () => {
      try {
        return await api.get("/users/profiles", {
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

// ─── Update Profile ───

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, userId, userRole, userStatus }) => {
      try {
        return await api.put(`/users/profiles/${id}`, data, {
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
      queryClient.invalidateQueries({ queryKey: ["users", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["users", "profiles"] });
    },
  });
}

// ─── Create Profile (internal) ───

export function useCreateProfile() {
  return useMutation({
    mutationFn: async (profileDto) => {
      try {
        return await api.post("/users/internal/create", profileDto);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Favorite Restaurants ───

export function useFavoriteRestaurants({ userId, userRole, userStatus }) {
  return useQuery({
    queryKey: ["users", "favorites", userId, userRole, userStatus],
    enabled: !!userId && !!userRole && !!userStatus,
    queryFn: async () => {
      try {
        return await api.get("/users/profiles/favourites", {
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

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, userId, userRole, userStatus }) => {
      try {
        return await api.post(`/users/profiles/favourites/${restaurantId}`, null, {
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
    onSuccess: (_, { userId, userRole, userStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["users", "favorites", userId, userRole, userStatus] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ restaurantId, userId, userRole, userStatus }) => {
      try {
        return await api.del(`/users/profiles/favourites/${restaurantId}`, {
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
    onSuccess: (_, { userId, userRole, userStatus }) => {
      queryClient.invalidateQueries({ queryKey: ["users", "favorites", userId, userRole, userStatus] });
    },
  });
}

// Convenience hook that combines add/remove
export function useFavorites() {
  const addMutation = useAddFavorite();
  const removeMutation = useRemoveFavorite();

  return {
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    addFavoriteAsync: addMutation.mutateAsync,
    removeFavoriteAsync: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}

// ─── Owner Request ───

export function useOwnerRequest() {
  return useMutation({
    mutationFn: async (username) => {
      try {
        return await api.post("/owner/request", null, {
          query: { username },
        });
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Admin: Approve Owner ───

export function useApproveOwner() {
  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.post(`/admin/approve/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Admin: Reject Owner ───

export function useRejectOwner() {
  return useMutation({
    mutationFn: async (id) => {
      try {
        return await api.post(`/admin/reject/${id}`);
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}

// ─── Admin: Get All Owner Requests ───

export function useOwnerRequests() {
  return useQuery({
    queryKey: ["admin", "owner-requests"],
    queryFn: async () => {
      try {
        return await api.get("/admin/owner-requests");
      } catch (e) {
        throw toApiError(e);
      }
    },
  });
}