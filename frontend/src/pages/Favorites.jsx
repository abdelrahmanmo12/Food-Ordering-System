import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { useRestaurants } from '../hooks/restaurants'
import Badge from '../components/Badge'
import Btn from '../components/Button'

export default function Favorites() {
  const { favorites, toggleFavorite, isFavorite } = useApp()
  const navigate = useNavigate()

  const { data: restaurants = [], isLoading } = useRestaurants()

  const favoriteRestaurants = (restaurants || []).filter(restaurant =>
    favorites.includes(String(restaurant.id)) || favorites.includes(Number(restaurant.id))
  )

  if (isLoading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading favorites...</div>;

  if (favoriteRestaurants.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 80, marginBottom: 20 }}>❤️</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>No favorites yet</h2>
        <p style={{ color: "var(--text2)", marginBottom: 28 }}>
          Save restaurants you love for quick access later!
        </p>
        <Btn onClick={() => navigate('/')}>Browse Restaurants</Btn>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>My Favorites</h1>
        <p style={{ color: "var(--text2)" }}>
          {favoriteRestaurants.length} favorite{favoriteRestaurants.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 24
      }}>
        {favoriteRestaurants.map(restaurant => (
          <div
            key={restaurant.id}
            style={{
              background: "var(--bg2)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)"
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)"
              e.currentTarget.style.boxShadow = "none"
            }}
            onClick={() => navigate(`/menu/${restaurant.id}`)}
          >
            {}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(restaurant.id)
              }}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.6)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 2,
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.8)"
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0,0,0,0.6)"
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              <span style={{
                fontSize: 18,
                color: isFavorite(restaurant.id) ? "#ff4757" : "var(--text3)",
                transition: "color 0.2s ease"
              }}>
                ❤️
              </span>
            </button>

            {}
            <div style={{
              height: 160,
              background: `linear-gradient(135deg, ${restaurant.coverColor}22, ${restaurant.coverColor}44)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden"
            }}>
              <img
                src={restaurant.imageUrl || restaurant.image}
                alt={restaurant.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
              {restaurant.badge && (
                <Badge
                  color="var(--amber)"
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12
                  }}
                >
                  {restaurant.badge}
                </Badge>
              )}
            </div>

            {}
            <div style={{ padding: 20 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8
              }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 20,
                  fontWeight: 600,
                  margin: 0
                }}>
                  {restaurant.name}
                </h3>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 14,
                  color: "var(--text2)"
                }}>
                  ⭐ {restaurant.rating}
                </div>
              </div>

              <p style={{
                color: "var(--text2)",
                fontSize: 14,
                marginBottom: 12,
                lineHeight: 1.4
              }}>
                {restaurant.description}
              </p>

              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
                color: "var(--text3)"
              }}>
                <span>{restaurant.deliveryTime.min}–{restaurant.deliveryTime.max} min</span>
                <span>Min. {restaurant.minOrder} EGP</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}