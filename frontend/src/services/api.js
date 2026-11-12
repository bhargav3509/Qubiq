import axios from 'axios'

const rawUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
const baseURL = rawUrl
  ? (rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`)
  : '/api'

const api = axios.create({
  baseURL,
  timeout: 60000,
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qubiq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('qubiq_token')
      localStorage.removeItem('qubiq_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

