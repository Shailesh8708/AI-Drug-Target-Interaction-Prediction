export const ELEMENTS = ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I']

export const ELEMENT_COLORS = {
  C: '#475569', H: '#f8fafc', N: '#38bdf8', O: '#ef4444', S: '#eab308',
  P: '#f97316', F: '#22c55e', Cl: '#10b981', Br: '#b91c1c', I: '#7e22ce',
}

export const BOND_TYPES = [
  { id: 'single', label: 'Single', order: 1 },
  { id: 'double', label: 'Double', order: 2 },
  { id: 'triple', label: 'Triple', order: 3 },
  { id: 'aromatic', label: 'Aromatic', order: 1.5 },
]

const MASS = { H: 1.008, C: 12.011, N: 14.007, O: 15.999, F: 18.998, P: 30.974, S: 32.06, Cl: 35.45, Br: 79.904, I: 126.904 }

export const TEMPLATE_LIBRARY = [
  { id: 'benzene', name: 'Benzene', category: 'Ring', atoms: ['C', 'C', 'C', 'C', 'C', 'C'], bonds: [[0, 1, 'aromatic'], [1, 2, 'aromatic'], [2, 3, 'aromatic'], [3, 4, 'aromatic'], [4, 5, 'aromatic'], [5, 0, 'aromatic']] },
  { id: 'cyclohexane', name: 'Cyclohexane', category: 'Ring', atoms: ['C', 'C', 'C', 'C', 'C', 'C'], bonds: [[0, 1, 'single'], [1, 2, 'single'], [2, 3, 'single'], [3, 4, 'single'], [4, 5, 'single'], [5, 0, 'single']] },
  { id: 'pyridine', name: 'Pyridine', category: 'Heterocycle', atoms: ['N', 'C', 'C', 'C', 'C', 'C'], bonds: [[0, 1, 'aromatic'], [1, 2, 'aromatic'], [2, 3, 'aromatic'], [3, 4, 'aromatic'], [4, 5, 'aromatic'], [5, 0, 'aromatic']] },
  { id: 'methyl', name: 'Methyl', category: 'Group', atoms: ['C'], bonds: [] },
  { id: 'hydroxyl', name: 'Hydroxyl', category: 'Group', atoms: ['O', 'H'], bonds: [[0, 1, 'single']] },
  { id: 'amino', name: 'Amino', category: 'Group', atoms: ['N', 'H', 'H'], bonds: [[0, 1, 'single'], [0, 2, 'single']] },
  { id: 'carbonyl', name: 'Carbonyl', category: 'Group', atoms: ['C', 'O'], bonds: [[0, 1, 'double']] },
  { id: 'amide', name: 'Amide', category: 'Group', atoms: ['C', 'O', 'N'], bonds: [[0, 1, 'double'], [0, 2, 'single']] },
]

export function createMolecule(name = 'Untitled structure') {
  return { version: 1, name, atoms: [], bonds: [], source: 'editor', validation: { status: 'empty', message: 'Add an atom or load a template.' } }
}

export function createAtom(element, x, y, options = {}) {
  return { id: options.id || `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, element, x, y, charge: options.charge || 0, aromatic: Boolean(options.aromatic), hydrogens: options.hydrogens ?? null }
}

export function createBond(from, to, type = 'single') {
  return { id: `b-${from}-${to}-${Date.now()}`, from, to, type, order: BOND_TYPES.find((item) => item.id === type)?.order || 1, stereo: 'none' }
}

export function cloneMolecule(molecule) {
  return JSON.parse(JSON.stringify(molecule))
}

export function nextId(prefix, items) {
  let index = items.length
  while (items.some((item) => item.id === `${prefix}-${index}`)) index += 1
  return `${prefix}-${index}`
}

export function addTemplate(molecule, template, origin = { x: 280, y: 180 }) {
  const next = cloneMolecule(molecule)
  const spacing = 58
  const radius = template.atoms.length > 2 ? 42 : 0
  const atomIds = template.atoms.map((element, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(template.atoms.length, 1)
    const x = template.atoms.length > 2 ? origin.x + Math.cos(angle) * radius : origin.x + index * spacing
    const y = template.atoms.length > 2 ? origin.y + Math.sin(angle) * radius : origin.y
    const atom = createAtom(element, x, y, { id: nextId('a', next.atoms), aromatic: template.bonds.some((bond) => bond[2] === 'aromatic') })
    next.atoms.push(atom)
    return atom.id
  })
  template.bonds.forEach(([from, to, type]) => next.bonds.push({ ...createBond(atomIds[from], atomIds[to], type), id: nextId('b', next.bonds) }))
  return recompute(next)
}

export function removeAtom(molecule, atomId) {
  const next = cloneMolecule(molecule)
  next.atoms = next.atoms.filter((atom) => atom.id !== atomId)
  next.bonds = next.bonds.filter((bond) => bond.from !== atomId && bond.to !== atomId)
  return recompute(next)
}

export function upsertBond(molecule, from, to, type) {
  if (from === to) return molecule
  const next = cloneMolecule(molecule)
  const existing = next.bonds.find((bond) => (bond.from === from && bond.to === to) || (bond.from === to && bond.to === from))
  if (existing) existing.type = type, existing.order = BOND_TYPES.find((item) => item.id === type)?.order || 1
  else next.bonds.push(createBond(from, to, type))
  return recompute(next)
}

function connectedComponents(atoms, bonds) {
  const seen = new Set()
  const result = []
  atoms.forEach((atom) => {
    if (seen.has(atom.id)) return
    const queue = [atom.id]
    const component = []
    seen.add(atom.id)
    while (queue.length) {
      const current = queue.shift()
      component.push(current)
      bonds.forEach((bond) => {
        const neighbour = bond.from === current ? bond.to : bond.to === current ? bond.from : null
        if (neighbour && !seen.has(neighbour)) seen.add(neighbour), queue.push(neighbour)
      })
    }
    result.push(component)
  })
  return result
}

function countRings(atoms, bonds, components) {
  return Math.max(0, bonds.length - atoms.length + components.length)
}

export function calculateDescriptors(molecule) {
  const atoms = molecule.atoms || []
  const bonds = molecule.bonds || []
  const components = connectedComponents(atoms, bonds)
  const hydrogenCount = atoms.filter((atom) => atom.element === 'H').length
  const heavyAtoms = atoms.filter((atom) => atom.element !== 'H')
  const heteroatoms = heavyAtoms.filter((atom) => atom.element !== 'C').length
  const aromaticBonds = bonds.filter((bond) => bond.type === 'aromatic').length
  const rings = countRings(atoms, bonds, components)
  const donorCount = atoms.filter((atom) => ['N', 'O', 'S'].includes(atom.element) && atom.hydrogens !== 0).length
  const acceptorCount = atoms.filter((atom) => ['N', 'O', 'S'].includes(atom.element) && atom.charge <= 0).length
  const rotatableBonds = bonds.filter((bond) => bond.type === 'single' && !isRingBond(bond, molecule)).length
  return {
    formula: formulaFor(atoms), molecularWeight: atoms.length ? Number(atoms.reduce((sum, atom) => sum + (MASS[atom.element] || 0), 0).toFixed(3)) : null,
    exactMass: atoms.length ? Number(atoms.reduce((sum, atom) => sum + (MASS[atom.element] || 0), 0).toFixed(4)) : null,
    atomCount: atoms.length, heavyAtomCount: heavyAtoms.length, hydrogenCount, heteroatomCount: heteroatoms,
    bondCount: bonds.length, ringCount: rings, aromaticRingCount: aromaticBonds >= 3 && rings > 0 ? rings : 0,
    rotatableBonds, formalCharge: atoms.reduce((sum, atom) => sum + Number(atom.charge || 0), 0),
    hbd: donorCount, hba: acceptorCount, tpsa: null, logP: null, components: components.length,
  }
}

function isRingBond(bond, molecule) {
  const without = molecule.bonds.filter((item) => item.id !== bond.id)
  return connectedComponents(molecule.atoms, without).some((component) => component.includes(bond.from) && component.includes(bond.to))
}

function formulaFor(atoms) {
  if (!atoms.length) return 'Not available'
  const counts = atoms.reduce((result, atom) => ({ ...result, [atom.element]: (result[atom.element] || 0) + 1 }), {})
  return ['C', 'H', ...Object.keys(counts).filter((key) => !['C', 'H'].includes(key)).sort()].filter((element) => counts[element]).map((element) => `${element}${counts[element] > 1 ? counts[element] : ''}`).join('')
}

export function validateMolecule(molecule) {
  if (!molecule.atoms.length) return { status: 'empty', message: 'Add at least one atom to validate this structure.' }
  const atomIds = new Set(molecule.atoms.map((atom) => atom.id))
  if (molecule.bonds.some((bond) => !atomIds.has(bond.from) || !atomIds.has(bond.to))) return { status: 'invalid', message: 'A bond references an atom that is no longer present.' }
  if (molecule.atoms.some((atom) => !ELEMENTS.includes(atom.element) && atom.element !== 'H')) return { status: 'invalid', message: 'This editor does not support one or more elements yet.' }
  return { status: 'valid', message: 'Graph is structurally consistent. Valence validation requires RDKit.' }
}

export function parseSmiles(smiles) {
  const value = String(smiles || '').trim()
  if (!value) throw new Error('SMILES input is empty.')
  const molecule = createMolecule('SMILES structure')
  const branches = []
  const rings = new Map()
  let current = null
  let pendingBond = 'single'
  let atomIndex = 0
  let x = 120
  let y = 190
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]
    if (char === '(') { if (!current) throw new Error('Branch starts before an atom.'); branches.push(current); continue }
    if (char === ')') { current = branches.pop(); if (!current) throw new Error('Unmatched branch close.'); continue }
    if (char === '=' || char === '#' || char === '-') { pendingBond = char === '=' ? 'double' : char === '#' ? 'triple' : 'single'; continue }
    if (/\d/.test(char)) {
      if (!current) throw new Error('Ring label must follow an atom.')
      if (rings.has(char)) { const start = rings.get(char); molecule.bonds.push(createBond(start, current, pendingBond)); rings.delete(char) }
      else rings.set(char, current)
      pendingBond = 'single'
      continue
    }
    if (char === '.') { current = null; pendingBond = 'single'; continue }
    if (char === '[' || char === ']' || char === '+' || char === '@' || char === '/') continue
    const two = value.slice(index, index + 2)
    const token = ['Cl', 'Br'].includes(two) ? two : /^[A-Z]/.test(char) || /^[a-z]/.test(char) ? char : null
    if (!token) throw new Error(`Unsupported SMILES token "${char}".`)
    if (token.length === 2) index += 1
    const aromatic = token === token.toLowerCase()
    const atom = createAtom(token.charAt(0).toUpperCase() + token.slice(1).toLowerCase(), x, y, { id: `a-${atomIndex}`, aromatic })
    molecule.atoms.push(atom)
    if (current) molecule.bonds.push(createBond(current, atom.id, aromatic && molecule.atoms.find((item) => item.id === current)?.aromatic ? 'aromatic' : pendingBond))
    current = atom.id
    atomIndex += 1
    x += 62
    if (x > 540) x = 120, y += 62
    pendingBond = 'single'
  }
  if (branches.length || rings.size) throw new Error('SMILES contains an unmatched branch or ring label.')
  if (!molecule.atoms.length) throw new Error('No atoms were found in the SMILES input.')
  return recompute(molecule)
}

export function recompute(molecule) {
  const next = cloneMolecule(molecule)
  next.validation = validateMolecule(next)
  next.descriptors = calculateDescriptors(next)
  return next
}

export function moleculeToJson(molecule) {
  return JSON.stringify({ ...molecule, exportedAt: new Date().toISOString() }, null, 2)
}

export function moleculeToMol(molecule) {
  const atoms = molecule.atoms || []
  const bonds = molecule.bonds || []
  const lines = [molecule.name || 'Aegis Molecular Studio', '  Aegis editor', '', `${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0  0  0  0  0999 V2000`]
  atoms.forEach((atom) => lines.push(`${(atom.x / 40).toFixed(4).padStart(10)}${(-atom.y / 40).toFixed(4).padStart(10)}${'0.0000'.padStart(10)} ${atom.element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`))
  const index = new Map(atoms.map((atom, i) => [atom.id, i + 1]))
  bonds.forEach((bond) => lines.push(`${String(index.get(bond.from)).padStart(3)}${String(index.get(bond.to)).padStart(4)}${String(Math.round(bond.order)).padStart(3)}  0  0  0  0`))
  return `${lines.join('\n')}\nM  END\n`
}
