import { BrainCircuit, ExternalLink, ShieldCheck, BookOpen, Database, Sparkles, FileText } from 'lucide-react'

export default function ResearchHubView({ setNotice }) {
  const references = [
    {
      title: 'RCSB Protein Data Bank (PDB 2XCT)',
      description: 'Crystal structure of EGFR kinase domain in complex with drug-like reversible inhibitor.',
      url: 'https://www.rcsb.org/structure/2XCT',
      tag: 'Structural Biology',
    },
    {
      title: 'SwissADME Cheminformatics Suite',
      description: 'Web tool that gives free access to robust models for physicochemical properties and pharmacokinetics.',
      url: 'https://www.swissadme.ch/index.php',
      tag: 'Cheminformatics',
    },
    {
      title: 'GROMACS Molecular Dynamics Tutorials',
      description: 'Standard methodology for force-field parameterization, solvated simulation boxes, and binding energy minimization.',
      url: 'https://www.mdtutorials.com/gmx/',
      tag: 'Simulation',
    },
  ]

  const datasets = [
    { name: 'Davis Dataset', pairs: '30,056', drugs: '68', targets: '379', metric: 'Kd (nM)', focus: 'Kinase affinity spectrum' },
    { name: 'KIBA Dataset', pairs: '118,254', drugs: '2,111', targets: '229', metric: 'KIBA score', focus: 'Integrated multi-source bioactivity' },
    { name: 'BindingDB Benchmark', pairs: '2.5M+', drugs: '1M+', targets: '8,500', metric: 'IC50, Ki, Kd', focus: 'Broad therapeutic target screening' },
  ]

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Methodology & Literature</p>
          <h1>Research Hub</h1>
          <p className="intro-copy">
            Explore computational biology methodologies, open scientific benchmark datasets, and literature references.
          </p>
        </div>
        <button
          className="primary-button small"
          onClick={() => setNotice('Citation exported in BibTeX format')}
        >
          <FileText size={15} /> Export Citations
        </button>
      </div>

      <div className="dashboard-grid">
        {/* Left: Scientific Inspiration & Open Reference Architectures */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Scientific Benchmarks</p>
              <h3>Reference Platforms & Literature</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {references.map((ref) => (
              <a
                key={ref.title}
                href={ref.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px',
                  background: '#fcfdfb',
                  border: '1px solid #edf0ec',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="status-pill active">{ref.tag}</span>
                    <strong style={{ fontSize: '12.5px', color: '#1b2521' }}>{ref.title}</strong>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b', lineHeight: '1.45' }}>
                    {ref.description}
                  </p>
                </div>
                <ExternalLink size={16} color="#397654" style={{ flex: '0 0 auto', marginLeft: '12px' }} />
              </a>
            ))}
          </div>
        </div>

        {/* Right: Benchmark Datasets for DTI */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Data Foundations</p>
              <h3>Standard DTI Datasets</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {datasets.map((ds) => (
              <div key={ds.name} style={{ padding: '12px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '12px' }}>{ds.name}</strong>
                  <span className="draft-badge">{ds.metric}</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#66746b', marginBottom: '4px' }}>
                  <span>Pairs: <strong>{ds.pairs}</strong></span>
                  <span>Drugs: <strong>{ds.drugs}</strong></span>
                  <span>Targets: <strong>{ds.targets}</strong></span>
                </div>
                <small style={{ color: '#89958d', fontSize: '10px' }}>{ds.focus}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Methodology Architecture Panel */}
      <div className="content-panel" style={{ marginTop: '16px' }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Pipeline Architecture</p>
            <h3>Computational Modeling Methodology</h3>
          </div>
          <span className="draft-badge">REPRODUCIBLE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '11px' }}>
          <div style={{ padding: '12px', background: '#f9fbf8', border: '1px solid #edf0ec', borderRadius: '4px' }}>
            <span style={{ font: '600 10px var(--mono)', color: '#397654' }}>STAGE 01</span>
            <strong style={{ display: 'block', margin: '4px 0 6px', fontSize: '12px' }}>SMILES Tokenization</strong>
            <p style={{ margin: 0, color: '#64748b', fontSize: '10px', lineHeight: '1.4' }}>
              Parsing molecular strings into Morgan circular fingerprints (ECFP4) and chemical graph adjacency matrices.
            </p>
          </div>
          <div style={{ padding: '12px', background: '#f9fbf8', border: '1px solid #edf0ec', borderRadius: '4px' }}>
            <span style={{ font: '600 10px var(--mono)', color: '#397654' }}>STAGE 02</span>
            <strong style={{ display: 'block', margin: '4px 0 6px', fontSize: '12px' }}>Target Encoding</strong>
            <p style={{ margin: 0, color: '#64748b', fontSize: '10px', lineHeight: '1.4' }}>
              Transforming amino acid sequences into Conjoint Triad descriptors and ESM-2 protein language representations.
            </p>
          </div>
          <div style={{ padding: '12px', background: '#f9fbf8', border: '1px solid #edf0ec', borderRadius: '4px' }}>
            <span style={{ font: '600 10px var(--mono)', color: '#397654' }}>STAGE 03</span>
            <strong style={{ display: 'block', margin: '4px 0 6px', fontSize: '12px' }}>Graph Affinity Layer</strong>
            <p style={{ margin: 0, color: '#64748b', fontSize: '10px', lineHeight: '1.4' }}>
              Bilinear tensor fusion combining drug molecular embeddings and target pocket vectors.
            </p>
          </div>
          <div style={{ padding: '12px', background: '#f9fbf8', border: '1px solid #edf0ec', borderRadius: '4px' }}>
            <span style={{ font: '600 10px var(--mono)', color: '#397654' }}>STAGE 04</span>
            <strong style={{ display: 'block', margin: '4px 0 6px', fontSize: '12px' }}>Uncertainty Estimation</strong>
            <p style={{ margin: 0, color: '#64748b', fontSize: '10px', lineHeight: '1.4' }}>
              Monte Carlo dropout and conformal prediction intervals to guard against out-of-distribution chemical space.
            </p>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <ShieldCheck size={18} />
        <p>
          <strong>Scientific Methodology Disclaimer</strong> Aegis is an open computational biology platform. All models and heuristics are for exploratory research purposes and require empirical validation in wet-lab assays.
        </p>
      </div>
    </div>
  )
}
