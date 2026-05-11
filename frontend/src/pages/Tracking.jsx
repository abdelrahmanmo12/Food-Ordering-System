// pages/Tracking.jsx
//
// Endpoints used:
//   GET  /orders/{orderId}                   → order status + deliveryId
//   GET  /api/deliveries/{deliveryId}        → full delivery detail (address, driver, ETA)
//   PATCH /api/deliveries/{deliveryId}/status → delivery person updates their status
//
// Route: /tracking/:orderId
// Add to App.js:
//   import Tracking from './pages/Tracking';
//   <Route path="/tracking/:orderId" element={<Tracking />} />

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STEPS = [
  { key: 'PLACED',     label: 'Order placed',    icon: '📋', desc: 'Your order has been received' },
  { key: 'CONFIRMED',  label: 'Confirmed',        icon: '✅', desc: 'Restaurant accepted your order' },
  { key: 'PREPARING',  label: 'Preparing',        icon: '👨‍🍳', desc: 'Your food is being prepared' },
  { key: 'READY',      label: 'Ready',            icon: '📦', desc: 'Order packed and ready for pickup' },
  { key: 'PICKED_UP',  label: 'Picked up',        icon: '🛵', desc: 'Driver has picked up your order' },
  { key: 'IN_TRANSIT', label: 'On the way',       icon: '🚀', desc: 'Your order is heading to you' },
  { key: 'DELIVERED',  label: 'Delivered',        icon: '🎉', desc: 'Enjoy your meal!' },
];

const TERMINAL = ['DELIVERED', 'CANCELLED', 'REJECTED'];

const DRIVER_TRANSITIONS = {
  ASSIGNED:   'PICKED_UP',
  PICKED_UP:  'IN_TRANSIT',
  IN_TRANSIT: 'DELIVERED',
};

const DRIVER_LABELS = {
  PICKED_UP:  'Mark as picked up',
  IN_TRANSIT: 'Mark as in transit',
  DELIVERED:  'Mark as delivered',
};

// ─── Step tracker ─────────────────────────────────────────────────────────────

function StepTracker({ currentStatus }) {
  const upper = currentStatus?.toUpperCase() ?? 'PLACED';
  const isCancelled = upper === 'CANCELLED' || upper === 'REJECTED';

  const currentIdx = ORDER_STEPS.findIndex(s => s.key === upper);

  return (
    <div style={{ padding: '8px 0 4px' }}>
      {isCancelled ? (
        <div style={{
          textAlign: 'center', padding: '28px 20px',
          background: '#fef2f2', borderRadius: 14,
          border: '1.5px solid #fecaca',
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>❌</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#dc2626' }}>
            Order {upper.charAt(0) + upper.slice(1).toLowerCase()}
          </div>
          <div style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
            This order was not completed
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {ORDER_STEPS.map((step, idx) => {
            const done    = idx <= currentIdx;
            const active  = idx === currentIdx;
            const last    = idx === ORDER_STEPS.length - 1;

            return (
              <div key={step.key} style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                {}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                    background: done ? (active ? '#f97316' : '#fff7ed') : '#f3f4f6',
                    border: active ? '2.5px solid #f97316' : done ? '2px solid #fed7aa' : '2px solid #e5e7eb',
                    boxShadow: active ? '0 0 0 4px rgba(249,115,22,0.15)' : 'none',
                    transition: 'all 0.3s',
                    position: 'relative', zIndex: 1,
                  }}>
                    {step.icon}
                  </div>
                  {!last && (
                    <div style={{
                      width: 2, flex: 1, minHeight: 20,
                      background: done && !active ? '#fed7aa' : '#e5e7eb',
                      margin: '2px 0',
                      transition: 'background 0.3s',
                    }} />
                  )}
                </div>

                {}
                <div style={{ paddingBottom: last ? 0 : 20, paddingTop: 8, flex: 1 }}>
                  <div style={{
                    fontWeight: active ? 700 : done ? 600 : 400,
                    fontSize: 15,
                    color: active ? '#f97316' : done ? '#111827' : '#9ca3af',
                    transition: 'color 0.3s',
                  }}>
                    {step.label}
                  </div>
                  {active && (
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                      {step.desc}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: 15, color: '#111827', fontWeight: 500, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}

// ─── Driver action panel ──────────────────────────────────────────────────────

function DriverPanel({ delivery, onUpdate, isPending }) {
  const deliveryStatus = delivery?.status?.toUpperCase();
  const nextStatus = DRIVER_TRANSITIONS[deliveryStatus];
  if (!nextStatus) return null;

  return (
    <div style={{
      background: '#fff7ed', borderRadius: 14, border: '1.5px solid #fed7aa',
      padding: '18px 20px', marginTop: 4,
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: '#92400e', marginBottom: 12 }}>
        🛵 Driver controls
      </div>
      <div style={{ fontSize: 14, color: '#78350f', marginBottom: 14 }}>
        Current status: <strong>{deliveryStatus?.replace(/_/g, ' ')}</strong>
      </div>
      <button
        onClick={() => onUpdate(nextStatus)}
        disabled={isPending}
        style={{
          padding: '11px 22px', borderRadius: 10, border: 'none',
          background: isPending ? '#fdba74' : '#f97316',
          color: '#fff', fontWeight: 700, fontSize: 15,
          cursor: isPending ? 'not-allowed' : 'pointer',
          width: '100%', transition: 'opacity 0.15s',
        }}
      >
        {isPending ? 'Updating…' : DRIVER_LABELS[nextStatus]}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Tracking() {
  const { orderId } = useParams();
  const { user, role } = useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pollRef = useRef(null);

  // ── Fetch order ─────────────────────────────────────────────────────────
  const {
    data: order,
    isLoading: orderLoading,
    isError: orderError,
  } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/api/orders/${orderId}`),
    refetchInterval: (data) => {
      const status = data?.status?.toUpperCase();
      return TERMINAL.includes(status) ? false : 10_000;
    },
    enabled: !!orderId,
  });

  // ── Fetch delivery (only when order has a deliveryId) ───────────────────
  const deliveryId = order?.deliveryId ?? order?.delivery?.id;

  const { data: delivery } = useQuery({
    queryKey: ['delivery', deliveryId],
    queryFn: () => api.get(`/api/deliveries/${deliveryId}`),
    enabled: !!deliveryId,
    refetchInterval: (data) => {
      const status = data?.status?.toUpperCase();
      return TERMINAL.includes(status) ? false : 10_000;
    },
  });

  // ── Driver: update delivery status ──────────────────────────────────────
  const updateStatus = useMutation({
    mutationFn: (newStatus) =>
      api.patch(`/api/deliveries/${deliveryId}/status`, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(['delivery', deliveryId]);
      queryClient.invalidateQueries(['order', orderId]);
    },
  });

  const isDelivery = role === 'delivery';
  const isOwner    = role === 'owner';
  const isAdmin    = role === 'admin';
  const isTerminal = TERMINAL.includes(order?.status?.toUpperCase());

  // ── Format ETA ──────────────────────────────────────────────────────────
  const formatETA = (isoString) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' });
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  if (orderLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12, animation: 'spin 1s linear infinite' }}>🔄</div>
          <div>Loading your order…</div>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 18, marginBottom: 8 }}>Order not found</div>
          <button onClick={() => navigate('/orders')} style={{
            padding: '10px 24px', borderRadius: 10, background: '#f97316',
            color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
          }}>View all orders</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f9fafb',
      padding: '24px 16px', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {}
        <button
          onClick={() => navigate('/orders')}
          style={{
            alignSelf: 'flex-start', background: 'none', border: 'none',
            cursor: 'pointer', color: '#6b7280', fontWeight: 600,
            fontSize: 14, padding: 0, display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← All orders
        </button>

        {}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6',
          padding: '22px 22px 18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Order #{String(order.id).slice(-8).toUpperCase()}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginTop: 4 }}>
                {order.restaurantName ?? 'Your order'}
              </div>
              {order.createdAt && (
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                  Placed {new Date(order.createdAt).toLocaleString('en-EG')}
                </div>
              )}
            </div>
            <div style={{
              padding: '6px 14px', borderRadius: 20, fontWeight: 700, fontSize: 13,
              background: isTerminal
                ? (order.status?.toUpperCase() === 'DELIVERED' ? '#f0fdf4' : '#fef2f2')
                : '#fff7ed',
              color: isTerminal
                ? (order.status?.toUpperCase() === 'DELIVERED' ? '#16a34a' : '#dc2626')
                : '#f97316',
            }}>
              {order.status?.replace(/_/g, ' ')}
            </div>
          </div>

          {}
          {!isTerminal && (
            <div style={{
              marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: '#f97316', fontWeight: 600,
            }}>
              <span style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: '#f97316',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              Live tracking — updates every 10s
            </div>
          )}
        </div>

        {}
        <div style={{
          background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6',
          padding: '22px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>
            Order progress
          </div>
          <StepTracker currentStatus={order.status} />
        </div>

        {}
        {delivery && (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6',
            padding: '22px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>
              Delivery details
            </div>
            <InfoRow icon="📍" label="Pickup address"   value={delivery.pickupAddress} />
            <InfoRow icon="🏠" label="Delivery address" value={delivery.deliveryAddress} />
            <InfoRow icon="⏱️" label="Estimated arrival" value={formatETA(delivery.estimatedDeliveryTime)} />
            {delivery.actualDeliveryTime && (
              <InfoRow icon="✅" label="Delivered at" value={formatETA(delivery.actualDeliveryTime)} />
            )}
            {delivery.specialInstructions && (
              <InfoRow icon="📝" label="Instructions" value={delivery.specialInstructions} />
            )}
            {delivery.deliveryPersonId && (
              <InfoRow icon="🧑‍🦯" label="Driver ID" value={`#${delivery.deliveryPersonId}`} />
            )}
          </div>
        )}

        {}
        {(order.items?.length > 0) && (
          <div style={{
            background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6',
            padding: '22px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 14 }}>
              Items ordered
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((item, i) => (
                <div key={item.id ?? i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 14, color: '#374151', padding: '6px 0',
                  borderBottom: i < order.items.length - 1 ? '1px solid #f9fafb' : 'none',
                }}>
                  <span>
                    <span style={{ fontWeight: 600 }}>{item.quantity ?? 1}×</span>{' '}
                    {item.name ?? item.itemName ?? `Item ${i + 1}`}
                  </span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    {item.price
                      ? `${(item.price * (item.quantity ?? 1)).toFixed(2)} EGP`
                      : ''}
                  </span>
                </div>
              ))}
            </div>

            {}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: 14, paddingTop: 12, borderTop: '1.5px solid #f3f4f6',
              fontWeight: 700, fontSize: 16, color: '#111827',
            }}>
              <span>Total</span>
              <span style={{ color: '#f97316' }}>
                {(order.totalAmount ?? order.total ?? 0).toFixed(2)} EGP
              </span>
            </div>
          </div>
        )}

        {}
        {isDelivery && delivery && (
          <DriverPanel
            delivery={delivery}
            onUpdate={(status) => updateStatus.mutate(status)}
            isPending={updateStatus.isPending}
          />
        )}

        {}
        {(isAdmin || isOwner) && delivery && (
          <div style={{
            background: '#f8fafc', borderRadius: 14, border: '1.5px dashed #e2e8f0',
            padding: '16px 18px',
          }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              Delivery status: <span style={{ color: '#f97316' }}>{delivery.status}</span>
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              Delivery ID: {delivery.id} · Order ID: {delivery.orderId}
            </div>
          </div>
        )}

        {}
        {order.status?.toUpperCase() === 'DELIVERED' && (
          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: 16, padding: '24px 22px', textAlign: 'center',
            color: '#fff',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Enjoy your meal!</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>Hope you love it</div>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 24px', borderRadius: 10,
                background: 'rgba(255,255,255,0.2)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer',
              }}
            >
              Order again
            </button>
          </div>
        )}

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}