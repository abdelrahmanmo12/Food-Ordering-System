
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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load restaurant data
        const restaurantData = await api.get(`/restaurants/${id}`);
        setRestaurant(restaurantData);
        setReviews(restaurantData?.reviews || []);
        
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

  const userReview = user ? reviews.find(r => r.user === user.name) : null;

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

  const displayRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : restaurant.rating;

  const handleSubmitReview = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!reviewText.trim()) {
      setReviewError("Please add a review before submitting.");
      return;
    }
    if (userReview) {
      setReviewError("You have already submitted a review for this restaurant.");
      return;
    }

    const nextReview = {
      id: Date.now(),
      user: user.name,
      rating: reviewRating,
      text: reviewText.trim(),
      date: new Date().toLocaleDateString(),
    };

    try {
      const updatedReviews = await submitReview(restaurant.id, nextReview);
      setReviews(updatedReviews);
      setReviewText("");
      setReviewRating(5);
      setReviewError("");
    } catch (error) {
      console.error('Failed to submit review:', error);
      setReviewError(error.message || "Failed to submit review. Please try again.");
    }
  };

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
              <span>{reviews.length ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet"}</span>
              <span>⏱️ {restaurant.deliveryTime?.min || 30}–{restaurant.deliveryTime?.max || 45} min</span>
              <span>🍽️ {restaurant.cuisine || "General"}</span>
              <span>💳 Min {restaurant.minOrder || 0} EGP</span>
            </div>
            <p style={{ marginTop: 10, color: "var(--text2)", fontSize: 14 }}>{restaurant.description}</p>
          </div>
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
          />
        ))}
      </div>

      {}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24, marginBottom: 32 }}>
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6 }}>Customer reviews</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{displayRating} ⭐</div>
              <div style={{ color: "var(--text2)", fontSize: 13 }}>{reviews.length ? `${reviews.length} review${reviews.length > 1 ? "s" : ""}` : "No reviews yet"}</div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)} style={{
                  border: "none", background: "transparent", cursor: "pointer", fontSize: 22,
                  color: star <= reviewRating ? "var(--amber)" : "var(--text3)",
                }}>
                  ★
                </button>
              ))}
            </div>
          </div>

          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder={user ? (userReview ? "You already reviewed this restaurant." : "Share your experience...") : "Sign in to leave a review"}
            rows={5}
            disabled={!!userReview}
            style={{
              width: "100%", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 14,
              padding: "14px 16px", color: "var(--text)", resize: "vertical", fontSize: 14,
            }}
          />
          {reviewError && <div style={{ marginTop: 12, color: "#f87171", fontSize: 13 }}>{reviewError}</div>}
          <Btn onClick={handleSubmitReview} size="sm" style={{ width: "100%", marginTop: 18 }} disabled={!!userReview}>
            {user ? (userReview ? "Review Submitted" : "Submit Review") : "Sign in to review"}
          </Btn>
          {userReview && <div style={{ marginTop: 12, color: "var(--text2)", fontSize: 13 }}>You already posted a review as {user.name}.</div>}
        </div>

        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <h3 style={{ marginBottom: 18, fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Recent reviews</h3>
          {reviews.length === 0 ? (
            <div style={{ color: "var(--text2)", fontSize: 14 }}>No reviews yet. Be the first to rate this restaurant.</div>
          ) : (
            reviews.slice().reverse().map(review => (
              <div key={review.id} style={{ marginBottom: 18, borderBottom: "1px solid var(--border)", paddingBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>{review.user}</span>
                  <span style={{ color: "var(--amber)" }}>{'★'.repeat(review.rating)}</span>
                </div>
                <div style={{ color: "var(--text2)", fontSize: 12, marginBottom: 10 }}>{review.date}</div>
                <p style={{ margin: 0, color: "var(--text)", lineHeight: 1.6 }}>{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ item, qtyInCart, onAdd, delay }) {
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
          <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", marginLeft: 8 }}>{item.price} EGP</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12, lineHeight: 1.5 }}>{item.description || item.desc}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Badge color="var(--text3)" style={{ fontSize: 10 }}>{item.category}</Badge>
          <Btn size="sm" onClick={onAdd} style={{ padding: "6px 14px", fontSize: 13 }}>
            {qtyInCart > 0 ? `+1 (${qtyInCart})` : "+ Add"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
