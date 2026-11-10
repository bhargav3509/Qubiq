import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Rocket, Gamepad2 } from 'lucide-react'
import useAuthStore from '../store/authStore'
import Mascot from '../components/mascot/Mascot'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, loading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (error) clearError()
    if (localError) setLocalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setLocalError('Passwords do not match!')
      return
    }
    if (form.password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }
    try {
      await register(form.email, form.username, form.password)
      navigate('/dashboard')
    } catch {}
  }

  const displayError = localError || error

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple/80 to-sky flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { color: '#68764A', size: 14, left: '5%', top: '8%' },
          { color: '#55C7E8', size: 10, left: '22%', top: '15%' },
          { color: '#FFB547', size: 16, left: '40%', top: '6%' },
          { color: '#FF6685', size: 12, left: '60%', top: '20%' },
          { color: '#75D66B', size: 11, left: '78%', top: '10%' },
          { color: '#68764A', size: 9,  left: '90%', top: '25%' },
        ].map((dot, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{ left: dot.left, top: dot.top, width: dot.size, height: dot.size, background: dot.color, opacity: 0.5 }}
            animate={{ y: [0, -12, 0], scale: [1, 1.4, 1] }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl border-2 border-purple/20 shadow-game-lg p-8">
          <div className="flex flex-col items-center mb-6">
            <Mascot expression="celebrating" size={90} />
            <h1 className="text-3xl font-black text-navy mt-3">Join QUBIQ!</h1>
            <p className="text-navy/60 font-semibold text-sm mt-1">Start your learning adventure today</p>
          </div>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-pink-game/10 border-2 border-pink-game/40 text-pink-dark rounded-2xl px-4 py-3
                         font-bold text-sm mb-4 flex items-center gap-2"
            >
              <AlertCircle size={16} /> {displayError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-navy mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className="input-game pl-10" placeholder="hero@qubiq.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-navy mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  className="input-game pl-10" placeholder="QuizMaster99" required minLength={3} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-navy mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} className="input-game pl-10 pr-10" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-navy mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
                <input type={showPassword ? 'text' : 'password'} name="confirm" value={form.confirm}
                  onChange={handleChange} className="input-game pl-10" placeholder="Repeat password" required />
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Gamepad2 size={18} /> Create My Account!
                </span>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <p className="text-navy/60 font-semibold text-sm">
              Already a hero?{' '}
              <Link to="/login" className="text-purple font-black hover:underline">Log In →</Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-white/80 font-bold text-sm hover:text-white">← Back to Home</Link>
        </div>
      </motion.div>
    </div>
  )
}

