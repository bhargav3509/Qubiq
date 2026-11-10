import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('qubiq_user') || 'null'),
  token: localStorage.getItem('qubiq_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('qubiq_token', data.token)
      localStorage.setItem('qubiq_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data?.error || 'Login failed', loading: false })
      throw err
    }
  },

  register: async (email, username, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { email, username, password })
      localStorage.setItem('qubiq_token', data.token)
      localStorage.setItem('qubiq_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.token, loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data?.error || 'Registration failed', loading: false })
      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('qubiq_token')
    localStorage.removeItem('qubiq_user')
    set({ user: null, token: null })
  },

  updateUser: (updates) => {
    const newUser = { ...get().user, ...updates }
    localStorage.setItem('qubiq_user', JSON.stringify(newUser))
    set({ user: newUser })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore

