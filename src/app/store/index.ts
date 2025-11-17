import { configureStore } from '@reduxjs/toolkit'
import authSlice from './slices/authSlice'
import applicationSlice from './slices/applicationSlice'
import documentSlice from './slices/documentSlice'
import notificationSlice from './slices/notificationSlice'
import uiSlice from './slices/uiSlice'

// Configure the Redux store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    applications: applicationSlice,
    documents: documentSlice,
    notifications: notificationSlice,
    ui: uiSlice,
  },
})

// TypeScript types for the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch