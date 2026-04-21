import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#0d0d14] px-6 text-slate-200">
          <div className="w-full max-w-lg rounded-3xl border border-white/[0.08] bg-[#0f0f1a] p-8 text-center shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-300">Demo Mode</p>
            <h1 className="mt-4 text-2xl font-semibold text-white">The page is taking a moment to recover</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              The site shell is still working. Please refresh once, or open another section while the demo data reconnects.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
