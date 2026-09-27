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
  RefreshCw,
  Atom,
  Dna,
  PieChart,
  HelpCircle,
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

// Universal Engine Subcomponents
import ElementProfilePanel from '../drugintelligence/ElementProfilePanel.jsx'
import ElementCompositionPanel from '../drugintelligence/ElementCompositionPanel.jsx'
import ProteinComplexPanel from '../drugintelligence/ProteinComplexPanel.jsx'
import IntegratedStructureComparisonPanel from '../drugintelligence/IntegratedStructureComparisonPanel.jsx'

// Import Service and CSS
import { getDrugProfile } from '../../services/drugIntelligenceService.js'
import '../drugintelligence/drugintelligence.css'

export default function DrugAnalysisView({ setNotice = () => {}, navigate }) {
  const [activeDrugId, setActiveDrugId] = useState('ciprofloxacin')
  const [drug, setDrug] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Interactive highlighting states across panels
  const [highlightedElement, setHighlightedElement] = useState(null)
  const [highlightedIndices, setHighlightedIndices] = useState([])

  // Modals & Mode toggles
  const [showWorkspace, setShowWorkspace] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [showJourney, setShowJourney] = useState(false)

  // Fetch full drug profile
  useEffect(() => {
    let isMounted = true
    const loadDrug = async () => {
      setLoading(true)
      setHighlightedElement(null)
      setHighlightedIndices([])
      const data = await getDrugProfile(activeDrugId)
      if (isMounted) {
        setDrug(data)
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

  const isElement = drug?.entityType === 'ELEMENT'
  const isProtein = drug?.entityType === 'PROTEIN' || drug?.entityType === 'PROTEIN-LIGAND COMPLEX'

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

      {/* 4. Adaptive Workspace Navigation Tabs */}
      <div className="intel-tabs-bar">
        <button
          className={`intel-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          {isElement ? <Atom size={15} /> : isProtein ? <Dna size={15} /> : <Layers size={15} />}
          {isElement ? 'Periodic Profile & Lattice' : isProtein ? 'Macromolecular Structure' : '3D Structure & Properties'}
        </button>

        {!isElement && (
          <button
            className={`intel-tab-btn ${activeTab === 'composition' ? 'active' : ''}`}
            onClick={() => setActiveTab('composition')}
          >
            <PieChart size={15} /> Elemental Stoichiometry
          </button>
        )}

        {!isElement && !isProtein && (
          <button
            className={`intel-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
            onClick={() => setActiveTab('compare')}
          >
            <GitCompare size={15} /> Structure Comparison & Drift
          </button>
        )}

        <button
          className={`intel-tab-btn ${activeTab === 'targets' ? 'active' : ''}`}
          onClick={() => setActiveTab('targets')}
        >
          <Target size={15} /> {isElement ? 'Physiological Targets' : 'Targets & Bioactivity'}
        </button>

        {!isElement && (
          <button
            className={`intel-tab-btn ${activeTab === 'network' ? 'active' : ''}`}
            onClick={() => setActiveTab('network')}
          >
            <Network size={15} /> AI Intelligence Graph
          </button>
        )}

        {!isElement && !isProtein && (
          <button
            className={`intel-tab-btn ${activeTab === 'pharmacology' ? 'active' : ''}`}
            onClick={() => setActiveTab('pharmacology')}
          >
            <Activity size={15} /> ADMET & MoA
          </button>
        )}

        {!isElement && !isProtein && (
          <button
            className={`intel-tab-btn ${activeTab === 'interactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('interactions')}
          >
            <AlertTriangle size={15} /> DDI & Safety
          </button>
        )}

        {!isElement && (
          <button
            className={`intel-tab-btn ${activeTab === 'clinical' ? 'active' : ''}`}
            onClick={() => setActiveTab('clinical')}
          >
            <Stethoscope size={15} /> Indications & PGx
          </button>
        )}

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

        {!isElement && !isProtein && (
          <button
            className={`intel-tab-btn ${activeTab === 'similar' ? 'active' : ''}`}
            onClick={() => setActiveTab('similar')}
          >
            <GitCompare size={15} /> SAR & Congeners
          </button>
        )}
      </div>

      {/* 5. Loading State */}
      {loading && !drug && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: '#94a3b8' }}>
          <RefreshCw size={36} className="spin" color="#10b981" style={{ marginBottom: '1rem', display: 'inline-block' }} />
          <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem', fontSize: '1.25rem' }}>Synthesizing Chemical Intelligence...</h3>
          <p style={{ fontSize: '0.85rem' }}>Querying periodic metrics, 3D conformer coordinates, and target interactomes for "{activeDrugId}".</p>
        </div>
      )}

      {/* 6. Graceful Unknown / Unresolved State */}
      {!loading && !drug && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
          <AlertTriangle size={42} color="#f59e0b" style={{ marginBottom: '1rem', display: 'inline-block' }} />
          <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem', fontSize: '1.35rem' }}>Chemical Substance Not Found</h3>
          <p style={{ fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Could not resolve <strong>"{activeDrugId}"</strong> in the universal chemical engine or deposited biological repositories.
          </p>

          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              borderRadius: '12px',
              padding: '1.25rem',
              textAlign: 'left',
              fontSize: '0.82rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={15} /> Suggested Universal Search Formats:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px', color: '#cbd5e1' }}>
              <li><strong>Chemical Elements:</strong> Enter symbol or name (e.g. <code>Fe</code>, <code>Iron</code>, <code>Au</code>, <code>Gold</code>, <code>Carbon</code>)</li>
              <li><strong>Small Molecules & Drugs:</strong> Enter generic, common or brand name (e.g. <code>Aspirin</code>, <code>Benzene</code>, <code>Glucose</code>)</li>
              <li><strong>Molecular Formulas:</strong> Enter formula (e.g. <code>C6H12O6</code>, <code>CH4O</code>, <code>H2O</code>, <code>NaCl</code>)</li>
              <li><strong>Chemical Representations:</strong> Enter SMILES (e.g. <code>CCO</code>, <code>c1ccccc1</code>) or InChIKey</li>
              <li><strong>Proteins & PDB Structures:</strong> Enter 4-letter PDB ID (e.g. <code>2XCT</code>, <code>4HHB</code>) or Protein name (e.g. <code>Insulin</code>, <code>Hemoglobin</code>)</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="action-btn-pill primary" onClick={() => handleSelectDrug('ciprofloxacin')}>
              Reset to Ciprofloxacin
            </button>
            <button className="action-btn-pill" onClick={() => handleSelectDrug('iron')}>
              Try Iron (Element)
            </button>
            <button className="action-btn-pill" onClick={() => handleSelectDrug('benzene')}>
              Try Benzene (Organic)
            </button>
            <button className="action-btn-pill" onClick={() => handleSelectDrug('2XCT')}>
              Try 2XCT (PDB Complex)
            </button>
          </div>
        </div>
      )}

      {/* 7. Active Entity Views */}
      {drug && (
        <>
          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {isElement ? (
                /* Element Layout */
                <>
                  <div className="structure-overview-grid">
                    <DrugStructureViewer
                      drug={drug}
                      highlightedElement={highlightedElement}
                      highlightedIndices={highlightedIndices}
                    />
                    <ElementProfilePanel drug={drug} />
                  </div>
                </>
              ) : isProtein ? (
                /* Protein / Complex Layout */
                <>
                  <div className="structure-overview-grid">
                    <DrugStructureViewer
                      drug={drug}
                      highlightedElement={highlightedElement}
                      highlightedIndices={highlightedIndices}
                    />
                    <ProteinComplexPanel drug={drug} navigate={navigate} />
                  </div>
                </>
              ) : (
                /* Small Molecule / Drug / Compound Layout */
                <>
                  <div className="structure-overview-grid">
                    <DrugStructureViewer
                      drug={drug}
                      highlightedElement={highlightedElement}
                      highlightedIndices={highlightedIndices}
                    />
                    <ChemicalPropertiesPanel drug={drug} />
                  </div>
                  <div className="structure-overview-grid">
                    <ElementCompositionPanel
                      drug={drug}
                      activeHighlightedElement={highlightedElement}
                      onHighlightElement={setHighlightedElement}
                    />
                    <PhysicochemicalRadar drug={drug} />
                  </div>
                  <div className="structure-overview-grid">
                    <FunctionalGroupScaffoldPanel
                      drug={drug}
                      activeIndices={highlightedIndices}
                      onHighlightIndices={setHighlightedIndices}
                    />
                    <IntegratedStructureComparisonPanel
                      drug={drug}
                      onSelectDrug={handleSelectDrug}
                      navigate={navigate}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: Elemental Stoichiometry (Dedicated) */}
          {activeTab === 'composition' && !isElement && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <ElementCompositionPanel
                drug={drug}
                activeHighlightedElement={highlightedElement}
                onHighlightElement={setHighlightedElement}
              />
              <DrugStructureViewer
                drug={drug}
                highlightedElement={highlightedElement}
                highlightedIndices={highlightedIndices}
              />
            </div>
          )}

          {/* TAB: Structure Comparison & Drift (Dedicated) */}
          {activeTab === 'compare' && !isElement && !isProtein && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <IntegratedStructureComparisonPanel
                drug={drug}
                onSelectDrug={handleSelectDrug}
                navigate={navigate}
              />
            </div>
          )}

          {/* TAB: Targets & Bioactivity */}
          {activeTab === 'targets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <TargetIntelligencePanel drug={drug} navigate={navigate} />
              <BioactivityIntelligencePanel drug={drug} />
            </div>
          )}

          {/* TAB: AI Intelligence Graph */}
          {activeTab === 'network' && (
            <DrugTargetNetworkGraph drug={drug} />
          )}

          {/* TAB: ADMET & MoA */}
          {activeTab === 'pharmacology' && (
            <ADMEPharmacologyPanel drug={drug} />
          )}

          {/* TAB: DDI & Safety */}
          {activeTab === 'interactions' && (
            <DrugInteractionsPanel drug={drug} />
          )}

          {/* TAB: Indications & PGx */}
          {activeTab === 'clinical' && (
            <DiseasePharmacogenomicsPanel drug={drug} />
          )}

          {/* TAB: Evidence Matrix */}
          {activeTab === 'evidence' && (
            <LiteratureEvidenceMatrix drug={drug} />
          )}

          {/* TAB: AI Analyst & Explainable DTI */}
          {activeTab === 'ai_analyst' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <AIDrugAnalystPanel drug={drug} />
              <ExplainableDTIComparison drug={drug} navigate={navigate} />
            </div>
          )}

          {/* TAB: SAR & Congeners */}
          {activeTab === 'similar' && (
            <SimilarDrugsSARPanel
              drug={drug}
              onSelectDrug={handleSelectDrug}
              navigate={navigate}
            />
          )}
        </>
      )}

      {/* 8. Scientific & Non-Clinical Disclaimer */}
      <div className="intel-disclaimer">
        <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#f1f5f9' }}>Scientific Research & Computational Simulation Notice:</strong>
          {' '}Bioactivity indices, ADMET properties, and interaction likelihoods are derived from curated open databases (PubChem, ChEMBL, PDB, IUPAC) and in-silico machine learning models. This platform is strictly designed for computational chemistry education and pharmaceutical research; it does not provide clinical advice or patient-specific prescribing recommendations.
        </div>
      </div>

      {/* 9. Research Workspace Modal */}
      {showWorkspace && (
        <ResearchWorkspaceModal
          drug={drug}
          onSelectDrug={handleSelectDrug}
          onClose={() => setShowWorkspace(false)}
        />
      )}

      {/* 10. Export Dossier Modal */}
      {showReport && (
        <DrugReportModal
          drug={drug}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
