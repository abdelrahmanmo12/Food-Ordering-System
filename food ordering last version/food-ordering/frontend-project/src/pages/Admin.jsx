// pages/Admin.jsx
import { useApp } from '../context/AppContext'
import { useState } from 'react'
import { useRestaurants } from '../hooks/restaurants'
import Btn from '../components/Button'
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import PaymentManagement from '../components/PaymentManagement';
import DeliveryManagement from '../components/Deliverymanagement';

// ─── Hooks ─────────────────────────────────────────────────────────────────
function usePendingAccounts() {
  return useQuery({
    queryKey: ["pending-accounts"],
    queryFn: () => api.get("/auth/accounts/pending"),
  });
}

function useOwnerRequests() {
  // GET /admin/owner-requests  (user-service port 8083, via gateway)
  return useQuery({
    queryKey: ["owner-requests"],
    queryFn: () => api.get("/admin/owner-requests"),
  });
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Admin() {
  const { role } = useApp();
  if (role !== "admin") return <AccessDenied />;
  return <AdminDashboard />;
}

function AdminDashboard() {
  const queryClient = useQueryClient();
  const [tab, setTab]         = useState("restaurants");
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState({ name: "", cuisine: "" });
  const [driverModal, setDriverModal] = useState(false);
  const [driverForm, setDriverForm]   = useState({ name: '', email: '', password: '' });
  const [driverErr,  setDriverErr]    = useState('');

  const { data: restaurants = [], isLoading: loadingR, error: errorR } = useRestaurants();
  const { data: pendingAccounts = [], isLoading: loadingP }            = usePendingAccounts();
  const { data: ownerRequests   = [], isLoading: loadingO }            = useOwnerRequests();

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addRestaurant = useMutation({
    mutationFn: (data) => api.post("/restaurants", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["restaurants"]);
      setOpen(false);
      setForm({ name: "", cuisine: "" });
    },
  });

  const updateAccountStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/auth/accounts/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(["pending-accounts"]),
  });

  // POST /admin/approve/{id}  or  POST /admin/reject/{id}
  const approveOwner = useMutation({
    mutationFn: (id) => api.post(`/admin/approve/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["owner-requests"]),
  });

  const rejectOwner = useMutation({
    mutationFn: (id) => api.post(`/admin/reject/${id}`),
    onSuccess: () => queryClient.invalidateQueries(["owner-requests"]),
  });

  const createDriver = useMutation({
    mutationFn: (body) => api.post('/auth/register/delivery', body),
    onSuccess: () => {
      setDriverModal(false);
      setDriverForm({ name: '', email: '', password: '' });
      setDriverErr('');
    },
    onError: (err) => setDriverErr(err.message || 'Failed to create driver account'),
  });

  const pendingOwners = ownerRequests.filter(r => r.status === "PENDING");

  const stats = [
    { label: "Total Restaurants", value: restaurants.length,                          icon: "🏪", color: "var(--amber)" },
    { label: "Menu Items",        value: restaurants.reduce((s, r) => s + (r.items?.length ?? 0), 0), icon: "🍽️", color: "var(--green)" },
    { label: "Active Now",        value: restaurants.filter(r => r.isOpen).length,    icon: "🟢", color: "#5b8dd9" },
    { label: "Pending Owners",    value: pendingOwners.length,                         icon: "⏳", color: "#f5a623" },
  ];

  const tabs = [
    { key: "restaurants",   label: "🏪 Restaurants" },
    { key: "ownerRequests", label: `🧑‍🍳 Owner Requests${pendingOwners.length ? ` (${pendingOwners.length})` : ""}` },
    { key: "accounts",      label: `🔐 Accounts${pendingAccounts.length ? ` (${pendingAccounts.length})` : ""}` },
    { key: "payments",      label: "💳 Payments" },
    { key: "deliveries",    label: "🚚 Deliveries" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <span style={{ fontSize: 32 }}>🛡️</span>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32 }}>Admin Dashboard</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>System overview and management</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "20px 24px", animation: `fadeUp 0.4s ${i * 0.07}s ease both`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "10px 20px", border: "none", background: "none", cursor: "pointer",
            fontSize: 14, fontWeight: 600,
            color: tab === t.key ? "var(--primary)" : "var(--text2)",
            borderBottom: tab === t.key ? "2px solid var(--primary)" : "2px solid transparent",
            transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Restaurants Tab ── */}
      {tab === "restaurants" && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Restaurants</h3>
            <Btn size="sm" onClick={() => setOpen(true)}>+ Add Restaurant</Btn>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                  {["Restaurant", "Cuisine", "Status", "Rating", "Items", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {errorR ? (
                  <tr><td colSpan="6" style={{ padding: 40, textAlign: "center", color: "var(--red)" }}>Error: {errorR.message}</td></tr>
                ) : loadingR ? (
                  <tr><td colSpan="6" style={{ padding: 40, textAlign: "center" }}>Loading...</td></tr>
                ) : restaurants.map(r => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "14px 20px" }}>{r.name}</td>
                    <td style={{ padding: "14px 20px" }}>{r.cuisine}</td>
                    <td style={{ padding: "14px 20px" }}>{r.isOpen ? "Open" : "Closed"}</td>
                    <td style={{ padding: "14px 20px" }}>⭐ {r.rating}</td>
                    <td style={{ padding: "14px 20px" }}>{r.items?.length ?? 0}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="ghost" size="sm">Edit</Btn>
                        <Btn variant="danger" size="sm">Delete</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Owner Requests Tab ── */}
      {tab === "ownerRequests" && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Owner Requests</h3>
            <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>
              Approve or reject restaurant owner registration requests.
            </p>
          </div>

          {loadingO ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading requests...</div>
          ) : ownerRequests.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>
              ✅ No owner requests yet.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--bg3)", borderBottom: "1px solid var(--border)" }}>
                    {["ID", "Username", "Status", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 12, color: "var(--text3)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ownerRequests.map((req, i) => (
                    <tr key={req.id} style={{ borderBottom: "1px solid var(--border)", animation: `fadeUp 0.3s ${i * 0.04}s ease both` }}>
                      <td style={{ padding: "14px 20px", color: "var(--text3)", fontSize: 13 }}>#{req.id}</td>
                      <td style={{ padding: "14px 20px", fontWeight: 600 }}>{req.username}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        {req.status === "PENDING" ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <Btn
                              variant="danger"
                              size="sm"
                              disabled={rejectOwner.isPending}
                              onClick={() => rejectOwner.mutate(req.id)}
                            >
                              Reject
                            </Btn>
                            <Btn
                              size="sm"
                              disabled={approveOwner.isPending}
                              onClick={() => approveOwner.mutate(req.id)}
                            >
                              ✓ Approve
                            </Btn>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: "var(--text3)" }}>
                            {req.status === "APPROVED" ? "✅ Approved" : "❌ Rejected"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Accounts Tab (auth service pending accounts) ── */}
      {tab === "accounts" && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>Pending Accounts</h3>
              <p style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>Accounts awaiting activation from the auth service.</p>
            </div>
            <Btn size="sm" onClick={() => { setDriverModal(true); setDriverErr(''); }}>
              + Create Driver Account
            </Btn>
          </div>
          {loadingP ? (
            <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>
          ) : pendingAccounts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>✅ No pending accounts.</div>
          ) : (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingAccounts.map((account) => (
                <div key={account.id} style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius)", padding: "16px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{account.name ?? account.email}</div>
                    <div style={{ fontSize: 13, color: "var(--text2)" }}>{account.email}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn variant="danger" size="sm" disabled={updateAccountStatus.isPending}
                      onClick={() => updateAccountStatus.mutate({ id: account.id, status: "REJECTED" })}>
                      Reject
                    </Btn>
                    <Btn size="sm" disabled={updateAccountStatus.isPending}
                      onClick={() => updateAccountStatus.mutate({ id: account.id, status: "APPROVED" })}>
                      ✓ Approve
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Create Driver Modal ── */}
      {driverModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999, padding: 16,
        }}>
          <div style={{
            background: "var(--bg)", borderRadius: "var(--radius-lg)",
            padding: "28px 26px", width: "100%", maxWidth: 420,
            border: "1px solid var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>🛵 Create Driver Account</h3>
              <button onClick={() => setDriverModal(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text3)" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { key: "name",     label: "Full Name",      placeholder: "e.g. Ahmed Hassan",        type: "text"     },
                { key: "email",    label: "Email",          placeholder: "driver@example.com",        type: "email"    },
                { key: "password", label: "Password",       placeholder: "Temporary password",        type: "password" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={driverForm[key]}
                    onChange={e => setDriverForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{
                      padding: "10px 14px", borderRadius: "var(--radius)",
                      border: "1.5px solid var(--border)", background: "var(--bg2)",
                      color: "var(--text)", fontSize: 14, outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  />
                </div>
              ))}

              {driverErr && (
                <div style={{ fontSize: 13, color: "var(--red)", padding: "8px 12px", background: "#fef2f2", borderRadius: 8 }}>
                  ⚠️ {driverErr}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <Btn variant="ghost" onClick={() => setDriverModal(false)} style={{ flex: 1 }}>Cancel</Btn>
                <Btn
                  onClick={() => {
                    if (!driverForm.name || !driverForm.email || !driverForm.password) {
                      setDriverErr('All fields are required.');
                      return;
                    }
                    createDriver.mutate(driverForm);
                  }}
                  disabled={createDriver.isPending}
                  style={{ flex: 1 }}
                >
                  {createDriver.isPending ? 'Creating…' : 'Create Driver'}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Payments Tab ── */}
      {tab === "payments" && <PaymentManagement />}

      {/* ── Deliveries Tab ── */}
      {tab === "deliveries" && <DeliveryManagement />}

      {/* ── Add Restaurant Modal ── */}
      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
          <div style={{ background: "var(--bg)", padding: 28, borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 420, border: "1px solid var(--border)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: 20 }}>Add Restaurant</h3>
            <input placeholder="Restaurant name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", marginBottom: 12, borderRadius: "var(--radius)", border: "1px solid var(--border)", fontSize: 15, background: "var(--bg2)", color: "var(--text1)" }} />
            <input placeholder="Cuisine type" value={form.cuisine}
              onChange={(e) => setForm({ ...form, cuisine: e.target.value })}
              style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", marginBottom: 20, borderRadius: "var(--radius)", border: "1px solid var(--border)", fontSize: 15, background: "var(--bg2)", color: "var(--text1)" }} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn>
              <Btn onClick={() => addRestaurant.mutate(form)} disabled={addRestaurant.isPending}>
                {addRestaurant.isPending ? "Adding..." : "Add"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    PENDING:  { bg: "#f5a62322", color: "#f5a623" },
    APPROVED: { bg: "#22c55e22", color: "#22c55e" },
    REJECTED: { bg: "#e8443a22", color: "#e8443a" },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 500, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🚫</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>Access Denied</h2>
      <p style={{ color: "var(--text2)", marginBottom: 28 }}>You don't have permission to view this page.</p>
      <Btn onClick={() => navigate("/")}>Go Home</Btn>
    </div>
  );
}