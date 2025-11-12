import axios from 'axios'
import { store } from '../store'
import { logout } from '../store/slices/authSlice'

// API Base URL from environment variables with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7204/api'
console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // No timeout - let requests complete naturally
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      store.dispatch(logout())
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api