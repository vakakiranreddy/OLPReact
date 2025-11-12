import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    // We'll add more slices here later
    // applications: applicationSlice,
    // notifications: notificationSlice,
  },
})

// TypeScript types for the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch