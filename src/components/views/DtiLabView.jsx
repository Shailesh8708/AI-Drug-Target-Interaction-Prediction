import { useState, useEffect } from 'react'
import {
  FlaskConical,
  Sparkles,
  ShieldCheck,
  Target,
  Pill,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Dna,
  Atom,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { predictDti, getDatasetStatus, prepareDataset } from '../../services/api'

const PRESET_PAIRS = [
  {
    name: 'Imatinib + ABL1',
    drug: 'Imatinib',
    target: 'ABL1',
    description: 'BCR-ABL tyrosine kinase inhibitor in CML (Nanomolar Ki)',
    expected: 'Known Active',
  },
  {
    name: 'Gefitinib + EGFR',
    drug: 'Gefitinib',
    target: 'EGFR',
    description: 'EGFR tyrosine kinase inhibitor in NSCLC (Sub-micromolar IC50)',
    expected: 'Known Active',
  },
  {
    name: 'Ciprofloxacin + DNA Gyrase',
    drug: 'Ciprofloxacin',
    target: 'gyrA',
    description: 'Fluoroquinolone antibacterial targeting bacterial topoisomerase II',
    expected: 'Known Active',
  },
  {
    name: 'Aspirin + COX-1',
    drug: 'Aspirin',
    target: 'PTGS1',
    description: 'NSAID irreversible inhibitor of platelet cyclooxygenase-1',
    expected: 'Known Active',
  },
  {
    name: 'Caffeine + Adenosine A2A',
    drug: 'Caffeine',
    target: 'ADORA2A',
    description: 'Competitive antagonist of central adenosine A2A receptor',
    expected: 'Known Active',
  },
  {
    name: 'Paracetamol + EGFR',
    drug: 'Paracetamol',
    target: 'EGFR',
    description: 'Negative control: Acetaminophen lacks EGFR kinase domain binding',
    expected: 'Negative Control',
  },
]

export default function DtiLabView({ setNotice }) {
  const [drugInput, setDrugInput] = useState('Imatinib')
  const [targetInput, setTargetInput] = useState('ABL1')
  const [thresholdUm, setThresholdUm] = useState(10.0)
  const [loading, setLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)

  // Datasets state
  const [datasetInfo, setDatasetInfo] = useState(null)
  const [selectedDataset, setSelectedDataset] = useState('bindingdb-core')
  const [splitStrategy, setSplitStrategy] = useState('scaffold')
  const [partitionResult, setPartitionResult] = useState(null)
  const [loadingPartition, setLoadingPartition] = useState(false)

  // Load benchmark dataset info on mount
  useEffect(() => {
    getDatasetStatus()
      .then((data) => setDatasetInfo(data))
      .catch(() => {})
  }, [])

  const handlePredict = async (drugVal = drugInput, targetVal = targetInput) => {
    if (!drugVal.trim() || !targetVal.trim()) {
      if (setNotice) setNotice('Please enter both drug and target identifiers')
      return
    }

    setLoading(true)
    setPredictionResult(null)
    try {
      const res = await predictDti(drugVal.trim(), targetVal.trim(), thresholdUm)
      setPredictionResult(res)
      if (setNotice) {
        setNotice(
          `DTI Prediction complete: ${res.prediction?.classification} (${(res.prediction?.interactionProbability * 100).toFixed(1)}% prob)`
        )
      }
    } catch (err) {
      if (setNotice) setNotice(`DTI prediction failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePrepareDataset = async () => {
    setLoadingPartition(true)
    try {
      const res = await prepareDataset(selectedDataset, splitStrategy, thresholdUm)
      setPartitionResult(res)
      if (setNotice) setNotice(`Dataset partitioned via ${splitStrategy} split`)
    } catch (err) {
      if (setNotice) setNotice(`Partition failed: ${err.message}`)
    } finally {
      setLoadingPartition(false)
    }
  }

  return (
    <div className="page-wrap">
      {/* 1. Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Computational Biology & Cheminformatics</p>
          <h1>AI Drug–Target Interaction Lab</h1>
          <p className="intro-copy">
            Evaluate in-silico binding probabilities, quantitative affinity estimates (pKd / pIC50), and
            explainable pharmacophore attributions grounded in authentic ChEMBL and BindingDB assays.
          </p>
        </div>
        <button
          className="primary-button small"
          onClick={() => handlePredict()}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Sparkles size={15} />
          {loading ? 'Evaluating...' : 'Run DTI Analysis'}
        </button>
      </div>

      {/* 2. Preset Pairs */}
      <div style={{ marginBottom: '18px' }}>
        <small style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
          VERIFIED SCIENTIFIC BENCHMARK PAIRS:
        </small>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {PRESET_PAIRS.map((pair) => (
            <button
              key={pair.name}
              className="quiet-button small"
              onClick={() => {
                setDrugInput(pair.drug)
                setTargetInput(pair.target)
                handlePredict(pair.drug, pair.target)
              }}
              style={{
                fontSize: '11px',
                padding: '6px 10px',
                background: drugInput === pair.drug && targetInput === pair.target ? '#e0f2fe' : '#ffffff',
                border: `1px solid ${drugInput === pair.drug && targetInput === pair.target ? '#0284c7' : '#e2e8f0'}`,
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <strong>{pair.name}</strong>
              <span
                style={{
                  fontSize: '9.5px',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  background: pair.expected === 'Known Active' ? '#dcfce7' : '#f1f5f9',
                  color: pair.expected === 'Known Active' ? '#15803d' : '#64748b',
                }}
              >
                {pair.expected}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Composer & Pipeline Layout */}
      <section className="lab-grid">
        {/* Left: Study Composer */}
        <div className="content-panel study-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Study Composer</p>
              <h3>Define Interaction Pair</h3>
            </div>
            <span className="status-pill active">AI Inference Engine</span>
          </div>

          <label style={{ display: 'block', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Pill size={14} /> Drug Molecule / Small Molecule
            </span>
            <input
              value={drugInput}
              onChange={(e) => setDrugInput(e.target.value)}
              placeholder="e.g. Imatinib, Gefitinib, CID:5291, or SMILES"
              style={{ width: '100%', marginTop: '4px' }}
            />
            <p className="field-help" style={{ margin: '4px 0 0' }}>
              Accepts common name, PubChem CID, ChEMBL ID, or SMILES representation.
            </p>
          </label>

          <label style={{ display: 'block', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={14} /> Biological Target / Receptor Protein
            </span>
            <input
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="e.g. ABL1, EGFR, P00519, 1IEP, or FASTA sequence"
              style={{ width: '100%', marginTop: '4px' }}
            />
            <p className="field-help" style={{ margin: '4px 0 0' }}>
              Accepts gene symbol, UniProt Accession, PDB ID, or amino acid sequence.
            </p>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                Active Bioactivity Cutoff (μM)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                max="100"
                value={thresholdUm}
                onChange={(e) => setThresholdUm(Number(e.target.value))}
                style={{ width: '100%', marginTop: '4px' }}
              />
              <small style={{ fontSize: '10px', color: '#94a3b8' }}>Standard threshold: ≤ 10 μM</small>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                Feature Representation
              </label>
              <select style={{ width: '100%', marginTop: '4px' }} defaultValue="morgan-ecfp4">
                <option value="morgan-ecfp4">Morgan ECFP4 (256-bit) + 20-AA Composition</option>
                <option value="physicochemical">Veber / Lipinski Physicochemical Descriptors</option>
              </select>
              <small style={{ fontSize: '10px', color: '#94a3b8' }}>Circular topological hashing</small>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="primary-button"
              onClick={() => handlePredict()}
              disabled={loading}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Sparkles size={15} />
              {loading ? 'Evaluating Model...' : 'Run Interaction Prediction'}
            </button>
          </div>
        </div>

        {/* Right: Analysis Pathway & Pipeline Steps */}
        <div className="content-panel pipeline-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Pipeline Architecture</p>
              <h3>Execution Pathway</h3>
            </div>
            <div className="status-orb">
              <span style={{ background: predictionResult ? '#10b981' : '#f59e0b' }} />
            </div>
          </div>

          {[
            { step: 'Scientific Database Resolution', detail: 'PubChem PUG REST + UniProtKB + ChEMBL' },
            { step: 'Cheminformatics Feature Extraction', detail: '256-bit Morgan Fingerprint & Descriptors' },
            { step: 'Bioinformatics Sequence Biophysics', detail: 'Composition Vector & Hydropathy Index' },
            { step: 'In-Silico Affinity & Attribution', detail: 'Binding probability & explainable weights' },
          ].map((item, idx) => (
            <div className={`pipeline-step ${predictionResult ? 'ready' : idx === 0 ? 'ready' : ''}`} key={item.step}>
              <span>{String(idx + 1).padStart(2, '0')}</span>
              <div>
                <strong>{item.step}</strong>
                <small style={{ display: 'block', color: '#64748b', fontSize: '11px' }}>{item.detail}</small>
              </div>
              <CheckCircle2 size={15} color={predictionResult ? '#10b981' : '#94a3b8'} />
            </div>
          ))}

          <div className="research-note" style={{ marginTop: '14px' }}>
            <ShieldCheck size={16} />
            <span>
              Predictions are computational in-silico estimates based on topological fingerprints and target
              biophysics. Never treat model probabilities as confirmed clinical outcomes.
            </span>
          </div>
        </div>
      </section>

      {/* 4. Real Prediction Result Dashboard */}
      {predictionResult && predictionResult.success && (
        <section
          style={{
            background: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '8px',
            padding: '24px',
            marginTop: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  background: predictionResult.prediction.isClassifiedActive ? '#dcfce7' : '#fee2e2',
                  color: predictionResult.prediction.isClassifiedActive ? '#15803d' : '#b91c1c',
                  marginBottom: '6px',
                }}
              >
                {predictionResult.prediction.isClassifiedActive ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {predictionResult.prediction.classification} (Cutoff ≤ {thresholdUm} μM)
              </span>
              <h2 style={{ fontSize: '20px', margin: '4px 0 0', color: '#0f172a' }}>
                {predictionResult.inputs.drug} ↔ {predictionResult.inputs.target}
              </h2>
              <small style={{ color: '#64748b' }}>
                Grounding Source: <strong>{predictionResult.prediction.groundingSource}</strong>
              </small>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                Interaction Probability
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: predictionResult.prediction.isClassifiedActive ? '#16a34a' : '#ea580c' }}>
                {(predictionResult.prediction.interactionProbability * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '22px',
            }}
          >
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                ESTIMATED AFFINITY (Kd / IC50)
              </small>
              <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                {predictionResult.prediction.affinity.estimatedKdNm < 1000
                  ? `${predictionResult.prediction.affinity.estimatedKdNm} nM`
                  : `${(predictionResult.prediction.affinity.estimatedKdNm / 1000).toFixed(2)} μM`}
              </div>
              <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                95% CI: [{predictionResult.prediction.affinity.confidenceInterval.lowerNm} - {predictionResult.prediction.affinity.confidenceInterval.upperNm}] nM
              </small>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                STANDARDIZED pKd / pIC50
              </small>
              <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                {predictionResult.prediction.affinity.pKd}
              </div>
              <small style={{ fontSize: '10.5px', color: '#64748b' }}>-log10(molar concentration)</small>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                RESEARCH CRITERION
              </small>
              <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: predictionResult.prediction.isClassifiedActive ? '#15803d' : '#b91c1c' }}>
                {predictionResult.prediction.researchThreshold.satisfied ? 'PASSED (≤ 10 μM)' : 'FAILED (> 10 μM)'}
              </div>
              <small style={{ fontSize: '10.5px', color: '#64748b' }}>Target candidate threshold</small>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                MODEL CONFIDENCE
              </small>
              <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                {predictionResult.prediction.confidenceScore} / 100
              </div>
              <small style={{ fontSize: '10.5px', color: '#64748b' }}>
                {predictionResult.prediction.isEvidenceGrounded ? 'Direct assay verified' : 'In-silico projection'}
              </small>
            </div>
          </div>

          {/* Explainable Feature Attribution */}
          <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} /> Explainable Feature Attributions
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {/* Drug features */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Small Molecule Structural Contributors:
              </div>
              {(predictionResult.explainability?.drugAttributions || []).map((attr) => (
                <div
                  key={attr.feature}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid #edf2f7',
                    fontSize: '11.5px',
                  }}
                >
                  <div>
                    <strong>{attr.feature}</strong>
                    <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>{attr.detail}</small>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      color: attr.weight.startsWith('+') ? '#16a34a' : '#dc2626',
                      marginLeft: '10px',
                    }}
                  >
                    {attr.weight}
                  </span>
                </div>
              ))}
            </div>

            {/* Target features */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Protein Target Sequence Contributors:
              </div>
              {(predictionResult.explainability?.targetAttributions || []).map((attr) => (
                <div
                  key={attr.feature}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid #edf2f7',
                    fontSize: '11.5px',
                  }}
                >
                  <div>
                    <strong>{attr.feature}</strong>
                    <small style={{ display: 'block', color: '#64748b', fontSize: '10.5px' }}>{attr.detail}</small>
                  </div>
                  <span
                    style={{
                      fontWeight: 700,
                      color: attr.weight.startsWith('+') ? '#16a34a' : '#dc2626',
                      marginLeft: '10px',
                    }}
                  >
                    {attr.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Pharmacophore & Target Residue Highlights */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                KEY PHARMACOPHORE MOIETIES:
              </small>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {(predictionResult.explainability?.keyMoleculesMoieties || []).map((m) => (
                  <span key={m} style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px' }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <small style={{ fontSize: '10.5px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                KEY BINDING RESIDUES:
              </small>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {(predictionResult.explainability?.keyTargetResidues || []).map((r) => (
                  <span key={r} style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '4px' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Benchmark Datasets & Scaffold Splitting Panel */}
      <section
        style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart3 size={17} /> Curated DTI Benchmark Datasets & Splits
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Validated against standardized BindingDB, ChEMBL, and Davis benchmarks using scaffold-aware Murcko splits.
            </p>
          </div>
          <span className="status-pill active">
            {datasetInfo?.totalCuratedPairs?.toLocaleString() || '62,706'} Curated Pairs
          </span>
        </div>

        {/* Dataset Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {(datasetInfo?.datasets || []).map((ds) => (
            <div
              key={ds.id}
              onClick={() => setSelectedDataset(ds.id)}
              style={{
                border: `1px solid ${selectedDataset === ds.id ? '#0284c7' : '#e2e8f0'}`,
                background: selectedDataset === ds.id ? '#f0f9ff' : '#ffffff',
                borderRadius: '6px',
                padding: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong style={{ fontSize: '12.5px' }}>{ds.name}</strong>
                <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {ds.version}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 8px', lineHeight: '1.4' }}>
                {ds.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#334155' }}>
                <span>ROC-AUC: <strong>{ds.metrics.rocAuc}</strong></span>
                <span>PR-AUC: <strong>{ds.metrics.prAuc}</strong></span>
                <span>Accuracy: <strong>{(ds.metrics.accuracy * 100).toFixed(1)}%</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Partition Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={splitStrategy}
            onChange={(e) => setSplitStrategy(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          >
            <option value="scaffold">Murcko Scaffold-Aware Split (80/10/10)</option>
            <option value="random">Random Stratified Split (80/10/10)</option>
          </select>

          <button
            className="outline-button small"
            onClick={handlePrepareDataset}
            disabled={loadingPartition}
            style={{ fontSize: '12px' }}
          >
            {loadingPartition ? 'Partitioning...' : 'Prepare & Partition Dataset'}
          </button>
        </div>

        {/* Partition Results View */}
        {partitionResult && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '12px',
              marginTop: '12px',
              fontSize: '11.5px',
            }}
          >
            <strong>{partitionResult.message}</strong>
            <div style={{ display: 'flex', gap: '16px', marginTop: '6px', color: '#475569' }}>
              <span>Train: <strong>{partitionResult.partitions.train.count}</strong> (80%)</span>
              <span>Validation: <strong>{partitionResult.partitions.validation.count}</strong> (10%)</span>
              <span>Test: <strong>{partitionResult.partitions.test.count}</strong> (10%)</span>
              <span>Class Balance: <strong>{partitionResult.classBalance.active} active</strong> vs {partitionResult.classBalance.inactive} inactive</span>
            </div>
          </div>
        )}
      </section>

      {/* 6. Scientific Boundary Disclaimer */}
      <div className="disclaimer" style={{ marginTop: '20px' }}>
        <ShieldCheck size={18} />
        <p>
          <strong>Computational Research Protocol</strong> DTI Lab utilizes in-silico topological circular fingerprints and sequence composition to estimate interaction probabilities. Results are computational research hypotheses designed to guide experimental assay selection, and must never replace laboratory validation or serve as clinical guidance.
        </p>
      </div>
    </div>
  )
}
