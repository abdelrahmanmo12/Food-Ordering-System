import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/ratings";

export async function submitRating(ratingData) {
  try {
    if (USE_MOCK_API) return await mock.submitRating(ratingData);
    return await api.post("/ratings", ratingData);
  } catch (e) {
    throw toApiError(e);
  }
}

// Note: in mock mode this reads localStorage via fakeApi.
// In backend mode you should replace this with an endpoint like /users/me/ratings.
export async function getUserRatings(userId) {
  try {
    if (USE_MOCK_API) return mock.getUserRatings(userId);
    return await api.get("/ratings", { query: { userId } });
  } catch (e) {
    throw toApiError(e);
  }
}

