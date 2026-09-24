import { useEffect, useState } from 'react'
import {
  Activity, ArrowUpRight, Atom, Bell, Bot, BrainCircuit, CalendarDays, ChevronRight,
  CircleHelp, FlaskConical, LayoutDashboard, Menu, Package, Pill, Search, Settings2,
  ShieldCheck, Sparkles, Target, Wand2, X,
} from 'lucide-react'
import MoleculeScene from './components/MoleculeScene'
import { getHealth } from './services/api'
import BipashaAgent from './components/bipasha/BipashaAgent'
import { BipashaProvider } from './components/bipasha/BipashaContext'
import './components/bipasha/bipasha.css'

import MoleculeLabView from './components/views/MoleculeLabView'
import VisualizeCompoundView from './components/views/VisualizeCompoundView'
import MolecularProteinStudioView from './components/views/MolecularProteinStudioView'
import DrugAnalysisView from './components/views/DrugAnalysisView'
import TargetAnalysisView from './components/views/TargetAnalysisView'
import ExpiryMonitorView from './components/views/ExpiryMonitorView'
import ResearchHubView from './components/views/ResearchHubView'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'dti', label: 'DTI Lab', icon: FlaskConical, tag: 'Research' },
  { id: 'molecules', label: 'Molecule Lab', icon: Atom, tag: '3D' },
  { id: 'visualize', label: 'Visualize Compound', icon: Atom, tag: 'New' },
  { id: 'studio', label: 'Molecular Studio', icon: Wand2, tag: 'Build' },
  { id: 'drugs', label: 'Drug Analysis', icon: Pill },
  { id: 'targets', label: 'Target Analysis', icon: Target },
  { id: 'medicines', label: 'Medicine cabinet', icon: Package },
  { id: 'expiry', label: 'Expiry monitor', icon: Bell, tag: 'Alerts' },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'assistant', label: 'AI assistant', icon: Bot },
  { id: 'analytics', label: 'Analytics', icon: Activity },
  { id: 'research', label: 'Research Hub', icon: BrainCircuit, tag: 'Docs' },
]

const medicineRows = [
  { name: 'Cetirizine', detail: '10 mg · Personal', expiry: 'Sep 29, 2026', status: 'Expiring soon', tone: 'warning' },
  { name: 'First-aid antiseptic', detail: '100 ml · Wound care', expiry: 'Nov 04, 2026', status: 'Active', tone: 'active' },
  { name: 'Paracetamol', detail: '500 mg · Pain / fever', expiry: 'Aug 17, 2026', status: 'Expired', tone: 'danger' },
]

function App() {
  const [activePage, setActivePage] = useState('overview')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notice, setNotice] = useState(null)
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    let mounted = true
    getHealth()
      .then(() => mounted && setApiStatus('connected'))
      .catch(() => mounted && setApiStatus('offline'))
    return () => { mounted = false }
  }, [])

  const navigate = (page) => {
    setActivePage(page)
    setMobileNavOpen(false)
  }

  const page = navItems.find((item) => item.id === activePage) ?? navItems[0]

  return (
    <BipashaProvider activePage={activePage} navigate={navigate} setNotice={setNotice}>
      <div className="app-shell">
        <aside className={`sidebar ${mobileNavOpen ? 'is-open' : ''}`}>
          <div className="brand-lockup">
            <div className="brand-mark"><span /><span /><span /></div>
            <div><strong>AEGIS</strong><small>MOLECULAR LAB</small></div>
            <button className="icon-button mobile-close" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation"><X size={18} /></button>
          </div>
          <div className="workspace-switcher"><div className="workspace-dot" /><div><small>WORKSPACE</small><strong>Research / default</strong></div><ChevronRight size={15} /></div>
          <nav className="primary-nav" aria-label="Primary navigation">
            <p className="nav-label">Workspace</p>
            {navItems.map(({ id, label, icon: Icon, tag }) => (
              <button className={`nav-item ${activePage === id ? 'active' : ''}`} key={id} onClick={() => navigate(id)}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>{tag && <em>{tag}</em>}
              </button>
            ))}
          </nav>
          <div className="sidebar-foot">
            <div className="system-status"><span className={`status-dot ${apiStatus}`} /><div><small>SYSTEM STATUS</small><strong>{apiStatus === 'connected' ? 'API connected' : apiStatus === 'offline' ? 'API offline' : 'Connecting to API'}</strong></div></div>
            <button className="nav-item" onClick={() => navigate('research')}><Settings2 size={17} /><span>Settings</span></button>
            <button className="nav-item" onClick={() => navigate('research')}><CircleHelp size={17} /><span>Documentation</span></button>
            <div className="profile-chip"><div className="avatar">SR</div><div><strong>Student Researcher</strong><small>Local workspace</small></div><ChevronRight size={15} /></div>
          </div>
        </aside>
        {mobileNavOpen && <button className="sidebar-scrim" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation overlay" />}

        <main className="main-content">
          <header className="topbar">
            <button className="icon-button mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div className="breadcrumb"><span>AEGIS LAB</span><ChevronRight size={14} /><strong>{page.label}</strong></div>
            <div className="topbar-actions"><div className="search-box"><Search size={16} /><input aria-label="Search workspace" placeholder="Search workspace" /></div><button className="icon-button notification-button" onClick={() => setNotice('You are all caught up')} aria-label="View notifications"><Bell size={18} /><span /></button><div className="top-avatar">SR</div></div>
          </header>
          {notice && <div className="toast" role="status"><ShieldCheck size={17} /><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={14} /></button></div>}

          {/* Page Routing */}
          {activePage === 'overview' && <Dashboard navigate={navigate} setNotice={setNotice} />}
          {activePage === 'dti' && <DtiLab setNotice={setNotice} />}
          {activePage === 'molecules' && <MoleculeLabView setNotice={setNotice} />}
          {activePage === 'visualize' && <VisualizeCompoundView setNotice={setNotice} />}
          {activePage === 'studio' && <MolecularProteinStudioView setNotice={setNotice} navigate={navigate} />}
          {activePage === 'drugs' && <DrugAnalysisView setNotice={setNotice} />}
          {activePage === 'targets' && <TargetAnalysisView setNotice={setNotice} />}
          {activePage === 'medicines' && <Medicines setNotice={setNotice} />}
          {activePage === 'expiry' && <ExpiryMonitorView setNotice={setNotice} />}
          {activePage === 'schedule' && <Schedule setNotice={setNotice} />}
          {activePage === 'assistant' && <Assistant />}
          {activePage === 'analytics' && <Analytics />}
          {activePage === 'research' && <ResearchHubView setNotice={setNotice} />}
        </main>

        {/* Persistent 3D AI Agent "Bipasha Mam" */}
        <BipashaAgent />
      </div>
    </BipashaProvider>
  )
}

function PageIntro({ eyebrow, title, children, action }) {
  return <div className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children && <p className="intro-copy">{children}</p>}</div>{action}</div>
}

function Dashboard({ navigate, setNotice }) {
  return <div className="page-wrap">
    <PageIntro eyebrow="Tuesday · 22 September 2026" title="Good morning, researcher."><span>Your workspace is ready for the next question.</span><button className="text-action" onClick={() => navigate('dti')}>Open DTI Lab <ArrowUpRight size={15} /></button></PageIntro>
    <section className="hero-panel">
      <div className="hero-copy"><div className="signal-line"><span className="pulse-dot" /> RESEARCH ENVIRONMENT · PHASE 01</div><h2>Where molecular<br /><i>questions become</i> signals.</h2><p>Aegis brings computational biology and everyday medicine management into one clear, research-ready workspace.</p><button className="primary-button" onClick={() => navigate('dti')}><FlaskConical size={16} /> Start a prediction study <ArrowUpRight size={15} /></button></div>
      <MoleculeScene />
      <div className="hero-foot"><span><span className="mini-dot green" /> Molecular processing layer</span><span><span className="mini-dot blue" /> Model registry standby</span><span><span className="mini-dot orange" /> 3 safety alerts</span></div>
    </section>
    <div className="section-heading"><div><p className="eyebrow">At a glance</p><h2>Workspace pulse</h2></div><button className="quiet-button" onClick={() => setNotice('Dashboard data is local demo state for Phase 1')}>Last synced just now <Activity size={14} /></button></div>
    <section className="metrics-grid"><Metric icon={Target} label="Prediction studies" value="12" detail="This workspace" accent="coral" /><Metric icon={Package} label="Active medicines" value="18" detail="Across your cabinet" accent="green" /><Metric icon={Bell} label="Expiry watch" value="03" detail="Needs attention" accent="orange" /><Metric icon={BrainCircuit} label="Model registry" value="—" detail="No trained models yet" accent="blue" /></section>
    <section className="dashboard-grid"><div className="content-panel medicine-panel"><div className="panel-heading"><div><p className="eyebrow">Medicine safety center</p><h3>Expiry watchlist</h3></div><button className="icon-link" onClick={() => navigate('medicines')}>View cabinet <ArrowUpRight size={15} /></button></div><div className="medicine-list">{medicineRows.map((row) => <MedicineRow key={row.name} {...row} />)}</div><div className="panel-note"><ShieldCheck size={15} /><span>Expiry status is an organizational reminder, not a safety determination. Follow official disposal guidance.</span></div></div><div className="content-panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">Recent activity</p><h3>Lab notebook</h3></div><button className="icon-button" onClick={() => navigate('analytics')} aria-label="Open analytics"><ArrowUpRight size={17} /></button></div><div className="activity-list"><ActivityItem icon={FlaskConical} title="DTI Lab opened" time="Today, 09:42" color="coral" /><ActivityItem icon={Package} title="Medicine cabinet reviewed" time="Yesterday, 18:16" color="green" /><ActivityItem icon={Sparkles} title="Workspace initialized" time="Sep 20, 14:03" color="blue" /></div><div className="empty-note">Your trained model activity will appear here once the ML pipeline is connected.</div></div></section>
    <div className="disclaimer"><ShieldCheck size={18} /><p><strong>Research and organization tool</strong> Aegis does not diagnose, prescribe, adjust doses, or confirm biological interactions. Always verify medication instructions with a qualified healthcare professional.</p></div>
  </div>
}

function Metric({ icon: Icon, label, value, detail, accent }) { return <div className={`metric-card accent-${accent}`}><div className="metric-icon"><Icon size={17} /></div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div> }
function MedicineRow({ name, detail, expiry, status, tone }) { return <div className="medicine-row"><div className="medicine-icon"><Package size={16} /></div><div className="medicine-info"><strong>{name}</strong><small>{detail}</small></div><div className="medicine-expiry"><small>Expiry</small><strong>{expiry}</strong></div><span className={`status-pill ${tone}`}>{status}</span></div> }
function ActivityItem({ icon: Icon, title, time, color }) { return <div className="activity-item"><div className={`activity-icon ${color}`}><Icon size={15} /></div><div><strong>{title}</strong><small>{time}</small></div><ChevronRight size={15} /></div> }

function DtiLab({ setNotice }) { return <div className="page-wrap"><PageIntro eyebrow="Computational biology" title="DTI Lab"><span>Compose a study from molecular inputs and a registered model.</span><button className="primary-button small" onClick={() => setNotice('Prediction service is a Phase 3 placeholder until a trained model is registered')}><Sparkles size={15} /> Run analysis</button></PageIntro><section className="lab-grid"><div className="content-panel study-panel"><div className="panel-heading"><div><p className="eyebrow">Study composer</p><h3>Define your interaction question</h3></div><span className="draft-badge">DRAFT</span></div><label>Drug molecule <input placeholder="Paste a SMILES string" /></label><p className="field-help">SMILES validation and RDKit features will connect in Phase 3.</p><label>Biological target <input placeholder="Target identifier or protein sequence" /></label><div className="input-row"><label>Model family <select><option>Choose a registered model</option><option>Logistic Regression</option><option>Random Forest</option></select></label><label>Dataset version <select><option>Not connected</option></select></label></div><button className="outline-button" onClick={() => setNotice('Study saved locally as a draft')}><ShieldCheck size={15} /> Save draft</button></div><div className="content-panel pipeline-panel"><div className="panel-heading"><div><p className="eyebrow">Pipeline status</p><h3>Analysis pathway</h3></div><div className="status-orb"><span /></div></div>{['Molecular structure', 'Feature extraction', 'Target representation', 'Model inference'].map((step, index) => <div className={`pipeline-step ${index === 0 ? 'ready' : ''}`} key={step}><span>{String(index + 1).padStart(2, '0')}</span><strong>{step}</strong><small>{index === 0 ? 'Awaiting input' : 'Not configured'}</small><ChevronRight size={15} /></div>)}<div className="research-note"><CircleHelp size={16} /><span>Predictions will be labeled as computational estimates and never as confirmed biological interactions.</span></div></div></section></div> }
function Medicines({ setNotice }) {
  return <div className="page-wrap"><PageIntro eyebrow="Personal organization" title="Medicine cabinet"><span>Keep your own inventory visible, current, and easy to review.</span><button className="primary-button small" onClick={() => setNotice('Medicine entry form will be enabled in the inventory phase')}><Package size={15} /> Add medicine</button></PageIntro><section className="content-panel full-panel"><div className="panel-heading"><div><p className="eyebrow">Inventory · 3 records</p><h3>Current supplies</h3></div><div className="filter-chip"><Search size={14} /> Filter inventory</div></div><div className="inventory-table"><div className="table-head"><span>Medicine</span><span>Category</span><span>Quantity</span><span>Expiry</span><span>Status</span></div>{medicineRows.map((row) => <div className="table-row" key={row.name}><div><strong>{row.name}</strong><small>{row.detail}</small></div><span>{row.name === 'Cetirizine' ? 'Allergy' : row.name === 'Paracetamol' ? 'Pain / fever' : 'Wound care'}</span><span>{row.name === 'First-aid antiseptic' ? '100 ml' : '24 tablets'}</span><span>{row.expiry}</span><span className={`status-pill ${row.tone}`}>{row.status}</span></div>)}</div></section><div className="disclaimer"><ShieldCheck size={18} /><p>Inventory details are user-provided. Aegis does not recommend purchasing, taking, stopping, or changing any medicine.</p></div></div>
}
function Schedule({ setNotice }) { return <div className="page-wrap"><PageIntro eyebrow="Organizational assistance" title="Medication schedule"><span>Turn instructions you already have into a clear timetable.</span><button className="primary-button small" onClick={() => setNotice('Schedule entry will be enabled in the reminders phase')}><CalendarDays size={15} /> Add schedule</button></PageIntro><section className="schedule-layout"><div className="content-panel calendar-panel"><div className="calendar-head"><button className="icon-button"><ChevronRight size={16} className="rotate-180" /></button><strong>September 2026</strong><button className="icon-button"><ChevronRight size={16} /></button></div><div className="weekdays">{['M','T','W','T','F','S','S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: 30 }, (_, index) => <button key={index} className={index + 1 === 22 ? 'selected' : ''}>{index + 1}</button>)}</div></div><div className="content-panel agenda-panel"><div className="panel-heading"><div><p className="eyebrow">Today · Tuesday 22</p><h3>Upcoming entries</h3></div></div><div className="agenda-item"><span className="agenda-time">08:00</span><div className="agenda-bar green" /><div><strong>Morning routine</strong><small>User-entered schedule details will appear here.</small></div></div><div className="agenda-item"><span className="agenda-time">20:00</span><div className="agenda-bar coral" /><div><strong>Evening routine</strong><small>Verify every dose and timing against your label or prescription.</small></div></div><div className="research-note"><CircleHelp size={16} /><span>Organizational assistance only. The assistant must never invent dosage, frequency, or duration.</span></div></div></section></div> }
function Assistant() { return <div className="page-wrap"><PageIntro eyebrow="General information" title="AI assistant"><span>Ask about this workspace, terminology, or how to read a prediction output.</span><span className="privacy-badge"><span className="status-dot" /> Local demo mode</span></PageIntro><section className="chat-layout"><div className="content-panel chat-panel"><div className="chat-header"><div className="assistant-avatar"><Bot size={19} /></div><div><strong>Aegis guide</strong><small>General information · Safety boundaries on</small></div><span className="status-pill active">Available</span></div><div className="chat-messages"><div className="message assistant"><span>Good morning. I can help explain your workspace, organize information you provide, or clarify what a computational prediction means.</span><small>09:44</small></div><div className="message user"><span>What can I ask you about?</span><small>09:45</small></div><div className="message assistant"><span>Try asking about molecular fingerprints, the expiry watchlist, or the difference between a model probability and experimental evidence.</span><small>09:45</small></div></div><div className="chat-composer"><input placeholder="Ask a general question..." aria-label="Ask the AI assistant" /><button className="primary-button" aria-label="Send question"><ArrowUpRight size={17} /></button></div></div><div className="content-panel boundaries-panel"><p className="eyebrow">Always in view</p><h3>How Aegis stays careful</h3>{['No diagnosis or prescription', 'No dose changes or stop advice', 'No certainty from model output alone'].map((item) => <div className="boundary-item" key={item}><ShieldCheck size={15} /><span>{item}</span></div>)}<p className="field-help">For personal medical decisions, speak with a qualified healthcare professional or pharmacist.</p></div></section></div> }
function Analytics() { return <div className="page-wrap"><PageIntro eyebrow="Research observatory" title="Analytics"><span>Make the system measurable once real data and trained models are connected.</span></PageIntro><section className="analytics-grid"><div className="content-panel chart-panel"><div className="panel-heading"><div><p className="eyebrow">Prediction history</p><h3>Study volume</h3></div><span className="draft-badge">NO DATA</span></div><div className="empty-chart"><div className="chart-grid-lines" /><div className="empty-chart-copy"><Activity size={22} /><strong>Awaiting prediction history</strong><span>Connect a trained model to begin logging studies.</span></div></div></div><div className="content-panel metric-panel"><p className="eyebrow">Model registry</p><h3>Evaluation metrics</h3><div className="metric-placeholder"><BrainCircuit size={22} /><span>Accuracy, precision, recall, F1, ROC-AUC, and PR-AUC will appear after evaluation.</span></div><div className="metric-list"><span>Dataset split <strong>Not configured</strong></span><span>Cross-validation <strong>Not configured</strong></span><span>Reproducibility seed <strong>Not configured</strong></span></div></div></section></div> }

export default App
