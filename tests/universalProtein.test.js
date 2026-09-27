import test from 'node:test'
import assert from 'node:assert/strict'
import {
  classifyProteinQuery,
  calculateSequenceMetrics,
  searchUniversalProteins,
  resolveUniversalProtein,
  UNIVERSAL_PROTEIN_CATALOG,
} from '../server/services/universalProteinService.js'

test('Universal Protein Engine: Curated model catalog covers major biological systems', () => {
  const keys = Object.keys(UNIVERSAL_PROTEIN_CATALOG)
  assert.ok(keys.length >= 7, 'Should cover at least 7 flagship model systems')

  // Verify key systems exist
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['4hhb'], 'Should include Deoxyhemoglobin')
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['4ins'], 'Should include Insulin')
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['1tup'], 'Should include p53 Tumor Suppressor')
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['2xct'], 'Should include DNA Gyrase')
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['1m17'], 'Should include EGFR Kinase')
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['6vxx'], 'Should include Spike Glycoprotein')
  assert.ok(UNIVERSAL_PROTEIN_CATALOG['1lyz'], 'Should include Lysozyme')

  // Verify structured properties of p53
  const p53 = UNIVERSAL_PROTEIN_CATALOG['1tup']
  assert.equal(p53.gene, 'TP53')
  assert.equal(p53.uniprotId, 'P04637')
  assert.equal(p53.pdbId, '1TUP')
  assert.equal(p53.resolution, 2.20)
  assert.ok(p53.domains.length >= 2, 'p53 should have domain annotations')
  assert.ok(p53.activeSites.length >= 2, 'p53 should have active site / hotspot annotations')
  assert.equal(p53.metalBinding[0]?.element, 'ZN')
})

test('Universal Protein Engine: Classifies diverse structural biology queries accurately', () => {
  // PDB IDs
  assert.equal(classifyProteinQuery('4HHB').category, 'PDB_ID')
  assert.equal(classifyProteinQuery('2XCT').category, 'PDB_ID')
  assert.equal(classifyProteinQuery('1TUP').category, 'PDB_ID')
  assert.equal(classifyProteinQuery('6VXX').category, 'PDB_ID')
  assert.equal(classifyProteinQuery('1CRN').category, 'PDB_ID')

  // UniProt Accessions
  assert.equal(classifyProteinQuery('P04637').category, 'UNIPROT_ID')
  assert.equal(classifyProteinQuery('P01308').category, 'UNIPROT_ID')
  assert.equal(classifyProteinQuery('P00533').category, 'UNIPROT_ID')
  assert.equal(classifyProteinQuery('P69905').category, 'UNIPROT_ID')
  assert.equal(classifyProteinQuery('P0AES4').category, 'UNIPROT_ID')

  // Gene Symbols
  assert.equal(classifyProteinQuery('TP53').category, 'GENE_NAME')
  assert.equal(classifyProteinQuery('EGFR').category, 'GENE_NAME')
  assert.equal(classifyProteinQuery('INS').category, 'GENE_NAME')
  assert.equal(classifyProteinQuery('HBA1').category, 'GENE_NAME')
  assert.equal(classifyProteinQuery('BRAF').category, 'GENE_NAME')

  // Protein Names
  assert.equal(classifyProteinQuery('Hemoglobin').category, 'PROTEIN_NAME')
  assert.equal(classifyProteinQuery('Lysozyme').category, 'PROTEIN_NAME')
  assert.equal(classifyProteinQuery('DNA Gyrase').category, 'PROTEIN_NAME')
  assert.equal(classifyProteinQuery('Spike protein').category, 'PROTEIN_NAME')

  // Sequences
  assert.equal(classifyProteinQuery('>sp|P01308\nGIVEQCCTSICSLYQLENYCN').category, 'SEQUENCE')
  assert.equal(classifyProteinQuery('MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTR').category, 'SEQUENCE')

  // Drug Targets
  assert.equal(classifyProteinQuery('Ciprofloxacin').category, 'DRUG_TARGET')
  assert.equal(classifyProteinQuery('Erlotinib').category, 'DRUG_TARGET')
  assert.equal(classifyProteinQuery('Saquinavir').category, 'DRUG_TARGET')

  // Unknown / Empty
  assert.equal(classifyProteinQuery('').category, 'UNKNOWN')
  assert.equal(classifyProteinQuery(null).category, 'UNKNOWN')
})

test('Universal Protein Engine: Calculates deterministic sequence biophysics and composition', () => {
  // Test with Insulin A-chain: GIVEQCCTSICSLYQLENYCN (21 residues)
  const insulinA = 'GIVEQCCTSICSLYQLENYCN'
  const metrics = calculateSequenceMetrics(insulinA)

  assert.ok(metrics)
  assert.equal(metrics.length, 21)
  assert.ok(metrics.molecularWeightDa > 2200 && metrics.molecularWeightDa < 2500)
  assert.ok(metrics.molecularWeightKDa > 2.2 && metrics.molecularWeightKDa < 2.5)
  assert.ok(metrics.theoreticalPi > 3.0 && metrics.theoreticalPi < 6.0, 'Insulin A chain is acidic')
  assert.ok(typeof metrics.chargeAtPh74 === 'number')
  assert.ok(typeof metrics.gravyHydropathy === 'number')

  // Check amino acid composition
  assert.equal(metrics.composition.cysteineCount, 4, 'Insulin A chain has 4 cysteines')
  assert.equal(metrics.composition.glycineCount, 1)
  assert.equal(metrics.composition.prolineCount, 0)
  assert.ok(metrics.composition.polarPercent > 0)
  assert.ok(metrics.composition.hydrophobicPercent > 0)

  // Check secondary structure estimates
  assert.ok(metrics.secondaryStructureEstimate.alphaHelix >= 0)
  assert.ok(metrics.secondaryStructureEstimate.betaSheet >= 0)
  assert.ok(metrics.secondaryStructureEstimate.turnsAndCoils >= 0)
})

test('Universal Protein Engine: Resolves model proteins with sequence, domains, and PDB coordinates', async () => {
  // 1. Resolve Insulin
  const insulin = await resolveUniversalProtein('Insulin')
  assert.ok(insulin.success)
  assert.equal(insulin.pdbId, '4INS')
  assert.equal(insulin.uniprotId, 'P01308')
  assert.equal(insulin.gene, 'INS')
  assert.ok(insulin.sequenceMetrics.length > 0)
  assert.ok(insulin.domains.length >= 2)
  assert.ok(insulin.provenanceTiers.structure.includes('[EXPERIMENTAL STRUCTURE]'))
  assert.ok(insulin.provenanceTiers.properties.includes('[CALCULATED INFORMATION]'))
  assert.ok(insulin.provenanceTiers.annotations.includes('[DATABASE ANNOTATION]'))
  assert.ok(insulin.provenanceTiers.interpretation.includes('[AI INTERPRETATION]'))

  // 2. Resolve Hemoglobin
  const hb = await resolveUniversalProtein('4HHB')
  assert.ok(hb.success)
  assert.equal(hb.pdbId, '4HHB')
  assert.match(hb.name, /hemoglobin/i)
  assert.equal(hb.resolution, 1.74)
  assert.ok(hb.chains.length >= 4, 'Tetramer should have 4 chains')

  // 3. Resolve DNA Gyrase (2XCT) with bound ligand CPF
  const gyrase = await resolveUniversalProtein('2XCT')
  assert.ok(gyrase.success)
  assert.equal(gyrase.pdbId, '2XCT')
  assert.ok(gyrase.ligands.length > 0)
  assert.ok(gyrase.pocketData, 'Should compute binding pocket for 2XCT')
  assert.ok(gyrase.pocketData.pocketResidues.length > 0)
})

test('Universal Protein Engine: Resolves in-silico custom sequence input', async () => {
  const customSeq = '>TestPeptide\nMVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH'
  const result = await resolveUniversalProtein(customSeq)

  assert.ok(result.success)
  assert.equal(result.structureType, 'CALCULATED')
  assert.equal(result.sequenceMetrics.length, 51)
  assert.ok(result.sequenceMetrics.theoreticalPi > 0)
  assert.ok(result.provenanceTiers.structure.includes('[PREDICTED STRUCTURE]'))
  assert.ok(result.provenanceTiers.properties.includes('[CALCULATED INFORMATION]'))
})

test('Universal Protein Engine: Dynamic protein search returns structured candidates', async () => {
  const results = await searchUniversalProteins('Insulin')
  assert.ok(results.length > 0, 'Should find insulin candidates')

  const topHit = results[0]
  assert.ok(topHit.name)
  assert.ok(topHit.pdbId || topHit.uniprotId)
  assert.ok(topHit.organism)
  assert.ok(topHit.method)
  assert.ok(topHit.provenance.includes('[EXPERIMENTAL STRUCTURE]'))
})

test('Universal Protein Engine: Handles unknown or malformed queries safely without crashing', async () => {
  // Non-existent protein string
  const res = await resolveUniversalProtein('nonexistentproteinxyz999')
  assert.ok(res)
  assert.ok(res.success)
  assert.ok(res.sequenceMetrics, 'Should produce safe fallback sequence metrics')

  // Null / empty rejection
  await assert.rejects(async () => {
    await resolveUniversalProtein('')
  }, /Please enter a valid protein/)
})
