import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from '../../types'

// Define the shape of our auth state

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Initial state
const initialState: AuthState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
}

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action: Start login process
    loginStart: (state) => {
      state.loading = true
      state.error = null
    },
    
    // Action: Login successful
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.token = action.payload.token
      state.error = null
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    
    // Action: Login failed
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.isAuthenticated = false
      state.user = null
      state.token = null
      state.error = action.payload
    },
    
    // Action: Logout
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    
    // Action: Clear error
    clearError: (state) => {
      state.error = null
    },
    
    // Action: Update user data
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
  },
})

// Export actions
export const { loginStart, loginSuccess, loginFailure, logout, clearError, updateUser } = authSlice.actions

// Export reducer
export default authSlice.reducer