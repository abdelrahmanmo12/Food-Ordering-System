// pages/Checkout.jsx
//
// Flow:
//   1. User fills delivery details + picks payment method
//   2. handleSubmit → POST /orders  (via placeOrder in AppContext)
//   3.             → POST /api/payments  (with the new orderId)
//   4. Navigate to /payment-success
//
// Endpoints:
//   POST /orders          → create order (via AppContext.placeOrder)
//   POST /api/payments    → create payment record
//
// Route: /checkout
// Navigate here from cart:  navigate('/checkout', { state: { cart, cartTotal } })

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: 'CASH_ON_DELIVERY', label: 'Cash on delivery',  desc: 'Pay when your order arrives',        icon: '💵' },
  { key: 'CREDIT_CARD',      label: 'Credit card',       desc: 'Visa, Mastercard, Amex',             icon: '💳' },
  { key: 'DEBIT_CARD',       label: 'Debit card',        desc: 'Direct from your bank account',      icon: '🏧' },
  { key: 'DIGITAL_WALLET',   label: 'Digital wallet',    desc: 'Apple Pay, Google Pay, Fawry',       icon: '📱' },
  { key: 'PAYPAL',           label: 'PayPal',            desc: 'Pay with your PayPal account',       icon: '🅿️' },
  { key: 'BANK_TRANSFER',    label: 'Bank transfer',     desc: 'Direct bank transfer',               icon: '🏦' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
        {label} {required && <span style={{ color: '#f97316' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = 'text', as: As = 'input', rows }) {
  const shared = {
    value, onChange, placeholder,
    style: {
      padding: '11px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb',
      fontSize: 15, outline: 'none', background: '#fff', color: '#111827',
      width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
      resize: 'vertical', transition: 'border-color 0.15s',
    },
    onFocus: e => { e.target.style.borderColor = '#f97316'; },
    onBlur:  e => { e.target.style.borderColor = '#e5e7eb'; },
  };
  if (As === 'textarea') return <textarea rows={rows ?? 3} {...shared} />;
  return <input type={type} {...shared} />;
}

// ─── Payment method picker ────────────────────────────────────────────────────

function PaymentSelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {PAYMENT_METHODS.map(pm => {
        const active = selected === pm.key;
        return (
          <div
            key={pm.key}
            onClick={() => onSelect(pm.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 16px', borderRadius: 12, cursor: 'pointer',
              border: `1.5px solid ${active ? '#f97316' : '#e5e7eb'}`,
              background: active ? '#fff7ed' : '#fff',
              transition: 'all 0.15s', userSelect: 'none',
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{pm.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{pm.label}</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 1 }}>{pm.desc}</div>
            </div>
            <div style={{
              width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${active ? '#f97316' : '#d1d5db'}`,
              background: active ? '#f97316' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}>
              {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Order summary sidebar ────────────────────────────────────────────────────

function Summary({ cart, cartTotal, paymentMethod }) {
  const pm = PAYMENT_METHODS.find(p => p.key === paymentMethod);
  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6',
      padding: '22px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      position: 'sticky', top: 24,
    }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 16 }}>Order summary</div>

      {cart[0]?.restaurantName && (
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
          🏪 {cart[0].restaurantName}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {cart.map((item, i) => (
          <div key={item.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
            <span><span style={{ fontWeight: 600 }}>{item.quantity}×</span> {item.name}</span>
            <span style={{ fontWeight: 500 }}>{(item.price * item.quantity).toFixed(2)} EGP</span>
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        paddingTop: 12, borderTop: '1.5px solid #f3f4f6',
        fontWeight: 700, fontSize: 17, color: '#111827',
      }}>
        <span>Total</span>
        <span style={{ color: '#f97316' }}>{cartTotal.toFixed(2)} EGP</span>
      </div>

      {pm && (
        <div style={{
          marginTop: 14, padding: '10px 12px', borderRadius: 10,
          background: '#f9fafb', fontSize: 13, color: '#6b7280',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>{pm.icon}</span>
          <span>Paying via <strong style={{ color: '#374151' }}>{pm.label}</strong></span>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Checkout() {
  const { user, placeOrder, showToast } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();

  const { cart = [], cartTotal = 0 } = location.state ?? {};

  const [form,          setForm]          = useState({ address: '', phone: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [loading,       setLoading]       = useState(false);
  const [step,          setStep]          = useState('details'); // 'details' | 'payment'

  if (!user)            { navigate('/auth'); return null; }
  if (!cart.length) return (
    <div style={{ textAlign: 'center', padding: '80px 16px' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
      <div style={{ fontWeight: 700, color: '#111827', fontSize: 18 }}>Your cart is empty</div>
      <button onClick={() => navigate('/')} style={{
        marginTop: 16, padding: '10px 24px', borderRadius: 10,
        background: '#f97316', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
      }}>Browse restaurants</button>
    </div>
  );

  const goToPayment = () => {
    if (!form.address.trim()) { showToast('Please enter a delivery address', 'error'); return; }
    setStep('payment');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1 — Create order
      const newOrder = await placeOrder(cart, cartTotal, {
        address: form.address,
        phone:   form.phone,
        notes:   form.notes,
      });

      if (newOrder?.id) {
        // 2 — Create payment record
        // PaymentRequest: { orderId, userId, amount, paymentMethod, description }
        try {
          await api.post('/api/payments', {
            orderId:       String(newOrder.id),
            userId:        user.id,
            amount:        cartTotal,
            paymentMethod: paymentMethod,
            description:   `Order #${String(newOrder.id).slice(-6).toUpperCase()} — ${cart[0]?.restaurantName ?? 'Food order'}`,
          });
        } catch (err) {
          console.error('Payment record failed:', err);
          showToast('Order placed, but payment record failed — contact support if charged.', 'error');
        }

        // 3 — Navigate to success
        navigate('/payment-success', {
          state: { orderId: newOrder.id, total: cartTotal, paymentMethod },
        });
      }
    } catch {
      // placeOrder already shows the toast
    } finally {
      setLoading(false);
    }
  };

  const stepBar = (
    <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
      {[{ key: 'details', label: '1  Delivery details' }, { key: 'payment', label: '2  Payment' }].map(({ key, label }) => (
        <button key={key} onClick={() => key === 'details' && setStep('details')} style={{
          flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
          fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
          background: step === key ? '#fff' : 'transparent',
          color: step === key ? '#f97316' : '#6b7280',
          boxShadow: step === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}>{label}</button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '28px 16px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{
        maxWidth: 880, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px',
        gap: 24, alignItems: 'start',
      }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            alignSelf: 'flex-start', background: 'none', border: 'none',
            cursor: 'pointer', color: '#6b7280', fontWeight: 600, fontSize: 14, padding: 0,
          }}>← Back</button>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Checkout</h1>

          {stepBar}

          {/* Step 1 — Delivery */}
          {step === 'details' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6', padding: '24px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>📍 Delivery details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Delivery address" required>
                  <StyledInput value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street, area, building number…" />
                </Field>
                <Field label="Phone number">
                  <StyledInput type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+20 1XX XXX XXXX" />
                </Field>
                <Field label="Special instructions">
                  <StyledInput as="textarea" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Leave at door, ring bell, etc." />
                </Field>
              </div>
              <button onClick={goToPayment} style={{
                marginTop: 22, width: '100%', padding: '13px 24px', borderRadius: 12,
                border: 'none', background: '#f97316', color: '#fff',
                fontWeight: 700, fontSize: 16, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(249,115,22,0.3)',
              }}>Continue to payment →</button>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 'payment' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6', padding: '24px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>💳 Choose payment method</div>
              <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  marginTop: 22, width: '100%', padding: '15px 24px', borderRadius: 12,
                  border: 'none', background: loading ? '#fdba74' : '#f97316',
                  color: '#fff', fontWeight: 700, fontSize: 17,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 14px rgba(249,115,22,0.35)',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? 'Placing your order…' : `Place order · ${cartTotal.toFixed(2)} EGP`}
              </button>
              <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                🔒 Your details are secure
              </div>
            </div>
          )}
        </div>

        {/* Right — summary */}
        <Summary cart={cart} cartTotal={cartTotal} paymentMethod={paymentMethod} />
      </div>
    </div>
  );
}