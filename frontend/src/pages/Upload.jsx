import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle, XCircle, Loader, Trash2, AlertCircle, FileType2, Presentation, AlignLeft, List } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'

const ALLOWED = ['pdf', 'docx', 'pptx', 'txt']

const FILE_TYPE_COLORS = { pdf: '#FF6685', docx: '#68764A', pptx: '#FFB547', txt: '#75D66B' }
const FILE_TYPE_ICONS = { pdf: FileText, docx: FileType2, pptx: Presentation, txt: AlignLeft }

function FileIcon({ type }) {
  const color = FILE_TYPE_COLORS[type] || '#68764A'
  const Icon = FILE_TYPE_ICONS[type] || FileText
  return (
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
         style={{ background: `${color}18`, border: `2px solid ${color}40` }}>
      <Icon size={32} style={{ color }} />
    </div>
  )
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [uploadState, setUploadState] = useState('idle') // idle | uploading | success | error
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [mascotExpr, setMascotExpr] = useState('thinking')

  const validateFile = (f) => {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!ALLOWED.includes(ext)) return `Unsupported file type. Use: ${ALLOWED.join(', ')}`
    if (f.size > 50 * 1024 * 1024) return 'File too large. Maximum size is 50MB.'
    return null
  }

  const handleFile = (f) => {
    const err = validateFile(f)
    if (err) { setErrorMsg(err); setMascotExpr('disappointed'); return }
    setFile(f)
    setErrorMsg('')
    setMascotExpr('happy')
    setUploadState('idle')
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const onFileInput = (e) => {
    const f = e.target.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploadState('uploading')
    setProgress(0)
    setMascotExpr('thinking')

    const formData = new FormData()
    formData.append('file', file)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 85) { clearInterval(progressInterval); return p }
          return p + 10
        })
      }, 300)

      await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      clearInterval(progressInterval)
      setProgress(100)
      setUploadState('success')
      setMascotExpr('celebrating')

      setTimeout(() => navigate('/library'), 2000)
    } catch (err) {
      setUploadState('error')
      setMascotExpr('disappointed')
      setErrorMsg(err.response?.data?.error || 'Upload failed. Please try again.')
    }
  }

  return (
    <GameLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-black text-navy flex items-center gap-2">
            <Upload size={28} className="text-purple" /> Upload Study Material
          </h1>
          <p className="text-navy/60 font-semibold mt-1">Drop your file and let AI transform it into an adventure!</p>
        </div>

        {/* Mascot panel */}
        <div className="game-card flex items-center gap-4">
          <Mascot expression={mascotExpr} size={70} />
          <div>
            {uploadState === 'idle' && !file && <p className="font-bold text-navy">Drop your PDF, DOCX, PPTX, or TXT and I'll work my magic!</p>}
            {uploadState === 'idle' && file && <p className="font-bold text-navy">Great choice! Click <strong>Upload</strong> when you're ready. I'll analyse it for you!</p>}
            {uploadState === 'uploading' && <p className="font-bold text-navy">Uploading and processing your file… this takes a moment!</p>}
            {uploadState === 'success' && <p className="font-bold text-green-dark">Awesome! Your document is being analysed. Redirecting to library…</p>}
            {uploadState === 'error' && <p className="font-bold text-pink-dark">Oops! Something went wrong. Try again?</p>}
          </div>
        </div>

        {/* Drop zone */}
        <motion.div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          animate={{ scale: dragging ? 1.02 : 1 }}
          className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all
            ${dragging ? 'border-purple bg-purple/5' : 'border-gray-300 bg-white hover:border-purple/50 hover:bg-purple/5'}`}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input id="fileInput" type="file" accept=".pdf,.docx,.pptx,.txt" onChange={onFileInput} className="hidden" />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-20 h-20 rounded-3xl bg-purple/10 flex items-center justify-center mx-auto mb-4">
                  <Upload size={36} className="text-purple" />
                </div>
                <h3 className="text-xl font-black text-navy mb-2">Drop your file here</h3>
                <p className="text-navy/60 font-semibold mb-4">or click to browse</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {ALLOWED.map((ext) => (
                    <span key={ext} className="px-3 py-1 bg-purple/10 text-purple rounded-xl font-bold text-sm uppercase">
                      .{ext}
                    </span>
                  ))}
                </div>
                <p className="text-navy/40 text-xs font-semibold mt-3">Maximum file size: 50MB</p>
              </motion.div>
            ) : (
              <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <FileIcon type={file.name.split('.').pop().toLowerCase()} />
                <h3 className="text-lg font-black text-navy mt-3 mb-1">{file.name}</h3>
                <p className="text-navy/50 font-semibold text-sm">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                  · {file.name.split('.').pop().toUpperCase()}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setUploadState('idle'); setMascotExpr('thinking') }}
                  className="mt-3 text-pink-dark text-sm font-bold hover:underline flex items-center gap-1 mx-auto"
                >
                  <Trash2 size={14} /> Remove file
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-pink-game/10 border-2 border-pink-game/40 text-pink-dark rounded-2xl px-4 py-3 font-bold text-sm"
          >
            {errorMsg}
          </motion.div>
        )}

        {/* Upload progress */}
        {uploadState === 'uploading' && (
          <div>
            <div className="flex justify-between text-sm font-bold text-navy/60 mb-2">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-purple to-sky rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Upload button */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleUpload}
            disabled={!file || uploadState === 'uploading' || uploadState === 'success'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex-1 py-4 text-base flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadState === 'uploading' ? (
              <><Loader size={18} className="animate-spin" /> Uploading…</>
            ) : uploadState === 'success' ? (
              <><CheckCircle size={18} /> Upload Complete!</>
            ) : (
              <><Upload size={18} /> Upload & Analyse</>
            )}
          </motion.button>

          <motion.button
            onClick={() => navigate('/library')}
            whileHover={{ scale: 1.02 }}
            className="btn-secondary px-6"
          >
            My Library
          </motion.button>
        </div>

        {/* Format guide */}
        <div className="game-card">
          <h3 className="font-black text-navy mb-3 text-sm flex items-center gap-2">
            <List size={16} className="text-purple" /> Supported Formats
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { ext: 'PDF', color: '#FF6685', Icon: FileText, desc: 'Adobe PDF documents' },
              { ext: 'DOCX', color: '#68764A', Icon: FileType2, desc: 'Microsoft Word files' },
              { ext: 'PPTX', color: '#FFB547', Icon: Presentation, desc: 'PowerPoint presentations' },
              { ext: 'TXT', color: '#75D66B', Icon: AlignLeft, desc: 'Plain text files' },
            ].map(({ ext, color, Icon, desc }) => (
              <div key={ext} className="flex items-center gap-3 p-3 bg-cream rounded-2xl">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{ background: `${color}18`, border: `1.5px solid ${color}40` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div className="font-black text-navy text-sm">.{ext}</div>
                  <div className="text-navy/50 font-semibold text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  )
}

