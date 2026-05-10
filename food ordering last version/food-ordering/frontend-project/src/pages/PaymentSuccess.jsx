// pages/PaymentSuccess.jsx
// Shown after a successful order + payment.
// Receives state: { orderId, total, paymentMethod }
//
// Route: /payment-success
// Add to App.js:
//   import PaymentSuccess from './pages/PaymentSuccess';
//   <Route path="/payment-success" element={<PaymentSuccess />} />

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const METHOD_LABELS = {
  CASH_ON_DELIVERY: { label: 'Cash on delivery', icon: '💵', note: 'Have cash ready when your driver arrives.' },
  CREDIT_CARD:      { label: 'Credit card',       icon: '💳', note: 'Your card will be charged shortly.' },
  DEBIT_CARD:       { label: 'Debit card',        icon: '🏧', note: 'Payment will be deducted from your account.' },
  DIGITAL_WALLET:   { label: 'Digital wallet',    icon: '📱', note: 'Payment processed via your digital wallet.' },
  PAYPAL:           { label: 'PayPal',            icon: '🅿️', note: 'Payment processed via PayPal.' },
  BANK_TRANSFER:    { label: 'Bank transfer',     icon: '🏦', note: 'Complete the bank transfer to confirm your order.' },
};

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { orderId, total, paymentMethod } = location.state ?? {};

  const pm = METHOD_LABELS[paymentMethod] ?? METHOD_LABELS['CASH_ON_DELIVERY'];

  // Auto-redirect to tracking after 6 seconds
  const timerRef = useRef(null);
  useEffect(() => {
    if (!orderId) return;
    timerRef.current = setTimeout(() => {
      navigate(`/tracking/${orderId}`);
    }, 6000);
    return () => clearTimeout(timerRef.current);
  }, [orderId, navigate]);

  if (!orderId) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
        <div style={{ fontWeight: 700, color: '#111827', fontSize: 18 }}>Nothing to show here</div>
        <button onClick={() => navigate('/')} style={{
          marginTop: 16, padding: '10px 24px', borderRadius: 10,
          background: '#f97316', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
        }}>Go home</button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f9fafb', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        maxWidth: 460, width: '100%',
        background: '#fff', borderRadius: 20,
        border: '1.5px solid #f3f4f6',
        boxShadow: '0 8px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {/* Success banner */}
        <div style={{
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          padding: '36px 32px', textAlign: 'center', color: '#fff',
        }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Order confirmed!</div>
          <div style={{ fontSize: 15, opacity: 0.85 }}>
            Your food is on its way
          </div>
        </div>

        {/* Details */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Order ID */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', background: '#f9fafb', borderRadius: 10,
          }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>ORDER ID</span>
            <span style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>
              #{String(orderId).slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Total */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 16px', background: '#f9fafb', borderRadius: 10,
          }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>TOTAL PAID</span>
            <span style={{ fontWeight: 800, color: '#f97316', fontSize: 18 }}>
              {total?.toFixed(2)} EGP
            </span>
          </div>

          {/* Payment method */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', background: '#fff7ed',
            borderRadius: 10, border: '1px solid #fed7aa',
          }}>
            <span style={{ fontSize: 24 }}>{pm.icon}</span>
            <div>
              <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{pm.label}</div>
              <div style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>{pm.note}</div>
            </div>
          </div>

          {/* Auto-redirect note */}
          <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
            Redirecting to live tracking in a few seconds…
          </div>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            <button
              onClick={() => navigate(`/tracking/${orderId}`)}
              style={{
                padding: '13px 24px', borderRadius: 12, border: 'none',
                background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 16,
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
              }}
            >
              Track my order →
            </button>
            <button
              onClick={() => navigate('/orders')}
              style={{
                padding: '11px 24px', borderRadius: 12,
                border: '1.5px solid #e5e7eb', background: '#fff',
                color: '#374151', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              }}
            >
              View all orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}