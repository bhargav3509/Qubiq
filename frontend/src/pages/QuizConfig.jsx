import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, Clock, Target, BookOpen, ChevronDown, AlertCircle, Sword, Swords } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import { LoadingSpinner, DifficultyBadge } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'
import useGameStore from '../store/gameStore'

export default function QuizConfig() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setCurrentQuiz, setAttemptId } = useGameStore()

  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(location.state?.documentId || '')
  const [docDetail, setDocDetail] = useState(null)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const [config, setConfig] = useState({
    difficulty: 'medium',
    questionCount: 10,
    duration: 600,
    mode: 'standard',
    questionType: 'mcq',
  })

  useEffect(() => {
    api.get('/documents').then((r) => {
      const ready = r.data.filter((d) => d.status === 'ready')
      setDocuments(ready)
    })
  }, [])

  useEffect(() => {
    if (selectedDoc) {
      setDocDetail(null)
      setSelectedTopics([])
      api.get(`/documents/${selectedDoc}`).then((r) => setDocDetail(r.data)).catch(console.error)
    }
  }, [selectedDoc])

  const toggleTopic = (id) =>
    setSelectedTopics((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))

  const handleGenerate = async () => {
    if (!selectedDoc) { setError('Please select a document first.'); return }
    setError('')
    setGenerating(true)

    try {
      const { data: quiz } = await api.post('/quizzes/generate', {
        documentId: selectedDoc,
        topicIds: selectedTopics,
        difficulty: config.difficulty,
        questionCount: config.questionCount,
        duration: config.duration,
        mode: config.mode,
        questionType: config.questionType,
      })

      const { data: attempt } = await api.post('/quizzes/attempt', { quizId: quiz.id })

      setCurrentQuiz(quiz)
      setAttemptId(attempt.id)
      navigate('/quiz-arena')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <GameLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Mascot expression="thinking" size={70} />
          <div>
            <h1 className="text-3xl font-black text-navy flex items-center gap-2">
              <Zap size={28} className="text-purple" /> Configure Your Quiz
            </h1>
            <p className="text-navy/60 font-semibold mt-1">Choose your challenge settings</p>
          </div>
        </div>

        {error && (
          <div className="bg-pink-game/10 border-2 border-pink-game/40 text-pink-dark rounded-2xl px-4 py-3 font-bold text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Step 1: Document */}
        <div className="game-card">
          <h2 className="font-black text-navy text-base mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-purple text-white text-sm flex items-center justify-center font-black">1</span>
            Select Study Material
          </h2>
          {documents.length === 0 ? (
            <p className="text-navy/60 font-semibold text-sm">No ready documents found. Upload a document first.</p>
          ) : (
            <div className="relative">
              <select
                value={selectedDoc}
                onChange={(e) => setSelectedDoc(e.target.value)}
                className="input-game pr-10 appearance-none"
              >
                <option value="">— Choose a document —</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/40 pointer-events-none" />
            </div>
          )}
        </div>

        {/* Step 2: Topics */}
        {docDetail?.topics?.length > 0 && (
          <div className="game-card">
            <h2 className="font-black text-navy text-base mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-sky text-white text-sm flex items-center justify-center font-black">2</span>
              Select Topics (optional — all by default)
            </h2>
            <div className="flex flex-wrap gap-2">
              {docDetail.topics.map((topic) => (
                <motion.button
                  key={topic.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTopic(topic.id)}
                  className={`px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all
                    ${selectedTopics.includes(topic.id)
                      ? 'bg-purple text-white border-purple-dark shadow-game'
                      : 'bg-white text-navy border-gray-200 hover:border-purple/50'
                    }`}
                >
                  {topic.name}
                </motion.button>
              ))}
            </div>
            {selectedTopics.length > 0 && (
              <button onClick={() => setSelectedTopics([])} className="text-xs text-purple font-bold mt-2 hover:underline">
                Clear selection (use all topics)
              </button>
            )}
          </div>
        )}

        {/* Step 3: Config */}
        <div className="game-card">
          <h2 className="font-black text-navy text-base mb-5 flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-green-game text-white text-sm flex items-center justify-center font-black">3</span>
            Quiz Settings
          </h2>

          <div className="space-y-5">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-black text-navy mb-2 flex items-center gap-1">
                <Sword size={14} /> Difficulty
              </label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((d) => (
                  <motion.button
                    key={d}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig((c) => ({ ...c, difficulty: d }))}
                    className={`flex-1 py-3 rounded-2xl border-2 font-black text-sm capitalize transition-all
                      ${config.difficulty === d
                        ? d === 'easy' ? 'bg-green-game text-white border-green-dark shadow-game'
                        : d === 'medium' ? 'bg-orange-game text-white border-orange-dark shadow-game'
                        : 'bg-pink-game text-white border-pink-dark shadow-game'
                        : 'bg-white text-navy/60 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {d === 'easy' ? 'Easy' : d === 'medium' ? 'Medium' : 'Hard'}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Question type */}
            <div>
              <label className="block text-sm font-black text-navy mb-2 flex items-center gap-1">
                <HelpCircle size={14} className="text-purple" /> Question Type
              </label>
              <div className="flex gap-2">
                {[
                  { key: 'mcq', label: '4-Option MCQ' },
                  { key: 'true_false', label: 'True / False' },
                ].map(({ key, label }) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig((c) => ({ ...c, questionType: key }))}
                    className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-all
                      ${config.questionType === key
                        ? 'bg-purple text-white border-purple-dark shadow-game'
                        : 'bg-white text-navy/60 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <label className="block text-sm font-black text-navy mb-2 flex items-center gap-1">
                <Target size={14} className="text-purple" /> Questions: <span className="text-purple">{config.questionCount}</span>
              </label>
              <input
                type="range" min={5} max={20} step={5}
                value={config.questionCount}
                onChange={(e) => setConfig((c) => ({ ...c, questionCount: +e.target.value }))}
                className="w-full accent-purple h-2 rounded-full"
              />
              <div className="flex justify-between text-xs font-bold text-navy/40 mt-1">
                <span>5</span><span>10</span><span>15</span><span>20</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-black text-navy mb-2 flex items-center gap-1">
                <Clock size={14} className="text-purple" /> Time Limit: <span className="text-purple">{config.duration / 60} min</span>
              </label>
              <input
                type="range" min={120} max={1800} step={120}
                value={config.duration}
                onChange={(e) => setConfig((c) => ({ ...c, duration: +e.target.value }))}
                className="w-full accent-purple h-2 rounded-full"
              />
              <div className="flex justify-between text-xs font-bold text-navy/40 mt-1">
                <span>2m</span><span>10m</span><span>20m</span><span>30m</span>
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-black text-navy mb-2 flex items-center gap-1">
                <Swords size={14} className="text-purple" /> Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'standard', Icon: BookOpen, label: 'Standard', desc: 'Regular quiz mode' },
                  { key: 'boss_battle', Icon: Sword, label: 'Boss Battle', desc: 'Extra XP, harder!' },
                ].map(({ key, Icon, label, desc }) => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConfig((c) => ({ ...c, mode: key }))}
                    className={`p-3 rounded-2xl border-2 text-left transition-all
                      ${config.mode === key
                        ? 'bg-purple/10 border-purple shadow-card-purple'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon size={14} className={config.mode === key ? 'text-purple' : 'text-navy/50'} />
                      <span className="font-black text-navy text-sm">{label}</span>
                    </div>
                    <div className="text-navy/50 text-xs font-semibold">{desc}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={handleGenerate}
          disabled={generating || !selectedDoc}
          whileHover={{ scale: generating ? 1 : 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating Your Quiz…</>
          ) : (
            <><Zap size={22} /> Generate Quiz!</>
          )}
        </motion.button>
      </div>
    </GameLayout>
  )
}

