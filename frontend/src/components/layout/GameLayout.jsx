import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BookOpen, Zap, Trophy, User, LogOut,
  Map, Brain, BarChart2, Menu, X, ChevronLeft, ChevronRight,
  Layers
} from 'lucide-react'
import { useState, useEffect } from 'react'
import useAuthStore from '../../store/authStore'
import Mascot from '../mascot/Mascot'

const navItems = [
  { icon: Home,     label: 'Dashboard',   path: '/dashboard' },
  { icon: BookOpen, label: 'My Library',  path: '/library' },
  { icon: Map,      label: 'Missions',    path: '/missions' },
  { icon: Zap,      label: 'Quick Quiz',  path: '/quiz-config' },
  { icon: Brain,    label: 'Revision',    path: '/revision' },
  { icon: Trophy,   label: 'Leaderboard', path: '/leaderboard' },
  { icon: User,     label: 'Profile',     path: '/profile' },
]

export default function GameLayout({ children }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { user, logout } = useAuthStore()

  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [collapsed,    setCollapsed]    = useState(
    () => localStorage.getItem('qubiq_sidebar_collapsed') === 'true'
  )

  // Persist collapse preference
  useEffect(() => {
    localStorage.setItem('qubiq_sidebar_collapsed', collapsed)
  }, [collapsed])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-cream flex">

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={`
          fixed inset-y-0 left-0 z-40 bg-navy flex flex-col py-6 overflow-hidden
          transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex shrink-0
        `}
      >
        {/* Logo row */}
        <div className={`flex items-center mb-8 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 min-w-0">
            <Mascot expression="happy" size={36} animate={false} />
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <div className="text-xl font-black text-white tracking-tight leading-none">QUBIQ</div>
                  <div className="text-xs font-semibold text-sky leading-none mt-0.5">Learn. Play. Level Up.</div>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="hidden lg:flex w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20
                       items-center justify-center text-white/70 hover:text-white
                       transition-all shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className={`mx-3 mb-5 ${collapsed ? 'px-0' : 'px-0'}`}>
            {collapsed ? (
              <div className="flex justify-center">
                <div className="w-9 h-9 rounded-xl bg-purple flex items-center justify-center
                                text-white font-black text-base">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            ) : (
              <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple flex items-center justify-center
                                text-white font-black text-base shrink-0">
                  {user.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <div className="text-white font-bold text-sm truncate">{user.username}</div>
                  <div className="text-sky text-xs font-semibold">
                    Lv.{user.level?.level || 1} · {user.level?.totalXp || 0} XP
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 h-px bg-white/10 mb-3" />

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 px-2">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path
            return (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)} title={collapsed ? label : undefined}>
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 3 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm
                              transition-all relative group
                    ${active
                      ? 'bg-purple text-white shadow-game'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'
                    }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                >
                  <Icon size={18} className="shrink-0" />

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap flex-1"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {active && !collapsed && (
                    <motion.div
                      layoutId="activeNav"
                      className="w-1.5 h-1.5 rounded-full bg-sky shrink-0"
                    />
                  )}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-navy border border-white/20
                                    text-white text-xs font-bold rounded-lg whitespace-nowrap
                                    opacity-0 group-hover:opacity-100 pointer-events-none
                                    transition-opacity z-50">
                      {label}
                    </div>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/10 my-3" />

        {/* Logout */}
        <div className="px-2">
          <button
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50
                       hover:bg-white/10 hover:text-white font-bold text-sm transition-all w-full
                       group relative ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            {collapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-navy border border-white/20
                              text-white text-xs font-bold rounded-lg whitespace-nowrap
                              opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                Logout
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-navy px-4 py-3
                      flex items-center justify-between shadow-game">
        <div className="flex items-center gap-2">
          <Mascot expression="happy" size={28} animate={false} />
          <span className="text-white font-black text-lg">QUBIQ</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white p-1">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen pt-14 lg:pt-0 overflow-auto min-w-0">
        <div className="max-w-6xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
