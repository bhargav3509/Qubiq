import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, BookOpen, Trophy, Brain, ArrowRight, Star, Upload, Target, FileText, Gamepad2, TrendingUp } from 'lucide-react'
import Mascot from '../components/mascot/Mascot'

// Animated floating cloud
function Cloud({ x, y, scale = 1, delay = 0 }) {
  return (
    <motion.div
      className="absolute opacity-80"
      style={{ left: `${x}%`, top: `${y}%`, scale }}
      animate={{ x: [0, 15, 0], y: [0, -8, 0] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <svg width="80" height="40" viewBox="0 0 80 40">
        <ellipse cx="40" cy="30" rx="35" ry="18" fill="white" opacity="0.9" />
        <circle cx="25" cy="22" r="14" fill="white" opacity="0.9" />
        <circle cx="50" cy="18" r="18" fill="white" opacity="0.9" />
      </svg>
    </motion.div>
  )
}

// Animated tree
function Tree({ x, h = 60, color = '#75D66B' }) {
  return (
    <div className="absolute bottom-0" style={{ left: `${x}%` }}>
      <svg width="40" height={h} viewBox={`0 0 40 ${h}`}>
        <rect x="17" y={h * 0.6} width="6" height={h * 0.4} fill="#8B6914" rx="3" />
        <polygon points={`20,0 0,${h * 0.5} 10,${h * 0.45} 2,${h * 0.75} 12,${h * 0.7} 5,${h} 35,${h} 28,${h * 0.7} 38,${h * 0.75} 30,${h * 0.45} 40,${h * 0.5}`} fill={color} />
      </svg>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description, color }) {
  const colorMap = {
    purple: 'bg-purple/10 text-purple border-purple/20',
    sky: 'bg-sky/10 text-sky-dark border-sky/20',
    green: 'bg-green-game/10 text-green-dark border-green-game/20',
    orange: 'bg-orange-game/10 text-orange-dark border-orange-game/20',
  }
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="game-card flex flex-col gap-4"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${colorMap[color]}`}>
        <Icon size={28} />
      </div>
      <div>
        <h3 className="font-black text-navy text-lg mb-1">{title}</h3>
        <p className="text-navy/60 font-semibold text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

function StepCard({ number, title, description, icon: Icon }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex gap-4 items-start game-card"
    >
      <div className="w-12 h-12 rounded-2xl bg-purple text-white font-black text-xl
                      flex items-center justify-center shrink-0 shadow-game">
        {number}
      </div>
      <div>
        <div className="w-9 h-9 rounded-xl bg-purple/10 flex items-center justify-center mb-2">
          <Icon size={20} className="text-purple" />
        </div>
        <h4 className="font-black text-navy text-base mb-1">{title}</h4>
        <p className="text-navy/60 font-semibold text-sm">{description}</p>
      </div>
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen font-display overflow-x-hidden">

      {/* HERO — illustrated sky landscape */}
      <div className="relative min-h-screen bg-gradient-to-b from-sky to-cream overflow-hidden flex flex-col">

        {/* Clouds */}
        <Cloud x={5} y={8} scale={1.2} delay={0} />
        <Cloud x={30} y={5} scale={0.8} delay={1.5} />
        <Cloud x={60} y={3} scale={1.1} delay={0.8} />
        <Cloud x={80} y={10} scale={0.9} delay={2} />

        {/* Sun */}
        <motion.div
          className="absolute top-6 right-10"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <div className="w-20 h-20 rounded-full bg-orange-game/80 shadow-game-lg flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-orange-game" />
          </div>
        </motion.div>

        {/* Stars */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${10 + i * 15}%`, top: `${5 + (i % 3) * 8}%` }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" fill="#FFB547" opacity="0.85" />
            </svg>
          </motion.div>
        ))}

        {/* Trees ground row */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-green-game/60 rounded-t-[60px]" />
        {[5, 12, 20, 32, 42, 55, 65, 72, 80, 90].map((x, i) => (
          <Tree key={i} x={x} h={50 + (i % 3) * 20}
            color={i % 2 === 0 ? '#75D66B' : '#52B848'} />
        ))}

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-5">
          <div className="flex items-center gap-3">
            <Mascot expression="happy" size={44} />
            <div>
              <div className="text-2xl font-black text-navy">QUBIQ</div>
              <div className="text-xs font-bold text-navy/70">Learn. Play. Level Up.</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <motion.button whileHover={{ scale: 1.05 }} className="btn-secondary text-sm px-5 py-2.5">
                Log In
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button whileHover={{ scale: 1.05 }} className="btn-primary text-sm px-5 py-2.5">
                Sign Up
              </motion.button>
            </Link>
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pb-32 pt-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Mascot expression="celebrating" size={140} className="mx-auto mb-6" />
          </motion.div>

                    <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl md:text-6xl font-black text-navy leading-tight mb-4 max-w-3xl"
          >
            Your Learning Adventure
            <span className="text-purple block">Starts Here.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg md:text-xl font-semibold text-navy/70 mb-8 max-w-xl"
          >
            Upload your study materials. Transform them into epic quests,
            missions and challenges. Level up your knowledge!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-lg px-10 py-4 pulse-glow flex items-center gap-2"
              >
                <Gamepad2 size={22} /> PLAY NOW
                <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link to="/login" className="text-navy font-bold underline underline-offset-2 text-sm">
              Already have an account? Log in →
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center gap-6 text-sm font-bold text-navy/50"
          >
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-orange-game text-orange-game" />
              <Star size={14} className="fill-orange-game text-orange-game" />
              <Star size={14} className="fill-orange-game text-orange-game" />
              <Star size={14} className="fill-orange-game text-orange-game" />
              <Star size={14} className="fill-orange-game text-orange-game" />
              <span className="ml-1">Loved by learners</span>
            </div>
            <span>·</span>
            <span className="flex items-center gap-1"><Target size={13} /> Personalised</span>
          </motion.div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="bg-cream py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-purple/10 border-2 border-purple/20 text-purple
                            font-bold px-4 py-2 rounded-xl text-sm mb-4 flex items-center gap-1 justify-center">
              <Zap size={14} className="fill-purple" /> Why QUBIQ?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-navy">Study Smarter, Not Harder</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Upload,
                title: 'Upload & Unlock',
                description: 'Upload any PDF, DOCX, PPTX or TXT. Topics are extracted and your learning world is built instantly.',
                color: 'purple',
              },
              {
                icon: Brain,
                title: 'Quiz Magic',
                description: 'Get personalised MCQs, true/false questions and challenges generated from YOUR study material.',
                color: 'sky',
              },
              {
                icon: Trophy,
                title: 'Earn & Level Up',
                description: 'Collect XP, unlock achievements, maintain streaks and climb the global leaderboard.',
                color: 'orange',
              },
              {
                icon: Target,
                title: 'Smart Revision',
                description: 'Identify your weak spots and tackle personalised revision missions to fix them.',
                color: 'green',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <FeatureCard {...f} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-navy py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">How It Works</h2>
            <p className="text-white/60 font-semibold">From textbook to adventure in minutes</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { number: '1', icon: FileText, title: 'Upload Your Material', description: 'Drop any study file — PDF, Word doc, PowerPoint or plain text.' },
              { number: '2', icon: Gamepad2, title: 'Topics Extracted', description: 'Your material is read, key topics are extracted and a learning map is built.' },
              { number: '3', icon: Gamepad2, title: 'Play & Complete Missions', description: 'Answer quizzes, tackle boss battles and earn XP.' },
              { number: '4', icon: TrendingUp, title: 'Get Personalised Revision', description: 'Weak areas are spotted and targeted revision missions are created just for you.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <StepCard {...step} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary text-lg px-12 py-4 inline-flex items-center gap-2"
              >
                <Gamepad2 size={20} /> Start Your Adventure
                <ArrowRight size={18} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-navy border-t border-white/10 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Mascot expression="happy" size={30} animate={false} />
          <span className="text-white font-black text-xl">QUBIQ</span>
        </div>
        <p className="text-white/40 text-sm font-semibold">Learn. Play. Level Up. © 2026</p>
      </footer>
    </div>
  )
}

