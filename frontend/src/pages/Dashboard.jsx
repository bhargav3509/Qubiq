import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, Flame, BookOpen, Upload, Map, Trophy,
  ArrowRight, Plus, Clock, ChevronRight, Target
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import { XPBar, LevelBadge, StatCard, Badge, StreakBadge, LoadingSpinner } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import GameLayout from '../components/layout/GameLayout'
import api from '../services/api'

function MascotGreeting({ username, streak }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const messages = [
    `${greeting}, ${username}! Ready to level up today?`,
    `Welcome back, ${username}! Your brain is about to get stronger!`,
    `Hey ${username}! Let's crush some missions today!`,
  ]
  const msg = messages[Math.floor(Math.random() * messages.length)]
  const expr = streak > 5 ? 'celebrating' : streak > 0 ? 'encouraging' : 'happy'
  return (
    <div className="flex items-center gap-4">
      <Mascot expression={expr} size={80} />
      <div>
        <p className="font-black text-navy text-xl">{msg}</p>
        {streak > 0 && <div className="mt-1"><StreakBadge streak={streak} /></div>}
      </div>
    </div>
  )
}

function DocumentCard({ doc, onClick }) {
  const statusColor = {
    ready:      'bg-green-game/20 text-green-dark border-green-game/40',
    processing: 'bg-orange-game/20 text-orange-dark border-orange-game/40',
    analyzing:  'bg-sky/20 text-sky-dark border-sky/40',
    failed:     'bg-pink-game/20 text-pink-dark border-pink-game/40',
    pending:    'bg-gray-100 text-gray-500 border-gray-200',
  }
  const statusLabel = {
    ready: 'Ready', processing: 'Processing',
    analyzing: 'Analysing', failed: 'Failed', pending: 'Pending',
  }
  const bookColors = ['#68764A','#55C7E8','#FF6685','#FFB547','#75D66B']
  const color = bookColors[(doc?.title?.charCodeAt(0) || 0) % bookColors.length]

  return (
    <motion.div whileHover={{ y: -4, scale: 1.02 }} onClick={onClick} className="game-card cursor-pointer">
      <div className="relative h-28 rounded-2xl mb-4 flex items-center justify-center overflow-hidden"
           style={{ background: `${color}20`, border: `2px solid ${color}30` }}>
        <svg width="60" height="80" viewBox="0 0 60 80">
          <rect x="5" y="5" width="50" height="70" rx="4" fill={color} />
          <rect x="8" y="8" width="44" height="64" rx="3" fill="white" opacity="0.15" />
          <rect x="12" y="18" width="30" height="3" rx="1.5" fill="white" opacity="0.6" />
          <rect x="12" y="26" width="24" height="3" rx="1.5" fill="white" opacity="0.6" />
          <rect x="12" y="34" width="28" height="3" rx="1.5" fill="white" opacity="0.6" />
          <rect x="12" y="42" width="20" height="3" rx="1.5" fill="white" opacity="0.6" />
        </svg>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-black border ${statusColor[doc.status] || statusColor.pending}`}>
          {statusLabel[doc.status] || doc.status}
        </span>
      </div>
      <h3 className="font-black text-navy text-sm line-clamp-2 mb-2">{doc?.title || 'Untitled'}</h3>
      <div className="flex items-center gap-3 text-xs font-semibold text-navy/50">
        <span>{doc?._count?.topics || 0} topics</span>
        <span>·</span>
        <span>{doc?._count?.quizzes || 0} quizzes</span>
        <span>·</span>
        <span className="uppercase">{doc?.fileType || 'DOC'}</span>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const [stats,     setStats]     = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docsRes] = await Promise.all([
          api.get('/gamification/stats'),
          api.get('/documents'),
        ])
        setStats(statsRes.data)
        setDocuments(docsRes.data.slice(0, 6))
      } catch (err) { console.error('Dashboard fetch error:', err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <GameLayout><LoadingSpinner message="Loading your adventure..." /></GameLayout>

  const level       = stats?.level    || { level: 1, xp: 0, totalXp: 0 }
  const levelInfo   = stats?.levelInfo || { name: 'Beginner' }
  const nextLevelXP = stats?.nextLevelXP || 200
  const streak      = stats?.streak?.currentStreak || 0
  const achievements    = stats?.achievements    || []
  const recentAttempts  = stats?.recentAttempts  || []

  return (
    <GameLayout>
      <div className="space-y-8 animate-fade-in">

        {/* Welcome */}
        <div className="game-card">
          <MascotGreeting username={user?.username || 'Hero'} streak={streak} />
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <LevelBadge level={level.level} name={levelInfo.name} />
              <span className="text-xs font-bold text-navy/60">{level.totalXp} total XP</span>
            </div>
            <XPBar current={level.xp} max={nextLevelXP} label={`Progress to Level ${level.level + 1}`} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Zap}    label="Total XP"     value={level.totalXp}       color="purple" />
          <StatCard icon={Flame}  label="Day Streak"   value={`${streak} days`}    color="orange" />
          <StatCard icon={Trophy} label="Achievements" value={achievements.length}  color="sky"    />
          <StatCard icon={BookOpen} label="Documents"  value={documents.length}    color="green"  />
        </div>

        {/* Documents / My World */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-navy flex items-center gap-2">
              <BookOpen size={20} className="text-purple" /> My Study World
            </h2>
            <Link to="/library">
              <button className="btn-secondary text-sm px-4 py-2 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {documents.length === 0 ? (
            <div className="game-card text-center py-12">
              <Mascot expression="thinking" size={80} className="mx-auto mb-4" />
              <h3 className="font-black text-navy text-lg mb-2">No Study Materials Yet!</h3>
              <p className="text-navy/60 font-semibold text-sm mb-5">Upload your first document to begin your adventure.</p>
              <Link to="/upload">
                <button className="btn-primary inline-flex items-center gap-2">
                  <Upload size={16} /> Upload Material
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} onClick={() => navigate(`/library/${doc.id}`)} />
              ))}
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate('/upload')}
                className="game-card cursor-pointer border-2 border-dashed border-purple/30
                           flex flex-col items-center justify-center gap-3 min-h-[200px] text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple/10 flex items-center justify-center">
                  <Plus size={28} className="text-purple" />
                </div>
                <span className="font-black text-purple text-sm">Add Material</span>
              </motion.div>
            </div>
          )}
        </div>

        {/* Recent activity + Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Recent quizzes */}
          <div className="game-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-navy text-base flex items-center gap-2">
                <Zap size={16} className="text-purple" /> Recent Activity
              </h3>
              <Link to="/profile" className="text-purple text-sm font-bold hover:underline">View all</Link>
            </div>
            {recentAttempts.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-navy/50 font-semibold text-sm">No quizzes taken yet. Start playing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center gap-3 p-3 bg-cream rounded-2xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white
                                    ${attempt.accuracy >= 80 ? 'bg-green-game' : attempt.accuracy >= 50 ? 'bg-orange-game' : 'bg-pink-game'}`}>
                      {Math.round(attempt.accuracy)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-navy text-sm truncate">{attempt.quiz?.document?.title || 'Quiz'}</div>
                      <div className="text-xs text-navy/50 font-semibold flex items-center gap-1">
                        <Clock size={10} />
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-dark font-black text-sm">
                      <Zap size={12} /> +{attempt.xpEarned}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements */}
          <div className="game-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-navy text-base flex items-center gap-2">
                <Trophy size={16} className="text-purple" /> Achievements
              </h3>
              <Link to="/profile" className="text-purple text-sm font-bold hover:underline">View all</Link>
            </div>
            {achievements.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-navy/50 font-semibold text-sm">Complete quizzes to unlock achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {achievements.slice(0, 6).map((ua) => (
                  <Badge
                    key={ua.id}
                    icon={ua.achievement.icon}
                    name={ua.achievement.name}
                    unlocked={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
            <Target size={20} className="text-purple" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Upload Material', Icon: Upload,  path: '/upload',      color: 'btn-primary' },
              { label: 'Take a Quiz',     Icon: Zap,     path: '/quiz-config', color: 'btn-green'   },
              { label: 'View Missions',   Icon: Map,     path: '/missions',    color: 'btn-orange'  },
              { label: 'Leaderboard',     Icon: Trophy,  path: '/leaderboard', color: 'btn-pink'    },
            ].map(({ label, Icon, path, color }) => (
              <Link key={path} to={path}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${color} w-full flex flex-col items-center gap-2 py-5 text-sm`}
                >
                  <Icon size={22} />
                  {label}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </GameLayout>
  )
}
