import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap, Trophy, BookOpen, Flame, Star, Award, Target, Shield } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import { LoadingSpinner, Badge, XPBar, LevelBadge, StreakBadge, Stars } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'

const ALL_ACHIEVEMENTS = [
  { key: 'first_victory',   name: 'First Victory',    icon: Trophy,  description: 'Complete first quiz'    },
  { key: 'perfect_score',   name: 'Perfect Score',    icon: Star,    description: '100% accuracy'           },
  { key: 'seven_day_streak',name: '7-Day Streak',     icon: Flame,   description: '7 days in a row'         },
  { key: 'knowledge_master',name: 'Knowledge Master', icon: Award,   description: 'Reach Level 5'           },
  { key: 'speedster',       name: 'Speedster',        icon: Zap,     description: 'Finish in under 2 mins'  },
  { key: 'mission_champion',name: 'Mission Champion', icon: Target,  description: 'Complete 10 quizzes'     },
]

const LEVEL_NAMES = { 1: 'Beginner', 2: 'Explorer', 3: 'Challenger', 4: 'Scholar', 5: 'Master' }
const NEXT_XP     = { 1: 200, 2: 500, 3: 1000, 4: 2000 }

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/profile')
      .then((r) => setProfile(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <GameLayout><LoadingSpinner message="Loading profile…" /></GameLayout>

  const level       = profile?.level  || { level: 1, xp: 0, totalXp: 0 }
  const nextLevelXP = NEXT_XP[level.level] || 2000
  const streak      = profile?.streak || { currentStreak: 0, longestStreak: 0 }
  const achievements   = profile?.achievements  || []
  const quizHistory    = profile?.quizAttempts  || []
  const unlockedKeys   = achievements.map((ua) => ua.achievement?.key)

  const statItems = [
    { label: 'Quizzes Taken', value: profile?._count?.quizAttempts || 0, Icon: Zap    },
    { label: 'Documents',     value: profile?._count?.documents    || 0, Icon: BookOpen},
    { label: 'Best Streak',   value: `${streak.longestStreak}d`,         Icon: Flame  },
    { label: 'Achievements',  value: achievements.length,                 Icon: Trophy },
  ]

  return (
    <GameLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="game-card bg-gradient-to-br from-purple/10 to-sky/10 border-purple/20"
        >
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <Mascot expression="happy" size={80} animate={false} />
              <div className="absolute -bottom-1 -right-1 bg-purple text-white rounded-xl
                              px-2 py-0.5 text-xs font-black shadow-game">
                Lv.{level.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-navy">{profile?.username}</h1>
              <p className="text-navy/60 font-semibold text-sm truncate">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <LevelBadge level={level.level} name={LEVEL_NAMES[level.level] || 'Beginner'} />
                {streak.currentStreak > 0 && <StreakBadge streak={streak.currentStreak} />}
              </div>
            </div>

            <div className="text-right hidden sm:block shrink-0">
              <div className="text-3xl font-black text-purple">
                {(profile?.totalXP || level.totalXp || 0).toLocaleString()}
              </div>
              <div className="text-xs font-bold text-navy/50">Total XP</div>
            </div>
          </div>

          <div className="mt-4">
            <XPBar current={level.xp} max={nextLevelXP} label={`Progress to Level ${level.level + 1}`} />
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map(({ label, value, Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="game-card text-center py-5"
            >
              <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center mx-auto mb-2">
                <Icon size={18} className="text-purple" />
              </div>
              <div className="font-black text-navy text-xl">{value}</div>
              <div className="text-xs font-semibold text-navy/50">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <div className="game-card">
          <h2 className="font-black text-navy mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-purple" /> Achievements
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {ALL_ACHIEVEMENTS.map((ach) => (
              <Badge
                key={ach.key}
                icon={ach.icon}
                name={ach.name}
                description={ach.description}
                unlocked={unlockedKeys.includes(ach.key)}
              />
            ))}
          </div>
        </div>

        {/* Quiz history */}
        <div className="game-card">
          <h2 className="font-black text-navy mb-4 flex items-center gap-2">
            <Zap size={18} className="text-purple" /> Recent Quiz History
          </h2>
          {quizHistory.length === 0 ? (
            <p className="text-navy/50 font-semibold text-sm text-center py-4">No quizzes taken yet. Start playing!</p>
          ) : (
            <div className="space-y-3">
              {quizHistory.map((attempt, i) => (
                <motion.div
                  key={attempt.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-cream rounded-2xl"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm
                    ${attempt.accuracy >= 80 ? 'bg-green-game' : attempt.accuracy >= 50 ? 'bg-orange-game' : 'bg-pink-game'}`}>
                    {Math.round(attempt.accuracy)}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-navy text-sm truncate">
                      {attempt.quiz?.document?.title || 'Quiz'}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <Stars count={attempt.starsEarned || 0} size="sm" />
                      <span className="text-xs text-navy/50 font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="text-orange-dark font-black text-sm flex items-center gap-1 shrink-0">
                    <Zap size={12} /> +{attempt.xpEarned}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </GameLayout>
  )
}
