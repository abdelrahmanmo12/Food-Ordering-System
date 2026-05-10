import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/admin";

export async function getRestaurantsWithOwners() {
  try {
    if (USE_MOCK_API) return await mock.getRestaurantsWithOwners();
    return await api.get("/admin/restaurants-with-owners");
  } catch (e) {
    throw toApiError(e);
  }
}

export async function assignOwnerToRestaurant(restaurantId, ownerEmail) {
  try {
    if (USE_MOCK_API) return await mock.assignOwnerToRestaurant(restaurantId, ownerEmail);
    return await api.post(`/admin/restaurants/${encodeURIComponent(restaurantId)}/owner`, {
      ownerEmail,
    });
  } catch (e) {
    throw toApiError(e);
  }
}

export async function removeOwnerFromRestaurant(restaurantId) {
  try {
    if (USE_MOCK_API) return await mock.removeOwnerFromRestaurant(restaurantId);
    return await api.del(`/admin/restaurants/${encodeURIComponent(restaurantId)}/owner`);
  } catch (e) {
    throw toApiError(e);
  }
}

