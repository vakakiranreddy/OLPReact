import axios from 'axios'
import { store } from '../app/store'
import { logout } from '../app/store/slices/authSlice'

// API Base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7204/api'
console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 for authenticated requests (requests with Authorization header)
    // Don't handle 401 for login attempts (which don't have Authorization header)
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      // Token expired or invalid during authenticated request
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api