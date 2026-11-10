import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Gamepad2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import Mascot from '../components/mascot/Mascot'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, loading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch {}
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky to-cream flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + i * 20}%`, top: `${5 + (i % 3) * 25}%`,
              width: `${10 + i * 4}px`, height: `${10 + i * 4}px`,
              background: ['#68764A','#55C7E8','#FFB547','#FF6685','#75D66B'][i],
              opacity: 0.4,
            }}
            animate={{ y: [0, -15, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl border-2 border-purple/20 shadow-game-lg p-8">
          {/* Mascot header */}
          <div className="flex flex-col items-center mb-6">
            <Mascot expression="happy" size={90} />
            <h1 className="text-3xl font-black text-navy mt-3">Welcome Back!</h1>
            <p className="text-navy/60 font-semibold text-sm mt-1">Let's continue your adventure</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-pink-game/10 border-2 border-pink-game/40 text-pink-dark rounded-2xl px-4 py-3
                         font-bold text-sm mb-4 flex items-center gap-2"
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-navy mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-game pl-10" placeholder="hero@qubiq.com" required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-navy mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={form.password} onChange={handleChange}
                  className="input-game pl-10 pr-10" placeholder="••••••••" required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="btn-primary w-full text-base py-4 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Gamepad2 size={18} /> Enter the Arena!
                </span>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-navy/60 font-semibold text-sm">
              New adventurer?{' '}
              <Link to="/register" className="text-purple font-black hover:underline">
                Create Account →
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-navy/60 font-bold text-sm hover:text-navy">← Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
}

