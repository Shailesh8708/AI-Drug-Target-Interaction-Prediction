const STANDARD_AMINO_ACIDS = new Set('ALA ARG ASN ASP CYS GLN GLU GLY HIS ILE LEU LYS MET PHE PRO SER THR TRP TYR VAL'.split(' '))
const WATER_NAMES = new Set(['HOH', 'WAT', 'DOD'])

function numberAt(line, start, end) {
  const value = Number.parseFloat(line.slice(start, end).trim())
  return Number.isFinite(value) ? value : null
}

function elementFrom(line) {
  const explicit = line.slice(76, 78).trim()
  if (explicit) return explicit[0].toUpperCase() + explicit.slice(1).toLowerCase()
  const atomName = line.slice(12, 16).trim().replace(/[0-9]/g, '')
  return atomName ? atomName[0].toUpperCase() : 'X'
}

export function createProtein(name = 'Untitled protein') {
  return {
    kind: 'protein', version: 1, name, format: null, source: 'local-import', rawText: '',
    atoms: [], chains: [], residues: [], ligands: [], secondaryStructure: { helices: [], sheets: [], turns: [], available: false },
    metadata: { structureId: null, experimentalMethod: null, resolution: null, organism: null },
    validation: { status: 'empty', message: 'Import PDB text or upload a structure file.' },
  }
}

export function parsePdb(text, name = 'Imported protein') {
  const rawText = String(text || '')
  if (!rawText.trim()) throw new Error('The structure file is empty.')
  const lines = rawText.split(/\r?\n/)
  const protein = createProtein(name)
  protein.format = 'PDB'
  protein.rawText = rawText
  const chainMap = new Map()
  const residueMap = new Map()
  const ligandMap = new Map()
  const atoms = []

  lines.forEach((line, lineIndex) => {
    const record = line.slice(0, 6).trim()
    if (record === 'HEADER') protein.metadata.structureId = line.slice(62, 66).trim() || null
    if (record === 'TITLE') protein.name = line.slice(10).trim() || protein.name
    if (record === 'EXPDTA') protein.metadata.experimentalMethod = line.slice(10).trim() || null
    if (record === 'REMARK' && line.includes('RESOLUTION.')) {
      const match = line.match(/RESOLUTION\.\s+([0-9.]+)/i)
      if (match) protein.metadata.resolution = Number(match[1])
    }
    if (record === 'HELIX') protein.secondaryStructure.helices.push({ start: line.slice(21, 25).trim(), end: line.slice(33, 37).trim(), chain: line.slice(19, 20).trim() || '?' })
    if (record === 'SHEET') protein.secondaryStructure.sheets.push({ start: line.slice(22, 26).trim(), end: line.slice(33, 37).trim(), chain: line.slice(21, 22).trim() || '?' })
    if (record !== 'ATOM' && record !== 'HETATM') return
    const x = numberAt(line, 30, 38)
    const y = numberAt(line, 38, 46)
    const z = numberAt(line, 46, 54)
    if (x === null || y === null || z === null) return
    const chainId = line.slice(21, 22).trim() || '_'
    const residueName = line.slice(17, 20).trim() || 'UNK'
    const residueNumber = line.slice(22, 26).trim() || '?'
    const insertionCode = line.slice(26, 27).trim()
    const residueId = `${chainId}:${residueNumber}${insertionCode}`
    const atomName = line.slice(12, 16).trim() || elementFrom(line)
    const isWater = WATER_NAMES.has(residueName)
    const isStandard = STANDARD_AMINO_ACIDS.has(residueName)
    const atom = { id: `p-${atoms.length}`, serial: Number.parseInt(line.slice(6, 11).trim(), 10) || lineIndex, name: atomName, element: elementFrom(line), x, y, z, chainId, residueName, residueNumber, residueId, record, bFactor: numberAt(line, 60, 66), occupancy: numberAt(line, 54, 60) }
    atoms.push(atom)
    if (!chainMap.has(chainId)) chainMap.set(chainId, { id: chainId, residueIds: [], atomIds: [], visible: true })
    const chain = chainMap.get(chainId)
    chain.atomIds.push(atom.id)
    if (!residueMap.has(residueId)) residueMap.set(residueId, { id: residueId, chainId, number: residueNumber, name: residueName, atomIds: [], isStandard, secondaryStructure: 'Not available' })
    const residue = residueMap.get(residueId)
    residue.atomIds.push(atom.id)
    if (!chain.residueIds.includes(residueId)) chain.residueIds.push(residueId)
    if (record === 'HETATM' && !isWater && !isStandard) {
      if (!ligandMap.has(residueName)) ligandMap.set(residueName, { id: residueName, name: residueName, atomIds: [], visible: true })
      ligandMap.get(residueName).atomIds.push(atom.id)
    }
  })

  protein.atoms = atoms
  protein.chains = [...chainMap.values()]
  protein.residues = [...residueMap.values()]
  protein.ligands = [...ligandMap.values()]
  protein.secondaryStructure.available = protein.secondaryStructure.helices.length > 0 || protein.secondaryStructure.sheets.length > 0
  protein.validation = atoms.length ? { status: 'valid', message: 'PDB coordinates loaded. Contact and valence analysis require a configured structural engine.' } : { status: 'invalid', message: 'No coordinate records were found in this PDB input.' }
  return protein
}

export function parseStructureText(text, format = 'auto', name = 'Imported structure') {
  const value = String(text || '')
  const detected = format === 'auto' ? (value.includes('_atom_site.') || value.includes('data_') ? 'mmCIF' : 'PDB') : format
  if (detected.toLowerCase() === 'mmcif') throw new Error('mmCIF parsing is not configured yet. Import a PDB file or connect the structural processing service.')
  return parsePdb(value, name)
}

export function proteinSummary(protein) {
  return {
    chains: protein.chains.length, residues: protein.residues.length, atoms: protein.atoms.length, ligands: protein.ligands.length,
    helices: protein.secondaryStructure.helices.length, sheets: protein.secondaryStructure.sheets.length,
  }
}

export function nearbyResidues(protein, ligandId, cutoff = 4) {
  const ligand = protein.ligands.find((item) => item.id === ligandId)
  if (!ligand) return []
  const ligandAtoms = protein.atoms.filter((atom) => ligand.atomIds.includes(atom.id))
  const distances = new Map()
  protein.atoms.filter((atom) => !ligand.atomIds.includes(atom.id)).forEach((atom) => {
    const closest = ligandAtoms.reduce((best, ligandAtom) => Math.min(best, Math.hypot(atom.x - ligandAtom.x, atom.y - ligandAtom.y, atom.z - ligandAtom.z)), Infinity)
    if (closest <= cutoff && atom.residueId) distances.set(atom.residueId, closest)
  })
  return [...distances.entries()].map(([residueId, distance]) => ({ residueId, distance: Number(distance.toFixed(2)) })).sort((a, b) => a.distance - b.distance)
}
