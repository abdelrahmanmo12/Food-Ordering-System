export default function Btn({ children, onClick, variant = "primary", size = "md", style = {}, disabled }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    border: "none", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600, transition: "all 0.2s ease", borderRadius: "var(--radius)",
    opacity: disabled ? 0.5 : 1,
  };
  const sizes = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "12px 22px", fontSize: 15 }, lg: { padding: "16px 32px", fontSize: 16 } };
  const variants = {
    primary:  { background: "var(--amber)", color: "#1a1200" },
    ghost:    { background: "transparent", color: "var(--text2)", border: "1px solid var(--border)" },
    danger:   { background: "var(--red)", color: "#fff" },
    subtle:   { background: "var(--bg3)", color: "var(--text)" },
  };
  return (
    <button onClick={disabled ? null : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = "brightness(1.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.filter = ""; }}>
      {children}
    </button>
  );
}