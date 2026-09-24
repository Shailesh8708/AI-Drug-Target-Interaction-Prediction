import { useState, useRef, useEffect } from 'react'
import { Atom, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react'

const PRESET_MOLECULES = [
  {
    name: 'Aspirin (Acetylsalicylic acid)',
    formula: 'C9H8O4',
    smiles: 'CC(=O)Oc1ccccc1C(=O)O',
    mw: 180.16,
    logP: 1.31,
    hbd: 1,
    hba: 4,
    tpsa: 63.6,
    rotBonds: 3,
  },
  {
    name: 'Imatinib',
    formula: 'C29H31N7O',
    smiles: 'Cc1ccc(NC(=O)c2ccc(CN3CCN(C)CC3)cc2)cc1Nc4nccc(n4)c5cccnc5',
    mw: 493.60,
    logP: 3.52,
    hbd: 2,
    hba: 7,
    tpsa: 86.3,
    rotBonds: 7,
  },
  {
    name: 'Caffeine',
    formula: 'C8H10N4O2',
    smiles: 'Cn1cnc2c1c(=O)n(c(=O)n2C)C',
    mw: 194.19,
    logP: -0.07,
    hbd: 0,
    hba: 3,
    tpsa: 58.4,
    rotBonds: 0,
  },
]

export default function MoleculeLabView({ setNotice }) {
  const [selectedMolecule, setSelectedMolecule] = useState(PRESET_MOLECULES[0])
  const [customSmiles, setCustomSmiles] = useState(PRESET_MOLECULES[0].smiles)
  const canvasRef = useRef(null)

  // Interactive 3D Ball-and-Stick Rotation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frameId
    let angleX = 0.4
    let angleY = 0

    // Representative 3D atoms for visual simulation
    const atoms = [
      { x: -30, y: -20, z: 0, color: '#64748b', r: 8, label: 'C' },
      { x: 0, y: -35, z: 15, color: '#64748b', r: 8, label: 'C' },
      { x: 30, y: -20, z: -10, color: '#64748b', r: 8, label: 'C' },
      { x: 30, y: 15, z: 5, color: '#64748b', r: 8, label: 'C' },
      { x: 0, y: 30, z: -15, color: '#64748b', r: 8, label: 'C' },
      { x: -30, y: 15, z: 10, color: '#64748b', r: 8, label: 'C' },
      { x: 55, y: -35, z: -5, color: '#ef4444', r: 9, label: 'O' },
      { x: 75, y: -25, z: 10, color: '#38bdf8', r: 7, label: 'N' },
      { x: -55, y: 25, z: 12, color: '#f59e0b', r: 9, label: 'O' },
      { x: -70, y: 15, z: -8, color: '#ffffff', r: 5, label: 'H' },
    ]

    const bonds = [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
      [2, 6], [6, 7], [5, 8], [8, 9],
    ]

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      angleY += 0.012
      angleX += 0.005

      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)
      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)

      const projected = atoms.map((atom) => {
        // Rotate Y
        let x1 = atom.x * cosY + atom.z * sinY
        let z1 = -atom.x * sinY + atom.z * cosY
        // Rotate X
        let y1 = atom.y * cosX - z1 * sinX
        let z2 = atom.y * sinX + z1 * cosX

        const f = 160
        const scale = f / (f + z2)
        return {
          px: cx + x1 * scale,
          py: cy + y1 * scale,
          pz: z2,
          scale,
          color: atom.color,
          r: atom.r * scale,
          label: atom.label,
        }
      })

      // Draw Bonds
      bonds.forEach(([i, j]) => {
        const p1 = projected[i]
        const p2 = projected[j]
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)'
        ctx.lineWidth = 3 * ((p1.scale + p2.scale) / 2)
        ctx.beginPath()
        ctx.moveTo(p1.px, p1.py)
        ctx.lineTo(p2.px, p2.py)
        ctx.stroke()
      })

      // Sort by depth
      projected.sort((a, b) => b.pz - a.pz)

      // Draw Atoms with 3D gradient
      projected.forEach((atom) => {
        const grad = ctx.createRadialGradient(
          atom.px - atom.r * 0.35,
          atom.py - atom.r * 0.35,
          1,
          atom.px,
          atom.py,
          atom.r
        )
        grad.addColorStop(0, '#ffffff')
        grad.addColorStop(0.3, atom.color)
        grad.addColorStop(1, '#0f172a')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(atom.px, atom.py, atom.r, 0, Math.PI * 2)
        ctx.fill()
      })

      frameId = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(frameId)
  }, [selectedMolecule])

  const handleSelectPreset = (mol) => {
    setSelectedMolecule(mol)
    setCustomSmiles(mol.smiles)
    if (setNotice) setNotice(`Loaded 3D structure for ${mol.name}`)
  }

  // Lipinski rule checks
  const ruleMw = selectedMolecule.mw <= 500
  const ruleLogP = selectedMolecule.logP <= 5
  const ruleHbd = selectedMolecule.hbd <= 5
  const ruleHba = selectedMolecule.hba <= 10
  const passesLipinski = ruleMw && ruleLogP && ruleHbd && ruleHba

  return (
    <div className="page-wrap">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Structural Cheminformatics</p>
          <h1>Molecule Lab</h1>
          <p className="intro-copy">
            Explore 3D stereochemical conformations, atomic coordinates, and Lipinski Rule of 5 descriptors.
          </p>
        </div>
        <button
          className="primary-button small"
          onClick={() => setNotice('3D coordinate export formatted in SDF/MOL format')}
        >
          <Layers size={15} /> Export Mol Data
        </button>
      </div>

      <div className="lab-grid">
        {/* Left: 3D Molecular Conformation Viewport */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">3D Interactive Conformation</p>
              <h3>{selectedMolecule.name}</h3>
            </div>
            <span className="draft-badge">{selectedMolecule.formula}</span>
          </div>

          <div
            style={{
              position: 'relative',
              height: '280px',
              background: '#182922',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <canvas ref={canvasRef} width="360" height="280" style={{ maxWidth: '100%', height: '100%' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#9db6a6', font: '500 8.5px var(--mono)' }}>
              ROTATION: ACTIVE · FORCE-FIELD: MMFF94
            </div>
          </div>

          {/* Molecule Selector Chips */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            {PRESET_MOLECULES.map((m) => (
              <button
                key={m.name}
                className={`quiet-button ${selectedMolecule.name === m.name ? 'selected' : ''}`}
                style={{
                  background: selectedMolecule.name === m.name ? '#e4f0e5' : undefined,
                  borderColor: selectedMolecule.name === m.name ? '#397654' : undefined,
                  color: selectedMolecule.name === m.name ? '#1b2521' : undefined,
                  fontWeight: selectedMolecule.name === m.name ? '700' : undefined,
                }}
                onClick={() => handleSelectPreset(m)}
              >
                <Atom size={13} />
                <span>{m.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <label style={{ display: 'block', marginTop: '16px', color: '#66746b', font: '500 10px var(--mono)' }}>
            SMILES Representation
            <input
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '10px',
                fontFamily: 'monospace',
                fontSize: '11px',
                background: '#f5f7f3',
                border: '1px solid #dfe7df',
                borderRadius: '3px',
              }}
              value={customSmiles}
              onChange={(e) => setCustomSmiles(e.target.value)}
            />
          </label>
        </div>

        {/* Right: Physicochemical Descriptors & Lipinski Rules */}
        <div className="content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Pharmacological Descriptors</p>
              <h3>Physicochemical Properties</h3>
            </div>
            <span className={`status-pill ${passesLipinski ? 'active' : 'warning'}`}>
              {passesLipinski ? 'Drug-Like' : 'Review Profile'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>MOL WEIGHT</small>
              <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{selectedMolecule.mw} g/mol</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>LOGP (OCTANOL/WATER)</small>
              <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{selectedMolecule.logP}</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>H-BOND DONORS</small>
              <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{selectedMolecule.hbd}</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>H-BOND ACCEPTORS</small>
              <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{selectedMolecule.hba}</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>TPSA (POLAR SURFACE)</small>
              <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{selectedMolecule.tpsa} Å²</strong>
            </div>
            <div style={{ padding: '10px', background: '#f7f9f5', border: '1px solid #edf0ec', borderRadius: '4px' }}>
              <small style={{ color: '#8b968e', fontSize: '9px', fontFamily: 'monospace' }}>ROTATABLE BONDS</small>
              <strong style={{ display: 'block', fontSize: '16px', marginTop: '4px' }}>{selectedMolecule.rotBonds}</strong>
            </div>
          </div>

          <h4 style={{ fontSize: '12px', margin: '0 0 10px', color: '#55635a' }}>Lipinski Rule of Five Assessment</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', padding: '6px 0', borderBottom: '1px solid #edf0ec' }}>
              <span>MW ≤ 500 Da</span>
              {ruleMw ? <CheckCircle2 size={15} color="#397654" /> : <AlertCircle size={15} color="#b95b51" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', padding: '6px 0', borderBottom: '1px solid #edf0ec' }}>
              <span>LogP ≤ 5</span>
              {ruleLogP ? <CheckCircle2 size={15} color="#397654" /> : <AlertCircle size={15} color="#b95b51" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', padding: '6px 0', borderBottom: '1px solid #edf0ec' }}>
              <span>H-Bond Donors ≤ 5</span>
              {ruleHbd ? <CheckCircle2 size={15} color="#397654" /> : <AlertCircle size={15} color="#b95b51" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', padding: '6px 0', borderBottom: '1px solid #edf0ec' }}>
              <span>H-Bond Acceptors ≤ 10</span>
              {ruleHba ? <CheckCircle2 size={15} color="#397654" /> : <AlertCircle size={15} color="#b95b51" />}
            </div>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <ShieldCheck size={18} />
        <p>
          <strong>Computational Chemistry Estimation</strong> Descriptors and Lipinski filters are computed approximations based on 2D chemical structure. Biological bioavailability and clinical safety require rigorous experimental validation.
        </p>
      </div>
    </div>
  )
}
