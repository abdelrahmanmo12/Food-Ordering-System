// context/AppContext.jsx
// Order service endpoints (through gateway port 8080):
//   POST /orders                     → place order
//   GET  /orders/customer/{id}       → load user's orders
//   GET  /orders/{id}                → get single order (for tracking)
//   PATCH /orders/{id}/status        → (owner/admin only — not used here)

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from "react-router-dom";
import { api } from '../api/client'

const AppCtx = createContext()

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [role, setRole]               = useState("customer");
  const [orders, setOrders]           = useState([]);
  const [favorites, setFavorites]     = useState([]);
  const [toast, setToast]             = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [page, setPage]               = useState("home");
  const toastTimer = useRef(null);
  const navigate = useNavigate();

  // ── Restore session on mount ──────────────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('auth-token');
    const savedUser  = localStorage.getItem('auth-user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
      } catch { /* corrupted storage — ignore */ }
    }

    const savedFavorites = localStorage.getItem('food-ordering-favorites');
    if (savedFavorites) {
      try { setFavorites(JSON.parse(savedFavorites)); }
      catch { setFavorites([]); }
    }
  }, []);

  // ── Load orders when user is set ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { setOrders([]); return; }

    const loadOrders = async () => {
      try {
        // GET /orders/customer/{userId} — adjust path if your backend differs
        const data = await api.get(`/orders/customer/${user.id}`);
        setOrders(Array.isArray(data) ? data : data.content ?? []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    };

    loadOrders();
  }, [user]);

  // ── Favorites (local — synced to backend via Profile page) ────────────────
  const toggleFavorite = (restaurantId) => {
    setFavorites(prev => {
      const isFav = prev.includes(restaurantId);
      const next  = isFav ? prev.filter(id => id !== restaurantId) : [...prev, restaurantId];
      localStorage.setItem('food-ordering-favorites', JSON.stringify(next));

      // Also sync to backend (fire-and-forget)
      if (!isFav) {
        api.post(`/users/profiles/favourites/${restaurantId}`).catch(() => {});
      }

      return next;
    });
  };

  const isFavorite = (restaurantId) => favorites.includes(restaurantId);

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
        id:     data.userId ?? data.id,
        email,
        name:   data.name ?? email.split("@")[0],
        role:   (data.role ?? "customer").toLowerCase(),
        status: data.status ?? "APPROVED",
      };

      setUser(loggedInUser);
      setRole(loggedInUser.role);
      localStorage.setItem('auth-token', data.token ?? data.accessToken);
      localStorage.setItem('auth-user',  JSON.stringify(loggedInUser));

      showToast(`Welcome back! 👋`);

      if (loggedInUser.role === "admin")       navigate("/admin");
      else if (loggedInUser.role === "owner")  navigate("/owner");
      else if (loggedInUser.role === "delivery") navigate("/driver");
      else                                     navigate("/");

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
    } catch { /* ignore logout errors */ }

    setUser(null);
    setRole("customer");
    setOrders([]);
    setActiveOrder(null);
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    navigate("/");
    showToast("Logged out successfully");
  };

  // ── Place order ───────────────────────────────────────────────────────────
  // OrderRequest schema (adjust field names to match your Spring Boot DTO):
  //   restaurantId, customerId, items: [{ menuItemId, quantity, price }],
  //   deliveryAddress, specialInstructions, totalAmount
  const placeOrder = async (cart, cartTotal, customerInfo = {}) => {
    if (!user)          { navigate("/auth"); return; }
    if (cart.length === 0) return;

    // Build the request body matching your OrderRequest DTO
    const orderRequest = {
      restaurantId:        cart[0].restaurantId,
      customerId:          user.id,
      totalAmount:         cartTotal,
      deliveryAddress:     customerInfo.address || '',
      specialInstructions: customerInfo.notes   || '',
      items: cart.map(item => ({
        menuItemId: item.id,
        quantity:   item.quantity,
        price:      item.price,
      })),
    };

    try {
      const created = await api.post("/orders", orderRequest);

      // Normalise the response — Spring Boot may return the full order object
      const newOrder = {
        id:             created.id ?? created.orderId,
        restaurantId:   created.restaurantId ?? cart[0].restaurantId,
        restaurantName: created.restaurantName ?? cart[0].restaurantName,
        items:          created.items ?? cart,
        total:          created.totalAmount ?? cartTotal,
        status:         created.status ?? "PLACED",
        placedAt:       created.createdAt ?? new Date().toISOString(),
      };

      setOrders(prev => [newOrder, ...prev]);
      setActiveOrder(newOrder);
      navigate(`/tracking/${newOrder.id}`);
      showToast("Order placed! 🎉 Tracking live.");

      // Poll the order status every 10s so tracking page stays live
      startStatusPolling(newOrder.id);

      return newOrder;
    } catch (err) {
      showToast(err.message || "Failed to place order. Please try again.", "error");
      throw err;
    }
  };

  // ── Poll a single order's status (for live tracking) ─────────────────────
  const pollingRef = useRef(null);

  const startStatusPolling = useCallback((orderId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const updated = await api.get(`/orders/${orderId}`);
        const status  = updated.status ?? updated.orderStatus;

        setActiveOrder(prev =>
          prev && String(prev.id) === String(orderId)
            ? { ...prev, status }
            : prev
        );
        setOrders(prev =>
          prev.map(o => String(o.id) === String(orderId) ? { ...o, status } : o)
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
      login, logout, placeOrder, showToast, toggleFavorite, isFavorite,
      startStatusPolling,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);