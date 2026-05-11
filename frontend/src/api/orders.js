

import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/orders";

export const getOrders = (userId) => {
  try {
    if (USE_MOCK_API) return mock.fetchOrders(userId);
    return api.get("/api/orders", { query: { userId } });
  } catch (e) {
    throw toApiError(e);
  }
};

export const updateOrderStatus = (orderId, status) => {
  try {
    if (USE_MOCK_API) return mock.updateOrderStatusById(orderId, status);
    return api.patch(`/api/orders/${encodeURIComponent(orderId)}/status`, { status });
  } catch (e) {
    throw toApiError(e);
  }
};

export const getAllOrders = () => {
  try {
    if (USE_MOCK_API) return mock.fetchAllOrders();
    return api.get("/api/orders");
  } catch (e) {
    throw toApiError(e);
  }
};

export const createOrder = (userId, order) => {
  try {
    if (USE_MOCK_API) return mock.saveOrder(userId, order);
    return api.post("/api/orders", { userId, order });
  } catch (e) {
    throw toApiError(e);
  }
};