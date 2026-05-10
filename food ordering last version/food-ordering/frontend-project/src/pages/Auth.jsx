
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useApp } from '../context/AppContext'
import { useNotification } from '../context/NotificationContext'
import  Btn  from '../components/Button'
import  Input  from '../components/Input'
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { login } = useApp();
  const { showSuccess, showError } = useNotification();
  const [tab, setTab] = useState("login");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "customer"
    }
  });

  const watchedRole = watch("role");

  const onSubmit = (data) => {
    setError("");
    const ok = login(data.email, data.password, data.role);
    if (ok) {
      showSuccess(`Welcome back${data.role === 'owner' ? ', Owner' : data.role === 'admin' ? ', Admin' : ''}! 👋`);
      navigate('/');
    } else {
      showError('Login failed. Please check your credentials.');
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setError("");
    reset(); // Reset form when switching tabs
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
        padding: "44px 40px", width: "100%", maxWidth: 420, animation: "fadeUp 0.5s ease",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "var(--amber)" }}>Mazboot</h1>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>Delicious food, fast delivery</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--bg3)", borderRadius: "var(--radius)", padding: 4, marginBottom: 28 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => handleTabChange(t)} style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s",
              background: tab === t ? "var(--amber)" : "transparent",
              color: tab === t ? "#1a1200" : "var(--text2)",
            }}>{t === "login" ? "Sign In" : "Register"}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "register" && (
            <div>
              <Input
                label="Full Name"
                {...register("name", { required: "Full name is required" })}
                placeholder="Your name"
              />
              {errors.name && <span style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>{errors.name.message}</span>}
            </div>
          )}
          <div>
            <Input
              label="Email"
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address"
                }
              })}
              placeholder="you@example.com"
            />
            {errors.email && <span style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>{errors.email.message}</span>}
          </div>
          <div>
            <Input
              label="Password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
              placeholder="••••••••"
            />
            {errors.password && <span style={{ color: "var(--red)", fontSize: 12, marginTop: 4 }}>{errors.password.message}</span>}
          </div>

          {/* Role selector */}
          <div>
            <label style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, display: "block", marginBottom: 8 }}>Role</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { id: "customer", label: "👤 Customer" },
                { id: "owner",    label: "🏪 Owner" },
                { id: "admin",    label: "🛡️ Admin" },
              ].map(r => (
                <label key={r.id} style={{
                  flex: 1, padding: "10px 8px", borderRadius: 8, border: `1px solid ${watchedRole === r.id ? "var(--amber)" : "var(--border)"}`,
                  background: watchedRole === r.id ? "var(--amber-glow)" : "var(--bg3)",
                  color: watchedRole === r.id ? "var(--amber)" : "var(--text2)",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, fontWeight: 500, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <input
                    type="radio"
                    value={r.id}
                    {...register("role")}
                    style={{ display: "none" }}
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          {error && <div style={{ background: "#e8443a22", border: "1px solid var(--red)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>{error}</div>}

          <Btn type="submit" size="lg" style={{ width: "100%", marginTop: 4 }}>
            {tab === "login" ? "Sign In" : "Create Account"}
          </Btn>

          <button onClick={() => navigate(`/`)} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            Continue as guest →
          </button>
        </form>
      </div>
    </div>
  );
}
