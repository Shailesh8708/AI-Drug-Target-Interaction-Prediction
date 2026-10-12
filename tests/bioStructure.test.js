import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import {
  parsePdbStructure,
  calculateBindingPocket,
  findSimilarMolecules,
  alignStructures,
  generateStructureInterpretation,
  answerStructureQuestion,
  BIOACTIVE_REFERENCE_LIBRARY,
} from '../server/services/bioStructureService.js'
import {
  formatBioStructureReport,
  PRESET_STRUCTURES,
} from '../src/services/bioStructureService.js'

test('BioStructure: Parses 2XCT PDB coordinates and extracts complex hierarchy', async () => {
  const pdbPath = path.resolve('server/data/structures/2XCT.pdb')
  const pdbText = await fs.readFile(pdbPath, 'utf-8')

  const structure = parsePdbStructure(pdbText, '2XCT')

  // Check metadata
  assert.equal(structure.metadata.structureId, '2XCT')
  assert.equal(structure.metadata.experimentalMethod, 'X-RAY DIFFRACTION')
  assert.equal(structure.metadata.resolution, 3.35)
  assert.match(structure.metadata.title, /S\. AUREUS GYRASE/i)

  // Check chains: DNA Gyrase complex contains protein & DNA chains
  assert.ok(structure.chains.length >= 4, 'Should detect at least 4 chains')
  const proteinChains = structure.chains.filter((c) => c.type === 'protein')
  const dnaChains = structure.chains.filter((c) => c.type === 'dna')
  assert.ok(proteinChains.length >= 2, 'Should have protein chains')
  assert.ok(dnaChains.length >= 2, 'Should have DNA chains')

  // Check bound ligand: Ciprofloxacin (CPF)
  const cpfLigand = structure.ligands.find((l) => l.id === 'CPF')
  assert.ok(cpfLigand, 'Should identify CPF ligand')
  assert.equal(cpfLigand.name, 'Ciprofloxacin')
  assert.ok(cpfLigand.atomCount > 0, 'CPF should have atoms')

  // Check metal ions: Manganese (MN)
  assert.ok(structure.metalIons.length > 0, 'Should detect metal ions')
  const mnIon = structure.metalIons.find((m) => m.element === 'MN')
  assert.ok(mnIon, 'Should detect Manganese ions')
  assert.equal(mnIon.charge, 2)
})

test('BioStructure: Calculates binding pocket, contacts, and volume for 2XCT', async () => {
  const pdbPath = path.resolve('server/data/structures/2XCT.pdb')
  const pdbText = await fs.readFile(pdbPath, 'utf-8')
  const structure = parsePdbStructure(pdbText, '2XCT')

  const pocket = calculateBindingPocket(structure, 'CPF', 4.5)

  assert.equal(pocket.ligandId, 'CPF')
  assert.equal(pocket.cutoff, 4.5)
  assert.ok(pocket.pocketResidues.length > 0, 'Should detect contacting residues')
  assert.ok(pocket.interactions.length > 0, 'Should detect atomic contacts')

  // Verify interaction types
  const interactionTypes = new Set(pocket.interactions.map((i) => i.type))
  assert.ok(interactionTypes.has('Hydrophobic Contact') || interactionTypes.has('Hydrogen Bond'))

  // Verify summary statistics
  assert.ok(pocket.summary.totalResidues > 0)
  assert.ok(pocket.summary.totalInteractions > 0)
  assert.ok(pocket.summary.estimatedVolume > 0)
})

test('BioStructure: Circular topological fingerprint Tanimoto similarity search', () => {
  // Test similarity against Ciprofloxacin (CPF)
  const similar = findSimilarMolecules({ id: 'CPF' }, 0.6)

  assert.ok(similar.length >= 2, 'Should find similar fluoroquinolones')
  // Self similarity is 1.0
  const self = similar.find((m) => m.id === 'CPF')
  assert.ok(self, 'Self should be in library')
  assert.equal(self.similarity, 1.0)

  // Levofloxacin or Norfloxacin should be found
  const hasAnalog = similar.some((m) => m.id === 'LVX' || m.id === 'NOR' || m.id === 'OFX')
  assert.ok(hasAnalog, 'Should identify fluoroquinolone analogs')
})

test('BioStructure: Pairwise Cα structural alignment computes RMSD and differences', async () => {
  const pdbPath2XCT = path.resolve('server/data/structures/2XCT.pdb')
  const pdbPath1HSG = path.resolve('server/data/structures/1HSG.pdb')

  const text2XCT = await fs.readFile(pdbPath2XCT, 'utf-8')
  const text1HSG = await fs.readFile(pdbPath1HSG, 'utf-8')

  const structA = parsePdbStructure(text2XCT, '2XCT')
  const structB = parsePdbStructure(text1HSG, '1HSG')

  const alignment = alignStructures(structA, structB)

  assert.ok(typeof alignment.rmsd === 'number', 'RMSD should be numeric')
  assert.ok(alignment.rmsd > 0, 'RMSD between 2XCT and 1HSG should be positive')
  assert.ok(alignment.alignedResidues > 0, 'Should align Cα residues')
  assert.ok(Array.isArray(alignment.heatmap), 'Should produce residue heatmap')
  assert.ok(alignment.heatmap.length > 0)
})

test('BioStructure: AI Structure Interpreter answers grounded questions safely', async () => {
  const pdbPath = path.resolve('server/data/structures/2XCT.pdb')
  const pdbText = await fs.readFile(pdbPath, 'utf-8')
  const structure = parsePdbStructure(pdbText, '2XCT')
  const pocket = calculateBindingPocket(structure, 'CPF', 4.5)

  // Question 1: Resolution
  const ansRes = answerStructureQuestion('What is the experimental resolution?', structure, pocket)
  assert.match(ansRes.answer, /3\.35/i)
  assert.match(ansRes.answer, /X-RAY DIFFRACTION/i)

  // Question 2: Residues
  const ansResidues = answerStructureQuestion('Which residues contact the ligand?', structure, pocket)
  assert.match(ansResidues.answer, /interacting residues|physical contacts/i)
  assert.ok(ansResidues.highlight === 'residues' || ansResidues.highlight === 'pocket')

  // Question 3: Mechanism / simple terms
  const ansExplain = answerStructureQuestion('Explain this structure in simple terms', structure, pocket)
  assert.match(ansExplain.answer, /DNA Gyrase|cleaved DNA|complex/i)
})

test('BioStructure: Generates comprehensive publication report with disclaimer', async () => {
  const pdbPath = path.resolve('server/data/structures/2XCT.pdb')
  const pdbText = await fs.readFile(pdbPath, 'utf-8')
  const structure = parsePdbStructure(pdbText, '2XCT')
  const pocket = calculateBindingPocket(structure, 'CPF', 4.5)
  const similar = findSimilarMolecules({ id: 'CPF' }, 0.6)

  const report = formatBioStructureReport(structure, pocket, similar)

  assert.match(report, /BIOSTRUCTURE INTELLIGENCE REPORT: 2XCT/i)
  assert.match(report, /S\. AUREUS GYRASE|DNA Gyrase/i)
  assert.match(report, /Binding Site Intelligence/i)
  assert.match(report, /CPF|Ciprofloxacin/i)
  assert.match(report, /Disclaimer/i)
})

test('BioStructure: 3D backbone segmentation prevents WebGL crashes on crystallographic sequence gaps', async () => {
  const THREE = await import('three')
  const pdbPath = path.resolve('server/data/structures/2XCT.pdb')
  const pdbText = await fs.readFile(pdbPath, 'utf-8')
  const structure = parsePdbStructure(pdbText, '2XCT')

  const cx = structure.atoms.reduce((s, a) => s + a.x, 0) / structure.atoms.length
  const cy = structure.atoms.reduce((s, a) => s + a.y, 0) / structure.atoms.length
  const cz = structure.atoms.reduce((s, a) => s + a.z, 0) / structure.atoms.length

  let totalSegments = 0
  let tubesTested = 0

  structure.chains.forEach((chain) => {
    const chainAtoms = structure.atoms.filter(
      (a) => a.chainId === chain.id && (a.name === 'CA' || a.name === "C4'")
    )
    if (chainAtoms.length < 2) return

    const segments = []
    let currentSeg = []
    const maxGap = chain.type === 'dna' ? 7.5 : 5.2

    for (let i = 0; i < chainAtoms.length; i++) {
      const a = chainAtoms[i]
      if (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.z)) continue
      const pt = new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz)

      if (currentSeg.length > 0) {
        const lastPt = currentSeg[currentSeg.length - 1]
        const dist = lastPt.distanceTo(pt)
        if (dist < 0.05) continue
        if (dist > maxGap) {
          if (currentSeg.length >= 2) segments.push(currentSeg)
          currentSeg = [pt]
          continue
        }
      }
      currentSeg.push(pt)
    }
    if (currentSeg.length >= 2) segments.push(currentSeg)

    totalSegments += segments.length

    // Verify all continuous segments generate valid TubeGeometry without NaNs
    segments.forEach((segPoints) => {
      if (segPoints.length >= 3) {
        const curve = new THREE.CatmullRomCurve3(segPoints, false, 'centripetal')
        const tubeSegments = Math.min(Math.max(segPoints.length * 2, 8), 120)
        const tubeRadius = chain.type === 'dna' ? 0.65 : 0.48
        const tubeGeo = new THREE.TubeGeometry(curve, tubeSegments, tubeRadius, 6, false)

        const posArr = tubeGeo.attributes.position.array
        for (let k = 0; k < posArr.length; k++) {
          assert.ok(Number.isFinite(posArr[k]), `TubeGeometry vertex must be finite, found ${posArr[k]}`)
        }

        tubeGeo.computeBoundingSphere()
        assert.ok(Number.isFinite(tubeGeo.boundingSphere.radius), 'BoundingSphere radius must be finite')
        assert.ok(tubeGeo.boundingSphere.radius > 0, 'BoundingSphere radius must be positive')

        tubeGeo.dispose()
        tubesTested++
      }
    })
  })

  // Ensure all 12 chains were segmented and tubes generated without any crashes or NaNs
  assert.ok(totalSegments >= 12, 'Must have at least 12 segments across chains')
  assert.ok(tubesTested >= 10, 'Must have generated and tested tubes across segments')
})

