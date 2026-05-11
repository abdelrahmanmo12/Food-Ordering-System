import { useApp } from '../context/AppContext'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurants } from '../hooks/restaurants'

export default function Home() {
      const navigate = useNavigate();
      const { setPage, setSelectedRestaurant } = useApp();
      const [search, setSearch] = useState("");
      const [cuisineFilter, setCuisineFilter] = useState("All");
      const [categoryFilter, setCategoryFilter] = useState("All");
      const [currentSlide, setCurrentSlide] = useState(0);
      
      // Using React Query hook instead of useState/useEffect
      const { data: restaurants = [], isLoading: loading, error } = useRestaurants();
      
      const offers = [
        { image: "/imgs/Cairo Grill House menu special offer.png", title: "Cairo Grill House menu offer", restaurant: "Cairo Grill House" },
        { image: "/imgs/Burger Republic menu special offer.png", title: "Burger Republic menu offer", restaurant: "Burger Republic" },
        { image: "/imgs/Sakura Sushi menu special offer.png", title: "Sakura Sushi menu offer", restaurant: "Sakura Sushi" },
        { image: "/imgs/Pizza Palazzo menu special offer.png", title: "Pizza Palazzo menu offer", restaurant: "Pizza Palazzo" },
        { image: "/imgs/BBQ Ranch Melt offer.png", title: "BBQ Ranch Melt offer", restaurant: "Burger Republic" },
        { image: "/imgs/Koshary Deluxe & Om Ali offer.png", title: "Koshary Deluxe & Om Ali", restaurant: "Cairo Grill House" },
      ];
      
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % offers.length);
        }, 4000);
        return () => clearInterval(interval);
      }, [offers.length]);
    
      const cuisines = ["All", ...new Set((restaurants || []).map(r => r.cuisine).filter(Boolean))];
      const categories = ["All", ...new Set((restaurants || []).flatMap(r => (r.items || []).map(item => item.category)).filter(Boolean))];
      const filtered = (restaurants || []).filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) &&
        (cuisineFilter === "All" || r.cuisine === cuisineFilter) &&
        (categoryFilter === "All" || (r.items || []).some(item => item.category === categoryFilter))
      ).map(r => ({
        ...r,
        // Normalize status property names
        isOpen: r.isOpen ?? r.opened ?? false
      }));
    
      return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
          {}
          <div style={{ display: "flex", gap: 40, marginBottom: 56, alignItems: "center", animation: "fadeUp 0.6s ease" }}>
            {}
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ color: "var(--amber)", fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "0.15em", marginBottom: 12, textTransform: "uppercase" }}>
                Order in Cairo
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(42px, 6vw, 72px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
                Great food,<br /><em style={{ color: "var(--amber)" }}>delivered fast.</em>
              </h1>
              <p style={{ color: "var(--text2)", fontSize: 17, maxWidth: 480, margin: "0" }}>
                Browse top restaurants and get fresh meals to your door.
              </p>
            </div>
            
            {}
            <div style={{ flex: 1, maxWidth: 500 }}>
              <div style={{ position: "relative", borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                <div style={{ 
                  display: "flex", 
                  transition: "transform 0.5s ease", 
                  transform: `translateX(-${currentSlide * 100}%)` 
                }}>
                  {offers.map((offer, index) => (
                    <div key={index} style={{ minWidth: "100%", position: "relative" }}>
                      <img 
                        src={offer.image} 
                        alt={offer.title}
                        style={{ width: "100%", height: 350, objectFit: "cover" }}
                      />
                      <div style={{ 
                        position: "absolute", 
                        bottom: 0, 
                        left: 0, 
                        right: 0, 
                        background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        padding: "20px",
                        color: "white"
                      }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{offer.title}</h3>
                        <p style={{ margin: "4px 0 0 0", fontSize: 14, opacity: 0.9 }}>{offer.restaurant}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {}
                <div style={{ 
                  position: "absolute", 
                  bottom: 10, 
                  left: "50%", 
                  transform: "translateX(-50%)", 
                  display: "flex", 
                  gap: 8 
                }}>
                  {offers.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        border: "none",
                        background: currentSlide === index ? "var(--amber)" : "rgba(255,255,255,0.5)",
                        cursor: "pointer",
                        transition: "background 0.3s"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
    
          {}
          <div style={{ display: "flex", gap: 12, marginBottom: 40, animation: "fadeUp 0.7s ease", alignItems: "flex-end" }}>
            <div style={{ flex: 1, maxWidth: 480, position: "relative", display: "flex", flexDirection: "column" }}>
              <label style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, marginBottom: 4 }}>Search:</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "var(--text3)" }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
                  style={{
                    width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                    color: "var(--text)", padding: "14px 16px 14px 42px", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                    outline: "none", transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--amber)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 150 }}>
              <label style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, marginBottom: 4 }}>Cuisine:</label>
              <select value={cuisineFilter} onChange={e => setCuisineFilter(e.target.value)} style={{
                width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                color: "var(--text)", padding: "14px 16px", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: "none", transition: "border-color 0.2s", cursor: "pointer",
              }}
                onFocus={e => e.target.style.borderColor = "var(--amber)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              >
                {cuisines.map(c => (
                  <option key={c} value={c} style={{ background: "var(--bg2)", color: "var(--text)" }}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 150 }}>
              <label style={{ fontSize: 12, color: "var(--text2)", fontWeight: 500, marginBottom: 4 }}>Category:</label>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{
                width: "100%", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                color: "var(--text)", padding: "14px 16px", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                outline: "none", transition: "border-color 0.2s", cursor: "pointer",
              }}
                onFocus={e => e.target.style.borderColor = "var(--amber)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              >
                {categories.map(c => (
                  <option key={c} value={c} style={{ background: "var(--bg2)", color: "var(--text)" }}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 120, justifyContent: "center", alignItems: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{restaurants.length}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Restaurants</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", minWidth: 120, justifyContent: "center", alignItems: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{restaurants.filter(r => r.isOpen).length}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>Open now</div>
              </div>
            </div>
          </div>
    
          

          {}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {error ? (
              <div style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px",
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)"
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h3 style={{ color: "var(--red)", marginBottom: 12 }}>Error Loading Restaurants</h3>
                <p style={{ color: "var(--text2)", marginBottom: 20 }}>
                 {error?.message || "Something went wrong"}</p>
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
            ) : loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>Loading restaurants...</div>
            ) : (
              filtered.map((r, i) => (
                <RestaurantCard key={r.id} restaurant={r} delay={i * 0.08}
                  onClick={() => navigate(`/menu/${r.id}`)}
                />
              ))
            )}
          </div>
        </div>
      );
    }

     function RestaurantCard({ restaurant: r, onClick, delay }) {
        const { toggleFavorite, isFavorite } = useApp();
        const [hovered, setHovered] = useState(false);
        return (
          <div onClick={onClick}
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{
              background: "var(--bg2)", border: `1px solid ${hovered ? "var(--amber)" : "var(--border)"}`,
              borderRadius: "var(--radius-lg)", overflow: "hidden", cursor: r.isOpen ? "pointer" : "not-allowed",
              transition: "all 0.3s ease", transform: hovered && r.isOpen ? "translateY(-4px)" : "none",
              boxShadow: hovered && r.isOpen ? "var(--shadow-amber)" : "none",
              opacity: r.isOpen ? 1 : 0.6, animation: `fadeUp 0.5s ${delay}s ease both`,
              position: "relative",
            }}>
            {}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(r.id);
              }}
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
                transform: isFavorite(r.id) ? "scale(1.1)" : "scale(1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.8)";
                e.currentTarget.style.transform = isFavorite(r.id) ? "scale(1.2)" : "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.6)";
                e.currentTarget.style.transform = isFavorite(r.id) ? "scale(1.1)" : "scale(1)";
              }}
            >
              <span style={{
                fontSize: 16,
                color: isFavorite(r.id) ? "#ff4757" : "var(--text3)",
                transition: "color 0.2s ease",
                filter: isFavorite(r.id) ? "drop-shadow(0 0 4px rgba(255, 71, 87, 0.4))" : "none",
              }}>
                {isFavorite(r.id) ? "❤️" : "🤍"}
              </span>
            </button>
            {}
            <div style={{
              height: 140, background: `linear-gradient(135deg, ${r.coverColor} 0%, #1a1917 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64,
              position: "relative",
            }}>
              <img src={r.imageUrl || r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {r.badge && (
                <span style={{
                  position: "absolute", top: 12, left: 12,
                  background: "var(--amber)", color: "#1a1200", borderRadius: 6,
                  padding: "3px 10px", fontSize: 11, fontWeight: 700,
                }}>{r.badge}</span>
              )}
              {!r.isOpen && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 600, color: "var(--text2)", letterSpacing: "0.1em",
                }}>CLOSED</div>
              )}
            </div>
            {}
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700 }}>{r.name}</h3>
                <span style={{ color: "var(--amber)", fontWeight: 700, fontSize: 14 }}>⭐ {r.rating}</span>
              </div>
              <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 12 }}>{r.description}</p>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--text2)" }}>
                <span>🍽️ {r.cuisine || 'General'}</span>
                <span>⏱️ {r.deliveryTime?.min || 30}–{r.deliveryTime?.max || 45} min</span>
                <span>💳 Min {r.minOrder || 0} EGP</span>
              </div>
            </div>
          </div>
        );
  
}