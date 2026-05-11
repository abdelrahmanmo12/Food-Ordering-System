// components/OrderPaymentModal.jsx
//
// Stripe payment modal used in two places:
//   1. Orders page  — "Pay Now" on an existing PLACED order
//   2. Checkout.jsx — after order is created for card payments
//
// Flow:
//   Step 1: POST /api/payments/create-payment-intent → { clientSecret, paymentIntentId }
//   Step 2: stripe.confirmCardPayment(clientSecret)  → Stripe handles card
//   Step 3: POST /api/payments/confirm               → mark COMPLETED in DB
//   Step 4: onSuccess(paymentIntent) called          → parent navigates

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../api/client';

// ─── Stripe publishable key ───────────────────────────────────────────────────
// Move to VITE_STRIPE_PUBLISHABLE_KEY env var for production.
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51TNkmZLaPu9ajsblOXkmm0uFNncVcq0FktYW0TLa7iTlgPmbS5nnK0LNTaAy4rHNOGeD6p3zCjGYS34RwcevFf8m00QQQa5hQE'
);

// ─── Card element styles ──────────────────────────────────────────────────────
const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: "'DM Sans', sans-serif",
      color: '#111827',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
  },
};

// ─── Inner form (must be a child of <Elements>) ───────────────────────────────
function PaymentForm({ order, onClose, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Resolve order id and amount robustly
  const orderId = order.orderId ?? order.id;
  const orderAmount = order.totalAmount ?? order.total ?? order.totalPrice ?? 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!orderId) {
      setError('Invalid order: missing ID.');
      return;
    }
    if (orderAmount <= 0) {
      setError('Invalid order: amount must be greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── Step 1: create PaymentIntent on backend ──────────────────────────
      // Backend expects amount in CENTS, currency, orderId
      const intentData = await api.post('/api/payments/create-payment-intent', {
        amount: Math.round(orderAmount * 100), // dollars → cents
        currency: 'usd',
        orderId: String(orderId),
      });

      // api.post returns data directly (not response.data)
      const { clientSecret, paymentIntentId } = intentData;

      if (!clientSecret) {
        throw new Error('No client secret received from server.');
      }

      // ── Step 2: confirm card payment with Stripe.js ──────────────────────
      const cardElement = elements.getElement(CardElement);
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: { card: cardElement } }
      );

      if (stripeError) {
        // Stripe declined / 3DS failed / etc.
        setError(stripeError.message);
        onError(stripeError);
        return;
      }

      if (paymentIntent.status !== 'succeeded') {
        const msg = `Unexpected payment status: ${paymentIntent.status}`;
        setError(msg);
        onError(new Error(msg));
        return;
      }

      // ── Step 3: confirm on backend (mark COMPLETED) ──────────────────────
      await api.post('/api/payments/confirm', {
        paymentIntentId,
        orderId: String(orderId),
        status: 'COMPLETED',
      });

      // ── Step 4: tell parent it succeeded ────────────────────────────────
      onSuccess(paymentIntent);
    } catch (err) {
      const msg = err?.message || 'Payment failed. Please try again.';
      setError(msg);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 20,
        padding: '36px 32px', width: '100%', maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>

        { }
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
            Complete payment
          </h2>
          <div style={{ fontSize: 14, color: '#6b7280' }}>
            {order.restaurantName
              ? `Order from ${order.restaurantName}`
              : `Order #${String(orderId).slice(-6).toUpperCase()}`}
          </div>
        </div>

        { }
        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa',
          borderRadius: 12, padding: '16px 20px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, color: '#92400e', fontWeight: 600 }}>Total due</span>
          <span style={{ fontSize: 24, fontWeight: 800, color: '#f97316' }}>
            ${orderAmount.toFixed(2)}
          </span>
        </div>

        { }
        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block', fontSize: 13, fontWeight: 600,
            color: '#374151', marginBottom: 8,
          }}>
            Card details
          </label>
          <div style={{
            border: '1.5px solid #e5e7eb', borderRadius: 10,
            padding: '14px 16px', background: '#f9fafb',
            marginBottom: 20, transition: 'border-color 0.15s',
          }}>
            <CardElement options={CARD_OPTIONS} />
          </div>

          { }
          {error && (
            <div style={{
              color: '#dc2626', fontSize: 13, marginBottom: 16,
              padding: '10px 14px', background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          { }
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1, padding: '13px 0', borderRadius: 10,
                border: '1.5px solid #e5e7eb', background: '#fff',
                color: '#374151', fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!stripe || loading}
              style={{
                flex: 2, padding: '13px 0', borderRadius: 10,
                border: 'none',
                background: (!stripe || loading) ? '#fdba74' : '#f97316',
                color: '#fff', fontSize: 15, fontWeight: 700,
                cursor: (!stripe || loading) ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(249,115,22,0.35)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.8s linear infinite',
                  }} />
                  Processing…
                </>
              ) : (
                `Pay $${orderAmount.toFixed(2)}`
              )}
            </button>
          </div>
        </form>

        { }
        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
          🔒 Secured by Stripe — your card details never touch our servers
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Public wrapper (adds Stripe Elements context) ────────────────────────────
export default function OrderPaymentModal({ order, onClose, onSuccess, onError }) {
  if (!order) return null;

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        order={order}
        onClose={onClose}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
