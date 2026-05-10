import { RESTAURANTS } from '../data/restaurants'
import { getOrders, saveOrders } from './storage'

// BASE_URL mindset: future backend endpoints like /restaurants, /restaurants/:id, /orders
export const BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

// Fake API delay
const DELAY = 500;

// Simulate random errors (5% chance)
const shouldFail = () => Math.random() < 0.05;

// Simulate API calls with delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Fake API functions with error handling
export const fetchRestaurants = async () => {
  await delay(DELAY);

  if (shouldFail()) {
    throw new ApiError('Failed to fetch restaurants. Please try again.', 500);
  }

  try {
    // Simulate potential data corruption
    if (!RESTAURANTS || !Array.isArray(RESTAURANTS)) {
      throw new ApiError('Invalid restaurant data received.', 500);
    }

    return RESTAURANTS;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unexpected error while fetching restaurants.', 500);
  }
};

export const fetchRestaurantById = async (id) => {
  await delay(DELAY);

  if (shouldFail()) {
    throw new ApiError('Failed to fetch restaurant details. Please try again.', 500);
  }

  if (!id) {
    throw new ApiError('Restaurant ID is required.', 400);
  }

  try {
    const restaurant = RESTAURANTS.find(r => String(r.id) === String(id));

    if (!restaurant) {
      throw new ApiError(`Restaurant with ID ${id} not found.`, 404);
    }

    return restaurant;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unexpected error while fetching restaurant.', 500);
  }
};

export const submitReview = async (restaurantId, review) => {
  await delay(DELAY);

  if (shouldFail()) {
    throw new ApiError('Failed to submit review. Please try again.', 500);
  }

  // Validate input
  if (!restaurantId) {
    throw new ApiError('Restaurant ID is required.', 400);
  }

  if (!review || typeof review !== 'object') {
    throw new ApiError('Review data is required.', 400);
  }

  if (!review.user || !review.text || review.rating == null) {
    throw new ApiError('Review must include user, text, and rating.', 400);
  }

  if (review.rating < 1 || review.rating > 5) {
    throw new ApiError('Rating must be between 1 and 5.', 400);
  }

  try {
    const restaurant = RESTAURANTS.find(r => String(r.id) === String(restaurantId));

    if (!restaurant) {
      throw new ApiError(`Restaurant with ID ${restaurantId} not found.`, 404);
    }

    if (!restaurant.reviews) {
      restaurant.reviews = [];
    }

    // Check for duplicate review
    const existingReview = restaurant.reviews.find(r => r.user === review.user);
    if (existingReview) {
      throw new ApiError('You have already submitted a review for this restaurant.', 409);
    }

    restaurant.reviews.push(review);
    return restaurant.reviews;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unexpected error while submitting review.', 500);
  }
};

export const fetchOrders = async (userId) => {
  await delay(DELAY);

  if (shouldFail()) {
    throw new ApiError('Failed to fetch orders. Please try again.', 500);
  }

  if (!userId) {
    throw new ApiError('User ID is required.', 400);
  }

  try {
    // In a real app, this would fetch from server
    // For fake API, return empty or stored orders from isolated storage
    const orders = getOrders(userId);

    // Validate stored data
    if (!Array.isArray(orders)) {
      throw new ApiError('Invalid orders data format.', 500);
    }

    return orders;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid stored orders data.', 500);
    }
    throw new ApiError('Unexpected error while fetching orders.', 500);
  }
};

export const saveOrder = async (userId, order) => {
  await delay(DELAY);

  if (shouldFail()) {
    throw new ApiError('Failed to save order. Please try again.', 500);
  }

  // Validate input
  if (!userId) {
    throw new ApiError('User ID is required.', 400);
  }

  if (!order || typeof order !== 'object') {
    throw new ApiError('Order data is required.', 400);
  }

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    throw new ApiError('Order must contain at least one item.', 400);
  }

  try {
    const orders = await fetchOrders(userId);
    orders.unshift(order);

    // Validate before saving
    const orderString = JSON.stringify(orders);
    if (orderString.length > 5 * 1024 * 1024) { // 5MB limit
      throw new ApiError('Order storage limit exceeded.', 413);
    }

    saveOrders(userId, orders);
    return orders;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'QuotaExceededError') {
      throw new ApiError('Local storage is full. Please clear some data.', 507);
    }
    throw new ApiError('Unexpected error while saving order.', 500);
  }
};

export const updateOrderStatus = async (userId, orderId, status) => {
  await delay(DELAY);

  if (shouldFail()) {
    throw new ApiError('Failed to update order status. Please try again.', 500);
  }

  // Validate input
  if (!userId) {
    throw new ApiError('User ID is required.', 400);
  }

  if (!orderId) {
    throw new ApiError('Order ID is required.', 400);
  }

  if (!status) {
    throw new ApiError('Status is required.', 400);
  }

  const validStatuses = ['placed', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  try {
    const orders = await fetchOrders(userId);
    const order = orders.find(o => String(o.id) === String(orderId));

    if (!order) {
      throw new ApiError(`Order with ID ${orderId} not found.`, 404);
    }

    order.status = status;
    saveOrders(userId, orders);
    return orders;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Unexpected error while updating order status.', 500);
  }
};