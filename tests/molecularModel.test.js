import test from 'node:test'
import assert from 'node:assert/strict'
import {
  TEMPLATE_LIBRARY,
  addTemplate,
  calculateDescriptors,
  createMolecule,
  moleculeToMol,
  parseSmiles,
  recompute,
  removeAtom,
  upsertBond,
  validateMolecule,
} from '../src/services/molecularModel.js'

test('template insertion creates a structured aromatic graph', () => {
  const molecule = addTemplate(createMolecule(), TEMPLATE_LIBRARY.find((item) => item.id === 'benzene'))
  assert.equal(molecule.atoms.length, 6)
  assert.equal(molecule.bonds.length, 6)
  assert.equal(molecule.descriptors.formula, 'C6')
  assert.equal(molecule.descriptors.ringCount, 1)
  assert.equal(molecule.descriptors.aromaticRingCount, 1)
  assert.equal(validateMolecule(molecule).status, 'valid')
})

test('atom and bond editing updates deterministic descriptors', () => {
  let molecule = createMolecule()
  molecule = recompute({ ...molecule, atoms: [
    { id: 'a-0', element: 'C', x: 0, y: 0, charge: 0 },
    { id: 'a-1', element: 'O', x: 50, y: 0, charge: 0 },
  ] })
  molecule = upsertBond(molecule, 'a-0', 'a-1', 'double')
  assert.equal(molecule.descriptors.formula, 'CO')
  assert.equal(molecule.descriptors.bondCount, 1)
  assert.equal(molecule.bonds[0].order, 2)
  molecule = removeAtom(molecule, 'a-1')
  assert.equal(molecule.descriptors.atomCount, 1)
  assert.equal(molecule.descriptors.bondCount, 0)
})

test('empty and malformed structures are reported without fabricated chemistry', () => {
  const empty = recompute(createMolecule())
  assert.equal(empty.validation.status, 'empty')
  assert.equal(empty.descriptors.molecularWeight, null)
  const malformed = recompute({ ...createMolecule(), atoms: [{ id: 'a-0', element: 'C', x: 0, y: 0 }], bonds: [{ id: 'bad', from: 'a-0', to: 'missing', type: 'single' }] })
  assert.equal(malformed.validation.status, 'invalid')
})

test('MOL export preserves the graph rather than rendering a screenshot', () => {
  const molecule = addTemplate(createMolecule('Export test'), TEMPLATE_LIBRARY.find((item) => item.id === 'methyl'))
  const mol = moleculeToMol(molecule)
  assert.match(mol, /Export test/)
  assert.match(mol, /M  END/)
})

test('simple SMILES becomes an editable graph and malformed input is rejected', () => {
  const molecule = parseSmiles('C1=CC=CC=C1')
  assert.equal(molecule.atoms.length, 6)
  assert.equal(molecule.bonds.length, 6)
  assert.equal(molecule.descriptors.formula, 'C6')
  assert.throws(() => parseSmiles('C1=CC('), /unmatched|Ring label|Branch/i)
})
