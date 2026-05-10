// pages/Owner.jsx
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import Btn from '../components/Button';
import Badge from '../components/Badge';
import PaymentManagement from '../components/PaymentManagement';


// ─── Hooks ────────────────────────────────────────────────────────────────────

function useMyRestaurant(userId) {
  return useQuery({
    queryKey: ["my-restaurant", userId],
    queryFn:  () => api.get(`/restaurants/owner/${userId}`),
    enabled:  !!userId,
  });
}

function useCategories(restaurantId) {
  return useQuery({
    queryKey: ["categories", restaurantId],
    queryFn:  () => api.get(`/menu/categories/restaurant/${restaurantId}`),
    enabled:  !!restaurantId,
  });
}

function useMenuItems(restaurantId) {
  return useQuery({
    queryKey: ["menu", restaurantId],
    queryFn:  () => api.get(`/menu/${restaurantId}`),
    enabled:  !!restaurantId,
  });
}

// ─── Guard ────────────────────────────────────────────────────────────────────

export default function Owner() {
  const { role } = useApp();
  if (role !== "owner") return <AccessDenied />;
  return <OwnerDashboard />;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

function OwnerDashboard() {
  const { user } = useApp();
  const queryClient = useQueryClient();

  // ── Remote data ──
  const { data: restaurant, isLoading, error } = useMyRestaurant(user?.id);
  const { data: categories = [] }              = useCategories(restaurant?.id);
  const { data: menuItems  = [] }              = useMenuItems(restaurant?.id);

  // ── Modal state ──
  const [editOpen,        setEditOpen]        = useState(false);
  const [addItemOpen,     setAddItemOpen]      = useState(false);
  const [addCategoryOpen, setAddCategoryOpen]  = useState(false);

  const [editForm, setEditForm] = useState({
    name: "", location: "", phone: "", description: "",
  });

  const [itemForm, setItemForm] = useState({
    name: "", price: "", description: "", discount: "", stock: "", categoryId: "",
  });

  const [categoryName, setCategoryName] = useState("");

  // ── Mutations ─────────────────────────────────────────────────────────────

  // PUT /restaurants/{id}
  const updateRestaurant = useMutation({
    mutationFn: (data) => api.put(`/restaurants/${restaurant.id}`, data),
    onSuccess:  () => { queryClient.invalidateQueries(["my-restaurant"]); setEditOpen(false); },
  });

  // PATCH /restaurants/{id}/toggle-status
  const toggleStatus = useMutation({
    mutationFn: () => api.patch(`/restaurants/${restaurant.id}/toggle-status`),
    onSuccess:  () => queryClient.invalidateQueries(["my-restaurant"]),
  });

  // POST /menu/categories/{restaurantId}
  const addCategory = useMutation({
    mutationFn: () => api.post(`/menu/categories/${restaurant.id}`, { name: categoryName }),
    onSuccess:  () => {
      queryClient.invalidateQueries(["categories"]);
      setAddCategoryOpen(false);
      setCategoryName("");
    },
  });

  // POST /menu/{restaurantId}  — requires categoryId, name, price
  const addMenuItem = useMutation({
    mutationFn: (data) => api.post(`/menu/${restaurant.id}`, {
      name:        data.name,
      description: data.description,
      price:       parseFloat(data.price),
      discount:    data.discount  ? parseFloat(data.discount)  : undefined,
      stock:       data.stock     ? parseInt(data.stock)        : undefined,
      categoryId:  parseInt(data.categoryId),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["menu"]);
      setAddItemOpen(false);
      setItemForm({ name: "", price: "", description: "", discount: "", stock: "", categoryId: "" });
    },
  });

  // DELETE /menu/{id}
  const deleteMenuItem = useMutation({
    mutationFn: (itemId) => api.del(`/menu/${itemId}`),
    onSuccess:  () => queryClient.invalidateQueries(["menu"]),
  });

  // DELETE /menu/categories/{id}
  const deleteCategory = useMutation({
    mutationFn: (catId) => api.del(`/menu/categories/${catId}`),
    onSuccess:  () => queryClient.invalidateQueries(["categories"]),
  });

  // POST /restaurants/{id}/image  (multipart)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !restaurant?.id) return;
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem('auth-token');
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/restaurants/${restaurant.id}/image`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      queryClient.invalidateQueries(["my-restaurant"]);
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) return (
    <div style={{ textAlign: "center", padding: 60, color: "var(--text2)" }}>
      Loading your restaurant...
    </div>
  );

  if (error) return (
    <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <p style={{ color: "var(--red)", marginBottom: 16 }}>{error.message}</p>
      <Btn onClick={() => window.location.reload()}>Retry</Btn>
    </div>
  );

  if (!restaurant) return (
    <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 12 }}>
        No Restaurant Yet
      </h2>
      <p style={{ color: "var(--text2)" }}>
        Your account was approved but no restaurant is linked. Contact admin.
      </p>
    </div>
  );

  const r = restaurant;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>

        {/* Photo upload */}
        <label style={{ cursor: "pointer", position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "var(--radius)",
            background: "var(--bg2)", border: "2px dashed var(--border)",
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {r.imageUrl
              ? <img src={r.imageUrl} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span style={{ fontSize: 28 }}>📷</span>
            }
          </div>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
          <div style={{
            position: "absolute", bottom: 2, right: 2,
            background: "var(--primary)", color: "#fff", borderRadius: "50%",
            width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11,
          }}>✎</div>
        </label>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 8 }}>
            {r.name}
          </h1>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge color={r.opened ? "var(--green)" : "var(--text3)"}>
              {r.opened ? "🟢 Open" : "🔴 Closed"}
            </Badge>
            {r.status && <Badge color="var(--amber)">{r.status}</Badge>}
            {r.location && <Badge color="#5b8dd9">📍 {r.location}</Badge>}
          </div>
          {r.description && (
            <p style={{ color: "var(--text2)", fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
              {r.description}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Btn
            size="sm"
            variant={r.opened ? "danger" : "ghost"}
            disabled={toggleStatus.isPending}
            onClick={() => toggleStatus.mutate()}
          >
            {r.opened ? "Close Restaurant" : "Open Restaurant"}
          </Btn>
          <Btn
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditForm({
                name:        r.name        ?? "",
                location:    r.location    ?? "",
                phone:       r.phone       ?? "",
                description: r.description ?? "",
              });
              setEditOpen(true);
            }}
          >
            ✎ Edit Info
          </Btn>
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", marginBottom: 20, overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
            Categories
          </h2>
          <Btn size="sm" variant="ghost" onClick={() => setAddCategoryOpen(true)}>
            + Add Category
          </Btn>
        </div>

        {categories.length === 0 ? (
          <div style={{ padding: "20px 24px", color: "var(--text2)", fontSize: 14 }}>
            No categories yet — add one before adding menu items.
          </div>
        ) : (
          <div style={{ padding: "12px 24px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            {categories.map(cat => (
              <div key={cat.id} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 20, padding: "4px 12px",
              }}>
                <span style={{ fontSize: 13 }}>{cat.name}</span>
                <button
                  onClick={() => deleteCategory.mutate(cat.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 14, lineHeight: 1, padding: 0 }}
                >✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Menu Items ── */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Menu Items</h2>
          <Btn
            size="sm"
            onClick={() => setAddItemOpen(true)}
            disabled={categories.length === 0}
            title={categories.length === 0 ? "Add a category first" : ""}
          >
            + Add Item
          </Btn>
        </div>

        {menuItems.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text2)" }}>
            {categories.length === 0
              ? "Add a category above first, then add menu items."
              : "No menu items yet — add your first item!"}
          </div>
        ) : (
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {menuItems.map((item, i) => (
              <div key={item.id} style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "14px 20px",
                display: "flex", alignItems: "center", gap: 14,
                animation: `fadeUp 0.3s ${i * 0.04}s ease both`,
              }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                  : <span style={{ fontSize: 32, flexShrink: 0 }}>🍽️</span>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
                    {item.description}
                    {item.stock != null && ` · Stock: ${item.stock}`}
                  </div>
                  {item.discount > 0 && (
                    <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>
                      {item.discount}% OFF
                    </span>
                  )}
                </div>
                <span style={{ color: "var(--amber)", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {item.price} EGP
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="danger" size="sm" onClick={() => deleteMenuItem.mutate(item.id)}>
                    Delete
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Payments Section ── */}
      <OwnerPayments />

      {/* ── Edit Restaurant Modal ── */}
      {editOpen && (
        <Modal title="✎ Edit Restaurant Info" onClose={() => setEditOpen(false)}>
          <Field label="Restaurant Name" value={editForm.name}
            onChange={v => setEditForm(f => ({ ...f, name: v }))} />
          <Field label="Location" value={editForm.location}
            onChange={v => setEditForm(f => ({ ...f, location: v }))} />
          <Field label="Phone" value={editForm.phone}
            onChange={v => setEditForm(f => ({ ...f, phone: v }))} />
          <FieldArea label="Description" value={editForm.description}
            onChange={v => setEditForm(f => ({ ...f, description: v }))} />
          <ModalActions
            onCancel={() => setEditOpen(false)}
            onConfirm={() => updateRestaurant.mutate(editForm)}
            loading={updateRestaurant.isPending}
            label="Save Changes"
          />
        </Modal>
      )}

      {/* ── Add Category Modal ── */}
      {addCategoryOpen && (
        <Modal title="+ Add Category" onClose={() => setAddCategoryOpen(false)}>
          <Field label="Category Name" value={categoryName}
            onChange={setCategoryName} placeholder="e.g. Main Course" />
          <ModalActions
            onCancel={() => setAddCategoryOpen(false)}
            onConfirm={() => addCategory.mutate()}
            loading={addCategory.isPending}
            label="Add Category"
          />
        </Modal>
      )}

      {/* ── Add Menu Item Modal ── */}
      {addItemOpen && (
        <Modal title="+ Add Menu Item" onClose={() => setAddItemOpen(false)}>
          {/* Category selector — required by your MenuItemRequest schema */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Category *</label>
            <select
              value={itemForm.categoryId}
              onChange={e => setItemForm(f => ({ ...f, categoryId: e.target.value }))}
              style={{ ...inputStyle, background: "var(--bg2)" }}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <Field label="Item Name *"    value={itemForm.name}
            onChange={v => setItemForm(f => ({ ...f, name: v }))} />
          <Field label="Price (EGP) *"  value={itemForm.price}
            onChange={v => setItemForm(f => ({ ...f, price: v }))} type="number" />
          <Field label="Description"    value={itemForm.description}
            onChange={v => setItemForm(f => ({ ...f, description: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Discount (%)" value={itemForm.discount}
              onChange={v => setItemForm(f => ({ ...f, discount: v }))} type="number" />
            <Field label="Stock"        value={itemForm.stock}
              onChange={v => setItemForm(f => ({ ...f, stock: v }))} type="number" />
          </div>
          <ModalActions
            onCancel={() => setAddItemOpen(false)}
            onConfirm={() => {
              if (!itemForm.categoryId || !itemForm.name || !itemForm.price) return;
              addMenuItem.mutate(itemForm);
            }}
            loading={addMenuItem.isPending}
            label="Add Item"
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Owner Payments Section ───────────────────────────────────────────────────
// Collapsible section that renders PaymentManagement inline on the owner page.

function OwnerPayments() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ maxWidth: 900, margin: "32px auto 0" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderRadius: "var(--radius-lg)",
          background: "var(--bg2)", border: "1px solid var(--border)",
          cursor: "pointer", fontFamily: "'Playfair Display', serif",
          fontSize: 18, fontWeight: 700, color: "var(--text1)",
        }}
      >
        <span>💳 Payments</span>
        <span style={{ fontSize: 20, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>
      {open && (
        <div style={{
          marginTop: 12, padding: "20px 0",
          border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
          background: "var(--bg2)", padding: "20px 16px",
        }}>
          <PaymentManagement />
        </div>
      )}
    </div>
  );
}

// ─── Reusable UI helpers ──────────────────────────────────────────────────────

const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: "var(--text2)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 14px", borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  color: "var(--text1)", fontSize: 15,
};

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value ?? ""} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, background: "var(--bg2)" }}
      />
    </div>
  );
}

function FieldArea({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={value ?? ""} onChange={e => onChange(e.target.value)} rows={3}
        style={{ ...inputStyle, background: "var(--bg2)", resize: "vertical" }}
      />
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999,
    }}>
      <div style={{
        background: "var(--bg)", padding: 28, borderRadius: "var(--radius-lg)",
        width: "100%", maxWidth: 460, border: "1px solid var(--border)",
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "var(--text3)" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, loading, label }) {
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
      <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
      <Btn onClick={onConfirm} disabled={loading}>{loading ? "Saving..." : label}</Btn>
    </div>
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