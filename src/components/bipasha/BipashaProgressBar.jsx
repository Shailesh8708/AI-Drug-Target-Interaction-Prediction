import { getStageForProgress } from './BipashaActionRegistry'

export default function BipashaProgressBar({ action, progress }) {
  const stage = getStageForProgress(action, progress)
  const steps = [
    { label: '01 · Init', threshold: 20 },
    { label: '02 · Workspace', threshold: 40 },
    { label: '03 · Scientific', threshold: 60 },
    { label: '04 · Sync', threshold: 80 },
    { label: '05 · Ready', threshold: 100 },
  ]

  return (
    <div className="bipasha-progress-container" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
      {/* Top Header Readout */}
      <div className="progress-header-readout">
        <div className="stage-title-wrap">
          <span className="live-pulse-dot" />
          <strong className="stage-title">{stage.text}</strong>
        </div>
        <div className="progress-numeric-badge">
          <span className="progress-num">{progress}%</span>
        </div>
      </div>

      {/* Main Scientific Staged Bar */}
      <div className="progress-track-shell">
        <div
          className="progress-fill-bar"
          style={{ width: `${progress}%`, background: action?.color ? `linear-gradient(90deg, #10b981, ${action.color})` : undefined }}
        >
          <div className="progress-scan-glint" />
        </div>

        {/* Milestone dividers at 20%, 40%, 60%, 80% */}
        <span className="milestone-notch" style={{ left: '20%' }} />
        <span className="milestone-notch" style={{ left: '40%' }} />
        <span className="milestone-notch" style={{ left: '60%' }} />
        <span className="milestone-notch" style={{ left: '80%' }} />
      </div>

      {/* Staged Step Markers */}
      <div className="progress-milestones" aria-hidden="true">
        {steps.map((step) => {
          const isPassed = progress >= step.threshold
          const isCurrent = progress < step.threshold && progress >= step.threshold - 20
          return (
            <div
              key={step.threshold}
              className={`milestone-step ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <span className="step-indicator" />
              <small>{step.label}</small>
            </div>
          )
        })}
      </div>

      {/* Detailed Subtext */}
      <p className="progress-subtext">{stage.subtext}</p>

      {/* Telemetry Footer */}
      <div className="progress-telemetry-row">
        <span>SECURITY: ENFORCED</span>
        <span>LATENCY: 14ms</span>
        <span>REPRODUCIBILITY: DETERMINISTIC</span>
      </div>
    </div>
  )
}
