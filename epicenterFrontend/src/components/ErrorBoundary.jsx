import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    this.setState({ info })
    // Still logs to console too, for anyone who prefers dev tools
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0d14', color: '#fff', padding: 32, fontFamily: 'monospace' }}>
          <h1 style={{ color: '#f87171', fontSize: 20, marginBottom: 12 }}>Something broke</h1>
          <p style={{ color: '#fca5a5', marginBottom: 16, fontSize: 14 }}>
            Copy everything below and send it back \u2014 this is the real error, not the generic React message.
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#12151d', padding: 16, borderRadius: 8, fontSize: 12.5, lineHeight: 1.6, overflow: 'auto' }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
            {this.state.info?.componentStack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 20, padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}