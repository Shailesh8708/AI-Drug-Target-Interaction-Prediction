import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Atom, Check, ChevronDown, Clipboard, Copy, Download, Eye, FileJson, FileText, GitCompare, Link2, RotateCcw, Save, Trash2, Undo2, Redo2, Wand2, X } from 'lucide-react'
import {
  BOND_TYPES, ELEMENT_COLORS, ELEMENTS, TEMPLATE_LIBRARY, addTemplate, calculateDescriptors,
  cloneMolecule, createAtom, createMolecule, moleculeToJson, moleculeToMol, parseSmiles, recompute, removeAtom, upsertBond,
} from '../../services/molecularModel'

const STORAGE_KEY = 'aegis-molecular-studio-saved'

function readSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function downloadText(filename, content, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function sampleMolecule() {
  return addTemplate(createMolecule('Benzene draft'), TEMPLATE_LIBRARY[0], { x: 250, y: 180 })
}

function formatValue(value, suffix = '') {
  return value === null || value === undefined || Number.isNaN(Number(value)) ? 'Not available' : `${value}${suffix}`
}

function MoleculeCanvas({ molecule, tool, element, bondType, selectedAtom, selectedBond, onAtomClick, onBondClick, onCanvasClick, showHydrogens, showLabels, highlight }) {
  const svgRef = useRef(null)
  const width = 620
  const height = 390
  const activeIds = useMemo(() => {
    const ids = new Set()
    if (highlight === 'heteroatoms') molecule.atoms.filter((atom) => atom.element !== 'C' && atom.element !== 'H').forEach((atom) => ids.add(atom.id))
    if (highlight === 'carbon-skeleton') molecule.atoms.filter((atom) => atom.element === 'C').forEach((atom) => ids.add(atom.id))
    if (highlight === 'rings') molecule.bonds.filter((bond) => bond.type === 'aromatic').forEach((bond) => { ids.add(bond.from); ids.add(bond.to) })
    return ids
  }, [highlight, molecule])

  const pointFromEvent = (event) => {
    const rect = svgRef.current.getBoundingClientRect()
    return { x: ((event.clientX - rect.left) / rect.width) * width, y: ((event.clientY - rect.top) / rect.height) * height }
  }

  return <svg ref={svgRef} className="studio-canvas" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Editable 2D molecular structure canvas" onClick={(event) => onCanvasClick(pointFromEvent(event))}>
    <defs><pattern id="studio-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#dce8de" strokeWidth=".7" /></pattern></defs>
    <rect width={width} height={height} fill="url(#studio-grid)" />
    {molecule.bonds.map((bond) => {
      const from = molecule.atoms.find((atom) => atom.id === bond.from)
      const to = molecule.atoms.find((atom) => atom.id === bond.to)
      if (!from || !to) return null
      const selected = selectedBond === bond.id
      const lines = bond.type === 'double' ? [-3, 3] : bond.type === 'triple' ? [-5, 0, 5] : [0]
      return <g key={bond.id} className={`studio-bond ${selected ? 'selected' : ''}`} onClick={(event) => { event.stopPropagation(); onBondClick(bond.id) }}>
        {lines.map((offset) => <line key={offset} x1={from.x + offset} y1={from.y + offset} x2={to.x + offset} y2={to.y + offset} stroke={bond.type === 'aromatic' ? '#397654' : selected ? '#ef7869' : '#5d7569'} strokeWidth={selected ? 4 : 2.5} strokeDasharray={bond.type === 'aromatic' ? '5 4' : undefined} />)}
      </g>
    })}
    {molecule.atoms.filter((atom) => showHydrogens || atom.element !== 'H').map((atom) => {
      const selected = selectedAtom === atom.id
      const active = activeIds.has(atom.id)
      return <g key={atom.id} className={`studio-atom ${selected ? 'selected' : ''} ${active ? 'highlighted' : ''}`} onClick={(event) => { event.stopPropagation(); onAtomClick(atom.id) }}>
        <circle cx={atom.x} cy={atom.y} r={selected || active ? 18 : 14} fill={ELEMENT_COLORS[atom.element] || '#ec4899'} stroke={selected ? '#ef7869' : active ? '#397654' : '#fff'} strokeWidth={selected || active ? 3 : 2} />
        {showLabels && <text x={atom.x} y={atom.y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={atom.element === 'H' || atom.element === 'N' ? '#163128' : '#fff'}>{atom.element}</text>}
        <text x={atom.x + 17} y={atom.y - 14} className="studio-index">{atom.id.replace('a-', '#')}</text>
      </g>
    })}
    {!molecule.atoms.length && <text x={width / 2} y={height / 2} textAnchor="middle" className="canvas-empty">Choose a template or select Atom, then click the canvas</text>}
    {tool === 'atom' && <text x="18" y="28" className="canvas-hint">ATOM MODE · CLICK TO PLACE {element}</text>}
    {tool === 'bond' && <text x="18" y="28" className="canvas-hint">BOND MODE · SELECT TWO ATOMS</text>}
  </svg>
}

function Inspector({ molecule, selectedAtom, selectedBond, onDelete }) {
  const atom = molecule.atoms.find((item) => item.id === selectedAtom)
  const bond = molecule.bonds.find((item) => item.id === selectedBond)
  if (atom) {
    const connected = molecule.bonds.filter((item) => item.from === atom.id || item.to === atom.id).map((item) => item.from === atom.id ? item.to : item.from)
    return <div className="studio-inspector-block"><div className="inspector-title"><Atom size={15} /><strong>Atom Inspector</strong><button className="icon-button" onClick={() => onDelete(atom.id)} aria-label="Delete selected atom"><Trash2 size={14} /></button></div><div className="inspector-grid"><span>Element<strong>{atom.element}</strong></span><span>Index<strong>{atom.id}</strong></span><span>Formal charge<strong>{atom.charge}</strong></span><span>Aromaticity<strong>{atom.aromatic ? 'Yes' : 'No'}</strong></span><span>Hydrogens<strong>{atom.hydrogens ?? 'Not available'}</strong></span><span>Connected<strong>{connected.length ? connected.join(', ') : 'None'}</strong></span></div></div>
  }
  if (bond) return <div className="studio-inspector-block"><div className="inspector-title"><Link2 size={15} /><strong>Bond Inspector</strong><button className="icon-button" onClick={() => onDelete(bond.id)} aria-label="Delete selected bond"><Trash2 size={14} /></button></div><div className="inspector-grid"><span>Type<strong>{bond.type}</strong></span><span>Order<strong>{bond.order}</strong></span><span>Atoms<strong>{bond.from} / {bond.to}</strong></span><span>Stereo<strong>{bond.stereo || 'Not detected'}</strong></span><span>Length<strong>Not available</strong></span></div></div>
  return <div className="studio-empty-inspector"><Eye size={18} /><strong>Select an atom or bond</strong><span>Details from the current graph will appear here.</span></div>
}

export default function MolecularStudioView({ setNotice, navigate }) {
  const [molecule, setMolecule] = useState(sampleMolecule)
  const [history, setHistory] = useState([])
  const [future, setFuture] = useState([])
  const [tool, setTool] = useState('select')
  const [element, setElement] = useState('C')
  const [bondType, setBondType] = useState('single')
  const [selectedAtom, setSelectedAtom] = useState(null)
  const [selectedBond, setSelectedBond] = useState(null)
  const [view, setView] = useState('split')
  const [activePanel, setActivePanel] = useState('properties')
  const [highlight, setHighlight] = useState('none')
  const [showHydrogens, setShowHydrogens] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [saved, setSaved] = useState(readSaved)
  const [smiles, setSmiles] = useState('')
  const [smilesMessage, setSmilesMessage] = useState('')
  const [compare, setCompare] = useState(null)
  const [bondStart, setBondStart] = useState(null)
  const descriptors = molecule.descriptors || calculateDescriptors(molecule)

  const commit = (next) => { setHistory((items) => [...items.slice(-29), cloneMolecule(molecule)]); setFuture([]); setMolecule(recompute(next)) }
  const reset = () => { commit(createMolecule()); setSelectedAtom(null); setSelectedBond(null); setNotice?.('Studio canvas cleared') }
  const selectAtom = (id) => {
    setSelectedBond(null)
    if (tool === 'bond') { if (!bondStart) setBondStart(id); else { commit(upsertBond(molecule, bondStart, id, bondType)); setBondStart(null) } }
    else setSelectedAtom(id)
  }
  const onCanvasClick = ({ x, y }) => { if (tool === 'atom') commit({ ...molecule, atoms: [...molecule.atoms, createAtom(element, x, y)] }) }
  const deleteSelection = (id) => { if (molecule.atoms.some((atom) => atom.id === id)) commit(removeAtom(molecule, id)); else commit({ ...molecule, bonds: molecule.bonds.filter((bond) => bond.id !== id) }); setSelectedAtom(null); setSelectedBond(null) }
  const undo = () => { const previous = history.at(-1); if (!previous) return; setFuture((items) => [cloneMolecule(molecule), ...items]); setHistory((items) => items.slice(0, -1)); setMolecule(previous) }
  const redo = () => { const next = future[0]; if (!next) return; setHistory((items) => [...items, cloneMolecule(molecule)]); setFuture((items) => items.slice(1)); setMolecule(next) }

  useEffect(() => {
    const onKey = (event) => {
      const modifier = event.metaKey || event.ctrlKey
      if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo() }
      if (event.key === 'Delete' && (selectedAtom || selectedBond)) deleteSelection(selectedAtom || selectedBond)
      if (event.key === 'Escape') { setSelectedAtom(null); setSelectedBond(null); setBondStart(null); setTool('select') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const add = (template) => { commit(addTemplate(molecule, template, { x: 280, y: 190 })); setTool('select'); setNotice?.(`Inserted ${template.name} into the molecular graph`) }
  const save = () => { const record = { ...molecule, savedAt: new Date().toISOString() }; const next = [record, ...saved.filter((item) => item.name !== molecule.name)].slice(0, 12); setSaved(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setNotice?.(`${molecule.name} saved locally`) }
  const loadSaved = (item) => { setMolecule(recompute(item)); setHistory([]); setFuture([]); setNotice?.(`Reopened ${item.name}`) }
  const loadSmiles = () => { try { const parsed = parseSmiles(smiles); commit(parsed); setSmilesMessage('Parsed into the editable graph. Full valence and stereochemistry validation requires RDKit.'); setNotice?.('SMILES loaded into Molecular Studio') } catch (errorObject) { setSmilesMessage(`${errorObject.message} The previous valid graph was preserved.`) } }
  const copy = async (value, message) => { await navigator.clipboard?.writeText(value); setNotice?.(message) }
  const useInDti = () => { if (molecule.validation?.status !== 'valid') return setNotice?.('Validate a non-empty structure before handing it to DTI Lab'); localStorage.setItem('aegis-dti-molecule', moleculeToJson(molecule)); setNotice?.('Validated molecule staged for DTI Lab; prediction pipeline is not configured'); navigate?.('dti') }
  const lipinski = [{ label: 'MW <= 500 Da', pass: descriptors.molecularWeight !== null && descriptors.molecularWeight <= 500 }, { label: 'HBD <= 5', pass: descriptors.hbd <= 5 }, { label: 'HBA <= 10', pass: descriptors.hba <= 10 }, { label: 'LogP <= 5', pass: null }]

  return <div className="page-wrap molecular-studio-page">
    <div className="page-intro"><div><p className="eyebrow">Aegis Molecular Studio</p><h1>Build, inspect, and explain structures.</h1><p className="intro-copy">A structured chemical graph sits behind every edit. Local descriptors are deterministic; advanced chemistry is clearly marked until RDKit is connected.</p></div><div className="studio-header-actions"><button className="outline-button" onClick={save}><Save size={15} /> Save</button><button className="primary-button small" onClick={() => downloadText(`${molecule.name || 'molecule'}.json`, moleculeToJson(molecule), 'application/json')}><Download size={15} /> Export</button></div></div>
    <div className="studio-layout">
      <aside className="studio-toolbox content-panel"><div className="panel-heading"><div><p className="eyebrow">Chemistry toolbox</p><h3>Editor</h3></div><span className={`studio-status ${molecule.validation?.status}`}>{molecule.validation?.status}</span></div><div className="tool-grid">{[['select', 'Select'], ['atom', 'Atom'], ['bond', 'Bond']].map(([id, label]) => <button key={id} className={`studio-tool ${tool === id ? 'active' : ''}`} onClick={() => { setTool(id); setBondStart(null) }}><Atom size={14} />{label}</button>)}</div><label className="studio-field">Element<select value={element} onChange={(event) => setElement(event.target.value)}>{ELEMENTS.map((item) => <option key={item}>{item}</option>)}</select></label><label className="studio-field">Bond type<select value={bondType} onChange={(event) => setBondType(event.target.value)}>{BOND_TYPES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><div className="studio-tool-row"><button className="icon-button" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 size={15} /></button><button className="icon-button" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 size={15} /></button><button className="icon-button" onClick={reset} aria-label="Clear canvas"><Trash2 size={15} /></button></div><div className="studio-divider" /><p className="eyebrow">Templates</p><div className="template-list">{TEMPLATE_LIBRARY.map((template) => <button key={template.id} onClick={() => add(template)}><span>{template.name}</span><small>{template.category}</small><ChevronDown size={13} /></button>)}</div><div className="studio-divider" /><p className="eyebrow">Saved locally</p><div className="saved-list">{saved.length ? saved.slice(0, 4).map((item) => <button key={`${item.name}-${item.savedAt}`} onClick={() => loadSaved(item)}><Save size={12} />{item.name}</button>) : <span className="field-help">No saved structures yet.</span>}</div></aside>
      <main className="studio-main"><div className="studio-toolbar"><div className="view-switcher">{[['2d', '2D Structure'], ['split', 'Split View'], ['3d', '3D Molecule']].map(([id, label]) => <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>{label}</button>)}</div><div className="studio-toolbar-actions"><button className={`quiet-button ${showLabels ? 'selected' : ''}`} onClick={() => setShowLabels((value) => !value)}><Eye size={14} /> Labels</button><button className={`quiet-button ${showHydrogens ? 'selected' : ''}`} onClick={() => setShowHydrogens((value) => !value)}>H</button></div></div><div className={`studio-view-grid view-${view}`}><section className="studio-canvas-panel content-panel"><div className="panel-heading compact"><div><p className="eyebrow">2D chemical graph</p><h3>{molecule.name}</h3></div><span className="draft-badge">{descriptors.atomCount} atoms · {descriptors.bondCount} bonds</span></div><MoleculeCanvas {...{ molecule, tool, element, bondType, selectedAtom, selectedBond, onAtomClick: selectAtom, onBondClick: (id) => { setSelectedBond(id); setSelectedAtom(null) }, onCanvasClick, showHydrogens, showLabels, highlight }} /><p className="field-help">{tool === 'bond' && bondStart ? `Bond start: ${bondStart}. Select another atom.` : molecule.validation?.message}</p></section><section className="studio-3d-panel content-panel"><div className="panel-heading compact"><div><p className="eyebrow">3D molecular scene</p><h3>Interactive preview</h3></div><span className="draft-badge">Coordinates pending</span></div><div className="studio-3d-stage"><div className="studio-orbit orbit-a" /><div className="studio-orbit orbit-b" />{molecule.atoms.filter((atom) => showHydrogens || atom.element !== 'H').map((atom, index) => <span key={atom.id} className="studio-3d-atom" style={{ '--x': `${50 + (atom.x - 280) * .23 + Math.sin(index) * 5}%`, '--y': `${50 + (atom.y - 190) * .23}%`, '--z': `${index * 2}px`, background: ELEMENT_COLORS[atom.element] || '#ec4899' }} onClick={() => selectAtom(atom.id)} title={`${atom.element} ${atom.id}`} />)}<div className="studio-3d-note"><Wand2 size={15} /> No 3D conformer generated yet. Connect RDKit for validated coordinates.</div></div></section></div><section className="studio-analysis content-panel"><div className="studio-tabs">{[['properties', 'Properties'], ['topology', 'Topology'], ['drug', 'Drug Profile'], ['compare', 'Compare'], ['explain', 'Explain Structure']].map(([id, label]) => <button key={id} className={activePanel === id ? 'active' : ''} onClick={() => setActivePanel(id)}>{label}</button>)}</div>{activePanel === 'properties' && <div className="studio-property-grid">{[['Formula', descriptors.formula], ['Molecular weight', formatValue(descriptors.molecularWeight, ' Da')], ['Exact mass', formatValue(descriptors.exactMass, ' Da')], ['Atoms', descriptors.atomCount], ['Heavy atoms', descriptors.heavyAtomCount], ['Hydrogens', descriptors.hydrogenCount], ['Heteroatoms', descriptors.heteroatomCount], ['Formal charge', descriptors.formalCharge], ['H-bond donors', descriptors.hbd], ['H-bond acceptors', descriptors.hba], ['TPSA', 'Not available'], ['LogP', 'Not available']].map(([label, value]) => <div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>}{activePanel === 'topology' && <div className="studio-topology"><div className="topology-controls">{[['none', 'Clear highlight'], ['carbon-skeleton', 'Carbon skeleton'], ['heteroatoms', 'Heteroatoms'], ['rings', 'Rings']].map(([id, label]) => <button className={highlight === id ? 'active' : ''} key={id} onClick={() => setHighlight(id)}>{label}</button>)}</div><div className="studio-topology-summary"><span><strong>{descriptors.components}</strong> connected component(s)</span><span><strong>{descriptors.ringCount}</strong> cycle estimate</span><span><strong>{descriptors.rotatableBonds}</strong> rotatable bonds</span><span><strong>{descriptors.aromaticRingCount}</strong> aromatic ring estimate</span></div></div>}{activePanel === 'drug' && <div className="studio-drug-profile"><div><p className="field-help">Computational screening indicator only. No biological or clinical conclusion is implied.</p>{lipinski.map((rule) => <div className="drug-rule" key={rule.label}><span>{rule.label}</span>{rule.pass === true ? <Check size={15} color="#397654" /> : <span className="not-configured">Not available</span>}</div>)}</div><div className="studio-unavailable"><AlertTriangle size={17} /><strong>Advanced descriptors unavailable</strong><span>TPSA and LogP require a chemistry engine such as RDKit. No values are fabricated in this workspace.</span></div></div>}{activePanel === 'compare' && <div className="studio-compare"><div className="smiles-row"><label>Structure comparison input<input value={smiles} onChange={(event) => setSmiles(event.target.value)} placeholder="Paste SMILES for a future validated comparison" /></label><button className="outline-button" onClick={() => setCompare(smiles ? { input: smiles, method: 'Pending RDKit canonicalization' } : null)}><GitCompare size={14} /> Compare</button></div>{compare ? <p className="field-help">Comparison queued for {compare.input}. {compare.method}; similarity score is not available.</p> : <p className="field-help">Similarity and common-substructure results remain unavailable until both structures are validated by the chemistry service.</p>}</div>}{activePanel === 'explain' && <div className="studio-explanation"><h4>Structure overview</h4><ul><li>Contains {descriptors.atomCount} atoms, including {descriptors.heavyAtomCount} heavy atoms.</li><li>Contains {descriptors.heteroatomCount} heteroatom(s) and {descriptors.ringCount} cycle estimate(s).</li><li>Formal charge is {descriptors.formalCharge}; hydrogen count is {descriptors.hydrogenCount} in the current explicit graph.</li><li>Advanced stereochemistry and valence interpretation: not supported in the local editor.</li></ul></div>}</section></main>
      <aside className="studio-inspector content-panel"><div className="panel-heading"><div><p className="eyebrow">Molecular inspector</p><h3>Current structure</h3></div><button className="icon-button" onClick={() => copy(moleculeToJson(molecule), 'Molecular JSON copied')} aria-label="Copy molecular JSON"><Clipboard size={15} /></button></div><Inspector molecule={molecule} selectedAtom={selectedAtom} selectedBond={selectedBond} onDelete={deleteSelection} /><div className="studio-divider" /><label className="studio-field">Structure name<input value={molecule.name} onChange={(event) => setMolecule((current) => ({ ...current, name: event.target.value }))} /></label><label className="studio-field">SMILES workflow<input value={smiles} onChange={(event) => setSmiles(event.target.value)} placeholder="SMILES input" /></label><div className="studio-button-stack"><button className="outline-button" onClick={loadSmiles}><Check size={14} /> Validate / load syntax</button><button className="quiet-button" onClick={() => copy(smiles || 'Not available', 'SMILES copied')}><Copy size={14} /> Copy SMILES</button><button className="quiet-button" onClick={() => downloadText(`${molecule.name || 'molecule'}.mol`, moleculeToMol(molecule))}><FileText size={14} /> Export MOL</button><button className="quiet-button" onClick={() => downloadText(`${molecule.name || 'molecule'}.json`, moleculeToJson(molecule), 'application/json')}><FileJson size={14} /> Export JSON</button></div>{smilesMessage && <p className="studio-message" role="status">{smilesMessage}</p>}<button className="primary-button studio-dti-button" onClick={useInDti}><Wand2 size={15} /> Use in DTI Analysis</button></aside>
    </div>
  </div>
}
