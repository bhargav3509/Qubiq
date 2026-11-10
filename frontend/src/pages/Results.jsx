import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { Zap, RotateCcw, Home, Brain, CheckCircle, XCircle, Clock } from 'lucide-react'
import useGameStore from '../store/gameStore'
import { Stars, Badge } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import GameLayout from '../components/layout/GameLayout'

function ScoreCircle({ accuracy }) {
  const color = accuracy >= 80 ? '#75D66B' : accuracy >= 50 ? '#FFB547' : '#FF6685'
  const r     = 54
  const circ  = 2 * Math.PI * r
  const dash  = (accuracy / 100) * circ

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" width="144" height="144">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" strokeWidth="10"
          stroke={color} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - dash}
          transform="rotate(-90 60 60)"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-black text-navy"
        >{accuracy}%</motion.span>
        <span className="text-xs font-bold text-navy/50">accuracy</span>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  const navigate    = useNavigate()
  const { quizResult, currentQuiz, resetQuiz } = useGameStore()

  useEffect(() => { if (!quizResult) navigate('/dashboard') }, [quizResult, navigate])
  if (!quizResult) return null

  const { scoring, stars, xpEarned, xpBreakdown, unlockedAchievements, weakTopics, questions } = quizResult
  const accuracy = scoring?.accuracy || 0
  const expr  = accuracy >= 80 ? 'celebrating' : accuracy >= 50 ? 'encouraging' : 'disappointed'
  const title = accuracy >= 80 ? 'Excellent Work!' : accuracy >= 50 ? 'Good Effort!' : 'Keep Practising!'

  const topicData = scoring?.topicPerformance?.map((t) => ({
    topic: t.topic.length > 12 ? t.topic.substring(0, 12) + '…' : t.topic,
    score: t.percentage,
    fill:  t.percentage >= 80 ? '#75D66B' : t.percentage >= 50 ? '#FFB547' : '#FF6685',
  })) || []

  return (
    <GameLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Result banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className={`game-card text-center py-8 ${
            accuracy >= 80 ? 'bg-gradient-to-br from-green-game/10 to-sky/10'
            : accuracy >= 50 ? 'bg-gradient-to-br from-orange-game/10 to-cream'
            : 'bg-gradient-to-br from-pink-game/10 to-cream'
          }`}
        >
          <Mascot expression={expr} size={100} className="mx-auto mb-4" />
          <h1 className="text-3xl font-black text-navy mb-3">{title}</h1>
          <Stars count={stars} size="lg" />
          <div className="mt-4 inline-flex items-center gap-2 bg-orange-game/20 text-orange-dark
                          border-2 border-orange-game/40 px-4 py-2 rounded-xl font-black text-sm">
            <Zap size={16} /> +{xpEarned} XP earned
          </div>
        </motion.div>

        {/* Score + stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="game-card text-center"><ScoreCircle accuracy={accuracy} /></div>
          <div className="game-card flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center">
              <span className="text-navy/60 font-semibold text-sm flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-game" /> Correct
              </span>
              <span className="font-black text-green-dark text-lg">{scoring?.correct} / {scoring?.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-navy/60 font-semibold text-sm flex items-center gap-1.5">
                <XCircle size={14} className="text-pink-game" /> Incorrect
              </span>
              <span className="font-black text-pink-dark text-lg">
                {(scoring?.total || 0) - (scoring?.correct || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-navy/60 font-semibold text-sm">Stars</span>
              <Stars count={stars} size="sm" />
            </div>
          </div>
        </div>

        {/* XP breakdown */}
        {xpBreakdown?.length > 0 && (
          <div className="game-card">
            <h3 className="font-black text-navy mb-3 text-sm flex items-center gap-2">
              <Zap size={14} className="text-purple" /> XP Earned
            </h3>
            <div className="space-y-2">
              {xpBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="font-semibold text-navy/70 text-sm">{item.reason}</span>
                  <span className="font-black text-purple">+{item.amount} XP</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-black text-navy">
                <span>Total</span>
                <span className="text-orange-game text-lg">+{xpEarned} XP</span>
              </div>
            </div>
          </div>
        )}

        {/* Topic chart */}
        {topicData.length > 0 && (
          <div className="game-card">
            <h3 className="font-black text-navy mb-4 text-sm">Topic Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="topic" tick={{ fontSize: 11, fontWeight: 700, fill: '#30304A' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#30304A' }} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Score']}
                  contentStyle={{ borderRadius: 12, border: '2px solid #E5E7EB', fontWeight: 700 }}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {topicData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Weak topics */}
        {weakTopics?.length > 0 && (
          <div className="game-card border-2 border-orange-game/30 bg-orange-game/5">
            <h3 className="font-black text-navy mb-2 text-sm">Needs Improvement</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {weakTopics.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-orange-game/20 text-orange-dark
                                         border border-orange-game/30 rounded-xl font-bold text-sm">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-sm font-semibold text-navy/70">
              AI has generated personalised revision notes for these topics.
            </p>
          </div>
        )}

        {/* Unlocked achievements */}
        {unlockedAchievements?.length > 0 && (
          <div className="game-card">
            <h3 className="font-black text-navy mb-3 text-sm">Achievements Unlocked!</h3>
            <div className="grid grid-cols-3 gap-3">
              {unlockedAchievements.map((ach) => (
                <Badge key={ach.id} icon={ach.icon} name={ach.name} description={ach.description} unlocked />
              ))}
            </div>
          </div>
        )}

        {/* Question review */}
        {questions?.length > 0 && (
          <div className="game-card">
            <h3 className="font-black text-navy mb-4 text-sm">Question Review</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {questions.map((q) => {
                const result     = scoring?.results?.find((r) => r.questionId === q.id)
                const correctOpt = q.options.find((o) => o.isCorrect)
                return (
                  <div key={q.id} className={`p-4 rounded-2xl border-2
                    ${result?.isCorrect ? 'bg-green-game/10 border-green-game/30' : 'bg-pink-game/10 border-pink-game/30'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {result?.isCorrect
                        ? <CheckCircle size={16} className="text-green-game shrink-0 mt-0.5" />
                        : <XCircle    size={16} className="text-pink-game shrink-0 mt-0.5" />
                      }
                      <p className="font-bold text-navy text-sm flex-1">{q.questionText}</p>
                    </div>
                    <p className="text-xs font-semibold text-green-dark ml-5">{correctOpt?.text}</p>
                    {q.explanation && (
                      <p className="text-xs font-semibold text-navy/60 mt-1 ml-5 italic">{q.explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => { resetQuiz(); navigate('/quiz-config') }}
            className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Play Again
          </motion.button>
          {weakTopics?.length > 0 && (
            <Link to="/revision" className="flex-1">
              <button className="btn-orange w-full py-4 flex items-center justify-center gap-2">
                <Brain size={16} /> Revision Centre
              </button>
            </Link>
          )}
          <Link to="/dashboard">
            <button className="btn-secondary px-6 py-4 flex items-center gap-2">
              <Home size={16} /> Dashboard
            </button>
          </Link>
        </div>

      </div>
    </GameLayout>
  )
}
