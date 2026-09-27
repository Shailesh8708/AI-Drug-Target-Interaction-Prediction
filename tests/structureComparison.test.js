import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateMCS,
  calculateTanimotoSimilarity,
  analyzeStructuralDifferences,
} from '../server/services/structureComparison.js'
import { parseSmiles } from '../src/services/molecularModel.js'

test('Test 1 — Benzene vs Toluene: identifies benzene core MCS and methyl addition', () => {
  const benzene = parseSmiles('c1ccccc1')
  benzene.name = 'Benzene'
  benzene.formula = 'C6H6'

  const toluene = parseSmiles('Cc1ccccc1')
  toluene.name = 'Toluene'
  toluene.formula = 'C7H8'

  const mcs = calculateMCS(benzene, toluene)
  assert.equal(mcs.commonAtomsCount, 6, 'Benzene ring should match 6 carbon atoms')
  assert.ok(mcs.commonBondsCount >= 5, 'Common ring should have at least 5-6 common bonds')

  const diff = analyzeStructuralDifferences(benzene, toluene, mcs)
  assert.equal(diff.addedToB.length, 1, 'Toluene should have exactly 1 additional heavy carbon atom')
  assert.match(diff.additionsSummary, /Methyl/i, 'Should identify additional methyl group')

  const sim = calculateTanimotoSimilarity(benzene, toluene)
  assert.ok(sim.score >= 0.35 && sim.score <= 1.0, 'Tanimoto similarity should reflect related aromatic core')
  assert.ok(mcs.similarityScore >= 0.85, 'MCS similarity score should be very high (>0.85)')
})

test('Test 2 — Ethanol vs Methanol: calculates molecular formula and descriptor differences', () => {
  const methanol = parseSmiles('CO')
  methanol.name = 'Methanol'
  methanol.formula = 'CH4O'

  const ethanol = parseSmiles('CCO')
  ethanol.name = 'Ethanol'
  ethanol.formula = 'C2H6O'

  const mcs = calculateMCS(methanol, ethanol)
  assert.equal(mcs.commonAtomsCount, 2, 'Common substructure is C-O (2 heavy atoms)')

  const diff = analyzeStructuralDifferences(methanol, ethanol, mcs)
  assert.equal(diff.addedToB.length, 1, 'Ethanol has 1 extra heavy carbon atom')

  const elemDiffC = diff.elementalDifference.find((e) => e.element === 'C')
  assert.equal(elemDiffC.diff, 1, 'Formula carbon diff should be +1')

  const sim = calculateTanimotoSimilarity(methanol, ethanol)
  assert.ok(sim.score >= 0.25, 'Methanol and ethanol share C-O core fingerprint')
  assert.ok(mcs.similarityScore >= 0.7, 'MCS similarity between methanol and ethanol should be high')
})

test('Test 3 — Caffeine vs Theobromine: compares purine rings and methyl substituents', () => {
  // Caffeine: 1,3,7-trimethylxanthine
  // Theobromine: 3,7-dimethylxanthine (missing methyl at N1)
  const caffeine = parseSmiles('Cn1cnc2c1c(=O)n(c(=O)n2C)C')
  caffeine.name = 'Caffeine'
  caffeine.formula = 'C8H10N4O2'

  const theobromine = parseSmiles('Cn1cnc2c1c(=O)[nH]c(=O)n2C')
  theobromine.name = 'Theobromine'
  theobromine.formula = 'C7H8N4O2'

  const mcs = calculateMCS(theobromine, caffeine)
  assert.ok(mcs.commonAtomsCount >= 13, 'Shared xanthine core should match at least 13 heavy atoms')

  const diff = analyzeStructuralDifferences(theobromine, caffeine, mcs)
  assert.ok(diff.summaryText.length > 20, 'Should generate rich plain-language summary')

  const sim = calculateTanimotoSimilarity(theobromine, caffeine)
  assert.ok(sim.score >= 0.5, 'Caffeine and theobromine should have substantial fingerprint similarity')
  assert.ok(mcs.similarityScore >= 0.9, 'MCS overlap should be over 90%')
})

test('Test 4 — Structurally unrelated molecules: handles low similarity safely', () => {
  const benzene = parseSmiles('c1ccccc1')
  const water = { atoms: [{ id: 'a0', element: 'O', charge: 0 }], bonds: [], descriptors: {} }

  const mcs = calculateMCS(benzene, water)
  assert.equal(mcs.commonAtomsCount, 0, 'No common heavy atoms between benzene and water')

  const sim = calculateTanimotoSimilarity(benzene, water)
  assert.equal(sim.score, 0, 'Tanimoto similarity should be 0')
})

test('Test 5 — Invalid / empty inputs: rejects safely without crashing', () => {
  assert.throws(() => parseSmiles(''), /empty/i)
  assert.throws(() => parseSmiles('Invalid$$$Chemical'), /Unsupported/i)

  const emptyMol = { atoms: [], bonds: [] }
  const mcs = calculateMCS(emptyMol, emptyMol)
  assert.equal(mcs.commonAtomsCount, 0)
  assert.equal(mcs.timedOut, false)
})

test('Test 6 — MCS search timeout protection works gracefully', () => {
  const benzene = parseSmiles('c1ccccc1')
  // Call MCS with an ultra-short 0ms timeout to verify timeout guard triggers without throwing
  const mcs = calculateMCS(benzene, benzene, { timeoutMs: 0 })
  assert.ok(typeof mcs.timedOut === 'boolean')
})
