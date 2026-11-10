import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Shield, Zap } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import { LoadingSpinner, LevelBadge } from '../components/ui/GameUI'
import useAuthStore from '../store/authStore'
import api from '../services/api'

function RankMedal({ rank }) {
  if (rank === 1) return <div className="w-8 h-8 rounded-xl bg-orange-game/20 border-2 border-orange-game/50 flex items-center justify-center"><Crown size={16} className="text-orange-game" /></div>
  if (rank === 2) return <div className="w-8 h-8 rounded-xl bg-sky/20 border-2 border-sky/40 flex items-center justify-center"><Shield size={14} className="text-sky-dark" /></div>
  if (rank === 3) return <div className="w-8 h-8 rounded-xl bg-orange-game/10 border-2 border-orange-game/20 flex items-center justify-center"><Trophy size={14} className="text-orange-dark" /></div>
  return <span className="font-black text-navy/50 w-8 text-center text-sm">{rank}</span>
}

function LeaderRow({ entry, isCurrentUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (entry.rank - 1) * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
        ${isCurrentUser
          ? 'bg-purple/10 border-purple shadow-card-purple'
          : 'bg-white border-gray-100 hover:border-purple/20'
        }`}
    >
      <div className="w-10 flex items-center justify-center shrink-0">
        <RankMedal rank={entry.rank} />
      </div>

      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shrink-0"
           style={{ background: `hsl(${(entry.username?.charCodeAt(0) || 65) * 5}, 65%, 55%)` }}>
        {entry.username?.[0]?.toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-black text-navy text-sm truncate">{entry.username}</span>
          {isCurrentUser && (
            <span className="text-xs bg-purple text-white px-2 py-0.5 rounded-lg font-bold shrink-0">You</span>
          )}
        </div>
        <LevelBadge level={entry.level} name="" className="mt-0.5 scale-90 origin-left" />
      </div>

      <div className="text-right shrink-0">
        <div className="font-black text-navy text-sm">{(entry.totalXP || 0).toLocaleString()}</div>
        <div className="text-xs font-semibold text-navy/50 flex items-center gap-0.5 justify-end">
          <Zap size={10} /> XP
        </div>
      </div>
    </motion.div>
  )
}

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [data,    setData]    = useState({ leaderboard: [], userRank: null })
  const [tab,     setTab]     = useState('global')
  const [loading, setLoading] = useState(true)

  const fetchLeaderboard = async (type) => {
    setLoading(true)
    try {
      const { data: res } = await api.get(`/leaderboard?type=${type}`)
      setData(res)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLeaderboard(tab) }, [tab])

  return (
    <GameLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-game/20 border-2 border-orange-game/40 rounded-3xl
                          flex items-center justify-center">
            <Trophy size={28} className="text-orange-dark" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-navy">Leaderboard</h1>
            <p className="text-navy/60 font-semibold mt-1">Compete with learners worldwide</p>
          </div>
        </div>

        {/* Your rank */}
        {data.userRank && (
          <div className="game-card border-2 border-purple/30 bg-purple/5">
            <p className="text-xs font-black text-purple uppercase tracking-wide mb-2">Your Rank</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black text-navy">#{data.userRank.rank}</span>
                <div>
                  <div className="font-black text-navy">{data.userRank.username}</div>
                  <LevelBadge level={data.userRank.level} name="" />
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-purple text-xl">{(data.userRank.totalXP || 0).toLocaleString()}</div>
                <div className="text-xs font-semibold text-navy/50 flex items-center gap-0.5 justify-end">
                  <Zap size={10} /> Total XP
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-1 rounded-2xl border-2 border-gray-100">
          {[
            { key: 'global', label: 'All Time' },
            { key: 'weekly', label: 'This Week' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all
                ${tab === key ? 'bg-purple text-white shadow-game' : 'text-navy/60 hover:text-navy'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Podium top 3 */}
        {!loading && data.leaderboard.length >= 3 && (
          <div className="flex items-end justify-center gap-4 py-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-sky/20 border-2 border-sky/40
                              flex items-center justify-center font-black text-xl text-navy">
                {data.leaderboard[1]?.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-xs font-black text-navy/70 max-w-16 truncate text-center">
                {data.leaderboard[1]?.username}
              </div>
              <div className="bg-sky/20 rounded-t-xl w-16 h-16 flex items-center justify-center">
                <Shield size={24} className="text-sky-dark" />
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2 -mt-4">
              <Crown size={22} className="text-orange-game" />
              <div className="w-16 h-16 rounded-2xl bg-orange-game/20 border-2 border-orange-game/50
                              flex items-center justify-center font-black text-2xl text-navy">
                {data.leaderboard[0]?.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-xs font-black text-navy max-w-20 truncate text-center">
                {data.leaderboard[0]?.username}
              </div>
              <div className="bg-orange-game/30 rounded-t-xl w-20 h-24 flex items-center justify-center">
                <Trophy size={28} className="text-orange-dark" />
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-orange-game/10 border-2 border-orange-game/20
                              flex items-center justify-center font-black text-xl text-navy">
                {data.leaderboard[2]?.username?.[0]?.toUpperCase()}
              </div>
              <div className="text-xs font-black text-navy/70 max-w-16 truncate text-center">
                {data.leaderboard[2]?.username}
              </div>
              <div className="bg-orange-game/15 rounded-t-xl w-16 h-10 flex items-center justify-center">
                <Trophy size={18} className="text-orange-dark/60" />
              </div>
            </div>
          </div>
        )}

        {/* Full list */}
        {loading ? <LoadingSpinner message="Loading leaderboard…" /> : (
          <div className="space-y-2">
            {data.leaderboard.map((entry) => (
              <LeaderRow key={entry.id} entry={entry} isCurrentUser={entry.id === user?.id} />
            ))}
            {data.leaderboard.length === 0 && (
              <div className="text-center py-8 text-navy/50 font-semibold">
                No players yet. Be the first!
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  )
}
