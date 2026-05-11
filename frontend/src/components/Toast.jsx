import { useApp  } from '../context/AppContext.jsx'

export default function Toast() {
  

  const { toast } = useApp();
  if (!toast) return null;
  const colors = { success: "var(--green)", error: "var(--red)", info: "var(--amber)" };
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 9999,
      background: "var(--bg3)", border: `1px solid ${colors[toast.type] || colors.success}`,
      color: "var(--text)", padding: "14px 20px", borderRadius: "var(--radius)",
      boxShadow: "var(--shadow)", maxWidth: 320, fontSize: 14, fontWeight: 500,
      animation: "toastSlide 0.3s ease",
      borderLeft: `4px solid ${colors[toast.type] || colors.success}`
    }}>
      {toast.msg}
    </div>
  );

}