import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Zap, ChevronRight, RefreshCw, Plus, CheckCircle, Clock, Cpu, XCircle, BookOpen, BookMarked, Upload } from 'lucide-react'
import GameLayout from '../components/layout/GameLayout'
import { LoadingSpinner, EmptyState, DifficultyBadge } from '../components/ui/GameUI'
import Mascot from '../components/mascot/Mascot'
import api from '../services/api'

const statusColors = {
  ready: 'bg-green-game/15 text-green-dark border-green-game/30',
  processing: 'bg-orange-game/15 text-orange-dark border-orange-game/30',
  analyzing: 'bg-sky/15 text-sky-dark border-sky/30',
  failed: 'bg-pink-game/15 text-pink-dark border-pink-game/30',
  pending: 'bg-gray-100 text-gray-500 border-gray-200',
}
const statusIcon = {
  ready: CheckCircle,
  processing: Clock,
  analyzing: Cpu,
  failed: XCircle,
  pending: Clock,
}

function StatusBadge({ status }) {
  const Icon = statusIcon[status] || Clock
  return (
    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-black border flex items-center gap-1 ${statusColors[status] || statusColors.pending}`}>
      <Icon size={10} /> {status}
    </span>
  )
}

function DocumentCard({ doc, onDelete, onSelect }) {
  const bookColors = ['#68764A', '#55C7E8', '#FF6685', '#FFB547', '#75D66B']
  const color = bookColors[(doc?.title?.charCodeAt(0) || 0) % bookColors.length]
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.delete(`/documents/${doc.id}`)
      onDelete(doc.id)
    } catch { setDeleting(false) }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -3 }}
      className="game-card cursor-pointer group relative"
      onClick={() => onSelect(doc)}
    >
      {/* Book cover */}
      <div className="relative h-32 rounded-2xl mb-4 flex items-center justify-center overflow-hidden"
           style={{ background: `${color}18`, border: `2px solid ${color}30` }}>
        <svg width="56" height="72" viewBox="0 0 56 72">
          <rect x="4" y="2" width="48" height="68" rx="5" fill={color} />
          <rect x="7" y="5" width="42" height="62" rx="4" fill="white" opacity="0.12" />
          <rect x="11" y="14" width="28" height="2.5" rx="1.25" fill="white" opacity="0.55" />
          <rect x="11" y="21" width="22" height="2.5" rx="1.25" fill="white" opacity="0.55" />
          <rect x="11" y="28" width="26" height="2.5" rx="1.25" fill="white" opacity="0.55" />
          <rect x="11" y="35" width="18" height="2.5" rx="1.25" fill="white" opacity="0.55" />
          <circle cx="28" cy="56" r="8" fill="white" opacity="0.15" />
        </svg>
        <StatusBadge status={doc.status} />
        {/* Delete btn */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-2 left-2 w-7 h-7 bg-pink-game/90 text-white rounded-lg
                     flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-pink-dark"
        >
          {deleting ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>

      <h3 className="font-black text-navy text-sm line-clamp-2 mb-3">{doc.title}</h3>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="px-2 py-0.5 bg-purple/10 text-purple rounded-lg text-xs font-bold uppercase">{doc.fileType}</span>
        {doc._count?.topics > 0 && (
          <span className="px-2 py-0.5 bg-sky/10 text-sky-dark rounded-lg text-xs font-bold">{doc._count.topics} topics</span>
        )}
        {doc._count?.missions > 0 && (
          <span className="px-2 py-0.5 bg-green-game/10 text-green-dark rounded-lg text-xs font-bold">{doc._count.missions} missions</span>
        )}
      </div>

      {doc.status === 'ready' && (
        <div className="flex items-center gap-1 text-purple text-xs font-bold">
          Generate Quiz <ChevronRight size={12} />
        </div>
      )}
    </motion.div>
  )
}

function DocumentModal({ doc, onClose }) {
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/documents/${doc.id}`).then((r) => setDetail(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [doc.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-game-lg w-full max-w-lg max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-navy">{doc.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-black border flex items-center gap-1 ${statusColors[doc.status]}`}>
                <StatusBadge status={doc.status} />
              </span>
              <span className="text-navy/50 text-xs font-bold uppercase">{doc.fileType}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-navy/40 hover:text-navy text-2xl font-black leading-none">×</button>
        </div>

        {loading ? <LoadingSpinner message="Loading document details…" /> : (
          <>
            {detail?.wordCount && (
              <p className="text-sm font-semibold text-navy/60 mb-4 flex items-center gap-1">
                <BookOpen size={14} /> {detail.wordCount.toLocaleString()} words
                {detail.pageCount && ` · ${detail.pageCount} pages`}
              </p>
            )}

            {detail?.topics?.length > 0 && (
              <div className="mb-5">
                <h3 className="font-black text-navy text-sm mb-3 flex items-center gap-1">
                  <BookMarked size={14} /> Topics Extracted
                </h3>
                <div className="space-y-2">
                  {detail.topics.map((topic) => (
                    <div key={topic.id} className="bg-cream rounded-2xl p-3">
                      <div className="font-bold text-navy text-sm">{topic.name}</div>
                      {topic.description && <div className="text-navy/50 text-xs font-semibold mt-0.5">{topic.description}</div>}
                      {topic.children?.length > 0 && (
                        <div className="mt-2 space-y-1 pl-3 border-l-2 border-purple/30">
                          {topic.children.map((sub) => (
                            <div key={sub.id} className="text-xs font-semibold text-navy/70">• {sub.name}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {doc.status === 'ready' ? (
              <button
                onClick={() => { onClose(); navigate('/quiz-config', { state: { documentId: doc.id, documentTitle: doc.title } }) }}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Zap size={16} /> Generate Quiz from This Document
              </button>
            ) : doc.status === 'processing' || doc.status === 'analyzing' ? (
              <div className="text-center py-4">
                <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-navy/60 font-bold text-sm">AI is analysing your document… please wait.</p>
              </div>
            ) : doc.status === 'failed' ? (
              <p className="text-pink-dark font-bold text-sm text-center flex items-center justify-center gap-1">
                <XCircle size={14} /> Processing failed. Try uploading again.
              </p>
            ) : null}
          </>
        )}
      </motion.div>
    </div>
  )
}

export default function DocumentLibrary() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDoc, setSelectedDoc] = useState(null)

  const fetchDocs = async () => {
    try {
      const { data } = await api.get('/documents')
      setDocuments(data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDocs() }, [])

  // Poll for processing docs
  useEffect(() => {
    const hasProcessing = documents.some((d) => ['processing', 'analyzing'].includes(d.status))
    if (!hasProcessing) return
    const interval = setInterval(fetchDocs, 5000)
    return () => clearInterval(interval)
  }, [documents])

  if (loading) return <GameLayout><LoadingSpinner message="Loading your library…" /></GameLayout>

  return (
    <GameLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-navy flex items-center gap-2">
              <BookOpen size={28} className="text-purple" /> My Library
            </h1>
            <p className="text-navy/60 font-semibold mt-1">{documents.length} document{documents.length !== 1 ? 's' : ''} in your collection</p>
          </div>
          <Link to="/upload">
            <button className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> Upload New
            </button>
          </Link>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Your Library is Empty"
            description="Upload your first study material to begin your learning adventure!"
            action={
              <Link to="/upload">
                <button className="btn-primary flex items-center gap-2"><Upload size={16} /> Upload Material</button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDelete={(id) => setDocuments((d) => d.filter((x) => x.id !== id))}
                  onSelect={setSelectedDoc}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDoc && (
          <DocumentModal doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
        )}
      </AnimatePresence>
    </GameLayout>
  )
}

