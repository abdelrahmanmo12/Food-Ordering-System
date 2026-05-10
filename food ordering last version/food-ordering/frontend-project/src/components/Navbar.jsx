import { useApp  } from '../context/AppContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useState } from "react";
import  Btn  from './Button.jsx'
import  Badge  from './Badge.jsx'
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout, role } = useApp();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  
    const navItems = [
      { id: "", label: "Restaurants", path: "/" },
      { id: "favorites", label: "❤️ Favorites", path: "/favorites" },
      { id: "orders", label: "My Orders", path: "/orders" },
      ...(role === "admin" ? [{ id: "admin", label: "Admin", path: "/admin" }] : []),
      ...(role === "owner" ? [{ id: "owner", label: "My Restaurant", path: "/owner" }] : []),
    ];
     
    

    return (
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(17,16,16,0.92)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)", padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", height: 64, gap: 32 }}>
          {/* Logo */}
          <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🍽️</span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "var(--amber)" }}>
              Mazboot
            </span>
          </div>
  
          {/* Nav links */}
          <div style={{ display: "flex", gap: 4, flex: 1 }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => navigate(`/${item.id}`)} style={{
                background: location.pathname  === item.id ? "var(--amber-glow)" : "transparent",
                border: "none", color: location.pathname === item.id ? "var(--amber)" : "var(--text2)",
                padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500,
                fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              }}>{item.label}</button>
            ))}
          </div>
  
          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* Cart */}
            <button onClick={() => navigate("/cart")} style={{
              position: "relative", background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "10px 16px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, color: "var(--text)", fontSize: 14,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.2s",
            }}>
              🛒
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6, background: "var(--amber)", color: "#1a1200",
                  borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 700, animation: "badgePop 0.3s ease",
                }}>{cartCount}</span>
              )}
              Cart
            </button>
  
            {/* User */}
            {user ? (
              <div style={{ position: "relative" }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
                  padding: "8px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  color: "var(--text)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1200", fontWeight: 700, fontSize: 12 }}>
                    {user.name[0].toUpperCase()}
                  </div>
                  {user.name}
                  <Badge color={role === "admin" ? "var(--red)" : role === "owner" ? "#9b59b6" : "var(--green)"}>
                    {role}
                  </Badge>
                </button>
                {menuOpen && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--bg3)",
                    border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden",
                    minWidth: 160, boxShadow: "var(--shadow)", animation: "fadeIn 0.15s ease",
                  }}>
                    <div style={{ padding: "8px 16px", fontSize: 12, color: "var(--text2)", borderBottom: "1px solid var(--border)" }}>
                      {user.email}
                    </div>
                    <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                      width: "100%", padding: "12px 16px", background: "none", border: "none",
                      color: "var(--red)", cursor: "pointer", textAlign: "left", fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    }}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <Btn onClick={() => navigate("/auth")} size="sm">
  Sign in
</Btn>
            )}
          </div>
        </div>
      </nav>
    );
}