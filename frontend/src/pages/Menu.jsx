
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import  Badge   from '../components/Badge.jsx'
import  Btn  from '../components/Button'
import { api } from '../api/client'
import { submitReview } from '../utils/fakeApi'

 export default function Menu() {
  const { id } = useParams();
  const { user } = useApp();
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load restaurant data
        const restaurantData = await api.get(`/restaurants/${id}`);
        setRestaurant(restaurantData);
        
        // Load menu items separately
        try {
          const menuData = await api.get(`/menu/${id}`);
          // Add restaurant name to each menu item for cart context
          const menuItemsWithName = Array.isArray(menuData) ? menuData.map(item => ({
            ...item,
            restaurantName: restaurantData.name
          })) : [];
          setMenuItems(menuItemsWithName);
        } catch (menuError) {
          console.error('Failed to load menu items:', menuError);
          setMenuItems([]);
        }
      } catch (error) {
        console.error('Failed to load restaurant:', error);
        setError(error.message || 'Failed to load restaurant details.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);



  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}>Loading restaurant...</div>;
  if (error) return (
    <div style={{
      maxWidth: 600,
      margin: "80px auto",
      padding: 24,
      textAlign: "center",
      background: "var(--bg2)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)"
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ color: "var(--red)", marginBottom: 12 }}>Error Loading Restaurant</h2>
      <p style={{ color: "var(--text2)", marginBottom: 20 }}>{error}</p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "8px 16px",
          background: "var(--primary)",
          color: "white",
          border: "none",
          borderRadius: "var(--radius)",
          cursor: "pointer"
        }}
      >
        Refresh Page
      </button>
    </div>
  );
  if (!restaurant) return <div>Restaurant not found</div>;

  const categories = ["All", ...new Set((menuItems || []).map(i => i.category).filter(Boolean))];
  const filtered = (menuItems || []).filter(i => activeCategory === "All" || i.category === activeCategory);
  const cartItems = cart.reduce((acc, c) => ({ ...acc, [c.id]: c.qty }), {});

  // Determine if restaurant is open
  const isOpen = restaurant.isOpen ?? restaurant.opened ?? true;

  const displayRating = restaurant.rating;



  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {}
      <div style={{ animation: "fadeUp 0.4s ease" }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "none", color: "var(--amber)", cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 20, padding: 0, display: "flex", alignItems: "center", gap: 6,
        }}>← Back to Restaurants</button>

        <div style={{
          background: `linear-gradient(135deg, ${restaurant.coverColor} 0%, var(--bg2) 100%)`,
          borderRadius: "var(--radius-lg)", padding: "32px 36px", marginBottom: 36,
          border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 24,
        }}>
          <div style={{ flexShrink: 0, width: 120, height: 120 }}>
            <img src={restaurant.imageUrl || restaurant.image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 900, marginBottom: 8 }}>{restaurant.name}</h1>
            <div style={{ display: "flex", gap: 16, fontSize: 14, color: "var(--text2)", flexWrap: "wrap" }}>
              <span>⭐ {displayRating || 0}</span>
              <span>⏱️ {restaurant.deliveryTime?.min || 30}–{restaurant.deliveryTime?.max || 45} min</span>
              <span>🍽️ {restaurant.cuisine || "General"}</span>
              <span>💳 Min {restaurant.minOrder || 0} EGP</span>
            </div>
            <p style={{ marginTop: 10, color: "var(--text2)", fontSize: 14 }}>{restaurant.description}</p>
          </div>
          {!isOpen && (
            <div style={{
              background: "var(--red)", color: "white", padding: "12px 24px",
              borderRadius: "var(--radius)", fontWeight: 700, fontSize: 14,
              animation: "pulse 2s infinite"
            }}>
              CLOSED
            </div>
          )}
        </div>
      </div>

      {}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
            background: activeCategory === cat ? "var(--amber)" : "var(--bg2)",
            color: activeCategory === cat ? "#1a1200" : "var(--text2)",
            border: activeCategory === cat ? "1px solid var(--amber)" : "1px solid var(--border)",
          }}>{cat}</button>
        ))}
      </div>

      {}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 48 }}>
        {filtered.map((item, i) => (
          <MenuItem key={item.id} item={item} qtyInCart={cartItems[item.id] || 0}
            onAdd={() => addToCart(restaurant.id, item)}
            delay={i * 0.05}
            disabled={!isOpen}
          />
        ))}
      </div>


    </div>
  );
}

function MenuItem({ item, qtyInCart, onAdd, delay, disabled }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{
      background: "var(--bg2)", border: `1px solid ${hovered ? "var(--amber)" : "var(--border)"}`,
      borderRadius: "var(--radius)", padding: "18px 20px",
      display: "flex", gap: 14, alignItems: "flex-start",
      transition: "all 0.2s", animation: `fadeUp 0.4s ${delay}s ease both`,
    }}>
      <span style={{ fontSize: 40, lineHeight: 1 }}>{(item.imageUrl || item.image) ? (
  <img
    src={item.imageUrl || item.image}
    alt={item.name}
    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
  />
) : (
  <span style={{ fontSize: 40 }}>{item.emoji || "🍴"}</span>
)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <h4 style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</h4>
          {item.discount > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: 8 }}>
              <span style={{ color: "var(--text3)", textDecoration: "line-through", fontSize: 12 }}>{item.price} EGP</span>
              <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>
                {(item.price - (item.price * item.discount / 100)).toFixed(2)} EGP
              </span>
            </div>
          ) : (
            <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", marginLeft: 8 }}>{item.price} EGP</span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12, lineHeight: 1.5 }}>{item.description || item.desc}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Badge color="var(--text3)" style={{ fontSize: 10 }}>{item.category}</Badge>
          <Btn 
            size="sm" 
            onClick={disabled ? null : onAdd} 
            style={{ 
              padding: "6px 14px", 
              fontSize: 13,
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
              background: disabled ? "var(--bg3)" : "var(--primary)",
              color: disabled ? "var(--text3)" : "white"
            }}
            disabled={disabled}
          >
            {disabled ? "Closed" : (qtyInCart > 0 ? `+1 (${qtyInCart})` : "+ Add")}
          </Btn>
        </div>
      </div>
    </div>
  );
}
