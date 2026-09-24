import { Bell, AlertTriangle, CheckCircle2, ShieldCheck, Trash2, Calendar } from 'lucide-react'

const EXPIRY_ITEMS = [
  {
    name: 'Paracetamol',
    dosage: '500 mg · 20 tablets',
    expiry: 'Aug 17, 2026',
    status: 'Expired',
    tone: 'danger',
    daysRemaining: -38,
    guidance: 'Expired medication may lose efficacy or degrade. Dispose via authorized take-back program.',
  },
  {
    name: 'Cetirizine',
    dosage: '10 mg · 10 tablets',
    expiry: 'Sep 29, 2026',
    status: 'Expiring soon (5 days)',
    tone: 'warning',
    daysRemaining: 5,
    guidance: 'Approaching end of shelf-life. Avoid restocking unnecessary surplus.',
  },
  {
    name: 'First-aid antiseptic',
    dosage: '100 ml solution',
    expiry: 'Nov 04, 2026',
    status: 'Active (41 days)',
    tone: 'active',
    daysRemaining: 41,
    guidance: 'Within safe labeled date window. Keep tightly closed in a cool, dry place.',
  },
]

export default function ExpiryMonitorView({ setNotice }) {
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Inventory Safety Center</p>
          <h1>Expiry Monitor</h1>
          <p className="intro-copy">
            Proactively monitor medicine expiration dates, track shelf-life countdowns, and access safe disposal recommendations.
          </p>
        </div>
        <button
          className="primary-button small"
          onClick={() => setNotice('Disposal checklist exported to local log')}
        >
          <Trash2 size={15} /> Disposal Checklist
        </button>
      </div>

      {/* Summary Metrics */}
      <section className="metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="metric-card accent-coral">
          <p>EXPIRED ITEMS</p>
          <strong>01</strong>
          <small>Dispose immediately</small>
        </div>
        <div className="metric-card accent-orange">
          <p>EXPIRING SOON (&lt;7D)</p>
          <strong>01</strong>
          <small>Plan replacement</small>
        </div>
        <div className="metric-card accent-green">
          <p>ACTIVE SHELF-LIFE</p>
          <strong>01</strong>
          <small>Supplies in good standing</small>
        </div>
        <div className="metric-card accent-blue">
          <p>NEXT AUDIT CYCLE</p>
          <strong>Oct 01</strong>
          <small>Weekly routine check</small>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Left: Detailed Priority Watchlist */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Priority Watchlist</p>
              <h3>Audited Medicine Supplies</h3>
            </div>
            <span className="draft-badge">3 ITEMS LOGGED</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {EXPIRY_ITEMS.map((item) => (
              <div
                key={item.name}
                style={{
                  padding: '14px',
                  borderRadius: '6px',
                  border: `1px solid ${item.tone === 'danger' ? '#fecaca' : item.tone === 'warning' ? '#fde68a' : '#bbf7d0'}`,
                  background: item.tone === 'danger' ? '#fef2f2' : item.tone === 'warning' ? '#fffbeb' : '#f0fdf4',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '13px' }}>{item.name}</strong>
                  <span className={`status-pill ${item.tone}`}>{item.status}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                  <span>{item.dosage}</span> · <span>Date: {item.expiry}</span>
                </div>
                <p style={{ margin: 0, fontSize: '10.5px', color: '#475569', lineHeight: '1.45' }}>
                  {item.guidance}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Safe Pharmaceutical Disposal Protocols */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Official Guidance</p>
              <h3>Safe Medicine Disposal</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#55635a' }}>
            <div style={{ padding: '10px', background: '#f7f9f5', borderRadius: '4px', border: '1px solid #edf0ec' }}>
              <strong style={{ display: 'block', color: '#1b2521', marginBottom: '4px' }}>1. Medicine Take-Back Programs</strong>
              <span>The best way to dispose of most types of unused or expired medicines is to drop off the medicine at an authorized take-back location.</span>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', borderRadius: '4px', border: '1px solid #edf0ec' }}>
              <strong style={{ display: 'block', color: '#1b2521', marginBottom: '4px' }}>2. Household Trash (If no take-back available)</strong>
              <span>Mix medicines (do not crush tablets or capsules) with an unpalatable substance such as dirt, cat litter, or used coffee grounds in a sealed plastic bag.</span>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', borderRadius: '4px', border: '1px solid #edf0ec' }}>
              <strong style={{ display: 'block', color: '#1b2521', marginBottom: '4px' }}>3. Do Not Flush</strong>
              <span>Never pour medicines down the drain or flush them down the toilet unless explicitly instructed on the package label.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <ShieldCheck size={18} />
        <p>
          <strong>Organizational Reminder Only</strong> Expiration statuses recorded in Aegis are organizational aids based on user-entered dates. Always inspect packaging and speak to a pharmacist before discarding or using any medical supply.
        </p>
      </div>
    </div>
  )
}
