// pages/OwnerRegister.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import Btn from '../components/Button';
 
export default function OwnerRegister() {
  const navigate = useNavigate();
  const { showToast } = useApp();
 
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
 
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
 
  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
 
  const handleSubmit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      showToast("Please fill all required fields", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast("Passwords don't match", "error");
      return;
    }
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      showToast("Password must be 8+ chars with uppercase, lowercase, number, and special char (@#$%^&+=!)", "error");
      return;
    }
 
    setLoading(true);
    try {
      // Step 1 — Register the owner account
      // POST /auth/register/owner  →  returns a string message
      await api.post("/auth/register/owner", {
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
      });
 
      // Step 2 is automatic in the backend via the register/owner endpoint status logic
      // No need for separate /owner/request call unless specified otherwise.
 
      setSubmitted(true);
      showToast("Registration submitted! Awaiting admin approval 🎉");
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };
 
  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ maxWidth: 520, margin: "80px auto", padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>⏳</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>
          Request Submitted!
        </h2>
        <p style={{ color: "var(--text2)", lineHeight: 1.7, marginBottom: 28 }}>
          Your owner account is <strong>pending admin approval</strong>.<br />
          You'll be able to log in and access your dashboard once approved.
        </p>
        <Btn onClick={() => navigate("/auth")}>Go to Login</Btn>
      </div>
    );
  }
 
  // ── Registration form ───────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: "48px auto", padding: "0 24px 60px" }}>
      {}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 44 }}>🏪</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, margin: "12px 0 6px" }}>
          Register as Owner
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 14 }}>
          Create your account. An admin will review and approve it.
        </p>
      </div>
 
      {}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: 28,
      }}>
        <Field label="Full Name *"        value={form.fullName}            onChange={set("fullName")}            placeholder="John Doe" />
        <Field label="Email *"            value={form.email}           onChange={set("email")}           placeholder="you@email.com" type="email" />
        <Field label="Password *"         value={form.password}        onChange={set("password")}        placeholder="••••••••"   type="password" />
        <Field label="Confirm Password *" value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••"   type="password" last />
 
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <Btn variant="ghost" style={{ flex: 1 }} onClick={() => navigate("/auth")}>
            Cancel
          </Btn>
          <Btn style={{ flex: 2 }} onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Approval"}
          </Btn>
        </div>
      </div>
 
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text3)" }}>
        Already have an account?{" "}
        <button
          onClick={() => navigate("/auth")}
          style={{ background: "none", border: "none", color: "var(--amber)", cursor: "pointer", fontSize: 13 }}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
 
function Field({ label, value, onChange, placeholder, type = "text", last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 16 }}>
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: "var(--text2)", letterSpacing: "0.07em",
        textTransform: "uppercase", marginBottom: 6,
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
          padding: "10px 14px", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", background: "var(--bg)",
          color: "var(--text1)", fontSize: 15, outline: "none",
        }}
      />
    </div>
  );
}
 