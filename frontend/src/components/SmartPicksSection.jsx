import { useState } from "react";
import { useCart } from "../context/CartContext";
import { RESTAURANTS } from "../data/restaurants";

const mostOrderedItems = [
  {
    id: "item_202", // Use actual item ID from restaurant
    name: "BBQ Ranch Melt",
    restaurant: "Burger Republic",
    restaurantId: "rest_2",
    orders: 120,
    price: 105,
    image: "/imgs/BBQ Ranch Melt.png",
    category: "Burgers",
  },
  {
    id: "item_402", // Use actual item ID from restaurant
    name: "Diavola",
    restaurant: "Pizza Palazzo",
    restaurantId: "rest_4",
    orders: 95,
    price: 115,
    image: "/imgs/Diavola.png",
    category: "Pizzas",
  },
  {
    id: "item_301", // Use actual item ID from restaurant
    name: "Salmon Nigiri (2pc)",
    restaurant: "Sakura Sushi",
    restaurantId: "rest_3",
    orders: 90,
    price: 85,
    image: "/imgs/Salmon Nigiri (2pc).png",
    category: "Nigiri",
  },
  {
    id: "item_403", // Use actual item ID from restaurant
    name: "Quattro Formaggi",
    restaurant: "Pizza Palazzo",
    restaurantId: "rest_4",
    orders: 60,
    price: 125,
    image: "/imgs/Quattro Formaggi.png",
    category: "Pizzas",
  },
  {
    id: "item_106", // Use actual item ID from restaurant
    name: "Om Ali",
    restaurant: "Cairo Grill House",
    restaurantId: "rest_1",
    orders: 63,
    price: 60,
    image: "/imgs/Om Ali.png",
    category: "Desserts",
  },
];

const sectionStyles = {
  position: "relative",
  overflow: "hidden",
  padding: "40px 24px",
  marginBottom: 40,
  borderRadius: "var(--radius-lg)",
  background: "linear-gradient(180deg, rgba(17,16,16,0.96) 0%, rgba(19,18,18,0.92) 100%)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
};

const sectionHeaderStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 24,
};

const sectionTitleStyles = {
  fontFamily: "'Playfair Display', serif",
  fontSize: "clamp(28px, 3vw, 36px)",
  fontWeight: 800,
  color: "var(--text)",
  margin: 0,
};

const sectionMetaStyles = {
  color: "var(--text2)",
  fontSize: 14,
  marginTop: 8,
};

const viewAllStyles = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  color: "var(--amber)",
  fontWeight: 700,
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
};

const cardsGridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: 20,
};

const cardStyles = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--radius-lg)",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "var(--bg2)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
  cursor: "pointer",
  transition: "transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease",
  display: "flex",
  flexDirection: "column",
};

const activeCardStyles = {
  borderColor: "rgba(245,166,35,0.7)",
  transform: "translateY(-4px)",
  boxShadow: "0 28px 70px rgba(245,166,35,0.16)",
};

const cardImageWrapperStyles = {
  position: "relative",
  minHeight: 180,
  overflow: "hidden",
  background: "rgba(0,0,0,0.08)",
};

const cardImageStyles = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const rankBadgeStyles = {
  position: "absolute",
  top: 16,
  left: 16,
  background: "var(--amber)",
  color: "#1a1200",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.02em",
};

const heartButtonStyles = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 36,
  height: 36,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.4)",
  color: "white",
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
};

const cardContentStyles = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const restaurantLabelStyles = {
  color: "var(--text2)",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
};

const cardNameStyles = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "var(--text)",
  lineHeight: 1.2,
};

const cardStatsStyles = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  color: "var(--text2)",
  fontSize: 13,
};

const ordersBadgeStyles = {
  background: "rgba(245,166,35,0.12)",
  color: "var(--amber)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 700,
};

const cardFooterStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const priceStyles = {
  fontWeight: 800,
  color: "var(--amber)",
};

const addButtonStyles = {
  marginTop: 8,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 999,
  border: "none",
  background: "var(--amber)",
  color: "#1a1200",
  fontWeight: 700,
  cursor: "pointer",
};

function SmartPickCard({ card, index, isActive, onSelect }) {
  const { addToCart } = useCart();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(card);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    const restaurant = RESTAURANTS.find(r => r.id === card.restaurantId);
    const item = restaurant.items.find(i => i.id === card.id);
    if (item) {
      addToCart(card.restaurantId, item);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(card)}
      onKeyDown={handleKeyDown}
      style={{
        ...cardStyles,
        ...(isActive ? activeCardStyles : {}),
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = isActive ? "translateY(-4px)" : "translateY(0)";
      }}
    >
      <div style={cardImageWrapperStyles}>
        <img src={card.image} alt={card.name} style={cardImageStyles} />
        <span style={rankBadgeStyles}>#{index + 1}</span>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          style={heartButtonStyles}
        >
          ❤️
        </button>
      </div>
      <div style={cardContentStyles}>
        <span style={restaurantLabelStyles}>{card.restaurant}</span>
        <h3 style={cardNameStyles}>{card.name}</h3>
        <div style={cardStatsStyles}>
          <span style={ordersBadgeStyles}>{card.orders} orders today</span>
        </div>
        <div style={cardFooterStyles}>
          <span style={{ color: "var(--text2)", fontSize: 13 }}>{card.category}</span>
          <span style={priceStyles}>{card.price} EGP</span>
        </div>
        <button type="button" style={addButtonStyles} onClick={handleAddToCart}>+ Add to cart</button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      minHeight: 180,
      borderRadius: "var(--radius-lg)",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(255,255,255,0.03)",
      padding: 24,
      boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
      display: "flex",
      flexDirection: "column",
      gap: 18,
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 18, background: "rgba(255,255,255,0.08)" }} />
      <div style={{ width: "60%", height: 22, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
      <div style={{ width: "100%", height: 16, borderRadius: 999, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ width: "90%", height: 16, borderRadius: 999, background: "rgba(255,255,255,0.06)" }} />
      <div style={{ width: "120px", height: 40, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

export default function SmartPicksSection({
  cards = mostOrderedItems,
  loading = false,
  selectedId = null,
  onFilterSelect,
}) {
  const [internalSelectedId, setInternalSelectedId] = useState(null);
  const activeId = selectedId ?? internalSelectedId;

  const handleSelect = (card) => {
    if (selectedId === undefined) {
      setInternalSelectedId(card.id);
    }
    if (typeof onFilterSelect === "function") {
      onFilterSelect(card.id);
    } else {
      // no-op
    }
  };

  return (
    <section style={sectionStyles}>
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at top left, rgba(245,166,35,0.16), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.08), transparent 22%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        inset: "0 0 auto 0",
        height: 140,
        background: "linear-gradient(180deg, rgba(17,16,16,0.9), transparent)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto" }}>
        <div style={sectionHeaderStyles}>
          <div>
            <h2 style={sectionTitleStyles}>Most ordered right now</h2>
            <p style={sectionMetaStyles}>Based on real orders</p>
          </div>
          <button type="button" style={viewAllStyles}>
            View all <span style={{ transform: "translateX(2px)" }}>→</span>
          </button>
        </div>

        {loading ? (
          <div style={cardsGridStyles}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cards.length === 0 ? (
          <div style={{
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            padding: 32,
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}>
            <p style={{ color: "var(--amber)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 16 }}>
              No orders available
            </p>
            <h3 style={{ margin: 0, color: "var(--text)", fontSize: 28, lineHeight: 1.2 }}>No top items found</h3>
            <p style={{ marginTop: 16, color: "var(--text2)", fontSize: 15, lineHeight: 1.8, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              Please refresh or check again later for the latest top-selling dishes.
            </p>
          </div>
        ) : (
          <div style={cardsGridStyles}>
            {cards.map((card, index) => (
              <SmartPickCard
                key={card.id}
                card={card}
                index={index}
                isActive={activeId === card.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
