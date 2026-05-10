 import { useApp } from '../context/AppContext'
import { useCart } from '../context/CartContext'
import  Btn  from '../components/Button'
import { useNavigate } from "react-router-dom";



export default function Cart() {
  const { user } = useApp();
  const { cart, cartTotal, removeFromCart, updateQty } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: "0 24px", textAlign: "center", animation: "fadeUp 0.5s ease" }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🛒</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>Your cart is empty</h2>
      <p style={{ color: "var(--text2)", marginBottom: 28 }}>Browse our restaurants and add some delicious food!</p>
      <Btn onClick={() => navigate("/")}>Explore Restaurants</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px", animation: "fadeUp 0.5s ease" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>Your Cart</h1>
      <p style={{ color: "var(--text2)", marginBottom: 32 }}>From {cart[0].restaurantName}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {cart.map(item => (
          <div key={item.id} style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 32 }}>{item.image ? (
  <img
    src={item.image}
    alt={item.name}
    style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
  />
) : (
  <span style={{ fontSize: 40 }}>{item.emoji}</span>
)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.name}</div>
              <div style={{ fontSize: 13, color: "var(--text2)" }}>{item.price} EGP × {item.qty} = <strong style={{ color: "var(--amber)" }}>{item.price * item.qty} EGP</strong></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => updateQty(item.id, -1)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>−</button>
              <span style={{ fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
              <button onClick={() => updateQty(item.id, 1)} style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>+</button>
              <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: 16, marginLeft: 4 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, color: "var(--text2)", fontSize: 14 }}>
          <span>Subtotal</span><span>{cartTotal} EGP</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, color: "var(--text2)", fontSize: 14 }}>
          <span>Delivery fee</span><span style={{ color: "var(--green)" }}>Free 🎉</span>
        </div>
        <div style={{ height: 1, background: "var(--border)", margin: "16px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
          <span>Total</span><span style={{ color: "var(--amber)" }}>{cartTotal} EGP</span>
        </div>
      </div>

      <Btn onClick={() => user ? navigate('/checkout') : navigate('/auth')} size="lg" style={{ width: "100%" }}>
        {user ? "🚀 Proceed to Checkout" : "🔐 Sign in to Order"}
      </Btn>
    </div>
  );
}