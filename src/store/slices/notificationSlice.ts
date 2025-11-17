import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  timestamp: number
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.notifications.unshift(notification)
      state.unreadCount += 1
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    
    markAsRead: (state) => {
      state.unreadCount = 0
    },
    
    showSuccess: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: action.payload,
        type: 'success',
        timestamp: Date.now(),
      }
      state.notifications.unshift(notification)
    },
    
    showError: (state, action: PayloadAction<string>) => {
      const notification: Notification = {
        id: Date.now().toString(),
        message: action.payload,
        type: 'error',
        timestamp: Date.now(),
      }
      state.notifications.unshift(notification)
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markAsRead,
  showSuccess,
  showError,
} = notificationSlice.actions

export default notificationSlice.reducer