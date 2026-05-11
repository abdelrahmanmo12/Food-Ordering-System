// pages/Profile.jsx
// Endpoints used:
//   GET  /users/profiles/me              → load profile
//   PUT  /users/profiles/{id}            → save edits
//   GET  /users/profiles/favourites      → load favorites
//   POST /users/profiles/favourites/{restaurantId} → add favorite
//   DELETE /users/profiles/favourites/{restaurantId} → remove favorite (if backend supports)

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// ─── Tiny helpers ────────────────────────────────────────────────────────────

function Avatar({ name, size = 80 }) {
  const initials = (name || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #f97316, #ea580c)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 700, fontSize: size * 0.35,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
        fontSize: 15, outline: 'none', background: disabled ? '#f9fafb' : '#fff',
        color: '#111827', transition: 'border-color 0.15s',
        width: '100%', boxSizing: 'border-box',
      }}
      onFocus={e => { if (!disabled) e.target.style.borderColor = '#f97316'; }}
      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
    />
  );
}

function Btn({ onClick, children, variant = 'primary', disabled, small }) {
  const styles = {
    primary: { background: '#f97316', color: '#fff', border: 'none' },
    outline: { background: 'transparent', color: '#f97316', border: '1.5px solid #f97316' },
    ghost:   { background: 'transparent', color: '#6b7280', border: '1.5px solid #e5e7eb' },
    danger:  { background: '#fee2e2', color: '#dc2626', border: 'none' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: small ? '7px 16px' : '11px 22px',
        borderRadius: 10, fontWeight: 600,
        fontSize: small ? 13 : 15, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s, transform 0.1s',
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {children}
    </button>
  );
}

// ─── Favorite restaurant card ─────────────────────────────────────────────────

function FavCard({ restaurant, onRemove }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, border: '1.5px solid #f3f4f6',
      padding: '14px 16px', display: 'flex', alignItems: 'center',
      gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
        background: '#f3f4f6', flexShrink: 0,
      }}>
        {restaurant.imageUrl
          ? <img src={restaurant.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🍽️</div>
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {restaurant.name}
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>{restaurant.cuisine}</div>
      </div>
      <button
        onClick={() => onRemove(restaurant.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f97316', fontSize: 18, padding: 4 }}
        title="Remove from favorites"
      >
        ♥
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Profile() {
  const { user, showToast } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [tab, setTab] = useState('info'); // 'info' | 'favorites' | 'security'
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  // Redirect if not logged in
  useEffect(() => { if (!user) navigate('/auth'); }, [user, navigate]);

  // ── Fetch profile ─────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/users/profiles/me'),
    enabled: !!user,
    onSuccess: (data) => {
      setForm({
        name:    data.name    || user?.name    || '',
        email:   data.email   || user?.email   || '',
        phone:   data.phone   || '',
        address: data.address || '',
      });
    },
  });

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        name:    profile.name    || user?.name    || '',
        email:   profile.email   || user?.email   || '',
        phone:   profile.phone   || '',
        address: profile.address || '',
      });
    }
  }, [profile, user]);

  // ── Fetch favorites ───────────────────────────────────────────────────────
  const { data: favorites = [], isLoading: favsLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => api.get('/users/profiles/favourites'),
    enabled: !!user && tab === 'favorites',
  });

  // ── Save profile ──────────────────────────────────────────────────────────
  const saveProfile = useMutation({
    mutationFn: (data) => api.put(`/users/profiles/${user.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      setEditing(false);
      showToast('Profile updated ✓');
    },
    onError: (err) => showToast(err.message || 'Update failed', 'error'),
  });

  // ── Remove favorite ───────────────────────────────────────────────────────
  const removeFav = useMutation({
    mutationFn: (restaurantId) => api.del(`/users/profiles/favourites/${restaurantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['favorites']);
      showToast('Removed from favorites');
    },
    onError: (err) => showToast(err.message || 'Failed to remove', 'error'),
  });

  // ── Change password ───────────────────────────────────────────────────────
  const changePassword = useMutation({
    mutationFn: (data) => api.put('/auth/change-password', data, {
      headers: { 'X-User-Id': String(user?.id) },
    }),
    onSuccess: () => {
      setPasswords({ current: '', next: '', confirm: '' });
      showToast('Password changed ✓');
    },
    onError: (err) => showToast(err.message || 'Failed to change password', 'error'),
  });

  const handlePasswordSubmit = () => {
    if (!passwords.current || !passwords.next) {
      showToast('Fill in all password fields', 'error'); return;
    }
    if (passwords.next !== passwords.confirm) {
      showToast('New passwords do not match', 'error'); return;
    }
    changePassword.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.next,
    });
  };

  if (!user) return null;

  // ─── Styles ───────────────────────────────────────────────────────────────
  const card = {
    background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden',
  };

  const tabBtn = (t) => ({
    padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 14,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: tab === t ? '#fff7ed' : 'transparent',
    color: tab === t ? '#f97316' : '#6b7280',
    boxShadow: tab === t ? '0 1px 4px rgba(249,115,22,0.15)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh', background: '#f9fafb',
      padding: '32px 16px', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {}
        <div style={{ ...card, padding: '28px 28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <Avatar name={form.name || user.name} size={72} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                {form.name || user.name || 'Your Profile'}
              </div>
              <div style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>{form.email || user.email}</div>
              <div style={{
                display: 'inline-block', marginTop: 8, padding: '3px 10px',
                borderRadius: 20, background: '#fff7ed', color: '#f97316',
                fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
              }}>
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {}
        <div style={{
          display: 'flex', gap: 6, background: '#f3f4f6',
          borderRadius: 12, padding: 4,
        }}>
          {[
            { key: 'info',      label: '👤 Profile' },
            { key: 'favorites', label: '♥ Favorites' },
            { key: 'security',  label: '🔒 Security' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)} style={tabBtn(key)}>
              {label}
            </button>
          ))}
        </div>

        {}
        {tab === 'info' && (
          <div style={{ ...card, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Personal information</div>
              {!editing && (
                <Btn variant="outline" small onClick={() => setEditing(true)}>Edit</Btn>
              )}
            </div>

            {profileLoading ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>Loading…</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                <Field label="Full name">
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Your name" disabled={!editing} />
                </Field>
                <Field label="Email">
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    type="email" placeholder="you@example.com" disabled={!editing} />
                </Field>
                <Field label="Phone">
                  <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+20 1XX XXX XXXX" disabled={!editing} />
                </Field>
                <Field label="Address">
                  <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Your address" disabled={!editing} />
                </Field>
              </div>
            )}

            {editing && (
              <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
                <Btn variant="ghost" onClick={() => setEditing(false)}>Cancel</Btn>
                <Btn
                  onClick={() => saveProfile.mutate(form)}
                  disabled={saveProfile.isPending}
                >
                  {saveProfile.isPending ? 'Saving…' : 'Save changes'}
                </Btn>
              </div>
            )}
          </div>
        )}

        {}
        {tab === 'favorites' && (
          <div style={{ ...card, padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 20 }}>
              Favorite restaurants
            </div>
            {favsLoading ? (
              <div style={{ color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>Loading…</div>
            ) : favorites.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍽️</div>
                <div style={{ fontWeight: 600, color: '#6b7280', fontSize: 16 }}>No favorites yet</div>
                <div style={{ fontSize: 14, marginTop: 6 }}>Heart a restaurant to save it here</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {favorites.map(r => (
                  <FavCard key={r.id} restaurant={r} onRemove={(id) => removeFav.mutate(id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {}
        {tab === 'security' && (
          <div style={{ ...card, padding: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#111827', marginBottom: 24 }}>
              Change password
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 380 }}>
              <Field label="Current password">
                <Input type="password" value={passwords.current}
                  onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                  placeholder="Current password" />
              </Field>
              <Field label="New password">
                <Input type="password" value={passwords.next}
                  onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))}
                  placeholder="New password" />
              </Field>
              <Field label="Confirm new password">
                <Input type="password" value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  placeholder="Repeat new password" />
              </Field>
              <div style={{ paddingTop: 4 }}>
                <Btn onClick={handlePasswordSubmit} disabled={changePassword.isPending}>
                  {changePassword.isPending ? 'Saving…' : 'Update password'}
                </Btn>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}