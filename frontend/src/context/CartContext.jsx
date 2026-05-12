import { createContext, useContext, useState } from 'react'
import { RESTAURANTS } from '../data/restaurants'

const CartCtx = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (restaurantId, item) => {
    const rest = RESTAURANTS.find(r => r.id === restaurantId);
    
    // Check if restaurant is closed (handling both mock data and potential API field names)
    const isOpen = rest ? (rest.isOpen ?? rest.opened ?? true) : true;
    if (!isOpen) {
      alert("This restaurant is currently closed and not accepting orders.");
      return;
    }

    if (cart.length > 0 && cart[0].restaurantId !== restaurantId) {
      if (!window.confirm("Replace your current cart from another restaurant?")) return;
      setCart([]);
    }
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      // Use restaurant name from item if available, fallback to mock data, or use default
      const restaurantName = item.restaurantName || (rest && rest.name) || 'Restaurant';
      return [...prev, { ...item, restaurantId, restaurantName, qty: 1 }];
    });
  };

  const removeFromCart = (itemId) => setCart(prev => prev.filter(c => c.id !== itemId));
  const updateQty = (itemId, delta) => setCart(prev =>
    prev.map(c => c.id === itemId ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
  );

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <CartCtx.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart, cartTotal, cartCount
    }}>
      {children}
    </CartCtx.Provider>
  );
}

export const useCart = () => useContext(CartCtx)