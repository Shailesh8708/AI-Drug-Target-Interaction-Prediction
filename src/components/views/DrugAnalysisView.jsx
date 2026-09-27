import { useState, useEffect } from 'react'
import {
  Pill,
  ShieldCheck,
  Activity,
  Layers,
  Target,
  Network,
  AlertTriangle,
  Stethoscope,
  BookOpen,
  Bot,
  GitCompare,
  Sparkles,
} from 'lucide-react'

// Import Drug Intelligence Subcomponents
import DrugSearchHeader from '../drugintelligence/DrugSearchHeader.jsx'
import DrugProfileHeader from '../drugintelligence/DrugProfileHeader.jsx'
import DrugStructureViewer from '../drugintelligence/DrugStructureViewer.jsx'
import ChemicalPropertiesPanel from '../drugintelligence/ChemicalPropertiesPanel.jsx'
import PhysicochemicalRadar from '../drugintelligence/PhysicochemicalRadar.jsx'
import FunctionalGroupScaffoldPanel from '../drugintelligence/FunctionalGroupScaffoldPanel.jsx'
import BioactivityIntelligencePanel from '../drugintelligence/BioactivityIntelligencePanel.jsx'
import TargetIntelligencePanel from '../drugintelligence/TargetIntelligencePanel.jsx'
import DrugTargetNetworkGraph from '../drugintelligence/DrugTargetNetworkGraph.jsx'
import DrugInteractionsPanel from '../drugintelligence/DrugInteractionsPanel.jsx'
import ADMEPharmacologyPanel from '../drugintelligence/ADMEPharmacologyPanel.jsx'
import DiseasePharmacogenomicsPanel from '../drugintelligence/DiseasePharmacogenomicsPanel.jsx'
import LiteratureEvidenceMatrix from '../drugintelligence/LiteratureEvidenceMatrix.jsx'
import AIDrugAnalystPanel from '../drugintelligence/AIDrugAnalystPanel.jsx'
import ExplainableDTIComparison from '../drugintelligence/ExplainableDTIComparison.jsx'
import SimilarDrugsSARPanel from '../drugintelligence/SimilarDrugsSARPanel.jsx'
import DrugJourneyStoryMode from '../drugintelligence/DrugJourneyStoryMode.jsx'
import ResearchWorkspaceModal from '../drugintelligence/ResearchWorkspaceModal.jsx'
import DrugReportModal from '../drugintelligence/DrugReportModal.jsx'

// Import Service and CSS
import { getDrugProfile } from '../../services/drugIntelligenceService.js'
import '../drugintelligence/drugintelligence.css'

export default function DrugAnalysisView({ setNotice = () => {}, navigate }) {
  const [activeDrugId, setActiveDrugId] = useState('ciprofloxacin')
  const [drug, setDrug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Modals & Mode toggles
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showJourney, setShowJourney] = useState(false)

  // Fetch full drug profile
  useEffect(() => {
    let isMounted = true
    const loadDrug = async () => {
      setLoading(true)
      const data = await getDrugProfile(activeDrugId)
      if (isMounted) {
        if (data) {
          setDrug(data)
        }
        setLoading(false)
      }
    }
    loadDrug()
    return () => {
      isMounted = false
    }
  }, [activeDrugId])

  const handleSelectDrug = (idOrName) => {
    setActiveDrugId(idOrName)
    setNotice && setNotice(`Loaded comprehensive pharmacological profile for ${idOrName}`)
  }

  return (
    <div className="drug-intel-workstation">
      {/* 1. Header & Search Bar */}
      <DrugSearchHeader
        activeDrugId={activeDrugId}
        onSelectDrug={handleSelectDrug}
        onOpenWorkspace={() => setShowWorkspace(true)}
        onOpenReport={() => setShowReport(true)}
        onOpenJourney={() => setShowJourney(true)}
        loading={loading}
      />

      {/* 2. Drug Identity Banner */}
      {drug && (
        <DrugProfileHeader
          drug={drug}
          navigate={navigate}
          onFavoriteChange={() => setNotice('Updated drug favorites in local research workspace')}
        />
      )}

      {/* 3. Drug Journey Mode (Storytelling) */}
      {showJourney && (
        <DrugJourneyStoryMode
          drug={drug}
          onClose={() => setShowJourney(false)}
        />
      )}

      {/* 4. Workspace Navigation Tabs */}
      <div className="intel-tabs-bar">
        <button
          className={`intel-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Layers size={15} /> 3D Structure & Properties
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'targets' ? 'active' : ''}`}
          onClick={() => setActiveTab('targets')}
        >
          <Target size={15} /> Targets & Bioactivity
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <Network size={15} /> AI Intelligence Graph
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'pharmacology' ? 'active' : ''}`}
          onClick={() => setActiveTab('pharmacology')}
        >
          <Activity size={15} /> ADMET & MoA
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          <AlertTriangle size={15} /> DDI & Safety
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'clinical' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinical')}
        >
          <Stethoscope size={15} /> Indications & PGx
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          <BookOpen size={15} /> Evidence Matrix
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'ai_analyst' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai_analyst')}
        >
          <Bot size={15} /> AI Analyst & Explainable DTI
        </button>
        <button
          className={`intel-tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
          onClick={() => setActiveTab('similar')}
        >
          <GitCompare size={15} /> SAR & Congeners
        </button>
      </div>

      {/* 5. Tab Content Views */}
      {drug && (
        <>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="structure-overview-grid">
                <DrugStructureViewer drug={drug} />
                <ChemicalPropertiesPanel drug={drug} />
              </div>
              <div className="structure-overview-grid">
                <PhysicochemicalRadar drug={drug} />
                <FunctionalGroupScaffoldPanel drug={drug} />
              </div>
            </div>
          )}

          {activeTab === 'targets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <TargetIntelligencePanel drug={drug} navigate={navigate} />
              <BioactivityIntelligencePanel drug={drug} />
            </div>
          )}

          {activeTab === 'network' && (
            <DrugTargetNetworkGraph drug={drug} />
          )}

          {activeTab === 'pharmacology' && (
            <ADMEPharmacologyPanel drug={drug} />
          )}

          {activeTab === 'interactions' && (
            <DrugInteractionsPanel drug={drug} />
          )}

          {activeTab === 'clinical' && (
            <DiseasePharmacogenomicsPanel drug={drug} />
          )}

          {activeTab === 'evidence' && (
            <LiteratureEvidenceMatrix drug={drug} />
          )}

          {activeTab === 'ai_analyst' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <AIDrugAnalystPanel drug={drug} />
              <ExplainableDTIComparison drug={drug} navigate={navigate} />
            </div>
          )}

          {activeTab === 'similar' && (
            <SimilarDrugsSARPanel
              drug={drug}
              onSelectDrug={handleSelectDrug}
              navigate={navigate}
            />
          )}
        </>
      )}

      {/* 6. Scientific & Non-Clinical Disclaimer */}
      <div className="intel-disclaimer">
        <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#f1f5f9' }}>Scientific Research & Computational Simulation Notice:</strong>
          {' '}Bioactivity indices, ADMET properties, and interaction likelihoods are derived from curated open databases (PubChem, ChEMBL, PDB) and in-silico machine learning models. This platform is strictly designed for computational chemistry education and pharmaceutical research; it does not provide clinical advice or patient-specific prescribing recommendations.
        </div>
      </div>

      {/* 7. Research Workspace Modal */}
      {showWorkspace && (
        <ResearchWorkspaceModal
          drug={drug}
          onSelectDrug={handleSelectDrug}
          onClose={() => setShowWorkspace(false)}
        />
      )}

      {/* 8. Export Dossier Modal */}
      {showReport && (
        <DrugReportModal
          drug={drug}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
