import test from 'node:test'
import assert from 'node:assert/strict'
import { scientificDataHub } from '../server/services/scientificDataHub.js'

test('Scientific Data Hub: Returns live integration status for all 7 databases', async () => {
  const status = await scientificDataHub.getIntegrationsStatus()
  assert.ok(status.timestamp, 'Must include timestamp')
  assert.equal(status.summary.totalSources, 7, 'Must track all 7 databases')
  assert.equal(status.sources.length, 7, 'Must have status reports for 7 sources')

  const ids = status.sources.map((s) => s.id)
  assert.ok(ids.includes('chembl'), 'Must include ChEMBL')
  assert.ok(ids.includes('bindingdb'), 'Must include BindingDB')
  assert.ok(ids.includes('pubchem'), 'Must include PubChem')
  assert.ok(ids.includes('rcsb'), 'Must include RCSB PDB')
  assert.ok(ids.includes('uniprot'), 'Must include UniProt')
  assert.ok(ids.includes('alphafold'), 'Must include AlphaFold DB')
  assert.ok(ids.includes('drugbank'), 'Must include DrugBank')

  // DrugBank uncredentialed state check
  const drugBank = status.sources.find((s) => s.id === 'drugbank')
  assert.ok(drugBank.status === 'uncredentialed' || drugBank.status === 'online')
  if (drugBank.status === 'uncredentialed') {
    assert.ok(drugBank.setupGuide, 'Must provide setup guide when uncredentialed')
  }
})

test('Scientific Data Hub: Resolves compound across PubChem & ChEMBL into normalized schema', async () => {
  const result = await scientificDataHub.resolveCompound('Aspirin')
  assert.equal(result.success, true)
  assert.ok(result.resolvedIdentifiers.smiles, 'Must resolve SMILES')
  assert.ok(result.resolvedIdentifiers.formula, 'Must resolve formula')
  assert.ok(result.normalizedRecord.name, 'Must have compound name')
  assert.ok(result.normalizedRecord.mw > 0, 'Must have molecular weight')
  assert.ok(Array.isArray(result.normalizedRecord.bioactivityRecords), 'Must include bioactivity records')
  assert.ok(result.timestamp, 'Must have timestamp')
})

test('Scientific Data Hub: Resolves protein across UniProt & AlphaFold with provenance badges', async () => {
  const result = await scientificDataHub.resolveProtein('P00533')
  assert.equal(result.success, true)
  assert.equal(result.resolvedIdentifiers.uniprotId, 'P00533')
  assert.ok(result.normalizedRecord.sequence.length > 50, 'Must have protein sequence')
  assert.ok(result.structureReferences.length > 0, 'Must have structure references')

  const hasExperimental = result.structureReferences.some((s) => s.badge === '[EXPERIMENTAL STRUCTURE]')
  const hasPredicted = result.structureReferences.some((s) => s.badge === '[PREDICTED STRUCTURE]')
  assert.ok(hasExperimental || hasPredicted, 'Must have labeled structural references')

  if (result.normalizedRecord.alphaFoldPrediction) {
    assert.equal(result.normalizedRecord.alphaFoldPrediction.provenance, 'PREDICTED')
    assert.equal(result.normalizedRecord.alphaFoldPrediction.badge, '[PREDICTED STRUCTURE]')
    assert.ok(result.normalizedRecord.alphaFoldPrediction.globalPlddt > 0, 'Must have pLDDT score')
  }
})

test('Scientific Data Hub: Resolves experimental RCSB macromolecular structure', async () => {
  const result = await scientificDataHub.resolveStructure('2XCT')
  assert.equal(result.success, true)
  assert.equal(result.normalizedRecord.pdbId, '2XCT')
  assert.equal(result.normalizedRecord.provenance, 'EXPERIMENTAL')
  assert.equal(result.normalizedRecord.badge, '[EXPERIMENTAL STRUCTURE]')
  assert.ok(result.normalizedRecord.resolution !== null, 'Must report resolution')
})

test('Scientific Data Hub: Retrieves quantitative bioactivity records for Imatinib', async () => {
  const result = await scientificDataHub.getCompoundBioactivity('Imatinib')
  assert.equal(result.success, true)
  assert.ok(result.totalCount > 0, 'Must have bioactivity entries')
  const hasAffinity = result.chemblBioactivities.some((b) => b.standardType === 'IC50' || b.standardType === 'Ki')
  assert.ok(hasAffinity, 'Must contain authentic IC50 or Ki values')
})

test('Scientific Data Hub: Retrieves interacting ligands for kinase target ABL1', async () => {
  const result = await scientificDataHub.getTargetLigands('P00519')
  assert.equal(result.success, true)
  assert.ok(result.ligands.length > 0, 'Must find ligands for ABL1')
  const imatinibMatch = result.ligands.some((l) => l.ligandName.toLowerCase().includes('imatinib'))
  assert.ok(imatinibMatch, 'Must list Imatinib as known ligand')
})

test('Scientific Data Hub: Handles non-existent or malformed queries safely without crashing', async () => {
  const result = await scientificDataHub.resolveCompound('non_existent_chemical_xyz_999')
  assert.equal(result.success, false)
  assert.ok(result.errors.length > 0)
})
