/**
 * API Layer for Orders
 * 
 * This module abstracts all order-related API calls. Currently it wraps the fakeApi
 * functions, but when a real backend is implemented, only this file needs to be updated.
 * Components should import from this module instead of calling fakeApi directly.
 * 
 * Benefits:
 * - Single point of change when switching from fake API to real backend
 * - Consistent interface for all order operations
 * - Easy to add logging, caching, or other cross-cutting concerns
 * - Components remain unchanged when backend is implemented
 */

import { USE_MOCK_API } from "./config";
import { api } from "./client";
import { toApiError } from "./errors";

import * as mock from "../shared/api/mock/orders";

/**
 * Fetch all orders for a specific user
 * @param {string} userId - The user identifier (typically email)
 * @returns {Promise<Array>} - Array of order objects
 */
export const getOrders = (userId) => {
  try {
    if (USE_MOCK_API) return mock.fetchOrders(userId);
    return api.get("/orders", { query: { userId } });
  } catch (e) {
    throw toApiError(e);
  }
};

/**
 * Update the status of an order
 * @param {string} orderId - The order identifier
 * @param {string} status - The new status value
 * @returns {Promise<Object>} - The updated order object
 */
export const updateOrderStatus = (orderId, status) => {
  try {
    if (USE_MOCK_API) return mock.updateOrderStatusById(orderId, status);
    return api.patch(`/orders/${encodeURIComponent(orderId)}/status`, { status });
  } catch (e) {
    throw toApiError(e);
  }
};

/**
 * Fetch all orders across all users (for admin/owner views)
 * @returns {Promise<Array>} - Array of all order objects
 */
export const getAllOrders = () => {
  try {
    if (USE_MOCK_API) return mock.fetchAllOrders();
    return api.get("/orders");
  } catch (e) {
    throw toApiError(e);
  }
};

/**
 * Save a new order
 * @param {string} userId - The user identifier
 * @param {Object} order - The order data
 * @returns {Promise<Array>} - Updated array of orders
 */
export const createOrder = (userId, order) => {
  try {
    if (USE_MOCK_API) return mock.saveOrder(userId, order);
    return api.post("/orders", { userId, order });
  } catch (e) {
    throw toApiError(e);
  }
};