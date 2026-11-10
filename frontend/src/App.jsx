import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ErrorBoundary from './components/layout/ErrorBoundary'

import LandingPage from './pages/Landing'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import Dashboard from './pages/Dashboard'
import UploadPage from './pages/Upload'
import DocumentLibrary from './pages/DocumentLibrary'
import QuizConfig from './pages/QuizConfig'
import QuizArena from './pages/QuizArena'
import ResultsPage from './pages/Results'
import MissionsPage from './pages/Missions'
import Leaderboard from './pages/Leaderboard'
import RevisionCentre from './pages/RevisionCentre'
import ProfilePage from './pages/Profile'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><DocumentLibrary /></ProtectedRoute>} />
        <Route path="/library/:id" element={<ProtectedRoute><DocumentLibrary /></ProtectedRoute>} />
        <Route path="/quiz-config" element={<ProtectedRoute><QuizConfig /></ProtectedRoute>} />
        <Route path="/quiz-arena" element={<ProtectedRoute><QuizArena /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/missions" element={<ProtectedRoute><MissionsPage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/revision" element={<ProtectedRoute><RevisionCentre /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
  )
}
