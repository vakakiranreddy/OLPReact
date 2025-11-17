import React from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { removeNotification } from '../store/slices/notificationSlice'
import { TOAST_CONFIG } from '../common'

const ToastNotification: React.FC = () => {
  const { notifications } = useSelector((state: RootState) => state.notifications)
  const dispatch = useDispatch()

  const handleClose = (id: string) => {
    dispatch(removeNotification(id))
  }

  const getToastVariant = (type: string) => {
    return TOAST_CONFIG.VARIANTS[type as keyof typeof TOAST_CONFIG.VARIANTS] || 'primary'
  }

  const getToastIcon = (type: string) => {
    return TOAST_CONFIG.ICONS[type as keyof typeof TOAST_CONFIG.ICONS] || '•'
  }

  return (
    <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', top: '70px', right: '15px', zIndex: 9999 }}>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          show={true}
          onClose={() => handleClose(notification.id)}
          delay={TOAST_CONFIG.DELAY}
          autohide
          bg={getToastVariant(notification.type)}
        >
          <Toast.Header>
            <span className="me-2">{getToastIcon(notification.type)}</span>
            <strong className="me-auto">
              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </strong>
            <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
          </Toast.Header>
          <Toast.Body className={notification.type === 'success' || notification.type === 'error' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  )
}

export default ToastNotification