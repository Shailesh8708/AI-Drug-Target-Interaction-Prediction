import { BIPASHA_ACTIONS } from './BipashaActionRegistry'
import { useBipasha } from './BipashaContext'
import {
  FlaskConical,
  Atom,
  Pill,
  Target,
  Package,
  Bell,
  CalendarDays,
  Bot,
  Activity,
  BrainCircuit,
  ArrowUpRight,
} from 'lucide-react'

const ICON_MAP = {
  FlaskConical,
  Atom,
  Pill,
  Target,
  Package,
  Bell,
  CalendarDays,
  Bot,
  Activity,
  BrainCircuit,
}

export default function BipashaFeatureGrid() {
  const { executeAction, activePage } = useBipasha()

  const categories = [
    { title: 'Discovery & Computational Chemistry', filter: 'Discovery' },
    { title: 'Healthcare & Patient Organization', filter: 'Healthcare' },
    { title: 'Intelligence & Observatory', filter: 'Intelligence' },
  ]

  return (
    <div className="bipasha-feature-grid-wrapper">
      <div className="feature-grid-header">
        <span className="grid-label">MODULE LAUNCHER & ORCHESTRATION</span>
        <span className="grid-count">10 CONNECTED SERVICES</span>
      </div>

      {categories.map((cat) => {
        const actions = BIPASHA_ACTIONS.filter((a) => a.category === cat.filter)
        return (
          <div key={cat.title} className="category-section">
            <h5 className="category-title">{cat.title}</h5>
            <div className="actions-subgrid">
              {actions.map((action) => {
                const IconComponent = ICON_MAP[action.iconName] || FlaskConical
                const isActive = activePage === action.route

                return (
                  <button
                    key={action.id}
                    type="button"
                    className={`bipasha-action-card ${isActive ? 'is-active' : ''}`}
                    onClick={() => executeAction(action.id)}
                    aria-label={`Open ${action.label}`}
                    style={{ '--accent-color': action.color }}
                  >
                    <div className="card-top-meta">
                      <div className="card-icon-bubble">
                        <IconComponent size={16} />
                      </div>
                      <span className="card-badge">{action.badge}</span>
                      <ArrowUpRight size={13} className="hover-arrow" />
                    </div>

                    <strong className="card-label">{action.label}</strong>
                    <p className="card-description">{action.description}</p>

                    {isActive && <span className="active-glow-pip" title="Currently viewing this module" />}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
