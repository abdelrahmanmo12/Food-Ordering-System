// pages/Orders.jsx
// Endpoints:
//   GET /orders/customer/{userId}   → list all orders for logged-in user
//   GET /orders/{id}                → fetch single order detail on expand

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  PLACED:      { bg: '#eff6ff', color: '#2563eb' },
  CONFIRMED:   { bg: '#f0fdf4', color: '#16a34a' },
  PREPARING:   { bg: '#fff7ed', color: '#f97316' },
  READY:       { bg: '#fefce8', color: '#ca8a04' },
  PICKED_UP:   { bg: '#faf5ff', color: '#9333ea' },
  IN_TRANSIT:  { bg: '#faf5ff', color: '#9333ea' },
  DELIVERED:   { bg: '#f0fdf4', color: '#16a34a' },
  CANCELLED:   { bg: '#fef2f2', color: '#dc2626' },
  REJECTED:    { bg: '#fef2f2', color: '#dc2626' },
};

function StatusBadge({ status }) {
  const s = status?.toUpperCase() ?? 'PLACED';
  const { bg, color } = STATUS_COLORS[s] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: bg, color,
    }}>
      {s.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const { data: detail, isLoading } = useQuery({
    queryKey: ['order', order.id],
    queryFn: () => api.get(`/orders/${order.id}`),
    enabled: expanded,
  });

  const items = detail?.items ?? order.items ?? [];
  const date = order.createdAt ?? order.placedAt;

  return (
    <div style={{
      background: '#fff', borderRadius: 14,
      border: '1.5px solid #f3f4f6',
      boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
      overflow: 'hidden', transition: 'box-shadow 0.2s',
    }}>
      {/* Order header — always visible */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '16px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        }}
      >
        {/* Restaurant icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: '#fff7ed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          🍽️
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
            {order.restaurantName ?? `Order #${String(order.id).slice(-6).toUpperCase()}`}
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
            {date ? new Date(date).toLocaleDateString('en-EG', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            }) : 'Date unknown'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <StatusBadge status={order.status} />
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>
            {order.totalAmount ?? order.total
              ? `${(order.totalAmount ?? order.total).toFixed(2)} EGP`
              : '—'}
          </div>
          <span style={{ color: '#9ca3af', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', background: '#fafafa' }}>
          {isLoading ? (
            <div style={{ color: '#9ca3af', fontSize: 14 }}>Loading details…</div>
          ) : items.length === 0 ? (
            <div style={{ color: '#9ca3af', fontSize: 14 }}>No item details available</div>
          ) : (
            <>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                ITEMS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => (
                  <div key={item.id ?? i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 14, color: '#374151',
                  }}>
                    <span>
                      <span style={{ fontWeight: 600 }}>{item.quantity ?? 1}×</span>{' '}
                      {item.name ?? item.itemName ?? `Item ${i + 1}`}
                    </span>
                    <span style={{ fontWeight: 500 }}>
                      {item.price ? `${(item.price * (item.quantity ?? 1)).toFixed(2)} EGP` : ''}
                    </span>
                  </div>
                ))}
              </div>

              {(detail?.deliveryAddress ?? order.deliveryAddress) && (
                <div style={{ marginTop: 14, fontSize: 13, color: '#6b7280' }}>
                  📍 {detail?.deliveryAddress ?? order.deliveryAddress}
                </div>
              )}

              {/* Track button — only for active orders */}
              {!['DELIVERED','CANCELLED','REJECTED'].includes(order.status?.toUpperCase()) && (
                <div style={{ marginTop: 14 }}>
                  <button
                    onClick={() => navigate(`/tracking/${order.id}`)}
                    style={{
                      padding: '8px 18px', borderRadius: 8, border: 'none',
                      background: '#f97316', color: '#fff',
                      fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    Track order →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Orders() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('ALL');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => api.get(`/orders/customer/${user.id}`),
    enabled: !!user,
    select: (data) => Array.isArray(data) ? data : data.content ?? [],
  });

  const orders = data ?? [];

  const FILTERS = ['ALL', 'PLACED', 'PREPARING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status?.toUpperCase() === filter);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Sign in to see your orders</div>
        <button onClick={() => navigate('/auth')} style={{
          marginTop: 16, padding: '10px 24px', borderRadius: 10,
          background: '#f97316', color: '#fff', border: 'none',
          fontWeight: 600, cursor: 'pointer',
        }}>Sign in</button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f9fafb',
      padding: '28px 16px', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Your orders</h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: '4px 0 0' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: filter === f ? '#f97316' : '#fff',
                color: filter === f ? '#fff' : '#6b7280',
                boxShadow: filter === f ? '0 2px 8px rgba(249,115,22,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              {f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            Loading your orders…
          </div>
        ) : isError ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ color: '#dc2626', marginBottom: 12 }}>Failed to load orders</div>
            <button onClick={refetch} style={{
              padding: '8px 20px', borderRadius: 8, background: '#f97316',
              color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
            }}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛍️</div>
            <div style={{ fontWeight: 700, color: '#374151', fontSize: 18 }}>
              {filter === 'ALL' ? 'No orders yet' : `No ${filter.toLowerCase()} orders`}
            </div>
            {filter === 'ALL' && (
              <button onClick={() => navigate('/')} style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 10,
                background: '#f97316', color: '#fff', border: 'none',
                fontWeight: 600, cursor: 'pointer',
              }}>Browse restaurants</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}