// context/AppContext.jsx
// Order service endpoints (through gateway port 8080):
//   POST /orders                     → place order
//   GET  /orders/customer/{id}       → load user's orders
//   GET  /orders/{id}                → get single order (for tracking)
//   PATCH /orders/{id}/status        → (owner/admin only — not used here)

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { api } from '../api/client'
import { useCart } from './CartContext';

const AppCtx = createContext()

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("user");
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [page, setPage] = useState("home");
  const toastTimer = useRef(null);
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const queryClient = useQueryClient();

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token');
    const savedUser = localStorage.getItem('auth-user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      } catch {  }
    }

    const savedFavorites = localStorage.getItem('food-ordering-favorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); }
      catch { setFavorites([]); }
    }
  }, []);

  // ── Load orders & favorites when user is set ──────────────────────────────
  useEffect(() => {
    if (!user) {
      setOrders([]);
      // Don't clear favorites if they were loaded from localStorage for guest
      return;
    }

    const loadData = async () => {
      try {
        // Load Orders
        const ordersData = await api.get(`/api/orders/me`);
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.content ?? []);

        // Load Favorites from Backend
        const favsData = await api.get(`/users/profiles/favourites`);
        if (Array.isArray(favsData)) {
          setFavorites(favsData.map(String)); // store as strings for consistency
          localStorage.setItem('food-ordering-favorites', JSON.stringify(favsData.map(String)));
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    };

    loadData();
  }, [user]);

  // ── Favorites ────────────────────────────────────────────────────────────
  const toggleFavorite = (restaurantId) => {
    const idStr = String(restaurantId);
    setFavorites(prev => {
      const isFav = prev.includes(idStr);
      const next = isFav ? prev.filter(id => id !== idStr) : [...prev, idStr];
      localStorage.setItem('food-ordering-favorites', JSON.stringify(next));

      // Sync to backend if logged in
      if (user) {
        if (!isFav) {
          api.post(`/users/profiles/favourites/${restaurantId}`).catch(() => { });
        } else {
          api.del(`/users/profiles/favourites/${restaurantId}`).catch(() => { });
        }
      }

      return next;
    });
  };

  const isFavorite = (restaurantId) => favorites.includes(String(restaurantId));

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const data = await api.post("/auth/login", { email, password });

      const loggedInUser = {
        id: data.accountId ?? data.userId ?? data.id,
        email,
        name: data.name ?? email.split("@")[0],
        role: (data.role ?? "user").toLowerCase(),
        status: data.status ?? "APPROVED",
      };

      setUser(loggedInUser);
      setRole(loggedInUser.role);
      localStorage.setItem('auth-token', data.token ?? data.accessToken);
      localStorage.setItem('auth-refresh-token', data.refreshToken || "");
      localStorage.setItem('auth-user', JSON.stringify(loggedInUser));

      showToast(`Welcome back! 👋`);

      if (loggedInUser.role === "admin") navigate("/admin");
      else if (loggedInUser.role === "owner") navigate("/owner");
      else if (loggedInUser.role === "delivery") navigate("/driver");
      else navigate("/");

      return true;
    } catch (err) {
      showToast(err.message || "Login failed", "error");
      return false;
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      if (user?.id) await api.post("/auth/logout", null, {
        headers: { "X-User-Id": String(user.id) },
      });
    } catch {  }

    setUser(null);
    setRole("user");
    setOrders([]);
    setActiveOrder(null);
    clearCart();
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-refresh-token');
    localStorage.removeItem('auth-user');
    localStorage.removeItem('food-ordering-favorites');
    queryClient.clear(); 
    navigate("/");
    showToast("Logged out successfully");
  };

  // ── Place order (cash / manual — navigates to tracking immediately) ──────
  // OrderRequest schema (adjust field names to match your Spring Boot DTO):
  //   restaurantId, customerId, items: [{ menuItemId, quantity, price }],
  //   deliveryAddress, specialInstructions, totalAmount
  const placeOrder = async (cart, cartTotal, customerInfo = {}) => {
    if (!user) { navigate("/auth"); return; }
    if (cart.length === 0) return;

    const orderRequest = {
      restaurantId: cart[0].restaurantId,
      customerId: user.id,
      address: customerInfo.address || '',
      paymentMethod: 'CASH_ON_DELIVERY',
      items: cart.map(item => ({
        itemId: item.id,
        quantity: item.qty || item.quantity || 1,
      })),
    };

    try {
      const created = await api.post("/api/orders", orderRequest);

      const newOrder = {
        id: created.id ?? created.orderId,
        restaurantId: created.restaurantId ?? cart[0].restaurantId,
        restaurantName: created.restaurantName ?? cart[0].restaurantName,
        items: created.items ?? cart,
        total: created.totalAmount ?? cartTotal,
        status: created.status ?? "PLACED",
        placedAt: created.createdAt ?? new Date().toISOString(),
      };

      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      navigate(`/tracking/${newOrder.id}`);
      showToast("Order placed! 🎉 Tracking live.");
      startStatusPolling(newOrder.id);

      return newOrder;
    } catch (err) {
      showToast(err.message || "Failed to place order. Please try again.", "error");
      throw err;
    }
  };

  // ── Place order only (Stripe flow — NO navigate, NO toast, returns order) ─
  // Use this when checkout needs to create the order first, then do Stripe,
  // then navigate to /payment-success itself after payment succeeds.
  const placeOrderOnly = async (cart, cartTotal, customerInfo = {}, paymentMethod = 'CREDIT_CARD') => {
    if (!user) { navigate("/auth"); return null; }
    if (cart.length === 0) return null;

    const orderRequest = {
      restaurantId: cart[0].restaurantId,
      customerId: user.id,
      address: customerInfo.address || '',
      paymentMethod: paymentMethod,
      items: cart.map(item => ({
        itemId: item.id,
        quantity: item.qty || item.quantity || 1,
      })),
    };

    const created = await api.post("/api/orders", orderRequest);

    const newOrder = {
      id: created.id ?? created.orderId,
      restaurantId: created.restaurantId ?? cart[0].restaurantId,
      restaurantName: created.restaurantName ?? cart[0].restaurantName,
      items: created.items ?? cart,
      total: created.totalAmount ?? cartTotal,
      totalAmount: created.totalAmount ?? cartTotal,
      status: created.status ?? "PLACED",
      placedAt: created.createdAt ?? new Date().toISOString(),
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    return newOrder; // caller handles navigation
  };

  // ── Poll a single order's status (for live tracking) ─────────────────────
  const pollingRef = useRef(null);

  const startStatusPolling = useCallback((orderId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const updated = await api.get(`/api/orders/${orderId}`);
        const status = updated.status ?? updated.orderStatus;

        setActiveOrder(prev =>
          prev && String(prev.orderId || prev.id) === String(orderId)
            ? { ...prev, status }
            : prev
        );
        setOrders(prev =>
          prev.map(o => String(o.orderId || o.id) === String(orderId) ? { ...o, status } : o)
        );

        // Stop polling when order is in a terminal state
        const terminal = ["DELIVERED", "CANCELLED", "REJECTED"];
        if (terminal.includes(status?.toUpperCase())) {
          clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error("Status poll failed:", err);
      }
    }, 10_000); // every 10 seconds
  }, []);

  // Clean up polling on unmount
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  return (
    <AppCtx.Provider value={{
      user, role, orders, favorites, toast, selectedRestaurant, activeOrder, page,
      setSelectedRestaurant, setActiveOrder, setPage,
      login, logout, placeOrder, placeOrderOnly, showToast, toggleFavorite, isFavorite,
      startStatusPolling,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);