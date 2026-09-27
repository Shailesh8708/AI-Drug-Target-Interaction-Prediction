import { useState, useEffect, useCallback } from 'react'
import {
  Dna,
  Atom,
  Flame,
  Layers,
  Pill,
  Sparkles,
  BrainCircuit,
  GitCompare,
  FlaskConical,
  FileText,
  Download,
  Share2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Eye,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Info,
  Sliders,
  ShieldCheck,
  Maximize2,
} from 'lucide-react'

import {
  loadCompleteBioStructure,
  getBioStructurePocket,
  getSimilarMolecules,
  PRESET_STRUCTURES,
} from '../../services/bioStructureService.js'

import StructureSearchHeader from '../biostructure/StructureSearchHeader.jsx'
import BioStructure3DViewer from '../biostructure/BioStructure3DViewer.jsx'
import StructureStoryMode from '../biostructure/StructureStoryMode.jsx'
import ChainSequenceExplorer from '../biostructure/ChainSequenceExplorer.jsx'
import LigandIntelligencePanel from '../biostructure/LigandIntelligencePanel.jsx'
import BindingSiteIntelligence from '../biostructure/BindingSiteIntelligence.jsx'
import NucleicAndMetalPanel from '../biostructure/NucleicAndMetalPanel.jsx'
import BiologicalAssemblyQuality from '../biostructure/BiologicalAssemblyQuality.jsx'
import ProteinSimilarityAlignment from '../biostructure/ProteinSimilarityAlignment.jsx'
import StructureInterpreterAI from '../biostructure/StructureInterpreterAI.jsx'
import DTIContextTimeline from '../biostructure/DTIContextTimeline.jsx'
import StructureReportModal from '../biostructure/StructureReportModal.jsx'
import '../biostructure/biostructure.css'

const TABS = [
  { id: 'overview', label: 'Overview & 3D', icon: Layers },
  { id: 'pocket', label: 'Binding Site Intelligence', icon: Flame, badge: 'Signature' },
  { id: 'chains', label: 'Chains & Sequence', icon: Dna },
  { id: 'ligand', label: 'Ligand Intelligence', icon: Pill },
  { id: 'nucleic', label: 'Nucleic & Metals', icon: Atom },
  { id: 'ai', label: 'AI Interpreter', icon: BrainCircuit, badge: 'AI' },
  { id: 'homology', label: 'Homology & Alignment', icon: GitCompare },
  { id: 'dti', label: 'DTI Evidence Timeline', icon: FlaskConical, badge: 'Bridge' },
]

export default function BioStructureHubView({ setNotice = () => {}, navigate = () => {} }) {
  const [currentPdbId, setCurrentPdbId] = useState('2XCT')
  const [structure, setStructure] = useState(null)
  const [pocketData, setPocketData] = useState(null)
  const [interpretation, setInterpretation] = useState('')
  const [similarMolecules, setSimilarMolecules] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  // 3D Visualizer controls
  const [representation, setRepresentation] = useState('cartoon')
  const [selectedResidueId, setSelectedResidueId] = useState(null)
  const [selectedLigandId, setSelectedLigandId] = useState('CPF')
  const [cutoff, setCutoff] = useState(4.5)
  const [showPocket, setShowPocket] = useState(true)
  const [showInteractions, setShowInteractions] = useState(true)
  const [cameraPreset, setCameraPreset] = useState('full')

  // Advanced interactive modes
  const [presentationMode, setPresentationMode] = useState(false)
  const [learnMode, setLearnMode] = useState(false)
  const [storyMode, setStoryMode] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // Load structure data
  const loadStructureData = useCallback(async (pdbId) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const data = await loadCompleteBioStructure(pdbId, '', 4.5)
      setStructure(data.structure)
      setPocketData(data.pocketData)
      setInterpretation(data.interpretation)

      // Set active ligand if available
      const primaryLigand = data.structure?.ligands?.[0]?.id || 'CPF'
      setSelectedLigandId(primaryLigand)

      // Load similar molecules for the primary ligand
      try {
        const sim = await getSimilarMolecules(primaryLigand, 0.6)
        setSimilarMolecules(sim)
      } catch {
        setSimilarMolecules([])
      }
    } catch (err) {
      setErrorMessage(`Failed to load structure ${pdbId}: ${err.message || 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStructureData(currentPdbId)
  }, [currentPdbId, loadStructureData])

  // Recalculate pocket when cutoff changes
  const handleCutoffChange = async (newCutoff) => {
    setCutoff(newCutoff)
    try {
      const res = await getBioStructurePocket(currentPdbId, selectedLigandId, newCutoff)
      if (res?.pocket) {
        setPocketData(res.pocket)
        if (res.interpretation) setInterpretation(res.interpretation)
      }
    } catch (err) {
      console.warn('Pocket recalculation error:', err)
    }
  }

  // Handle Search
  const handleSearch = (searchedId) => {
    const clean = searchedId.trim().toUpperCase()
    setCurrentPdbId(clean)
    setNotice(`Querying BioStructure repository for ${clean}...`)
  }

  // Handle Story step change
  const handleStoryStepChange = (step) => {
    if (step.camera) {
      setCameraPreset(step.camera)
    }
    if (step.highlight === 'pocket') {
      setShowPocket(true)
      setShowInteractions(true)
    } else if (step.highlight === 'interactions') {
      setShowInteractions(true)
    }
  }

  // Bridge to Structure Comparison module
  const handleNavigateToComparison = (ligandSmiles, ligandName) => {
    setNotice(`Bridging ${ligandName || 'Ligand'} to Molecular Structure Comparison...`)
    navigate('compare')
  }

  // Bridge to DTI Lab
  const handleNavigateToDti = (ligandSmiles, targetTitle) => {
    setNotice(`Transferring structural features of ${currentPdbId} to DTI Laboratory...`)
    navigate('dti')
  }

  const meta = structure?.metadata || {}
  const primaryLigand = structure?.ligands?.find((l) => l.id === selectedLigandId) || structure?.ligands?.[0] || null

  return (
    <div className={`page-wrap biostructure-hub-shell ${presentationMode ? 'presentation-active' : ''}`}>
      {/* Header with Search, Presets and Mode Toggles */}
      <StructureSearchHeader
        currentPdbId={currentPdbId}
        onSearch={handleSearch}
        isLoading={isLoading}
        presentationMode={presentationMode}
        onTogglePresentation={() => setPresentationMode(!presentationMode)}
        learnMode={learnMode}
        onToggleLearnMode={() => setLearnMode(!learnMode)}
        storyMode={storyMode}
        onToggleStoryMode={() => setStoryMode(!storyMode)}
      />

      {/* Presentation Mode Hero Overlay Banner */}
      {presentationMode && (
        <div className="presentation-overlay-card">
          <h2>{meta.title || currentPdbId}</h2>
          <div className="present-stats-row">
            <span><strong>PDB:</strong> {currentPdbId}</span>
            <span><strong>Organism:</strong> {meta.organism || 'N/A'}</span>
            <span><strong>Method:</strong> {meta.experimentalMethod} ({meta.resolution ? `${meta.resolution} Å` : 'N/A'})</span>
            <span><strong>Chains:</strong> {structure?.chains?.length || 0}</span>
            <span><strong>Ligand:</strong> {primaryLigand?.name || primaryLigand?.id || 'None'}</span>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="panel-error-notice">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
          <button className="quiet-button small" onClick={() => loadStructureData(currentPdbId)}>
            Retry
          </button>
        </div>
      )}

      {/* Main 3D WebGL Structural Canvas */}
      <div className="biostructure-viewer-container">
        {/* Viewer Toolbar */}
        <div className="viewer-toolbar">
          <div className="toolbar-section">
            <span className="toolbar-label">
              <Eye size={13} /> Style:
            </span>
            {['cartoon', 'backbone', 'ball-stick', 'surface'].map((mode) => (
              <button
                key={mode}
                className={`preset-btn ${representation === mode ? 'active' : ''}`}
                onClick={() => setRepresentation(mode)}
              >
                {mode === 'cartoon' ? 'Cartoon' : mode === 'backbone' ? 'Backbone' : mode === 'ball-stick' ? 'Ball & Stick' : 'Surface'}
              </button>
            ))}
          </div>

          <div className="toolbar-section">
            <span className="toolbar-label">
              <Sliders size={13} /> Camera:
            </span>
            {[
              { id: 'full', label: 'Full Complex' },
              { id: 'ligand', label: 'Ligand Focus' },
              { id: 'pocket', label: 'Pocket Cleft' },
              { id: 'dna', label: 'DNA Interface' },
              { id: 'protein', label: 'Protein Chains' },
            ].map((cam) => (
              <button
                key={cam.id}
                className={`preset-btn ${cameraPreset === cam.id ? 'active' : ''}`}
                onClick={() => setCameraPreset(cam.id)}
              >
                {cam.label}
              </button>
            ))}
          </div>

          <div className="toolbar-section">
            <label className="toggle-chip">
              <input
                type="checkbox"
                checked={showPocket}
                onChange={(e) => setShowPocket(e.target.checked)}
              />
              <span>Pocket Shell</span>
            </label>
            <label className="toggle-chip">
              <input
                type="checkbox"
                checked={showInteractions}
                onChange={(e) => setShowInteractions(e.target.checked)}
              />
              <span>Contact Vectors</span>
            </label>
            <button
              className="outline-button small"
              onClick={() => setShowReportModal(true)}
              title="Export Publication-Grade Report"
            >
              <FileText size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas */}
        <BioStructure3DViewer
          structure={structure}
          representation={representation}
          selectedResidueId={selectedResidueId}
          selectedLigandId={selectedLigandId}
          pocketData={pocketData}
          showPocket={showPocket}
          showInteractions={showInteractions}
          cameraPreset={cameraPreset}
          onSelectResidue={(resId) => {
            setSelectedResidueId(resId)
            setNotice(`Inspecting residue ${resId}`)
          }}
          onSelectLigand={(ligId) => {
            setSelectedLigandId(ligId)
            setNotice(`Focusing bound ligand ${ligId}`)
          }}
        />

        {/* Story Mode Overlay */}
        {storyMode && (
          <StructureStoryMode
            structure={structure}
            pocketData={pocketData}
            onStepChange={handleStoryStepChange}
            onClose={() => setStoryMode(false)}
          />
        )}
      </div>

      {/* Navigation Tabs Bar */}
      {!presentationMode && (
        <div className="biostructure-tabs-bar" role="tablist">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={`hub-tab-btn ${activeTab === id ? 'active' : ''}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={15} />
              <span>{label}</span>
              {badge && <span className="tab-pill-badge">{badge}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content Display */}
      {!presentationMode && (
        <div className="hub-tab-content-panel">
          {activeTab === 'overview' && (
            <div className="overview-tab-flow">
              <BiologicalAssemblyQuality
                structure={structure}
                onAssemblyChange={(asmId) => setNotice(`Biological assembly set to ${asmId}`)}
              />
              {/* Quick Summary Strip */}
              <div className="content-panel full-panel" style={{ marginTop: '1rem' }}>
                <div className="panel-heading compact">
                  <div>
                    <p className="eyebrow">Structural Provenance & Deposited Entities</p>
                    <h3>{meta.title || currentPdbId}</h3>
                  </div>
                  <span className="source-tag">{meta.source || 'RCSB Protein Data Bank'}</span>
                </div>
                <div className="pocket-metrics-grid">
                  <div className="pocket-metric-card">
                    <span className="metric-label">Experimental Method</span>
                    <strong>{meta.experimentalMethod || 'X-RAY'}</strong>
                    <small>High-Resolution Structural Determination</small>
                  </div>
                  <div className="pocket-metric-card accent-hbond">
                    <span className="metric-label">Resolution</span>
                    <strong>{meta.resolution ? `${meta.resolution} Å` : 'N/A'}</strong>
                    <small>Crystallographic coordinate precision</small>
                  </div>
                  <div className="pocket-metric-card accent-hydrophobic">
                    <span className="metric-label">Polymer Chains</span>
                    <strong>{structure?.chains?.length || 0}</strong>
                    <small>{structure?.chains?.filter((c) => c.type === 'protein').length || 0} Protein · {structure?.chains?.filter((c) => c.type === 'dna').length || 0} DNA</small>
                  </div>
                  <div className="pocket-metric-card accent-ionic">
                    <span className="metric-label">Bound Ligands</span>
                    <strong>{structure?.ligands?.length || 0}</strong>
                    <small>{primaryLigand?.name || primaryLigand?.id || 'None identified'}</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pocket' && (
            <BindingSiteIntelligence
              pocketData={pocketData}
              cutoff={cutoff}
              onCutoffChange={handleCutoffChange}
              showPocket={showPocket}
              onToggleShowPocket={() => setShowPocket(!showPocket)}
              showInteractions={showInteractions}
              onToggleShowInteractions={() => setShowInteractions(!showInteractions)}
              selectedResidueId={selectedResidueId}
              onSelectResidue={(resId) => {
                setSelectedResidueId(resId)
                setCameraPreset('pocket')
              }}
              learnMode={learnMode}
            />
          )}

          {activeTab === 'chains' && (
            <ChainSequenceExplorer
              chains={structure?.chains || []}
              selectedResidueId={selectedResidueId}
              onSelectResidue={(resId) => {
                setSelectedResidueId(resId)
                setCameraPreset('protein')
                setNotice(`Synchronized residue ${resId} in 3D viewport`)
              }}
              learnMode={learnMode}
            />
          )}

          {activeTab === 'ligand' && (
            <LigandIntelligencePanel
              ligands={structure?.ligands || []}
              activeLigand={primaryLigand}
              onSelectLigand={(lig) => {
                setSelectedLigandId(lig.id)
                setCameraPreset('ligand')
              }}
              onNavigateToComparison={handleNavigateToComparison}
              learnMode={learnMode}
              setNotice={setNotice}
            />
          )}

          {activeTab === 'nucleic' && (
            <NucleicAndMetalPanel
              structure={structure}
              pocketData={pocketData}
              onTriggerCamera={(preset) => setCameraPreset(preset)}
            />
          )}

          {activeTab === 'ai' && (
            <StructureInterpreterAI
              structure={structure}
              pocketData={pocketData}
              interpretation={interpretation}
              onTriggerCamera={(preset) => setCameraPreset(preset)}
            />
          )}

          {activeTab === 'homology' && (
            <ProteinSimilarityAlignment
              currentPdbId={currentPdbId}
              onLoadStructure={(pdbId) => handleSearch(pdbId)}
            />
          )}

          {activeTab === 'dti' && (
            <DTIContextTimeline
              structure={structure}
              pocketData={pocketData}
              onNavigateToDti={handleNavigateToDti}
            />
          )}
        </div>
      )}

      {/* Structure Intelligence Report Modal */}
      {showReportModal && (
        <StructureReportModal
          structure={structure}
          pocketData={pocketData}
          similarMolecules={similarMolecules}
          onClose={() => setShowReportModal(false)}
          setNotice={setNotice}
        />
      )}
    </div>
  )
}
