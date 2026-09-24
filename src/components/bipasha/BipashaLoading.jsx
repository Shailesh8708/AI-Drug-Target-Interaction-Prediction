import { useBipasha } from './BipashaContext'
import BipashaMolecularAnimation from './BipashaMolecularAnimation'
import BipashaProgressBar from './BipashaProgressBar'
import { FastForward, X, ShieldCheck } from 'lucide-react'

export default function BipashaLoading() {
  const { activeLoadingAction, loadingProgress, skipLoading, cancelLoading } = useBipasha()

  if (!activeLoadingAction) return null

  return (
    <div
      className="bipasha-loading-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Preparing ${activeLoadingAction.label}`}
    >
      <div className="bipasha-loading-card">
        {/* Top Laboratory Barcode & Header */}
        <div className="loading-card-topbar">
          <div className="agent-identity">
            <div className="loading-mini-orb" aria-hidden="true" />
            <div>
              <strong>Bipasha Mam</strong>
              <small>Autonomous Navigation Orchestrator</small>
            </div>
          </div>
          <div className="loading-action-badge">
            <span className="badge-tag">{activeLoadingAction.category}</span>
            <span className="badge-name">{activeLoadingAction.label}</span>
          </div>
        </div>

        {/* Cinematic Domain-Specific Scientific Animation */}
        <div className="loading-animation-stage">
          <BipashaMolecularAnimation
            animationType={activeLoadingAction.animationType}
            progress={loadingProgress}
          />
        </div>

        {/* Staged Scientific Progress Bar */}
        <BipashaProgressBar
          action={activeLoadingAction}
          progress={loadingProgress}
        />

        {/* Actions & Controls */}
        <div className="loading-controls-row">
          <button
            type="button"
            className="loading-cancel-btn"
            onClick={cancelLoading}
            aria-label="Cancel transition"
          >
            <X size={14} />
            <span>Cancel</span>
          </button>

          <div className="safety-guarantee-note">
            <ShieldCheck size={13} />
            <span>Computational estimate sandbox · Non-diagnostic</span>
          </div>

          <button
            type="button"
            className="loading-skip-btn"
            onClick={skipLoading}
            title="Fast forward to workspace"
            aria-label="Skip loading animation"
          >
            <span>Skip transition</span>
            <FastForward size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
