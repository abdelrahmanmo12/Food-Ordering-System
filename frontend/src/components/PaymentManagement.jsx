// components/PaymentManagement.jsx
// Drop this into your Admin.jsx as a new tab, or Owner.jsx as a section.
//
// Endpoints:
//   GET   /api/payments                        → list all payments (admin view)
//   GET   /api/payments/order/{orderId}        → payment for a specific order (if endpoint exists)
//   POST  /api/payments/refund                 → { paymentId, refundAmount, reason }
//   PATCH /api/payments/{paymentId}/cancel     → cancel a payment
//
// Roles that can use this: ADMIN, OWNER
//
// Usage in Admin.jsx:
//   import PaymentManagement from '../components/PaymentManagement';
//   // Add a "Payments" tab, render <PaymentManagement />

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES = {
  PENDING:   { bg: '#fff7ed', color: '#f97316' },
  COMPLETED: { bg: '#f0fdf4', color: '#16a34a' },
  REFUNDED:  { bg: '#eff6ff', color: '#2563eb' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626' },
  FAILED:    { bg: '#fef2f2', color: '#dc2626' },
};

function StatusBadge({ status }) {
  const s = (status ?? 'PENDING').toUpperCase();
  const { bg, color } = STATUS_STYLES[s] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
      background: bg, color, whiteSpace: 'nowrap',
    }}>
      {s}
    </span>
  );
}

// ─── Refund modal ─────────────────────────────────────────────────────────────

function RefundModal({ payment, onClose, onConfirm, isPending }) {
  const [amount, setAmount]   = useState(payment.amount ?? 0);
  const [reason, setReason]   = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, padding: '28px 26px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontWeight: 800, fontSize: 19, color: '#111827', marginBottom: 4 }}>
          Process refund
        </div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>
          Payment #{String(payment.paymentId ?? payment.id).slice(-8).toUpperCase()} · {payment.amount} EGP
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
              Refund amount (EGP) <span style={{ color: '#f97316' }}>*</span>
            </label>
            <input
              type="number"
              min="0.01"
              max={payment.amount}
              step="0.01"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
              style={{
                padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                fontSize: 15, outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#f97316'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
            {amount > payment.amount && (
              <div style={{ fontSize: 12, color: '#dc2626' }}>
                Cannot exceed original amount ({payment.amount} EGP)
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Customer complaint, wrong order, quality issue…"
              style={{
                padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
                fontSize: 14, outline: 'none', resize: 'vertical',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#f97316'; }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '11px', borderRadius: 10,
            border: '1.5px solid #e5e7eb', background: '#fff',
            color: '#374151', fontWeight: 600, cursor: 'pointer', fontSize: 15,
          }}>Cancel</button>
          <button
            onClick={() => onConfirm({ paymentId: payment.paymentId ?? payment.id, refundAmount: amount, reason })}
            disabled={isPending || amount <= 0 || amount > payment.amount}
            style={{
              flex: 1, padding: '11px', borderRadius: 10, border: 'none',
              background: isPending ? '#fdba74' : '#f97316',
              color: '#fff', fontWeight: 700, cursor: isPending ? 'not-allowed' : 'pointer',
              fontSize: 15, opacity: (amount <= 0 || amount > payment.amount) ? 0.5 : 1,
            }}
          >
            {isPending ? 'Processing…' : 'Confirm refund'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment row ──────────────────────────────────────────────────────────────

function PaymentRow({ payment, onRefund, onCancel, isCancelling }) {
  const canRefund  = ['COMPLETED', 'PENDING'].includes(payment.status?.toUpperCase());
  const canCancel  = payment.status?.toUpperCase() === 'PENDING';

  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1.5px solid #f3f4f6',
      padding: '14px 18px', display: 'flex',
      alignItems: 'center', gap: 14, flexWrap: 'wrap',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {}
      <div style={{ flex: '1 1 160px', minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
          #{String(payment.paymentId ?? payment.id ?? '').slice(-8).toUpperCase()}
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
          Order: {String(payment.orderId ?? '—').slice(-8).toUpperCase()}
        </div>
        {payment.createdAt && (
          <div style={{ fontSize: 11, color: '#d1d5db', marginTop: 1 }}>
            {new Date(payment.createdAt).toLocaleString('en-EG')}
          </div>
        )}
      </div>

      {}
      <div style={{ flex: '1 1 120px', textAlign: 'right' }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
          {payment.amount?.toFixed(2)} EGP
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
          {payment.paymentMethod?.replace(/_/g, ' ')}
        </div>
      </div>

      <StatusBadge status={payment.status} />

      {}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        {canRefund && (
          <button
            onClick={() => onRefund(payment)}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: '#eff6ff', color: '#2563eb',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            Refund
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => onCancel(payment.paymentId ?? payment.id)}
            disabled={isCancelling}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: '#fef2f2', color: '#dc2626',
              fontWeight: 600, fontSize: 13,
              cursor: isCancelling ? 'not-allowed' : 'pointer',
              opacity: isCancelling ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PaymentManagement() {
  const { showToast } = useApp();
  const queryClient = useQueryClient();
  const [refundTarget, setRefundTarget] = useState(null); // payment object being refunded
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all payments
  // Adjust endpoint if yours differs — some backends use /api/payments/all or /api/payments?role=admin
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/api/payments'),
    select: (d) => Array.isArray(d) ? d : d.content ?? [],
  });

  const payments = data ?? [];

  // Refund mutation
  const refund = useMutation({
    mutationFn: (body) => api.post('/api/payments/refund', body),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      setRefundTarget(null);
      showToast('Refund processed ✓');
    },
    onError: (err) => showToast(err.message || 'Refund failed', 'error'),
  });

  // Cancel mutation
  const cancel = useMutation({
    mutationFn: (paymentId) => api.patch(`/api/payments/${encodeURIComponent(paymentId)}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries(['payments']);
      showToast('Payment cancelled ✓');
    },
    onError: (err) => showToast(err.message || 'Cancel failed', 'error'),
  });

  // Filter
  const FILTERS = ['ALL', 'PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'];
  const filtered = statusFilter === 'ALL'
    ? payments
    : payments.filter(p => p.status?.toUpperCase() === statusFilter);

  // Summary stats
  const totalRevenue  = payments.filter(p => p.status?.toUpperCase() === 'COMPLETED').reduce((s, p) => s + (p.amount ?? 0), 0);
  const totalRefunded = payments.filter(p => p.status?.toUpperCase() === 'REFUNDED').reduce((s, p) => s + (p.amount ?? 0), 0);
  const pending       = payments.filter(p => p.status?.toUpperCase() === 'PENDING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Total revenue',   value: `${totalRevenue.toFixed(2)} EGP`,  color: '#16a34a', bg: '#f0fdf4' },
          { label: 'Total refunded',  value: `${totalRefunded.toFixed(2)} EGP`, color: '#2563eb', bg: '#eff6ff' },
          { label: 'Pending',         value: pending,                            color: '#f97316', bg: '#fff7ed' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{
            background: bg, borderRadius: 12, padding: '16px 18px',
            border: `1px solid ${color}20`,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 4 }}>{value}</div>
          </div>
        ))}
      </div>

      {}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: statusFilter === f ? '#f97316' : '#fff',
            color: statusFilter === f ? '#fff' : '#6b7280',
            boxShadow: statusFilter === f ? '0 2px 8px rgba(249,115,22,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
          }}>{f}</button>
        ))}
      </div>

      {}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Loading payments…</div>
      ) : isError ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ color: '#dc2626', marginBottom: 10 }}>Failed to load payments</div>
          <button onClick={refetch} style={{
            padding: '8px 20px', borderRadius: 8, background: '#f97316',
            color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600,
          }}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
          No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} payments found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((payment, i) => (
            <PaymentRow
              key={payment.paymentId ?? payment.id ?? i}
              payment={payment}
              onRefund={setRefundTarget}
              onCancel={(id) => cancel.mutate(id)}
              isCancelling={cancel.isPending}
            />
          ))}
        </div>
      )}

      {}
      {refundTarget && (
        <RefundModal
          payment={refundTarget}
          onClose={() => setRefundTarget(null)}
          onConfirm={(body) => refund.mutate(body)}
          isPending={refund.isPending}
        />
      )}
    </div>
  );
}