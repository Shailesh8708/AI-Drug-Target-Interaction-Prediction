import test from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyEntity,
  resolveUniversalEntity,
} from '../server/services/universalEntityService.js'
import {
  PERIODIC_TABLE,
  isElement,
  getElement,
  calculateElementComposition,
} from '../server/services/periodicTableData.js'
import {
  getDrugProfile,
  searchDrugs,
} from '../server/services/drugIntelligenceService.js'

test('Universal Chemical Engine: Periodic Table covers all 118 elements', () => {
  assert.equal(PERIODIC_TABLE.length, 118)

  // Verify first and last elements
  const h = PERIODIC_TABLE[0]
  assert.equal(h.number, 1)
  assert.equal(h.symbol, 'H')
  assert.equal(h.name, 'Hydrogen')

  const og = PERIODIC_TABLE[117]
  assert.equal(og.number, 118)
  assert.equal(og.symbol, 'Og')
  assert.equal(og.name, 'Oganesson')

  // Verify common metals and halogens
  assert.ok(isElement('Fe'))
  assert.ok(isElement('Iron'))
  assert.ok(isElement('gold'))
  assert.ok(isElement('Au'))
  assert.ok(isElement('Carbon'))
  assert.ok(!isElement('Benzene'))
})

test('Universal Chemical Engine: Classifies diverse scientific entity queries accurately', () => {
  // Elements
  assert.equal(classifyEntity('Iron').category, 'ELEMENT')
  assert.equal(classifyEntity('Fe').category, 'ELEMENT')
  assert.equal(classifyEntity('Au').category, 'ELEMENT')

  // PDB Complexes
  assert.equal(classifyEntity('2XCT').category, 'PROTEIN-LIGAND COMPLEX')
  assert.equal(classifyEntity('4HHB').category, 'PROTEIN-LIGAND COMPLEX')
  assert.equal(classifyEntity('1CRN').category, 'PROTEIN-LIGAND COMPLEX')

  // Proteins
  assert.equal(classifyEntity('Insulin').category, 'PROTEIN')
  assert.equal(classifyEntity('Hemoglobin').category, 'PROTEIN')
  assert.equal(classifyEntity('P0AES4').category, 'PROTEIN')

  // SMILES
  assert.equal(classifyEntity('CC(=O)O').category, 'SMILES')
  assert.equal(classifyEntity('c1ccccc1').category, 'SMILES')

  // Unknown
  assert.equal(classifyEntity('').category, 'UNKNOWN')
})

test('Universal Chemical Engine: Resolves Chemical Elements into full periodic profile', async () => {
  const iron = await resolveUniversalEntity('Iron')
  assert.ok(iron.success)
  assert.equal(iron.entityType, 'ELEMENT')
  assert.equal(iron.symbol, 'Fe')
  assert.equal(iron.atomicNumber, 26)
  assert.equal(iron.group, 8)
  assert.equal(iron.period, 4)
  assert.equal(iron.block, 'd')
  assert.equal(iron.electronConfig, '[Ar] 3d6 4s2')
  assert.ok(iron.oxidationStates.includes(2))
  assert.ok(iron.oxidationStates.includes(3))
  assert.ok(iron.atoms.length > 0)
  assert.equal(iron.elementBreakdown[0].weightPercent, 100)

  // Verify via getDrugProfile
  const feProfile = await getDrugProfile('Fe')
  assert.ok(feProfile)
  assert.equal(feProfile.entityType, 'ELEMENT')
  assert.equal(feProfile.name, 'Iron')
})

test('Universal Chemical Engine: Calculates exact elemental stoichiometry and mass breakdown', () => {
  // Ciprofloxacin: C17H18FN3O3, MW ~ 331.34
  const ciproAtoms = [
    ...Array(17).fill({ element: 'C' }),
    ...Array(18).fill({ element: 'H' }),
    ...Array(1).fill({ element: 'F' }),
    ...Array(3).fill({ element: 'N' }),
    ...Array(3).fill({ element: 'O' }),
  ]
  const breakdown = calculateElementComposition('C17H18FN3O3', ciproAtoms)
  assert.equal(breakdown.length, 5)

  const carbon = breakdown.find((b) => b.symbol === 'C')
  assert.ok(carbon)
  assert.equal(carbon.count, 17)
  assert.ok(carbon.weightPercent > 60 && carbon.weightPercent < 65)

  const fluorine = breakdown.find((b) => b.symbol === 'F')
  assert.ok(fluorine)
  assert.equal(fluorine.count, 1)
  assert.ok(fluorine.weightPercent > 5 && fluorine.weightPercent < 7)

  // Total weight percentages should sum close to 100%
  const totalPct = breakdown.reduce((sum, b) => sum + b.weightPercent, 0)
  assert.ok(Math.abs(totalPct - 100) < 0.5)
})

test('Universal Chemical Engine: Resolves Macromolecular Protein / PDB complexes', async () => {
  // 2XCT PDB complex
  const complex = await resolveUniversalEntity('2XCT')
  assert.ok(complex.success)
  assert.equal(complex.entityType, 'PROTEIN-LIGAND COMPLEX')
  assert.equal(complex.pdbId, '2XCT')
  assert.ok(complex.chains.length > 0)
  assert.ok(complex.ligands.length > 0)
  assert.ok(complex.bindingPocket)
  assert.ok(complex.bindingPocket.contactResidues.length > 0)

  // Protein Catalog: Insulin
  const insulin = await resolveUniversalEntity('Insulin')
  assert.ok(insulin.success)
  assert.equal(insulin.entityType, 'PROTEIN')
  assert.equal(insulin.name, 'Insulin')
  assert.ok(insulin.mw > 5000)
  assert.ok(insulin.chains.length >= 2)
})

test('Universal Chemical Engine: Universal search returns multi-category scientific hits', async () => {
  // Empty query returns rich diverse catalog
  const presets = await searchDrugs('')
  assert.ok(presets.length >= 10)
  assert.ok(presets.some((p) => p.entityType === 'ELEMENT'))
  assert.ok(presets.some((p) => p.entityType === 'DRUG'))
  assert.ok(presets.some((p) => p.entityType === 'PROTEIN'))
  assert.ok(presets.some((p) => p.entityType === 'PROTEIN-LIGAND COMPLEX'))

  // Element query
  const goldHits = await searchDrugs('Gold')
  assert.ok(goldHits.some((h) => h.symbol === 'Au' && h.entityType === 'ELEMENT'))

  // PDB query
  const pdbHits = await searchDrugs('2XCT')
  assert.ok(pdbHits.some((h) => h.pdbId === '2XCT' && h.entityType === 'PROTEIN-LIGAND COMPLEX'))
})

test('Universal Chemical Engine: Handles unknown or malformed input gracefully without crashing', async () => {
  const result = await resolveUniversalEntity('xyzqwerty123456')
  assert.equal(result.success, false)
  assert.equal(result.entityType, 'UNKNOWN')
  assert.ok(result.message)
})
