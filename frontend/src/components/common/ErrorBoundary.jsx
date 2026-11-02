import React from 'react'
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Corporate ErrorBoundary caught error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">Module Rendering Error</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred while loading this module. Your data and session are secure. You can try refreshing the view or navigating back to the dashboard.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
              >
                <RefreshCw size={15} />
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
              >
                <Home size={15} />
                Go to Dashboard
              </button>
            </div>

            {/* Collapsible Error Trace */}
            <div className="text-left border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {this.state.showDetails ? 'Hide technical details' : 'Show technical details'}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-48 whitespace-pre-wrap">
                  <p className="font-bold text-red-600 mb-1">
                    {this.state.error?.toString()}
                  </p>
                  <p className="text-slate-500">
                    {this.state.errorInfo?.componentStack || this.state.error?.stack}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
