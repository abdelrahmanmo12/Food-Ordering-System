// utils/storage.js

export const getOrders = (userId) => {
  if (!userId) return [];

  try {
    const stored = localStorage.getItem(`orders_${userId}`);
    const orders = stored ? JSON.parse(stored) : [];
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
};

export const saveOrders = (userId, orders) => {
  if (!userId) return;
  localStorage.setItem(`orders_${userId}`, JSON.stringify(orders));
};
