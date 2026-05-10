import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/rider";

export async function getAvailableDeliveries() {
  try {
    if (USE_MOCK_API) return await mock.getAvailableDeliveries();
    return await api.get("/rider/deliveries/available");
  } catch (e) {
    throw toApiError(e);
  }
}

export async function acceptDelivery(riderId, orderId) {
  try {
    if (USE_MOCK_API) return await mock.acceptDelivery(riderId, orderId);
    return await api.post(`/rider/deliveries/${encodeURIComponent(orderId)}/accept`, { riderId });
  } catch (e) {
    throw toApiError(e);
  }
}

export async function updateDeliveryStatus(riderId, orderId, status) {
  try {
    if (USE_MOCK_API) return await mock.updateDeliveryStatus(riderId, orderId, status);
    return await api.patch(`/rider/deliveries/${encodeURIComponent(orderId)}/status`, {
      riderId,
      status,
    });
  } catch (e) {
    throw toApiError(e);
  }
}

export async function getRiderDeliveries(riderId) {
  try {
    if (USE_MOCK_API) return await mock.getRiderDeliveries(riderId);
    return await api.get("/rider/deliveries", { query: { riderId } });
  } catch (e) {
    throw toApiError(e);
  }
}

export async function getRiderStats(riderId) {
  try {
    if (USE_MOCK_API) return await mock.getRiderStats(riderId);
    return await api.get("/rider/stats", { query: { riderId } });
  } catch (e) {
    throw toApiError(e);
  }
}

