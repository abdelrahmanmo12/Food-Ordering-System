// pages/Checkout.jsx
//
// Payment flow for NEW orders (from cart):
//
//   CASH / BANK / MANUAL methods:
//     1. Fill delivery details → click "Place order"
//     2. POST /api/orders (via placeOrder in AppContext)
//     3. POST /api/payments  (record pending payment)
//     4. Navigate to /payment-success
//
//   CARD / WALLET / PAYPAL (Stripe):
//     1. Fill delivery details → click "Continue to payment"
//     2. Select Stripe method → click "Create Order & Pay"
//     3. POST /api/orders (via placeOrderOnly — no navigate)
//     4. OrderPaymentModal handles:
//          POST /api/payments/create-payment-intent
//          stripe.confirmCardPayment(clientSecret)
//          POST /api/payments/confirm
//     5. Navigate to /payment-success

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import OrderPaymentModal from '../components/OrderPaymentModal';

// ─── Payment methods ──────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { key: 'CASH_ON_DELIVERY', label: 'Cash on delivery',  desc: 'Pay when your order arrives',        icon: '💵', isStripe: false },
  { key: 'CREDIT_CARD',      label: 'Credit card',       desc: 'Visa, Mastercard, Amex via Stripe',  icon: '💳', isStripe: true  },
  { key: 'DEBIT_CARD',       label: 'Debit card',        desc: 'Direct from your bank via Stripe',   icon: '🏧', isStripe: true  },
  { key: 'DIGITAL_WALLET',   label: 'Digital wallet',    desc: 'Apple Pay, Google Pay via Stripe',   icon: '📱', isStripe: true  },
  { key: 'PAYPAL',           label: 'PayPal',            desc: 'Pay with your PayPal account',       icon: '🅿️', isStripe: true  },
  { key: 'BANK_TRANSFER',    label: 'Bank transfer',     desc: 'Direct bank transfer',               icon: '🏦', isStripe: false },
];

const isStripeMethod = (key) => PAYMENT_METHODS.find(p => p.key === key)?.isStripe ?? false;

// ─── Small reusable components ────────────────────────────────────────────────

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
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>
                {pm.label}
                {pm.isStripe && (
                  <span style={{
                    marginLeft: 8, fontSize: 11, fontWeight: 600,
                    background: '#635bff', color: '#fff',
                    padding: '2px 7px', borderRadius: 4, verticalAlign: 'middle',
                  }}>
                    Stripe
                  </span>
                )}
              </div>
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
        {cart.map((item, i) => {
          const quantity = item.qty || item.quantity || 1;
          return (
            <div key={item.id ?? i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#374151' }}>
              <span><span style={{ fontWeight: 600 }}>{quantity}×</span> {item.name}</span>
              <span style={{ fontWeight: 500 }}>{(item.price * quantity).toFixed(2)} EGP</span>
            </div>
          );
        })}
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

// ─── Main Checkout ────────────────────────────────────────────────────────────

export default function Checkout() {
  const { user, placeOrder, placeOrderOnly, showToast } = useApp();
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // Support "pay existing order" flow from Orders page
  const existingOrder       = location.state?.orderId     ?? null;
  const existingOrderAmount = location.state?.amount      ?? 0;
  const existingOrderItems  = location.state?.items       ?? [];

  // Determine the working cart + total
  const finalCart      = cart.length > 0 ? cart : existingOrderItems;
  const finalCartTotal = cart.length > 0 ? cartTotal : (existingOrderAmount || 0);

  const [form,          setForm]          = useState({ address: '', phone: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [loading,       setLoading]       = useState(false);

  // step: 'details' | 'payment' | 'stripe'
  // 'stripe' = order created, waiting for Stripe card form
  const [step,    setStep]    = useState(existingOrder ? 'stripe' : 'details');
  const [orderId, setOrderId] = useState(existingOrder ?? null); // set once order is created

  // Guard: must be logged in
  if (!user) { navigate('/auth'); return null; }

  // Guard: must have items (unless coming from an existing order)
  if (!finalCart.length && !existingOrder) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
        <div style={{ fontWeight: 700, color: '#111827', fontSize: 18 }}>Your cart is empty</div>
        <button onClick={() => navigate('/')} style={{
          marginTop: 16, padding: '10px 24px', borderRadius: 10,
          background: '#f97316', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
        }}>Browse restaurants</button>
      </div>
    );
  }

  // ── Step bar ──────────────────────────────────────────────────────────────
  const stepBar = !existingOrder && (
    <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
      {[{ key: 'details', label: '1  Delivery details' }, { key: 'payment', label: '2  Payment' }].map(({ key, label }) => (
        <button key={key} onClick={() => step !== 'stripe' && key === 'details' && setStep('details')} style={{
          flex: 1, padding: '10px 16px', borderRadius: 9, border: 'none', cursor: 'pointer',
          fontWeight: 600, fontSize: 14, transition: 'all 0.15s',
          background: (step === key || (step === 'stripe' && key === 'payment')) ? '#fff' : 'transparent',
          color: (step === key || (step === 'stripe' && key === 'payment')) ? '#f97316' : '#6b7280',
          boxShadow: (step === key || (step === 'stripe' && key === 'payment')) ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
        }}>{label}</button>
      ))}
    </div>
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  // Step 1 → Step 2: validate delivery details
  const goToPayment = () => {
    if (!form.address.trim()) { showToast('Please enter a delivery address', 'error'); return; }
    setStep('payment');
  };

  // Manual/offline payment (Cash, Bank Transfer)
  const handleManualSubmit = async () => {
    setLoading(true);
    try {
      const newOrder = await placeOrder(finalCart, finalCartTotal, {
        address: form.address,
        phone:   form.phone,
        notes:   form.notes,
      });

      if (newOrder?.id) {
        // Record offline payment
        try {
          await api.post('/api/payments', {
            orderId:       String(newOrder.id),
            userId:        user.id,
            amount:        finalCartTotal,
            paymentMethod: paymentMethod,
            description:   `Order #${String(newOrder.id).slice(-6).toUpperCase()}`,
          });
        } catch (payErr) {
          console.warn('Payment record failed (non-critical):', payErr);
        }

        clearCart();
        navigate('/payment-success', {
          state: { orderId: newOrder.id, total: finalCartTotal, paymentMethod },
        });
      }
    } catch {
      // placeOrder already shows toast
    } finally {
      setLoading(false);
    }
  };

  // Stripe: create order first, then show Stripe card form
  const handleCreateOrderForStripe = async () => {
    if (!form.address.trim()) { showToast('Please enter a delivery address', 'error'); return; }
    setLoading(true);
    try {
      const newOrder = await placeOrderOnly(
        finalCart, finalCartTotal,
        { address: form.address, phone: form.phone, notes: form.notes },
        paymentMethod
      );

      if (!newOrder?.id) {
        showToast('Failed to create order. Please try again.', 'error');
        return;
      }

      setOrderId(String(newOrder.id));
      setStep('stripe'); // show Stripe modal
    } catch (err) {
      showToast(err?.message || 'Failed to create order.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Called by OrderPaymentModal on success
  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/payment-success', {
      state: { orderId, total: finalCartTotal, paymentMethod },
    });
  };

  // Called by OrderPaymentModal on cancel
  const handlePaymentClose = () => {
    // Order already created — go back to payment method step so user can retry
    // (the order stays PLACED in the backend; they can pay from Orders page)
    setStep('payment');
    showToast('Payment cancelled. You can retry from the Orders page.', 'error');
    clearCart();
    navigate('/orders');
  };

  // ── Stripe modal (full screen) ────────────────────────────────────────────
  if (step === 'stripe' && orderId) {
    return (
      <OrderPaymentModal
        order={{
          id:          orderId,
          orderId:     orderId,
          totalAmount: finalCartTotal,
          restaurantName: finalCart[0]?.restaurantName,
        }}
        onClose={handlePaymentClose}
        onSuccess={handlePaymentSuccess}
        onError={(err) => {
          console.error('Stripe payment error:', err);
          showToast('Payment failed. Please try again.', 'error');
        }}
      />
    );
  }

  // ── Main checkout UI ──────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '28px 16px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{
        maxWidth: 880, margin: '0 auto',
        display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px',
        gap: 24, alignItems: 'start',
      }}>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={() => navigate(-1)} style={{
            alignSelf: 'flex-start', background: 'none', border: 'none',
            cursor: 'pointer', color: '#6b7280', fontWeight: 600, fontSize: 14, padding: 0,
          }}>← Back</button>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0 }}>Checkout</h1>

          {stepBar}

          {}
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

          {}
          {step === 'payment' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid #f3f4f6', padding: '24px 22px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>💳 Choose payment method</div>

              <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />

              {}
              {isStripeMethod(paymentMethod) && (
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: 10,
                  background: '#f5f4ff', border: '1px solid #c7d2fe',
                  fontSize: 13, color: '#4338ca', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  🔒 <span>Your card is processed securely by <strong>Stripe</strong> — we never see your card details.</span>
                </div>
              )}

              {}
              {isStripeMethod(paymentMethod) ? (
                // Stripe flow: create order then open modal
                <button
                  onClick={handleCreateOrderForStripe}
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
                  {loading ? 'Creating order…' : `Pay with card · ${finalCartTotal.toFixed(2)} EGP`}
                </button>
              ) : (
                // Manual flow: place order + record payment
                <button
                  onClick={handleManualSubmit}
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
                  {loading ? 'Placing your order…' : `Place order · ${finalCartTotal.toFixed(2)} EGP`}
                </button>
              )}

              <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
                🔒 Your details are secure
              </div>
            </div>
          )}
        </div>

        {}
        <Summary cart={finalCart} cartTotal={finalCartTotal} paymentMethod={paymentMethod} />
      </div>
    </div>
  );
}