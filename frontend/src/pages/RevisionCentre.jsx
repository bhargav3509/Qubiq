import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ChevronDown, ChevronUp, Zap, BookOpen, AlertTriangle, List, HelpCircle, CheckCircle, Lightbulb } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import { LoadingSpinner, EmptyState } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'

function RecommendationCard({ rec, onRead }) {
  const [expanded, setExpanded] = useState(false)
  const practiceQuestions = Array.isArray(rec.practiceQuestions) ? rec.practiceQuestions : []
  const suggestedSequence = Array.isArray(rec.suggestedSequence) ? rec.suggestedSequence : []

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`game-card border-2 ${rec.isRead ? 'border-gray-100' : 'border-purple/40 bg-purple/5'}`}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => { setExpanded(!expanded); if (!rec.isRead) onRead(rec.id) }}
      >
        <div className="flex-1 mr-4">
          {!rec.isRead && (
            <span className="inline-block bg-purple text-white text-xs font-black px-2 py-0.5 rounded-lg mb-2">NEW</span>
          )}
          <h3 className="font-black text-navy text-sm mb-2 flex items-center gap-1">
            <AlertTriangle size={14} className="text-orange-game" /> Weak Topics Identified
          </h3>
          <div className="flex flex-wrap gap-2">
            {rec.weakTopics.map((t, i) => (
              <span key={i} className="px-2 py-0.5 bg-orange-game/20 text-orange-dark border border-orange-game/30 rounded-lg text-xs font-bold flex items-center gap-1">
                <AlertTriangle size={10} /> {t}
              </span>
            ))}
          </div>
          <p className="text-xs text-navy/50 font-semibold mt-2">
            {new Date(rec.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button className="text-navy/40 hover:text-navy p-1 mt-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t-2 border-gray-100 space-y-5">
              {/* Revision notes */}
              <div>
                <h4 className="font-black text-navy text-sm mb-2 flex items-center gap-2">
                  <BookOpen size={14} /> Revision Notes
                </h4>
                <div className="bg-cream rounded-2xl p-4 text-sm font-semibold text-navy/80 leading-relaxed">
                  {rec.revisionNotes}
                </div>
              </div>

              {/* Suggested sequence */}
              {suggestedSequence.length > 0 && (
                <div>
                  <h4 className="font-black text-navy text-sm mb-2 flex items-center gap-1">
                    <List size={14} /> Study Plan
                  </h4>
                  <div className="space-y-2">
                    {suggestedSequence.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-lg bg-purple text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm font-semibold text-navy/80">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Practice questions */}
              {practiceQuestions.length > 0 && (
                <div>
                  <h4 className="font-black text-navy text-sm mb-2 flex items-center gap-1">
                    <HelpCircle size={14} /> Practice Questions
                  </h4>
                  <div className="space-y-3">
                    {practiceQuestions.map((pq, i) => (
                      <div key={i} className="bg-white border-2 border-gray-100 rounded-2xl p-4">
                        <p className="font-bold text-navy text-sm mb-2">Q: {pq.question}</p>
                        {pq.hint && (
                          <p className="text-xs font-semibold text-sky-dark mb-2 flex items-center gap-1">
                            <Lightbulb size={12} /> Hint: {pq.hint}
                          </p>
                        )}
                        <details className="group">
                          <summary className="text-xs font-black text-purple cursor-pointer hover:underline">Show Answer</summary>
                          <p className="text-xs font-semibold text-green-dark mt-2 p-2 bg-green-game/10 rounded-xl flex items-center gap-1"><CheckCircle size={12} /> {pq.answer}</p>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function RevisionCentre() {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/revision')
      .then((r) => setRecommendations(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRead = async (id) => {
    await api.patch(`/revision/${id}/read`).catch(() => {})
    setRecommendations((recs) => recs.map((r) => r.id === id ? { ...r, isRead: true } : r))
  }

  const unread = recommendations.filter((r) => !r.isRead).length

  return (
    <GameLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Mascot expression={unread > 0 ? 'encouraging' : 'happy'} size={70} />
          <div>
            <h1 className="text-3xl font-black text-navy flex items-center gap-2">
              <Brain size={28} className="text-purple" /> Revision Centre
            </h1>
            <p className="text-navy/60 font-semibold mt-1">
              {unread > 0
                ? `${unread} new personalised revision plan${unread > 1 ? 's' : ''} waiting!`
                : 'Your AI-powered revision hub'
              }
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-sky/10 border-2 border-sky/30 rounded-2xl p-4 flex items-start gap-3">
          <Brain size={20} className="text-sky-dark shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-navy/80">
            After every quiz, QUBIQ's AI analyses your performance and generates personalised revision notes
            and practice questions for topics you need to improve on. Take more quizzes to unlock revision plans!
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading revision plans…" />
        ) : recommendations.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No Revision Plans Yet"
            description="Complete a quiz and AI will automatically generate personalised revision notes for your weak topics."
            action={
              <button onClick={() => navigate('/quiz-config')} className="btn-primary flex items-center gap-2">
                <Zap size={16} /> Take a Quiz
              </button>
            }
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} onRead={handleRead} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </GameLayout>
  )
}

