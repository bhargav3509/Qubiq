import { motion } from 'framer-motion'
import {
  Zap, Flame, Trophy, Star, BookOpen, Clock,
  CheckCircle, XCircle, Heart, TrendingUp, Award,
  Shield, Target, Layers, ChevronRight
} from 'lucide-react'

export function XPBar({ current, max, label, className = '' }) {
  const pct = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between text-xs font-bold text-navy/60 mb-1">
          <span>{label}</span>
          <span>{current} / {max} XP</span>
        </div>
      )}
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-purple to-sky"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export function LevelBadge({ level, name, className = '' }) {
  const colors = {
    1: 'bg-gray-100 text-gray-600 border-gray-200',
    2: 'bg-sky/20 text-sky-dark border-sky/40',
    3: 'bg-green-game/20 text-green-dark border-green-game/40',
    4: 'bg-orange-game/20 text-orange-dark border-orange-game/40',
    5: 'bg-purple/20 text-purple border-purple/40',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 font-black text-sm
                      ${colors[level] || colors[1]} ${className}`}>
      <Shield size={12} />
      Lv.{level}{name ? ` ${name}` : ''}
    </span>
  )
}

export function StatCard({ icon: Icon, label, value, color = 'purple', className = '' }) {
  const colors = {
    purple: 'bg-purple/10 text-purple border-purple/20',
    sky:    'bg-sky/10 text-sky-dark border-sky/20',
    green:  'bg-green-game/10 text-green-dark border-green-game/20',
    orange: 'bg-orange-game/10 text-orange-dark border-orange-game/20',
    pink:   'bg-pink-game/10 text-pink-dark border-pink-game/20',
  }
  return (
    <motion.div whileHover={{ y: -2 }} className={`game-card flex items-center gap-4 ${className}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${colors[color]}`}>
        <Icon size={22} />
      </div>
      <div>
        <div className="text-2xl font-black text-navy">{value}</div>
        <div className="text-sm font-semibold text-navy/60">{label}</div>
      </div>
    </motion.div>
  )
}

// Icon map for achievement keys — Lucide only, no emojis
const achievementMap = {
  first_victory: Trophy,
  perfect_score: Star,
  seven_day_streak: Flame,
  knowledge_master: Award,
  speedster: Zap,
  mission_champion: Target,
  '🏆': Trophy,
  '⭐': Star,
  '🔥': Flame,
  '🎓': Award,
  '⚡': Zap,
  '🗡️': Target,
}

function AchievementIcon({ icon, size = 24, className = '' }) {
  if (icon && (typeof icon === 'function' || typeof icon === 'object')) {
    const Component = icon
    return <Component size={size} className={className} />
  }
  const LucideIcon = achievementMap[icon] || Award
  return <LucideIcon size={size} className={className} />
}

export function Badge({ icon, name, description, unlocked = false, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center transition-all
        ${unlocked
          ? 'bg-white border-purple/30 shadow-card'
          : 'bg-gray-50 border-gray-200 opacity-50'
        } ${className}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                       ${unlocked ? 'bg-purple/10 text-purple' : 'bg-gray-100 text-gray-400'}`}>
        <AchievementIcon icon={icon} size={20} />
      </div>
      <div className="font-black text-sm text-navy">{name}</div>
      {description && <div className="text-xs text-navy/60 font-semibold">{description}</div>}
    </motion.div>
  )
}

export function StreakBadge({ streak }) {
  return (
    <div className="flex items-center gap-1.5 bg-orange-game/20 border-2 border-orange-game/40
                    text-orange-dark px-3 py-1.5 rounded-xl font-black text-sm">
      <Flame size={14} />
      {streak} day streak
    </div>
  )
}

export function DifficultyBadge({ difficulty }) {
  const styles = {
    easy:   'bg-green-game/20 text-green-dark border-green-game/40',
    medium: 'bg-orange-game/20 text-orange-dark border-orange-game/40',
    hard:   'bg-pink-game/20 text-pink-dark border-pink-game/40',
  }
  const labels = {
    easy:   'Easy',
    medium: 'Medium',
    hard:   'Hard',
  }
  const dots = { easy: 1, medium: 2, hard: 3 }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 font-bold text-xs
                      ${styles[difficulty] || styles.medium}`}>
      {Array.from({ length: dots[difficulty] || 1 }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      ))}
      {labels[difficulty] || difficulty}
    </span>
  )
}

export function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-12 h-12 border-4 border-purple border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-navy/60">{message}</p>
    </div>
  )
}

export function EmptyState({ icon: Icon = BookOpen, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-20 h-20 rounded-3xl bg-purple/10 border-2 border-purple/20
                      flex items-center justify-center">
        <Icon size={36} className="text-purple" />
      </div>
      <h3 className="text-xl font-black text-navy">{title}</h3>
      {description && <p className="text-navy/60 font-semibold max-w-sm">{description}</p>}
      {action}
    </div>
  )
}

export function Stars({ count = 0, max = 3, size = 'md' }) {
  const sizes = { sm: 14, md: 20, lg: 28 }
  const px    = sizes[size] || 20
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={px}
          className={`transition-all duration-300 ${i < count
            ? 'text-orange-game fill-orange-game star-pop'
            : 'text-gray-200 fill-gray-200'}`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

export function HeartLife({ lives, maxLives = 5 }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxLives }).map((_, i) => (
        <Heart
          key={i}
          size={18}
          className={`transition-all duration-300 ${i < lives
            ? 'text-pink-game fill-pink-game'
            : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}
