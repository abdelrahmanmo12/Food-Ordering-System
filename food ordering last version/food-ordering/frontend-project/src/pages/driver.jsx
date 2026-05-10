// pages/Driver.jsx
//
// Separate dashboard for users with role "delivery" (drivers).
// Route: /driver   — add to App.js:
//   import Driver from './pages/Driver';
//   <Route path="/driver" element={<Driver />} />
//
// Also update AppContext login redirect:
//   else if (loggedInUser.role === "delivery") navigate("/driver");
//
// Endpoints:
//   GET  /api/deliveries/delivery-person/{driverId}  → driver's delivery list
//   PATCH /api/deliveries/{deliveryId}/status         → update status
//
// Allowed status transitions (DELIVERY role):
//   ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const TRANSITIONS = {
  ASSIGNED:   { next: 'PICKED_UP',  label: 'Pick Up Order',     icon: '📦', color: '#2563eb', bg: '#eff6ff' },
  PICKED_UP:  { next: 'IN_TRANSIT', label: 'Start Delivery',    icon: '🛵', color: '#d97706', bg: '#fefce8' },
  IN_TRANSIT: { next: 'DELIVERED',  label: 'Mark Delivered',    icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
};

const STATUS_META = {
  ASSIGNED:   { label: 'Assigned',   dot: '#f97316', bar: '#fff7ed' },
  PICKED_UP:  { label: 'Picked Up',  dot: '#2563eb', bar: '#eff6ff' },
  IN_TRANSIT: { label: 'In Transit', dot: '#d97706', bar: '#fefce8' },
  DELIVERED:  { label: 'Delivered',  dot: '#16a34a', bar: '#f0fdf4' },
  CANCELLED:  { label: 'Cancelled',  dot: '#dc2626', bar: '#fef2f2' },
};

const ACTIVE_STATUSES  = ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'];
const DONE_STATUSES    = ['DELIVERED', 'CANCELLED'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function Badge({ status }) {
  const s  = (status ?? 'ASSIGNED').toUpperCase();
  const m  = STATUS_META[s] ?? { label: s, dot: '#9ca3af', bar: '#f3f4f6' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 11px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: m.bar, color: m.dot, whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%', background: m.dot, flexShrink: 0,
        boxShadow: ACTIVE_STATUSES.includes(s) ? `0 0 0 3px ${m.dot}30` : 'none',
      }} />
      {m.label}
    </span>
  );
}

// ─── Active delivery card ─────────────────────────────────────────────────────

function ActiveCard({ delivery, onUpdate, isUpdating }) {
  const s  = (delivery.status ?? 'ASSIGNED').toUpperCase();
  const t  = TRANSITIONS[s];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      borderRadius: 20, padding: '24px 22px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      color: '#fff',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            Active Delivery
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
            #{String(delivery.id ?? '').toString().slice(-6).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 3 }}>
            Order: {String(delivery.orderId ?? '—').slice(-8).toUpperCase()}
          </div>
        </div>
        <Badge status={delivery.status} />
      </div>

      {/* Address route */}
      <div style={{
        background: 'rgba(255,255,255,0.06)', borderRadius: 14,
        padding: '16px 18px', marginBottom: 18,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <AddressLine icon="📍" label="Pick up from" address={delivery.pickupAddress} />
        <div style={{ margin: '10px 0', paddingLeft: 14 }}>
          <div style={{ width: 1.5, height: 18, background: '#475569', marginLeft: 7 }} />
        </div>
        <AddressLine icon="🏠" label="Deliver to" address={delivery.deliveryAddress} />
      </div>

      {/* ETA + instructions */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {delivery.estimatedDeliveryTime && (
          <Chip icon="⏱️" label={`ETA ${fmt(delivery.estimatedDeliveryTime)}`} />
        )}
        {delivery.customerId && (
          <Chip icon="👤" label={`Customer #${delivery.customerId}`} />
        )}
      </div>

      {delivery.specialInstructions && (
        <div style={{
          background: 'rgba(251,191,36,0.12)', borderRadius: 10,
          padding: '10px 14px', marginBottom: 18,
          border: '1px solid rgba(251,191,36,0.2)',
          fontSize: 13, color: '#fbbf24',
        }}>
          📝 {delivery.specialInstructions}
        </div>
      )}

      {/* Action button */}
      {t && (
        <button
          onClick={() => onUpdate(delivery.id, t.next)}
          disabled={isUpdating}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none',
            background: isUpdating ? '#475569' : t.color,
            color: '#fff', fontWeight: 800, fontSize: 16,
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: '-0.01em',
            transition: 'all 0.2s',
            boxShadow: isUpdating ? 'none' : `0 4px 14px ${t.color}55`,
          }}
        >
          {isUpdating ? 'Updating…' : `${t.icon} ${t.label}`}
        </button>
      )}

      {s === 'DELIVERED' && (
        <div style={{
          textAlign: 'center', padding: '14px 0', color: '#4ade80',
          fontWeight: 700, fontSize: 16,
        }}>
          ✅ Delivered successfully!
        </div>
      )}
    </div>
  );
}

function AddressLine({ icon, label, address }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 500, marginTop: 2 }}>{address ?? '—'}</div>
      </div>
    </div>
  );
}

function Chip({ icon, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 20,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.1)',
      fontSize: 12, color: '#cbd5e1', fontWeight: 500,
    }}>
      {icon} {label}
    </span>
  );
}

// ─── Queue card (smaller, for assigned but not the topmost active) ────────────

function QueueCard({ delivery, onUpdate, isUpdating }) {
  const s = (delivery.status ?? 'ASSIGNED').toUpperCase();
  const t = TRANSITIONS[s];
  const [exp, setExp] = useState(false);

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1.5px solid #f1f5f9',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setExp(v => !v)}
        style={{
          padding: '14px 18px', display: 'flex',
          alignItems: 'center', gap: 14,
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
            #{String(delivery.id ?? '').toString().slice(-6).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {delivery.deliveryAddress ?? 'No address'}
          </div>
        </div>
        <Badge status={delivery.status} />
        <span style={{ color: '#cbd5e1', fontSize: 12 }}>{exp ? '▲' : '▼'}</span>
      </div>

      {exp && (
        <div style={{ padding: '0 18px 16px', borderTop: '1px solid #f8fafc', background: '#fafafa' }}>
          <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {delivery.pickupAddress && (
              <div style={{ fontSize: 13, color: '#475569' }}>📍 <strong>From:</strong> {delivery.pickupAddress}</div>
            )}
            {delivery.deliveryAddress && (
              <div style={{ fontSize: 13, color: '#475569' }}>🏠 <strong>To:</strong> {delivery.deliveryAddress}</div>
            )}
            {delivery.estimatedDeliveryTime && (
              <div style={{ fontSize: 13, color: '#475569' }}>⏱️ <strong>ETA:</strong> {fmt(delivery.estimatedDeliveryTime)}</div>
            )}
            {delivery.specialInstructions && (
              <div style={{ fontSize: 13, color: '#92400e', background: '#fef3c7', borderRadius: 8, padding: '8px 10px' }}>
                📝 {delivery.specialInstructions}
              </div>
            )}
            {t && (
              <button
                onClick={(e) => { e.stopPropagation(); onUpdate(delivery.id, t.next); }}
                disabled={isUpdating}
                style={{
                  marginTop: 4, padding: '10px 18px', borderRadius: 10, border: 'none',
                  background: t.color, color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: isUpdating ? 'not-allowed' : 'pointer', opacity: isUpdating ? 0.6 : 1,
                }}
              >
                {t.icon} {t.label}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── History card ─────────────────────────────────────────────────────────────

function HistoryCard({ delivery }) {
  const s = (delivery.status ?? 'DELIVERED').toUpperCase();
  return (
    <div style={{
      background: '#fff', borderRadius: 12,
      border: '1.5px solid #f1f5f9',
      padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      opacity: 0.8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>
          #{String(delivery.id ?? '').toString().slice(-6).toUpperCase()}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {delivery.deliveryAddress ?? 'No address'}
        </div>
        {delivery.actualDeliveryTime && (
          <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 2 }}>
            {fmtDate(delivery.actualDeliveryTime)}
          </div>
        )}
      </div>
      <Badge status={delivery.status} />
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow({ deliveries }) {
  const active    = deliveries.filter(d => ACTIVE_STATUSES.includes((d.status ?? '').toUpperCase())).length;
  const delivered = deliveries.filter(d => d.status?.toUpperCase() === 'DELIVERED').length;
  const cancelled = deliveries.filter(d => d.status?.toUpperCase() === 'CANCELLED').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
      {[
        { label: 'Active',    value: active,    color: '#f97316', bg: '#fff7ed' },
        { label: 'Delivered', value: delivered, color: '#16a34a', bg: '#f0fdf4' },
        { label: 'Cancelled', value: cancelled, color: '#dc2626', bg: '#fef2f2' },
      ].map(({ label, value, color, bg }) => (
        <div key={label} style={{
          background: bg, borderRadius: 14,
          padding: '14px 16px',
          border: `1px solid ${color}20`,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Driver() {
  const { user, role, logout } = useApp();
  const navigate   = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('active');

 

  // Fetch this driver's deliveries
  const {
    data: deliveries = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['driver-deliveries', user?.id],
    queryFn:  () => api.get(`/api/deliveries/delivery-person/${user.id}`),
    enabled:  !!user?.id,
    refetchInterval: 30_000, // poll every 30s for new assignments
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: ({ deliveryId, status }) =>
      api.patch(`/api/deliveries/${deliveryId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['driver-deliveries', user?.id]);
    },
  });

   // Access guard
  if (role !== 'delivery') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f8fafc',
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#111827', marginBottom: 8 }}>Driver Access Only</div>
          <div style={{ color: '#9ca3af', marginBottom: 20 }}>This page is for delivery personnel.</div>
          <button onClick={() => navigate('/')} style={{
            padding: '10px 24px', borderRadius: 10, background: '#f97316',
            color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer',
          }}>Go Home</button>
        </div>
      </div>
    );
  }

  const handleUpdate = (deliveryId, status) => {
    updateStatus.mutate({ deliveryId, status });
  };

  // Split into active and history
  const active  = deliveries.filter(d => ACTIVE_STATUSES.includes((d.status ?? '').toUpperCase()));
  const history = deliveries.filter(d => DONE_STATUSES.includes((d.status ?? '').toUpperCase()));

  // The topmost active delivery gets the big card; the rest go in the queue
  const [primary, ...queue] = active;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        background: '#0f172a',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🛵</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: "'Space Grotesk', sans-serif" }}>
              {user?.name ?? 'Driver'}
            </div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Delivery Dashboard</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#4ade80',
              boxShadow: '0 0 0 3px rgba(74,222,128,0.25)',
              display: 'inline-block',
            }} />
            Online
          </div>
          <button
            onClick={() => { logout?.(); navigate('/auth'); }}
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}
          >Sign out</button>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Stats */}
        <StatsRow deliveries={deliveries} />

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: '#e2e8f0', borderRadius: 12, padding: 4,
        }}>
          {[
            { key: 'active',  label: `Active${active.length ? ` (${active.length})` : ''}` },
            { key: 'history', label: `History${history.length ? ` (${history.length})` : ''}` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                background: tab === t.key ? '#fff' : 'transparent',
                color: tab === t.key ? '#0f172a' : '#64748b',
                fontWeight: 700, fontSize: 14,
                cursor: 'pointer',
                boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Loading / error */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
            Loading deliveries…
          </div>
        )}

        {isError && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ color: '#dc2626', marginBottom: 10 }}>Failed to load deliveries</div>
            <button onClick={refetch} style={{
              padding: '8px 20px', borderRadius: 8, background: '#f97316',
              color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
            }}>Retry</button>
          </div>
        )}

        {/* Active tab */}
        {!isLoading && !isError && tab === 'active' && (
          <>
            {active.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                background: '#fff', borderRadius: 16,
                border: '1.5px solid #f1f5f9',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>All clear!</div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>No active deliveries right now.<br />New assignments will appear here.</div>
              </div>
            ) : (
              <>
                {/* Primary active card */}
                {primary && (
                  <ActiveCard
                    delivery={primary}
                    onUpdate={handleUpdate}
                    isUpdating={updateStatus.isPending}
                  />
                )}

                {/* Queue — remaining active deliveries */}
                {queue.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                      Up next ({queue.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {queue.map((d, i) => (
                        <QueueCard
                          key={d.id ?? i}
                          delivery={d}
                          onUpdate={handleUpdate}
                          isUpdating={updateStatus.isPending}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* History tab */}
        {!isLoading && !isError && tab === 'history' && (
          <>
            {history.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                background: '#fff', borderRadius: 16,
                border: '1.5px solid #f1f5f9',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a', marginBottom: 6 }}>No history yet</div>
                <div style={{ fontSize: 14, color: '#94a3b8' }}>Completed deliveries will appear here.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.map((d, i) => (
                  <HistoryCard key={d.id ?? i} delivery={d} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pull to refresh hint */}
        {!isLoading && !isError && (
          <div style={{ textAlign: 'center', fontSize: 12, color: '#cbd5e1', paddingBottom: 8 }}>
            Auto-refreshes every 30s ·{' '}
            <span
              onClick={refetch}
              style={{ color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Refresh now
            </span>
          </div>
        )}

      </div>
    </div>
  );
}