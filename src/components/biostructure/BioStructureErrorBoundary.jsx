import React from 'react'
import { AlertCircle, RefreshCw, Layers } from 'lucide-react'

/**
 * BioStructureErrorBoundary.jsx
 * Research-grade React Error Boundary protecting the BioStructure Intelligence Hub
 * from unhandled WebGL, Three.js, geometry parsing, or rendering runtime crashes.
 */
export default class BioStructureErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('BioStructure 3D Visualization caught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="viewer-context-lost-overlay" style={{ minHeight: '420px', padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', textAlign: 'center', maxWidth: '520px' }}>
            <AlertCircle size={36} className="text-amber-400" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              {this.props.title || '3D Molecular Visualization Paused'}
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {this.props.description || 'The 3D WebGL renderer encountered an unexpected coordinate or GPU state:'}
            </p>
            <code style={{ padding: '0.5rem 0.75rem', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '6px', fontSize: '0.75rem', color: '#f43f5e', wordBreak: 'break-word', maxWidth: '100%' }}>
              {this.state.error?.message || 'Rendering exception'}
            </code>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              The rest of the workspace remains fully functional. You can reload or inspect sequence biophysics and binding pockets below.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="preset-btn active"
                onClick={this.handleReset}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshCw size={14} /> {this.props.buttonText || 'Restore 3D View'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

