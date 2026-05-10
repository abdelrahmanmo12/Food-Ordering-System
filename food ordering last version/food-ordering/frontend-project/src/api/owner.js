import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/owner";

export async function addMenuItem(restaurantId, itemData) {
  try {
    if (USE_MOCK_API) return await mock.addMenuItem(restaurantId, itemData);
    return await api.post(`/owner/restaurants/${encodeURIComponent(restaurantId)}/menu`, itemData);
  } catch (e) {
    throw toApiError(e);
  }
}

export async function updateMenuItem(restaurantId, itemId, itemData) {
  try {
    if (USE_MOCK_API) return await mock.updateMenuItem(restaurantId, itemId, itemData);
    return await api.put(
      `/owner/restaurants/${encodeURIComponent(restaurantId)}/menu/${encodeURIComponent(itemId)}`,
      itemData
    );
  } catch (e) {
    throw toApiError(e);
  }
}

export async function deleteMenuItem(restaurantId, itemId) {
  try {
    if (USE_MOCK_API) return await mock.deleteMenuItem(restaurantId, itemId);
    return await api.del(
      `/owner/restaurants/${encodeURIComponent(restaurantId)}/menu/${encodeURIComponent(itemId)}`
    );
  } catch (e) {
    throw toApiError(e);
  }
}

export async function createOffer(restaurantId, offerData) {
  try {
    if (USE_MOCK_API) return await mock.createOffer(restaurantId, offerData);
    return await api.post(
      `/owner/restaurants/${encodeURIComponent(restaurantId)}/offers`,
      offerData
    );
  } catch (e) {
    throw toApiError(e);
  }
}

export async function updateOffer(restaurantId, offerId, offerData) {
  try {
    if (USE_MOCK_API) return await mock.updateOffer(restaurantId, offerId, offerData);
    return await api.put(
      `/owner/restaurants/${encodeURIComponent(restaurantId)}/offers/${encodeURIComponent(offerId)}`,
      offerData
    );
  } catch (e) {
    throw toApiError(e);
  }
}

export async function deleteOffer(restaurantId, offerId) {
  try {
    if (USE_MOCK_API) return await mock.deleteOffer(restaurantId, offerId);
    return await api.del(
      `/owner/restaurants/${encodeURIComponent(restaurantId)}/offers/${encodeURIComponent(offerId)}`
    );
  } catch (e) {
    throw toApiError(e);
  }
}

export async function getMonthlyReport(restaurantId, year, month) {
  try {
    if (USE_MOCK_API) return await mock.getMonthlyReport(restaurantId, year, month);
    return await api.get(`/owner/restaurants/${encodeURIComponent(restaurantId)}/reports/monthly`, {
      query: { year, month },
    });
  } catch (e) {
    throw toApiError(e);
  }
}

