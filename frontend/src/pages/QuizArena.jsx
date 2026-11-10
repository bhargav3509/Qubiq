import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronRight, ChevronLeft, AlertCircle, CheckCircle, XCircle, BookOpen, Flag, Loader } from 'lucide-react'
import useGameStore from '../store/gameStore'
import { HeartLife, Stars } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'

function Timer({ timeLeft, totalTime }) {
  const pct = totalTime > 0 ? (timeLeft / totalTime) * 100 : 100
  const color = timeLeft < 30 ? '#FF6685' : timeLeft < 60 ? '#FFB547' : '#68764A'
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F3F4F6" strokeWidth="3" />
          <motion.circle
            cx="18" cy="18" r="15.9" fill="none" strokeWidth="3"
            stroke={color}
            strokeDasharray="100"
            strokeDashoffset={100 - pct}
            strokeLinecap="round"
            animate={{ strokeDashoffset: 100 - pct }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-navy">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

function OptionButton({ option, state, onClick, disabled }) {
  // state: 'default' | 'selected' | 'correct' | 'incorrect' | 'reveal-correct'
  const styles = {
    default: 'bg-white border-gray-200 text-navy hover:border-purple/50 hover:bg-purple/5',
    selected: 'bg-purple/10 border-purple text-navy shadow-card-purple',
    correct: 'bg-green-game/15 border-green-game text-green-dark',
    incorrect: 'bg-pink-game/15 border-pink-game text-pink-dark',
    'reveal-correct': 'bg-green-game/15 border-green-game text-green-dark',
  }
  const icons = { correct: CheckCircle, incorrect: XCircle, 'reveal-correct': CheckCircle }
  const IconComp = icons[state]

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01, x: 4 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-bold text-sm transition-all
                  flex items-center gap-3 ${styles[state] || styles.default}
                  ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span className="shrink-0 w-7 h-7 rounded-xl bg-current/10 flex items-center justify-center font-black text-xs">
        {IconComp ? <IconComp size={14} /> : String.fromCharCode(65 + option.orderIndex)}
      </span>
      <span className="flex-1">{option.text}</span>
    </motion.button>
  )
}

export default function QuizArena() {
  const navigate = useNavigate()
  const { currentQuiz, currentAttemptId, answers, setAnswer, setQuizResult } = useGameStore()

  const [questionIndex, setQuestionIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(currentQuiz?.duration || 600)
  const [lives, setLives] = useState(5)
  const [revealed, setRevealed] = useState(false)
  const [mascotExpr, setMascotExpr] = useState('encouraging')
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  const questionStartTime = useRef(Date.now())
  const timerRef = useRef(null)

  useEffect(() => {
    if (!currentQuiz || !currentAttemptId) {
      navigate('/quiz-config')
    }
  }, [currentQuiz, currentAttemptId, navigate])

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) { handleSubmit(); return }
    timerRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft])

  if (!currentQuiz) return null

  const question = currentQuiz.questions[questionIndex]
  const totalQuestions = currentQuiz.questions.length
  const userAnswer = answers[question?.id]

  const handleAnswer = (optionId) => {
    if (revealed || userAnswer) return
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000)
    setAnswer(question.id, optionId, timeTaken)
    setRevealed(true)

    // Show mascot reaction (we don't know correct answer yet — show neutral)
    setMascotExpr('thinking')
    setTimeout(() => {
      setMascotExpr('encouraging')
    }, 1500)
  }

  const handleNext = () => {
    setRevealed(false)
    questionStartTime.current = Date.now()
    if (questionIndex < totalQuestions - 1) {
      setQuestionIndex(questionIndex + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    setSubmitting(true)
    clearInterval(timerRef.current)

    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    const answersArray = Object.entries(answers).map(([questionId, ans]) => ({
      questionId,
      optionId: ans.optionId,
      timeTaken: ans.timeTaken,
    }))

    // Add unanswered questions
    currentQuiz.questions.forEach((q) => {
      if (!answers[q.id]) answersArray.push({ questionId: q.id, optionId: null, timeTaken: 0 })
    })

    try {
      const { data } = await api.post('/quizzes/submit', {
        attemptId: currentAttemptId,
        answers: answersArray,
        timeTaken,
      })
      setQuizResult(data)
      navigate('/results')
    } catch (err) {
      console.error('Submit error:', err)
      navigate('/dashboard')
    }
  }, [submitting, answers, currentQuiz, currentAttemptId, startTime, setQuizResult, navigate])

  const answered = Object.keys(answers).length
  const progress = ((answered) / totalQuestions) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky/30 to-cream flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b-2 border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HeartLife lives={lives} maxLives={5} />
          </div>
          <div className="flex-1 max-w-xs">
            <div className="flex justify-between text-xs font-bold text-navy/60 mb-1">
              <span>Q{questionIndex + 1} of {totalQuestions}</span>
              <span>{answered} answered</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple to-sky rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <Timer timeLeft={timeLeft} totalTime={currentQuiz.duration} />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl space-y-5">

          {/* Mascot */}
          <div className="flex justify-center">
            <Mascot expression={mascotExpr} size={80} />
          </div>

          {/* Question card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.id}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border-2 border-gray-100 shadow-card-purple p-6"
            >
              {question?.topic && (
                <div className="inline-flex items-center gap-1 bg-purple/10 text-purple text-xs font-black px-3 py-1 rounded-xl mb-3">
                  <BookOpen size={12} /> {question.topic.name}
                </div>
              )}
              <p className="text-navy font-black text-lg leading-relaxed">{question?.questionText}</p>
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question?.id + '-opts'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {question?.options?.map((option) => {
                let state = 'default'
                if (userAnswer?.optionId === option.id) state = 'selected'
                return (
                  <OptionButton
                    key={option.id}
                    option={option}
                    state={state}
                    onClick={() => handleAnswer(option.id)}
                    disabled={!!userAnswer}
                  />
                )
              })}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => { if (questionIndex > 0) { setQuestionIndex(q => q - 1); setRevealed(false) } }}
              disabled={questionIndex === 0}
              className="btn-secondary px-4 py-3 disabled:opacity-40 flex items-center gap-1 text-sm"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2
                ${questionIndex === totalQuestions - 1
                  ? 'btn-green'
                  : 'btn-primary'
                }`}
            >
              {questionIndex === totalQuestions - 1
                ? (submitting
                    ? <><Loader size={16} className="animate-spin" /> Submitting…</>
                    : <><Flag size={16} /> Finish Quiz!</>)
                : (<>Next Question <ChevronRight size={16} /></>)
              }
            </motion.button>
          </div>

          {/* Skip all / submit early */}
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-navy/40 font-semibold text-sm hover:text-navy transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit early →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

