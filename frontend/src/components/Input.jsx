export default function Input({ label, type = "text", placeholder, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        style={{
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          color: "var(--text)",
          padding: "12px 16px",
          fontSize: 15,
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          transition: "border-color 0.2s",
          width: "100%",
          ...style
        }}
        onFocus={e => e.target.style.borderColor = "var(--amber)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
        {...props}
      />
    </div>
  );
}