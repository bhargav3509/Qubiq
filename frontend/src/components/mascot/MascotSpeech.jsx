import { motion, AnimatePresence } from 'framer-motion'
import Mascot from './Mascot'

export default function MascotSpeech({ expression = 'happy', message, size = 100, className = '' }) {
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Mascot expression={expression} size={size} />
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            className="relative bg-white border-2 border-purple rounded-2xl rounded-bl-sm px-4 py-3
                       shadow-card max-w-xs text-sm font-bold text-navy mb-2"
          >
            {message}
            <div className="absolute -left-2.5 bottom-2 w-0 h-0
              border-t-8 border-t-transparent
              border-r-8 border-r-purple
              border-b-8 border-b-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

