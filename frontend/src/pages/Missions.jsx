import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Zap, ChevronRight, Sword, Star, Calendar } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import { LoadingSpinner, EmptyState } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'
import { Map, Upload } from 'lucide-react'

const typeConfig = {
  standard:        { bg: 'bg-purple/10',        border: 'border-purple/30',        badge: 'bg-purple text-white',        Icon: Star,     label: 'MISSION' },
  boss_battle:     { bg: 'bg-pink-game/10',     border: 'border-pink-game/30',     badge: 'bg-pink-game text-white',     Icon: Sword,    label: 'BOSS'    },
  daily_challenge: { bg: 'bg-orange-game/10',   border: 'border-orange-game/30',   badge: 'bg-orange-game text-white',  Icon: Calendar, label: 'DAILY'   },
}

function MissionCard({ mission, docTitle, onClick }) {
  const cfg    = typeConfig[mission.type] || typeConfig.standard
  const { Icon } = cfg
  const locked = mission.isLocked

  return (
    <motion.div
      whileHover={!locked ? { y: -3, scale: 1.01 } : {}}
      onClick={!locked ? onClick : undefined}
      className={`relative rounded-3xl border-2 p-5 transition-all
        ${cfg.bg} ${cfg.border}
        ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-card-purple'}`}
    >
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-3 shadow-card">
            <Lock size={22} className="text-navy/50" />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.badge}`}>
          <Icon size={18} />
        </div>
        <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      <h3 className="font-black text-navy text-sm mb-1">{mission.title}</h3>
      {docTitle && <p className="text-xs font-semibold text-navy/50 mb-3">{docTitle}</p>}
      {mission.description && (
        <p className="text-xs font-semibold text-navy/60 mb-3 line-clamp-2">{mission.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-orange-dark font-black text-xs">
          <Zap size={12} /> +{mission.xpReward} XP
        </span>
        {!locked && (
          <span className="flex items-center gap-1 text-purple font-black text-xs">
            Start <ChevronRight size={12} />
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function MissionsPage() {
  const navigate     = useNavigate()
  const [missions,   setMissions]   = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    api.get('/gamification/missions')
      .then((r) => setMissions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <GameLayout><LoadingSpinner message="Loading missions…" /></GameLayout>

  const worlds = missions.reduce((acc, m) => {
    const w = m.worldIndex || 1
    if (!acc[w]) acc[w] = []
    acc[w].push(m)
    return acc
  }, {})

  const handleMission = (mission) => {
    navigate('/quiz-config', {
      state: {
        documentId:    mission.documentId,
        documentTitle: mission.document?.title,
        topicIds:      mission.topicId ? [mission.topicId] : [],
        mode:          mission.type,
      }
    })
  }

  return (
    <GameLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center gap-4">
          <Mascot expression="encouraging" size={70} />
          <div>
            <h1 className="text-3xl font-black text-navy flex items-center gap-2">
              <Map size={28} className="text-purple" /> Your Missions
            </h1>
            <p className="text-navy/60 font-semibold mt-1">Complete missions to earn XP and unlock new worlds!</p>
          </div>
        </div>

        {missions.length === 0 ? (
          <EmptyState
            icon={Map}
            title="No Missions Yet"
            description="Upload a study document to automatically generate missions and worlds."
            action={
              <button onClick={() => navigate('/upload')} className="btn-primary flex items-center gap-2">
                <Upload size={16} /> Upload Document
              </button>
            }
          />
        ) : (
          Object.entries(worlds).map(([worldNum, worldMissions]) => (
            <div key={worldNum}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-navy text-white font-black text-lg
                               flex items-center justify-center shadow-game">
                  {worldNum}
                </div>
                <div>
                  <h2 className="font-black text-navy text-lg">World {worldNum}</h2>
                  <p className="text-navy/50 text-xs font-semibold">{worldMissions.length} missions</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-purple/30 to-transparent ml-3" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {worldMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    docTitle={mission.document?.title}
                    onClick={() => handleMission(mission)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </GameLayout>
  )
}
