import { motion } from 'framer-motion'

// Quby - QUBIQ's adorable purple mascot
// A round little creature with big eyes, tiny wings and a star on its forehead

const expressions = {
  happy: {
    eyeL: 'M 28 32 Q 33 27 38 32',
    eyeR: 'M 62 32 Q 67 27 72 32',
    mouth: 'M 42 54 Q 50 62 58 54',
    blush: true,
    blink: false,
    stars: false,
  },
  thinking: {
    eyeL: 'M 28 34 Q 33 30 38 34',
    eyeR: 'M 62 30 Q 67 26 72 30',
    mouth: 'M 44 56 Q 50 54 54 58',
    blush: false,
    blink: false,
    stars: false,
  },
  celebrating: {
    eyeL: 'M 26 30 Q 33 22 40 30',
    eyeR: 'M 60 30 Q 67 22 74 30',
    mouth: 'M 40 52 Q 50 64 60 52',
    blush: true,
    blink: false,
    stars: true,
  },
  surprised: {
    eyeL: null,  // circles
    eyeR: null,
    mouth: null, // oval
    blush: false,
    blink: false,
    stars: false,
    surprised: true,
  },
  encouraging: {
    eyeL: 'M 28 32 Q 33 27 38 32',
    eyeR: 'M 62 32 Q 67 27 72 32',
    mouth: 'M 42 52 Q 50 60 58 52',
    blush: true,
    blink: false,
    stars: true,
  },
  disappointed: {
    eyeL: 'M 28 36 Q 33 40 38 36',
    eyeR: 'M 62 36 Q 67 40 72 36',
    mouth: 'M 42 60 Q 50 54 58 60',
    blush: false,
    blink: false,
    stars: false,
  },
  default: {
    eyeL: 'M 28 32 Q 33 27 38 32',
    eyeR: 'M 62 32 Q 67 27 72 32',
    mouth: 'M 42 54 Q 50 62 58 54',
    blush: true,
    blink: false,
    stars: false,
  },
}

export default function Mascot({ expression = 'happy', size = 120, animate = true, className = '' }) {
  const expr = expressions[expression] || expressions.default
  const scale = size / 100

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={animate ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse cx="50" cy="95" rx="22" ry="5" fill="rgba(0,0,0,0.1)" />

        {/* Wings */}
        <motion.ellipse
          cx="18" cy="58" rx="12" ry="8"
          fill="#8A9C68"
          transform="rotate(-30 18 58)"
          animate={animate ? { rotate: ['-30deg', '-25deg', '-30deg'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.ellipse
          cx="82" cy="58" rx="12" ry="8"
          fill="#8A9C68"
          transform="rotate(30 82 58)"
          animate={animate ? { rotate: ['30deg', '25deg', '30deg'] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Body */}
        <circle cx="50" cy="55" r="32" fill="#68764A" />
        <circle cx="50" cy="52" r="30" fill="#758554" />

        {/* Belly */}
        <ellipse cx="50" cy="60" rx="18" ry="14" fill="#8A9C68" opacity="0.5" />

        {/* Head */}
        <circle cx="50" cy="38" r="26" fill="#68764A" />
        <circle cx="50" cy="36" r="24" fill="#758554" />

        {/* Star on forehead */}
        <text x="50" y="22" textAnchor="middle" fontSize="10" fill="#FFB547">★</text>

        {/* Eyes */}
        {expr.surprised ? (
          <>
            <circle cx="33" cy="36" r="8" fill="white" />
            <circle cx="33" cy="36" r="5" fill="#30304A" />
            <circle cx="31" cy="34" r="1.5" fill="white" />
            <circle cx="67" cy="36" r="8" fill="white" />
            <circle cx="67" cy="36" r="5" fill="#30304A" />
            <circle cx="65" cy="34" r="1.5" fill="white" />
          </>
        ) : (
          <>
            {/* Left eye */}
            <ellipse cx="33" cy="36" rx="8" ry="8" fill="white" />
            <ellipse cx="33" cy="36" rx="5" ry="5" fill="#30304A" />
            <circle cx="31" cy="34" r="1.5" fill="white" />
            {expr.eyeL && (
              <path d={expr.eyeL} stroke="#30304A" strokeWidth="2.5" fill="none" strokeLinecap="round"
                    transform="scale(1) translate(0 -4)" />
            )}

            {/* Right eye */}
            <ellipse cx="67" cy="36" rx="8" ry="8" fill="white" />
            <ellipse cx="67" cy="36" rx="5" ry="5" fill="#30304A" />
            <circle cx="65" cy="34" r="1.5" fill="white" />
            {expr.eyeR && (
              <path d={expr.eyeR} stroke="#30304A" strokeWidth="2.5" fill="none" strokeLinecap="round"
                    transform="scale(1) translate(0 -4)" />
            )}
          </>
        )}

        {/* Blush */}
        {expr.blush && (
          <>
            <ellipse cx="22" cy="44" rx="6" ry="4" fill="#FF6685" opacity="0.4" />
            <ellipse cx="78" cy="44" rx="6" ry="4" fill="#FF6685" opacity="0.4" />
          </>
        )}

        {/* Mouth */}
        {expr.surprised ? (
          <ellipse cx="50" cy="55" rx="6" ry="8" fill="#30304A" />
        ) : expr.mouth ? (
          <path d={expr.mouth} stroke="#30304A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : null}

        {/* Celebration stars */}
        {expr.stars && (
          <>
            <motion.text x="8" y="25" fontSize="10" fill="#FFB547"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}>✨</motion.text>
            <motion.text x="78" y="20" fontSize="10" fill="#55C7E8"
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>⭐</motion.text>
          </>
        )}

        {/* Thinking bubble */}
        {expression === 'thinking' && (
          <>
            <circle cx="72" cy="18" r="3" fill="white" opacity="0.8" />
            <circle cx="78" cy="12" r="4" fill="white" opacity="0.8" />
            <circle cx="85" cy="6" r="6" fill="white" opacity="0.8" />
            <text x="85" y="9" textAnchor="middle" fontSize="6" fill="#30304A">?</text>
          </>
        )}
      </svg>
    </motion.div>
  )
}

