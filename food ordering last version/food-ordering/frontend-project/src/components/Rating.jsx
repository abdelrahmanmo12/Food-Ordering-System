import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useNotification } from '../context/NotificationContext'
import { submitRating, getUserRatings } from '../api/ratings'
import Btn from './Button'
import Badge from './Badge'

export default function Rating({ orderId, restaurantId, restaurantName, onRatingSubmitted }) {
  const { user, orders } = useApp()
  const { showError, showSuccess } = useNotification()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [ratingType, setRatingType] = useState('food') // 'food' or 'delivery'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [existingRating, setExistingRating] = useState(null)

  // Check if user has purchased from this restaurant and has delivered order
  useEffect(() => {
    if (!user || !orders.length) {
      setHasPurchased(false)
      return
    }

    // Find delivered orders for this restaurant
    const deliveredOrder = orders.find(o => 
      o.id === orderId && 
      o.restaurantId === restaurantId && 
      o.status === 'delivered'
    )

    setHasPurchased(!!deliveredOrder)

    // Check if user has already rated this order
    if (deliveredOrder) {
      const savedRatings = getUserRatings(user.email)
      const userRating = savedRatings.find(r => 
        r.orderId === orderId && r.type === ratingType
      )
      
      if (userRating) {
        setHasRated(true)
        setExistingRating(userRating)
        setRating(userRating.rating)
        setComment(userRating.comment || '')
      }
    }
  }, [user, orders, orderId, restaurantId, ratingType])

  const canRate = user && hasPurchased && !hasRated

  const handleSubmitRating = async () => {
    if (!user) {
      showError('Please sign in to rate')
      return
    }

    if (!hasPurchased) {
      showError('You can only rate orders you have purchased')
      return
    }

    if (rating === 0) {
      showError('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const ratingData = {
        id: `rating_${Date.now()}`,
        orderId,
        restaurantId,
        userId: user.email,
        userName: user.name,
        rating,
        comment,
        type: ratingType, // 'food' or 'delivery'
        createdAt: new Date().toISOString()
      }

      await submitRating(ratingData)
      
      setHasRated(true)
      setExistingRating(ratingData)
      
      if (onRatingSubmitted) {
        onRatingSubmitted(ratingData)
      }

      showSuccess(`Thank you for your ${ratingType} rating! ⭐`)
      
      // Reset form
      setRating(0)
      setComment('')
    } catch (error) {
      showError(error.message || 'Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Star rating component
  const StarRating = ({ value, onChange, size = 'md' }) => {
    const starSize = size === 'sm' ? 20 : size === 'lg' ? 36 : 28
    const stars = [1, 2, 3, 4, 5]

    return (
      <div style={{ display: 'flex', gap: 4 }}>
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={!canRate}
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: canRate ? 'pointer' : 'default',
              padding: 0,
              opacity: canRate ? 1 : 0.5,
              transition: 'transform 0.2s'
            }}
          >
            <span
              style={{
                fontSize: starSize,
                color: star <= (hoveredRating || value) ? '#f5a623' : '#e0e0e0',
                transition: 'color 0.2s'
              }}
            >
              ★
            </span>
          </button>
        ))}
      </div>
    )
  }

  // If already rated, show existing rating
  if (hasRated && existingRating) {
    return (
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginTop: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Badge color="#4caf7d">
            {ratingType === 'food' ? '🍽️ Food Rated' : '🚴 Delivery Rated'}
          </Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StarRating value={existingRating.rating} size="sm" />
          <span style={{ fontSize: 14, color: 'var(--text2)' }}>
            {existingRating.rating}/5
          </span>
        </div>
        {existingRating.comment && (
          <p style={{ fontSize: 14, color: 'var(--text2)', marginTop: 8, fontStyle: 'italic' }}>
            "{existingRating.comment}"
          </p>
        )}
        <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
          Rated on {new Date(existingRating.createdAt).toLocaleDateString()}
        </p>
      </div>
    )
  }

  // If not authenticated
  if (!user) {
    return (
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginTop: '16px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🔐</span>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
          Sign in to rate this {ratingType === 'food' ? 'restaurant' : 'delivery'}
        </p>
      </div>
    )
  }

  // If hasn't purchased
  if (!hasPurchased) {
    return (
      <div style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px 24px',
        marginTop: '16px',
        textAlign: 'center'
      }}>
        <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>📦</span>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
          You can only rate after your order has been delivered
        </p>
      </div>
    )
  }

  // Rating form for authenticated users who have purchased
  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      marginTop: '16px',
      animation: 'fadeUp 0.4s ease'
    }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 }}>
        Rate your experience
      </h3>

      {/* Rating type selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setRatingType('food')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 'var(--radius)',
            border: `2px solid ${ratingType === 'food' ? 'var(--amber)' : 'var(--border)'}`,
            background: ratingType === 'food' ? 'var(--amber)' : 'transparent',
            color: ratingType === 'food' ? '#1a1200' : 'var(--text)',
            cursor: 'pointer',
            fontWeight: ratingType === 'food' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          🍽️ Food Quality
        </button>
        <button
          type="button"
          onClick={() => setRatingType('delivery')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: 'var(--radius)',
            border: `2px solid ${ratingType === 'delivery' ? 'var(--amber)' : 'var(--border)'}`,
            background: ratingType === 'delivery' ? 'var(--amber)' : 'transparent',
            color: ratingType === 'delivery' ? '#1a1200' : 'var(--text)',
            cursor: 'pointer',
            fontWeight: ratingType === 'delivery' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          🚴 Delivery Service
        </button>
      </div>

      {/* Star rating */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 14, color: 'var(--text2)', display: 'block', marginBottom: 8 }}>
          Your rating:
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
            {rating === 5 ? 'Excellent! ⭐' :
             rating === 4 ? 'Great! 👍' :
             rating === 3 ? 'Good 👌' :
             rating === 2 ? 'Fair 😐' : 'Poor 😞'}
          </p>
        )}
      </div>

      {/* Comment textarea */}
      <div style={{ marginBottom: 20 }}>
        <label 
          htmlFor={`comment-${orderId}`} 
          style={{ fontSize: 14, color: 'var(--text2)', display: 'block', marginBottom: 8 }}
        >
          Additional comments (optional):
        </label>
        <textarea
          id={`comment-${orderId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={ratingType === 'food' 
            ? 'Tell us about the food quality, taste, presentation...' 
            : 'Tell us about the delivery experience, rider behavior...'}
          rows={3}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            background: 'var(--bg3)',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--amber)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
        />
      </div>

      {/* Submit button */}
      <Btn
        onClick={handleSubmitRating}
        disabled={isSubmitting || rating === 0}
        size="md"
        style={{
          width: '100%',
          opacity: isSubmitting || rating === 0 ? 0.6 : 1
        }}
      >
        {isSubmitting ? 'Submitting...' : `Submit ${ratingType === 'food' ? 'Food' : 'Delivery'} Rating`}
      </Btn>

      <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 12, textAlign: 'center' }}>
        ✓ Verified purchase required • One rating per order
      </p>
    </div>
  )
}