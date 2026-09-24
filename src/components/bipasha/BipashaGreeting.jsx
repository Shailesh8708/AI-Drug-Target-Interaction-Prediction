import { getContextualGreeting } from './BipashaActionRegistry'
import { useBipasha } from './BipashaContext'
import { Sparkles, ArrowRight } from 'lucide-react'

export default function BipashaGreeting() {
  const { activePage, executeAction, sendChatMessage } = useBipasha()
  const contextData = getContextualGreeting(activePage)

  const handleChipClick = (action) => {
    if (action.actionId) {
      executeAction(action.actionId)
    } else if (action.query) {
      sendChatMessage(action.query)
    }
  }

  return (
    <div className="bipasha-greeting-card">
      <div className="greeting-header">
        <div className="greeting-avatar">
          <span className="avatar-pulse" />
          <span className="avatar-core" />
        </div>
        <div className="greeting-identity">
          <div className="greeting-eyebrow">
            <span className="pulse-dot-green" />
            <span>CONTEXT // {activePage.toUpperCase()}</span>
          </div>
          <h4 className="greeting-title">{contextData.greeting}</h4>
        </div>
      </div>

      <p className="greeting-subtext">{contextData.subtext}</p>

      {/* Suggested Quick Context Actions */}
      {contextData.quickActions && contextData.quickActions.length > 0 && (
        <div className="greeting-quick-actions">
          <span className="quick-label">
            <Sparkles size={11} /> Suggested:
          </span>
          <div className="quick-chips-row">
            {contextData.quickActions.map((action, idx) => (
              <button
                key={idx}
                type="button"
                className="context-quick-chip"
                onClick={() => handleChipClick(action)}
              >
                <span>{action.label}</span>
                <ArrowRight size={11} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
