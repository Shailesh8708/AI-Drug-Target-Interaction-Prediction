import { useState } from 'react'
import { Atom, Dna } from 'lucide-react'
import MolecularStudioView from './MolecularStudioView'
import ProteinStudioPanel from './ProteinStudioPanel'

export default function MolecularProteinStudioView({ setNotice, navigate }) {
  const [mode, setMode] = useState('molecule')
  return <div className="unified-studio-page">
    <div className="unified-studio-switcher"><div><p className="eyebrow">Aegis Molecular & Protein Visualization Studio</p><h1>Explore molecules, proteins, and their structural context.</h1><p className="intro-copy">Use real imported structure data for protein exploration. No protein, contact, surface, or DTI result is generated without a configured source or algorithm.</p></div><div className="unified-mode-tabs" role="tablist" aria-label="Studio object type"><button className={mode === 'molecule' ? 'active' : ''} onClick={() => setMode('molecule')} role="tab" aria-selected={mode === 'molecule'}><Atom size={16} /> Small molecule</button><button className={mode === 'protein' ? 'active' : ''} onClick={() => setMode('protein')} role="tab" aria-selected={mode === 'protein'}><Dna size={16} /> Protein / macromolecule</button></div></div>
    {mode === 'molecule' ? <MolecularStudioView setNotice={setNotice} navigate={navigate} /> : <div className="protein-page-wrap"><ProteinStudioPanel setNotice={setNotice} /></div>}
  </div>
}
