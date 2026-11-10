import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-purple/15 border-2 border-purple/30 flex items-center justify-center mb-4">
            <span className="text-3xl font-black text-purple">!</span>
          </div>
          <h2 className="text-2xl font-black text-navy mb-2">Something went sideways!</h2>
          <p className="text-navy/60 font-semibold max-w-md mb-6 text-sm">
            {this.state.error?.message || 'An unexpected glitch happened in this area of the arena.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.href = '/dashboard' }}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Reload Arena
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

