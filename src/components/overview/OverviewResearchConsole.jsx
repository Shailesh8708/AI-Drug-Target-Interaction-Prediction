import {
  Activity,
  ArrowUpRight,
  Bell,
  BrainCircuit,
  ChevronRight,
  FlaskConical,
  Package,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'

const medicineRows = [
  { name: 'Cetirizine', detail: '10 mg · Personal', expiry: 'Sep 29, 2026', status: 'Expiring soon', tone: 'warning' },
  { name: 'First-aid antiseptic', detail: '100 ml · Wound care', expiry: 'Nov 04, 2026', status: 'Active', tone: 'active' },
  { name: 'Paracetamol', detail: '500 mg · Pain / fever', expiry: 'Aug 17, 2026', status: 'Expired', tone: 'danger' },
]

export default function OverviewResearchConsole({ navigate, setNotice }) {
  return (
    <section className="cinematic-chapter-section console-section-wrapper" id="research-console-section">
      <div className="chapter-inner-content">
        {/* Preserved Page Intro & Greeting */}
        <div className="console-intro-banner">
          <div className="intro-badge-row">
            <span className="console-eyebrow">Tuesday · 22 September 2026</span>
            <div className="console-status-pill">
              <span className="live-pulse-dot" />
              <span>WORKSPACE ACTIVE</span>
            </div>
          </div>

          <div className="console-hero-heading-row">
            <div>
              <h2 className="console-main-greeting">Good morning, researcher.</h2>
              <p className="console-subgreeting">Your workspace is ready for the next question.</p>
            </div>
            <button
              className="cinematic-btn secondary-ghost-btn small-btn"
              onClick={() => navigate('biostructure')}
              aria-label="Explore BioStructure Hub"
            >
              <span>Explore BioStructure Hub</span>
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Section Heading & Workspace Pulse */}
        <div className="console-pulse-header">
          <div>
            <p className="console-eyebrow">At a glance</p>
            <h3 className="pulse-title">Workspace pulse & active telemetry</h3>
          </div>
          <button
            className="sync-status-btn"
            onClick={() => setNotice('Dashboard data is local demo state for Phase 1')}
            aria-label="Check sync status"
          >
            <Activity size={14} className="sync-icon" />
            <span>Last synced just now</span>
          </button>
        </div>

        {/* Preserved Metrics Grid */}
        <div className="console-metrics-grid">
          <ConsoleMetricCard
            icon={Target}
            label="Prediction studies"
            value="12"
            detail="This workspace"
            accent="coral"
          />
          <ConsoleMetricCard
            icon={Package}
            label="Active medicines"
            value="18"
            detail="Across your cabinet"
            accent="green"
          />
          <ConsoleMetricCard
            icon={Bell}
            label="Expiry watch"
            value="03"
            detail="Needs attention"
            accent="orange"
          />
          <ConsoleMetricCard
            icon={BrainCircuit}
            label="Model registry"
            value="—"
            detail="No trained models yet"
            accent="blue"
          />
        </div>

        {/* Preserved Dashboard Grid (Medicine Safety Center + Lab Notebook) */}
        <div className="console-dashboard-grid">
          {/* Medicine Safety Center */}
          <div className="console-panel medicine-safety-panel">
            <div className="panel-header-row">
              <div>
                <p className="console-eyebrow">Medicine safety center</p>
                <h4 className="panel-title">Expiry watchlist</h4>
              </div>
              <button
                className="panel-link-btn"
                onClick={() => navigate('medicines')}
                aria-label="View medicine cabinet"
              >
                <span>View cabinet</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="medicine-table-list">
              {medicineRows.map((row) => (
                <div className="console-medicine-row" key={row.name}>
                  <div className="medicine-avatar">
                    <Package size={15} />
                  </div>
                  <div className="medicine-info-col">
                    <strong>{row.name}</strong>
                    <small>{row.detail}</small>
                  </div>
                  <div className="medicine-expiry-col">
                    <small>Expiry</small>
                    <strong>{row.expiry}</strong>
                  </div>
                  <div className="medicine-status-col">
                    <span className={`status-pill ${row.tone}`}>{row.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="panel-safety-note">
              <ShieldCheck size={15} className="safety-icon" />
              <span>
                Expiry status is an organizational reminder, not a safety determination.
                Follow official disposal guidance.
              </span>
            </div>
          </div>

          {/* Lab Notebook / Recent Activity */}
          <div className="console-panel activity-notebook-panel">
            <div className="panel-header-row">
              <div>
                <p className="console-eyebrow">Recent activity</p>
                <h4 className="panel-title">Lab notebook</h4>
              </div>
              <button
                className="icon-only-btn"
                onClick={() => navigate('analytics')}
                aria-label="Open analytics"
              >
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="console-activity-list">
              <ConsoleActivityItem
                icon={FlaskConical}
                title="DTI Lab opened"
                time="Today, 09:42"
                color="coral"
                onClick={() => navigate('dti')}
              />
              <ConsoleActivityItem
                icon={Package}
                title="Medicine cabinet reviewed"
                time="Yesterday, 18:16"
                color="green"
                onClick={() => navigate('medicines')}
              />
              <ConsoleActivityItem
                icon={Sparkles}
                title="Workspace initialized"
                time="Sep 20, 14:03"
                color="blue"
                onClick={() => navigate('research')}
              />
            </div>

            <div className="console-empty-note">
              Your trained model activity will appear here once the ML pipeline is connected.
            </div>
          </div>
        </div>

        {/* Preserved Medical Disclaimer */}
        <div className="console-disclaimer-card">
          <ShieldCheck size={18} className="disclaimer-shield" />
          <p>
            <strong>Research and organization tool</strong> — Aegis does not diagnose,
            prescribe, adjust doses, or confirm biological interactions. Always verify
            medication instructions with a qualified healthcare professional.
          </p>
        </div>
      </div>
    </section>
  )
}

function ConsoleMetricCard({ icon: Icon, label, value, detail, accent }) {
  return (
    <div className={`console-metric-card accent-${accent}`}>
      <div className="metric-header-row">
        <span className="metric-label">{label}</span>
        <div className="metric-icon-bubble">
          <Icon size={16} />
        </div>
      </div>
      <div className="metric-value-display">{value}</div>
      <div className="metric-detail-text">{detail}</div>
    </div>
  )
}

function ConsoleActivityItem({ icon: Icon, title, time, color, onClick }) {
  return (
    <div className="console-activity-item" onClick={onClick} role="button" tabIndex={0}>
      <div className={`activity-icon-wrap ${color}`}>
        <Icon size={15} />
      </div>
      <div className="activity-info-wrap">
        <strong>{title}</strong>
        <small>{time}</small>
      </div>
      <ChevronRight size={14} className="activity-chevron" />
    </div>
  )
}

