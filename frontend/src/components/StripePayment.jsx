import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../api/client';

const stripePromise = loadStripe('pk_test_51TNkmnPturEXMFMX7uM1DErDimjl5cDNwn4I770EgsnYeI2l5TsWHApMlKITexMdalECB8YYpPCJNjFtZExUo0R000usoN83lD');

function StripePaymentForm({ amount, orderId, onSuccess, onError, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      if (!orderId) {
        throw new Error('Order ID is required for payment');
      }

      const response = await api.post('/api/payments/create-payment-intent', {
        amount: Math.round(amount * 100),
        currency: 'usd',
        orderId: orderId,
      });

      const { clientSecret, paymentIntentId } = response.data;

      const cardElement = elements.getElement(CardElement);
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
          },
        },
      });

      if (paymentError) {
        setError(paymentError.message);
        onError(paymentError);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess({
          ...paymentIntent,
          paymentIntentId: paymentIntentId,
          orderId: orderId
        });
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'block', 
          marginBottom: '8px', 
          fontSize: '14px', 
          fontWeight: '600',
          color: '#374151'
        }}>
          Card Details
        </label>
        <div style={{
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '12px',
          backgroundColor: '#f9fafb'
        }}>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div style={{
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 24px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: '#fff',
            color: '#374151',
            fontSize: '16px',
            fontWeight: '500',
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
            flex: 2,
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: loading ? '#9ca3af' : '#f97316',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: (!stripe || loading) ? 'not-allowed' : 'pointer',
            opacity: (!stripe || loading) ? 0.5 : 1,
          }}
        >
          {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

export default function StripePayment({ amount, orderId, onSuccess, onError, onCancel }) {
  return (
    <Elements stripe={stripePromise}>
      <StripePaymentForm 
        amount={amount}
        orderId={orderId}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
}
