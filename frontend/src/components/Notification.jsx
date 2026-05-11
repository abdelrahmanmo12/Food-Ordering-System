import { useEffect, useState } from 'react'

export default function Notification({ message, type = 'info', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false)
        setTimeout(onClose, 300) // Allow fade out animation
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const getColor = () => {
    switch (type) {
      case 'success': return 'var(--green)'
      case 'error': return 'var(--red)'
      case 'warning': return 'var(--amber)'
      default: return 'var(--blue)'
    }
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      background: 'var(--bg2)',
      border: `2px solid ${getColor()}`,
      borderRadius: 'var(--radius-lg)',
      padding: '16px 20px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      zIndex: 1000,
      maxWidth: 400,
      animation: visible ? 'slideInRight 0.3s ease' : 'slideOutRight 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }}>
      <span style={{ fontSize: 20 }}>{getIcon()}</span>
      <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500, flex: 1 }}>
        {message}
      </span>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(onClose, 300)
        }}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text3)',
          cursor: 'pointer',
          fontSize: 16,
          padding: 0,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        ×
      </button>
    </div>
  )
}