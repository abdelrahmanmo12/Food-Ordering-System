import { createContext, useContext, useState } from 'react'
import Notification from '../components/Notification'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setNotifications(prev => [...prev, { id, message, type, duration }])
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const showSuccess = (message, duration) => addNotification(message, 'success', duration)
  const showError = (message, duration) => addNotification(message, 'error', duration)
  const showWarning = (message, duration) => addNotification(message, 'warning', duration)
  const showInfo = (message, duration) => addNotification(message, 'info', duration)

  return (
    <NotificationContext.Provider value={{
      showSuccess,
      showError,
      showWarning,
      showInfo,
      addNotification
    }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}