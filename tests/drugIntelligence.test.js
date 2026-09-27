import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DRUG_INTELLIGENCE_LIBRARY,
  getDrugProfile,
  searchDrugs,
  analyzeDrugDrugInteraction,
  answerDrugQuestion,
  predictDrugTargetInteraction,
} from '../server/services/drugIntelligenceService.js'
import { generateDrugReportMarkdown } from '../src/services/drugIntelligenceService.js'

test('Drug Intelligence: Flagship library contains authentic data across 10 drug classes', () => {
  const expectedFlagships = [
    'ciprofloxacin',
    'aspirin',
    'caffeine',
    'ibuprofen',
    'paracetamol',
    'imatinib',
    'metformin',
    'atorvastatin',
    'indomethacin',
    'tamoxifen',
  ]

  assert.equal(DRUG_INTELLIGENCE_LIBRARY.length, 10)

  expectedFlagships.forEach((id) => {
    const drug = DRUG_INTELLIGENCE_LIBRARY[id]
    assert.ok(drug, `Drug ${id} should exist in library`)
    assert.ok(drug.name, `Drug ${id} must have a name`)
    assert.ok(drug.formula, `Drug ${id} must have a chemical formula`)
    assert.ok(drug.smiles, `Drug ${id} must have a SMILES string`)
    assert.ok(drug.inchiKey || drug.inchikey, `Drug ${id} must have an InChIKey`)
    assert.ok(drug.adme, `Drug ${id} must contain ADME parameters`)
    assert.ok(Array.isArray(drug.targets), `Drug ${id} must have targets array`)
    assert.ok(drug.targets.length > 0, `Drug ${id} must have at least one target`)
    assert.ok(Array.isArray(drug.bioactivity || drug.bioactivityRecords), `Drug ${id} must contain bioactivity assays`)
  })
})

test('Drug Intelligence: Resolves Ciprofloxacin profile with full molecular & target intelligence', async () => {
  const cipro = await getDrugProfile('ciprofloxacin')
  assert.ok(cipro)
  assert.equal(cipro.name, 'Ciprofloxacin')
  assert.equal(cipro.formula, 'C17H18FN3O3')
  assert.match(cipro.smiles, /C1CC1N2C=C\(C\(=O\)C3=CC\(=C\(C=C32\)N4CCNCC4\)F\)C\(=O\)O/)
  assert.equal(cipro.lipinski.violations, 0)
  assert.equal(cipro.drugLikeness.veber, true)
  assert.equal(cipro.pubchemCid, 2764)
  assert.equal(cipro.chemblId, 'CHEMBL8')

  // Target bridge verification
  const gyrase = cipro.targets.find((t) => t.pdb === '2XCT')
  assert.ok(gyrase, 'Ciprofloxacin should target DNA gyrase with PDB 2XCT')
  assert.equal(gyrase.uniprot, 'P0AES4')
})

test('Drug Intelligence: Universal search recognizes drug names, synonyms, and target mechanisms', async () => {
  const res1 = await searchDrugs('cipro')
  assert.ok(res1.length > 0)
  assert.equal(res1[0].id, 'ciprofloxacin')

  const res2 = await searchDrugs('tyrosine kinase')
  assert.ok(res2.some((d) => d.id === 'imatinib'))

  const res3 = await searchDrugs('acetylsalicylic')
  assert.ok(res3.some((d) => d.id === 'aspirin'))

  const res4 = await searchDrugs('statin')
  assert.ok(res4.some((d) => d.id === 'atorvastatin'))
})

test('Drug Intelligence: Evaluates Pairwise Drug-Drug Interaction (DDI) & CYP enzyme competition', async () => {
  const cipro = DRUG_INTELLIGENCE_LIBRARY['ciprofloxacin']
  const caffeine = DRUG_INTELLIGENCE_LIBRARY['caffeine']
  const ddi = await analyzeDrugDrugInteraction(cipro, caffeine)

  assert.ok(ddi)
  assert.ok(['Major', 'Moderate'].includes(ddi.severity))
  assert.match(ddi.description, /CYP1A2/i)
  assert.ok(ddi.cypOverlap.includes('CYP1A2'))
  assert.ok(ddi.recommendation)
})

test('Drug Intelligence: AI Drug Analyst generates grounded answers strictly based on pharmacology', async () => {
  const cipro = DRUG_INTELLIGENCE_LIBRARY['ciprofloxacin']
  const targetAns = await answerDrugQuestion(cipro, 'What is the primary target of this drug?')
  assert.match(targetAns, /topoisomerase|gyrase/i)

  const admeAns = await answerDrugQuestion(cipro, 'Does it cross the blood-brain barrier?')
  assert.match(admeAns, /blood-brain barrier|bbb/i)

  const aspirin = DRUG_INTELLIGENCE_LIBRARY['aspirin']
  const moaAns = await answerDrugQuestion(aspirin, 'What is the mechanism of action?')
  assert.match(moaAns, /cyclooxygenase|cox/i)
})

test('Drug Intelligence: In-silico DTI predictor outputs explainable feature attributions', async () => {
  const imatinib = DRUG_INTELLIGENCE_LIBRARY['imatinib']
  const pred = await predictDrugTargetInteraction(imatinib, 'BCR-ABL Tyrosine Kinase')

  assert.ok(pred)
  assert.ok(pred.predictedAffinity)
  assert.ok(pred.interactionProbability >= 0 && pred.interactionProbability <= 1)
  assert.ok(Array.isArray(pred.featureAttributions))
  assert.ok(pred.featureAttributions.length >= 4)

  const hasLogP = pred.featureAttributions.some((a) => a.feature.includes('LogP'))
  const hasHBond = pred.featureAttributions.some((a) => a.feature.includes('H-Bond'))
  assert.ok(hasLogP)
  assert.ok(hasHBond)
})

test('Drug Intelligence: Generates publication-grade research report in Markdown with safety disclaimer', () => {
  const cipro = DRUG_INTELLIGENCE_LIBRARY['ciprofloxacin']
  const md = generateDrugReportMarkdown(cipro, 'Automated AI test synthesis.')

  assert.ok(md)
  assert.match(md, /AEGIS DRUG INTELLIGENCE & PHARMACOLOGICAL DOSSIER/)
  assert.match(md, /Ciprofloxacin/)
  assert.match(md, /C17H18FN3O3/)
  assert.match(md, /Lipinski Rule of 5.*PASSED/)
  assert.match(md, /Scientific & Educational Disclaimer/)
})
