import React, { memo, useCallback, useMemo, useState } from "react";
import { useApp } from "../../../context/AppContext";

function RestaurantCardImpl({ restaurant: r, onClick, delay }) {
  const { toggleFavorite, isFavorite } = useApp();
  const [hovered, setHovered] = useState(false);

  const favorite = isFavorite(r.id);

  const cardStyle = useMemo(
    () => ({
      background: "var(--bg2)",
      border: `1px solid ${hovered ? "var(--amber)" : "var(--border)"}`,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      cursor: r.isOpen ? "pointer" : "not-allowed",
      transition: "all 0.3s ease",
      transform: hovered && r.isOpen ? "translateY(-4px)" : "none",
      boxShadow: hovered && r.isOpen ? "var(--shadow-amber)" : "none",
      opacity: r.isOpen ? 1 : 0.6,
      animation: `fadeUp 0.5s ${delay}s ease both`,
      position: "relative",
    }),
    [hovered, r.isOpen, delay]
  );

  const onToggleFavorite = useCallback(
    (e) => {
      e.stopPropagation();
      toggleFavorite(r.id);
    },
    [toggleFavorite, r.id]
  );

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={cardStyle}
    >
      <button
        onClick={onToggleFavorite}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(0,0,0,0.6)",
          border: "none",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 2,
          transition: "all 0.2s ease",
          transform: favorite ? "scale(1.1)" : "scale(1)",
        }}
      >
        <span
          style={{
            fontSize: 16,
            color: favorite ? "#ff4757" : "var(--text3)",
            transition: "color 0.2s ease",
            filter: favorite ? "drop-shadow(0 0 4px rgba(255, 71, 87, 0.4))" : "none",
          }}
        >
          {favorite ? "❤️" : "🤍"}
        </span>
      </button>

      <div
        style={{
          height: 140,
          background: `linear-gradient(135deg, ${r.coverColor} 0%, #1a1917 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          position: "relative",
        }}
      >
        <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {r.badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "var(--amber)",
              color: "#1a1200",
              borderRadius: 6,
              padding: "3px 10px",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {r.badge}
          </span>
        )}
        {!r.isOpen && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text2)",
              letterSpacing: "0.1em",
            }}
          >
            CLOSED
          </div>
        )}
      </div>

      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{r.name}</h3>
          <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 14 }}>⭐ {r.rating}</span>
        </div>
        <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 12 }}>{r.description}</p>
        <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text2)" }}>
          <span>🍽️ {r.cuisine}</span>
          <span>
            ⏱️ {r.deliveryTime.min}–{r.deliveryTime.max} min
          </span>
          <span>💳 Min {r.minOrder} EGP</span>
        </div>
      </div>
    </div>
  );
}

const RestaurantCard = memo(RestaurantCardImpl);
export default RestaurantCard;

