// pages/Auth.jsx
//
// Sign-in tab  → calls AppContext.login()  (handles token + redirect)
// Register tab → routes by role:
//   customer   → POST /auth/register/customer  (immediate success → switch to login)
//   owner      → POST /auth/register/owner  +  POST /owner/request  → navigate("/register/owner")
//                (OwnerRegister page handles the two-step flow with restaurantName)
//   delivery   → POST /auth/register/delivery  (pending approval, just like owner)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useRegisterCustomer, useRegisterDelivery } from "../hooks/auth";
import Btn from "../components/Button";

// ─── helpers ──────────────────────────────────────────────────────────────────

function Field({ label, type = "text", value, onChange, placeholder, error, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 18 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700,
        letterSpacing: "0.09em", textTransform: "uppercase",
        color: "var(--text3)", marginBottom: 7,
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: "11px 14px", borderRadius: "var(--radius)",
          border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
          background: "var(--bg)", color: "var(--text1)",
          fontSize: 15, outline: "none", transition: "border-color 0.15s",
        }}
      />
      {error && (
        <p style={{ fontSize: 12, color: "var(--red)", marginTop: 5 }}>{error}</p>
      )}
    </div>
  );
}

// ─── Login tab ────────────────────────────────────────────────────────────────

function LoginForm({ onSuccess }) {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    // AppContext.login() posts to /auth/login, stores token, navigates, shows toast
    await login(email, password);
    setLoading(false);
  };

  return (
    <div>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        error={errors.email}
      />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="••••••••"
        error={errors.password}
        last
      />

      <Btn
        style={{ width: "100%", marginTop: 24 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Signing in…" : "Sign In"}
      </Btn>
    </div>
  );
}

// ─── Register tab ─────────────────────────────────────────────────────────────

const ROLES = [
  { id: "user", icon: "👤", label: "User", hint: "Order food from restaurants" },
  { id: "owner", icon: "🏪", label: "Restaurant", hint: "Register your restaurant" },
  { id: "delivery", icon: "🛵", label: "Delivery", hint: "Deliver orders near you" },
];

function RegisterForm({ onLoginTab }) {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});

  const registerCustomer = useRegisterCustomer();
  const registerDelivery = useRegisterDelivery();

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
    if (!passwordRegex.test(password)) {
      e.password = "Must be 8+ chars with uppercase, lowercase, number, and special char";
    }
    if (password !== confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleSubmit = async () => {
    // Owner → full dedicated flow with restaurantName step
    // Skip validation here because we collect these on the /register/owner page
    if (role === "owner") {
      navigate("/register/owner");
      return;
    }

    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    const payload = { fullName: name, email, password };

    try {
      if (role === "delivery") {
        await registerDelivery.mutateAsync(payload);
        showToast("Delivery account submitted! Awaiting admin approval ⏳");
        onLoginTab();
      } else {
        // user
        await registerCustomer.mutateAsync(payload);
        showToast("Account created! You can now sign in 🎉");
        onLoginTab();
      }
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    }
  };

  const isLoading = registerCustomer.isPending || registerDelivery.isPending;

  return (
    <div>
      {}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 22 }}>
        {ROLES.map(r => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            style={{
              padding: "12px 6px", borderRadius: "var(--radius)",
              border: `1.5px solid ${role === r.id ? "var(--amber)" : "var(--border)"}`,
              background: role === r.id ? "var(--amber-glow)" : "var(--bg3)",
              color: role === r.id ? "var(--amber)" : "var(--text2)",
              cursor: "pointer", transition: "all 0.18s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}
          >
            <span style={{ fontSize: 20 }}>{r.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>{r.label}</span>
            <span style={{ fontSize: 10, color: role === r.id ? "var(--amber)" : "var(--text3)", lineHeight: 1.3 }}>
              {r.hint}
            </span>
          </button>
        ))}
      </div>

      {}
      {role === "owner" ? (
        <div style={{
          background: "var(--amber-glow)", border: "1px solid var(--amber)",
          borderRadius: "var(--radius)", padding: "14px 16px",
          fontSize: 13, color: "var(--amber)", lineHeight: 1.6, marginBottom: 20,
        }}>
          🏪 Restaurant owners go through a short approval process.<br />
          You'll fill in your restaurant name and account details on the next page.
        </div>
      ) : (
        <>
          <Field label="Full Name *" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" error={errors.name} />
          <Field label="Email *" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" error={errors.email} type="email" />
          <Field label="Password *" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" error={errors.password} type="password" />
          <Field label="Confirm Password *" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" error={errors.confirm} type="password" last />

          {role === "delivery" && (
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 10, lineHeight: 1.5 }}>
              ℹ️ Delivery accounts require admin approval before you can accept orders.
            </p>
          )}
        </>
      )}

      <Btn
        style={{ width: "100%", marginTop: 20 }}
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading
          ? "Creating account…"
          : role === "owner"
            ? "Continue to Restaurant Setup →"
            : "Create Account"}
      </Btn>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Auth() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");

  const switchTab = (t) => setTab(t);

  return (
    <div style={{
      minHeight: "80vh", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "44px 40px",
        width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease",
      }}>
        {}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "var(--amber)" }}>
            Mazboot
          </h1>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>
            Delicious food, fast delivery
          </p>
        </div>

        {}
        <div style={{
          display: "flex", background: "var(--bg3)",
          borderRadius: "var(--radius)", padding: 4, marginBottom: 28,
        }}>
          {[["login", "Sign In"], ["register", "Register"]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              style={{
                flex: 1, padding: "10px", borderRadius: 8, border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                background: tab === key ? "var(--amber)" : "transparent",
                color: tab === key ? "#1a1200" : "var(--text2)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {}
        {tab === "login"
          ? <LoginForm onSuccess={() => { }} />
          : <RegisterForm onLoginTab={() => switchTab("login")} />
        }

        {}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "block", width: "100%", textAlign: "center",
            marginTop: 20, background: "none", border: "none",
            color: "var(--text3)", cursor: "pointer", fontSize: 13,
          }}
        >
          Continue as guest →
        </button>
      </div>
    </div>
  );
}
