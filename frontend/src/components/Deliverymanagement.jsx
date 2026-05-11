// components/DeliveryManagement.jsx
//
// Used in:
//   Admin.jsx  → "🚚 Deliveries" tab  (sees ALL deliveries)
//   Owner.jsx  → collapsible section  (sees their restaurant's deliveries)
//
// Endpoints:
//   GET  /api/deliveries/status/{status}        → list by status
//   GET  /api/deliveries/{deliveryId}           → single delivery detail
//   POST /api/deliveries                        → assign delivery (ADMIN, OWNER)
//   PATCH /api/deliveries/{deliveryId}/status   → update status (ADMIN, DELIVERY)

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  ASSIGNED:   { bg: '#fff7ed', color: '#f97316' },
  PICKED_UP:  { bg: '#eff6ff', color: '#2563eb' },
  IN_TRANSIT: { bg: '#fefce8', color: '#ca8a04' },
  DELIVERED:  { bg: '#f0fdf4', color: '#16a34a' },
  CANCELLED:  { bg: '#fef2f2', color: '#dc2626' },
};

function StatusBadge({ status }) {
  const s = (status ?? 'ASSIGNED').toUpperCase();
  const { bg, color } = STATUS_STYLES[s] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: bg, color, whiteSpace: 'nowrap',
    }}>
      {s.replace(/_/g, ' ')}
    </span>
  );
}

// ─── Assign Delivery Modal ────────────────────────────────────────────────────

function AssignModal({ onClose, onConfirm, isPending }) {
  const [form, setForm] = useState({
    orderId: '',
    deliveryPersonId: '',
    pickupAddress: '',
    deliveryAddress: '',
    specialInstructions: '',
    estimatedDeliveryTime: '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const valid = form.orderId && form.deliveryPersonId &&
                form.pickupAddress && form.deliveryAddress &&
                form.estimatedDeliveryTime;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '28px 26px',
        width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontWeight: 800, fontSize: 19, color: '#111827', marginBottom: 20 }}>
          🚚 Assign Delivery
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ModalField label="Order ID *"            value={form.orderId}              onChange={set('orderId')}              placeholder="e.g. ORD-123" />
          <ModalField label="Delivery Person ID *"  value={form.deliveryPersonId}     onChange={set('deliveryPersonId')}     placeholder="e.g. 45"      type="number" />
          <ModalField label="Pickup Address *"      value={form.pickupAddress}        onChange={set('pickupAddress')}        placeholder="Restaurant address" />
          <ModalField label="Delivery Address *"    value={form.deliveryAddress}      onChange={set('deliveryAddress')}      placeholder="Customer address" />
          <ModalField label="Estimated Delivery Time *" value={form.estimatedDeliveryTime} onChange={set('estimatedDeliveryTime')} type="datetime-local" />
          <ModalField label="Special Instructions"  value={form.specialInstructions}  onChange={set('specialInstructions')}  placeholder="Leave at door, ring bell…" as="textarea" />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 11, borderRadius: 10,
            border: '1.5px solid #e5e7eb', background: '#fff',
            color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 15,
          }}>Cancel</button>
          <button
            onClick={() => onConfirm({
              ...form,
              deliveryPersonId: parseInt(form.deliveryPersonId),
              estimatedDeliveryTime: new Date(form.estimatedDeliveryTime).toISOString(),
            })}
            disabled={isPending || !valid}
            style={{
              flex: 1, padding: 11, borderRadius: 10, border: 'none',
              background: isPending || !valid ? '#fdba74' : '#f97316',
              color: '#fff', fontWeight: 700,
              cursor: isPending || !valid ? 'not-allowed' : 'pointer',
              fontSize: 15,
            }}
          >
            {isPending ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({ label, value, onChange, placeholder, type = 'text', as: As = 'input' }) {
  const shared = {
    value, onChange, placeholder,
    style: {
      padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
      fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box',
      fontFamily: 'inherit', resize: 'vertical',
    },
    onFocus: e => { e.target.style.borderColor = '#f97316'; },
    onBlur:  e => { e.target.style.borderColor = '#e5e7eb'; },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</label>
      {As === 'textarea'
        ? <textarea rows={2} {...shared} />
        : <input type={type} {...shared} />
      }
    </div>
  );
}

// ─── Delivery row ─────────────────────────────────────────────────────────────

function DeliveryRow({ delivery, onUpdateStatus, isUpdating }) {
  const [expanded, setExpanded] = useState(false);

  const ADMIN_TRANSITIONS = {
    ASSIGNED:   ['PICKED_UP', 'CANCELLED'],
    PICKED_UP:  ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  };

  const nextStatuses = ADMIN_TRANSITIONS[delivery.status?.toUpperCase()] ?? [];

  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1.5px solid #f3f4f6',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
    }}>
      {}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '14px 18px', display: 'flex',
          alignItems: 'center', gap: 14, flexWrap: 'wrap',
          cursor: 'pointer', userSelect: 'none',
        }}
      >
        <div style={{ flex: '1 1 160px', minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
            Delivery #{String(delivery.id ?? '').toString().slice(-6).toUpperCase()}
          </div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            Order: {String(delivery.orderId ?? '—').slice(-8).toUpperCase()}
          </div>
          {delivery.createdAt && (
            <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 1 }}>
              {new Date(delivery.createdAt).toLocaleString('en-EG')}
            </div>
          )}
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <div style={{ fontSize: 13, color: '#374151' }}>
            🧑‍🦯 Driver #{delivery.deliveryPersonId ?? '—'}
          </div>
          {delivery.estimatedDeliveryTime && (
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              ETA: {new Date(delivery.estimatedDeliveryTime).toLocaleTimeString('en-EG', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>

        <StatusBadge status={delivery.status} />
        <span style={{ color: '#9ca3af', fontSize: 14 }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {}
      {expanded && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          padding: '14px 18px',
          background: '#fafafa',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {delivery.pickupAddress && (
            <div style={{ fontSize: 13, color: '#374151' }}>
              📍 <strong>Pickup:</strong> {delivery.pickupAddress}
            </div>
          )}
          {delivery.deliveryAddress && (
            <div style={{ fontSize: 13, color: '#374151' }}>
              🏠 <strong>Deliver to:</strong> {delivery.deliveryAddress}
            </div>
          )}
          {delivery.specialInstructions && (
            <div style={{ fontSize: 13, color: '#374151' }}>
              📝 <strong>Instructions:</strong> {delivery.specialInstructions}
            </div>
          )}
          {delivery.actualDeliveryTime && (
            <div style={{ fontSize: 13, color: '#16a34a' }}>
              ✅ <strong>Delivered at:</strong> {new Date(delivery.actualDeliveryTime).toLocaleString('en-EG')}
            </div>
          )}

          {}
          {nextStatuses.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              {nextStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => onUpdateStatus(delivery.id, s)}
                  disabled={isUpdating}
                  style={{
                    padding: '7px 16px', borderRadius: 8, border: 'none',
                    background: s === 'CANCELLED' ? '#fef2f2' : '#f0fdf4',
                    color: s === 'CANCELLED' ? '#dc2626' : '#16a34a',
                    fontWeight: 600, fontSize: 13,
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  → {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const STATUS_FILTERS = ['ALL', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

export default function DeliveryManagement() {
  const { showToast } = useApp();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [assignOpen, setAssignOpen] = useState(false);

  // Fetch deliveries — if ALL, fetch ASSIGNED + IN_TRANSIT + PICKED_UP in parallel
  // and merge; if filtered, fetch by status
  const { data: assignedData  = [] } = useQuery({ queryKey: ['deliveries', 'ASSIGNED'],   queryFn: () => api.get('/api/deliveries/status/ASSIGNED'),   enabled: statusFilter === 'ALL' });
  const { data: pickedData    = [] } = useQuery({ queryKey: ['deliveries', 'PICKED_UP'],  queryFn: () => api.get('/api/deliveries/status/PICKED_UP'),  enabled: statusFilter === 'ALL' });
  const { data: transitData   = [] } = useQuery({ queryKey: ['deliveries', 'IN_TRANSIT'], queryFn: () => api.get('/api/deliveries/status/IN_TRANSIT'), enabled: statusFilter === 'ALL' });
  const { data: deliveredData = [] } = useQuery({ queryKey: ['deliveries', 'DELIVERED'],  queryFn: () => api.get('/api/deliveries/status/DELIVERED'),  enabled: statusFilter === 'ALL' });
  const { data: cancelledData = [] } = useQuery({ queryKey: ['deliveries', 'CANCELLED'],  queryFn: () => api.get('/api/deliveries/status/CANCELLED'),  enabled: statusFilter === 'ALL' });

  const { data: filteredData = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['deliveries', statusFilter],
    queryFn:  () => api.get(`/api/deliveries/status/${statusFilter}`),
    enabled:  statusFilter !== 'ALL',
  });

  const allDeliveries = statusFilter === 'ALL'
    ? [...assignedData, ...pickedData, ...transitData, ...deliveredData, ...cancelledData]
    : filteredData;

  // Stats
  const stats = {
    active:    [...assignedData, ...pickedData, ...transitData].length,
    delivered: deliveredData.length,
    cancelled: cancelledData.length,
  };

  // Assign mutation
  const assign = useMutation({
    mutationFn: (body) => api.post('/api/deliveries', body),
    onSuccess: () => {
      queryClient.invalidateQueries(['deliveries']);
      setAssignOpen(false);
      showToast('Delivery assigned ✓');
    },
    onError: (err) => showToast(err.message || 'Failed to assign delivery', 'error'),
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: ({ deliveryId, status }) =>
      api.patch(`/api/deliveries/${encodeURIComponent(deliveryId)}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['deliveries']);
      showToast('Status updated ✓');
    },
    onError: (err) => showToast(err.message || 'Update failed', 'error'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Active deliveries', value: stats.active,    color: '#f97316', bg: '#fff7ed' },
          { label: 'Delivered today',   value: stats.delivered, color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Cancelled',         value: stats.cancelled, color: '#dc2626', bg: '#fef2f2' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: 12, padding: '16px 18px',
            border: `1px solid ${color}20`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        {}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)} style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              background: statusFilter === f ? '#f97316' : '#fff',
              color: statusFilter === f ? '#fff' : '#6b7280',
              boxShadow: statusFilter === f ? '0 2px 8px rgba(249,115,22,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
            }}>{f.replace(/_/g, ' ')}</button>
          ))}
        </div>

        {}
        <button
          onClick={() => setAssignOpen(true)}
          style={{
            padding: '9px 20px', borderRadius: 10, border: 'none',
            background: '#f97316', color: '#fff', fontWeight: 700,
            fontSize: 14, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(249,115,22,0.3)',
          }}
        >
          + Assign Delivery
        </button>
      </div>

      {}
      {isLoading && statusFilter !== 'ALL' ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Loading deliveries…</div>
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ color: '#dc2626', marginBottom: 10 }}>Failed to load deliveries</div>
          <button onClick={refetch} style={{
            padding: '8px 20px', borderRadius: 8, background: '#f97316',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
          }}>Retry</button>
        </div>
      ) : allDeliveries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚚</div>
          No {statusFilter !== 'ALL' ? statusFilter.toLowerCase().replace(/_/g, ' ') : ''} deliveries found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {allDeliveries.map((delivery, i) => (
            <DeliveryRow
              key={delivery.id ?? i}
              delivery={delivery}
              onUpdateStatus={(deliveryId, status) => updateStatus.mutate({ deliveryId, status })}
              isUpdating={updateStatus.isPending}
            />
          ))}
        </div>
      )}

      {}
      {assignOpen && (
        <AssignModal
          onClose={() => setAssignOpen(false)}
          onConfirm={(body) => assign.mutate(body)}
          isPending={assign.isPending}
        />
      )}
    </div>
  );
}