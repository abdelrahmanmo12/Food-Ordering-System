import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/restaurants";

export async function fetchRestaurants() {
  try {
    if (USE_MOCK_API) return await mock.fetchRestaurants();
    return await api.get("/restaurants");
  } catch (e) {
    throw toApiError(e);
  }
}

export async function fetchRestaurantById(id) {
  try {
    if (USE_MOCK_API) return await mock.fetchRestaurantById(id);
    return await api.get(`/restaurants/${encodeURIComponent(id)}`);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function submitReview(restaurantId, review) {
  try {
    if (USE_MOCK_API) return await mock.submitReview(restaurantId, review);
    return await api.post(`/restaurants/${encodeURIComponent(restaurantId)}/reviews`, review);
  } catch (e) {
    throw toApiError(e);
  }
}

