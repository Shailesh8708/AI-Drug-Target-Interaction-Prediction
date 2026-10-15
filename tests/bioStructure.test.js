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
  detectStructureFormat,
  parseMmCifStructure,
  parseFastaSequence,
  parseUploadedStructureFile,
  getStructureData,
} from '../server/services/bioStructureService.js'
import {
  formatBioStructureReport,
  PRESET_STRUCTURES,
} from '../src/services/bioStructureService.js'
import {
  searchAdvancedBiostructures,
  UNIVERSAL_PROTEIN_CATALOG,
} from '../server/services/universalProteinService.js'

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

test('BioStructure: Detects structure formats accurately for PDB, mmCIF, and FASTA', () => {
  assert.equal(detectStructureFormat('', 'model.pdb'), 'pdb')
  assert.equal(detectStructureFormat('', 'complex.cif'), 'mmcif')
  assert.equal(detectStructureFormat('', 'structure.mmcif'), 'mmcif')
  assert.equal(detectStructureFormat('', 'target.fasta'), 'fasta')
  assert.equal(detectStructureFormat('', 'seq.fa'), 'fasta')

  // Content-based sniffing without filename
  const pdbSnippet = 'HEADER    PROTEIN                                 01-JAN-24   1ABC\nATOM      1  N   ALA A   1      11.100  12.200  13.300  1.00 20.00           N'
  assert.equal(detectStructureFormat(pdbSnippet), 'pdb')

  const cifSnippet = 'data_1ABC\n#\nloop_\n_atom_site.group_PDB\n_atom_site.id\n_atom_site.Cartn_x'
  assert.equal(detectStructureFormat(cifSnippet), 'mmcif')

  const fastaSnippet = '>sp|P0AES4|GYRA_ECOLI DNA gyrase subunit A\nMSDLAREITPVNIEEELKSSYLDYAMSVIVGRALPDVRDGLK'
  assert.equal(detectStructureFormat(fastaSnippet), 'fasta')

  assert.equal(detectStructureFormat('Random plain text without bioinformatics markers', 'test.txt'), 'unsupported')
})

test('BioStructure: Parses mmCIF crystallographic records and extracts 3D coordinates', () => {
  const mmCifContent = `data_TEST
#
_entry.id   TEST
_struct.title   "Synthetic Crystallographic mmCIF Test"
_exptl.method   "X-RAY DIFFRACTION"
_refine.ls_d_res_high   2.15
#
loop_
_atom_site.group_PDB
_atom_site.id
_atom_site.type_symbol
_atom_site.label_atom_id
_atom_site.label_comp_id
_atom_site.label_asym_id
_atom_site.label_seq_id
_atom_site.Cartn_x
_atom_site.Cartn_y
_atom_site.Cartn_z
_atom_site.occupancy
_atom_site.B_iso_or_equiv
ATOM   1 N  N  ALA A 1 10.500 20.250 30.100 1.00 15.20
ATOM   2 C  CA ALA A 1 11.200 21.100 31.050 1.00 16.40
ATOM   3 C  C  ALA A 1 12.050 20.500 32.100 1.00 14.80
ATOM   4 O  O  ALA A 1 12.100 19.300 32.300 1.00 15.00
ATOM   5 N  N  GLY A 2 12.800 21.400 32.700 1.00 13.90
ATOM   6 C  CA GLY A 2 13.650 20.950 33.750 1.00 14.20
HETATM 7 C  C1 CPF A 99 15.000 25.000 35.000 1.00 22.00
#
`
  const structure = parseMmCifStructure(mmCifContent, 'TEST')

  assert.equal(structure.metadata.structureId, 'TEST')
  assert.equal(structure.metadata.resolution, 2.15)
  assert.equal(structure.metadata.badge, '[USER UPLOADED STRUCTURE]')
  assert.ok(structure.atoms.length >= 7, 'Should parse all 7 atoms')
  assert.equal(structure.chains.length, 1)
  assert.equal(structure.chains[0].type, 'protein')
  assert.equal(structure.chains[0].sequence, 'AG')
  assert.ok(structure.ligands.length >= 1, 'Should extract CPF ligand')
})

test('BioStructure: Parses FASTA sequence uploads and handles file upload dispatch', () => {
  const fastaText = `>tr|TEST01|Synthetic Target Protein
MKTIIALSYIFCLVFA
DYKDDDDK`

  const fastaParsed = parseFastaSequence(fastaText)
  assert.equal(fastaParsed.sequence, 'MKTIIALSYIFCLVFADYKDDDDK')
  assert.match(fastaParsed.header, /Synthetic Target Protein/i)

  // Test parseUploadedStructureFile with FASTA
  const uploadedFasta = parseUploadedStructureFile(fastaText, 'custom_protein.fasta')
  assert.equal(uploadedFasta.isSequenceOnly, true)
  assert.equal(uploadedFasta.sequence, 'MKTIIALSYIFCLVFADYKDDDDK')
  assert.equal(uploadedFasta.metadata.badge, '[USER UPLOADED STRUCTURE]')
  assert.equal(uploadedFasta.chains[0].sequence, 'MKTIIALSYIFCLVFADYKDDDDK')

  // Test parseUploadedStructureFile with PDB
  const miniPdb = `HEADER    TEST COMPLEX\nATOM      1  CA  MET A   1      10.000  10.000  10.000  1.00 20.00           C\nEND`
  const uploadedPdb = parseUploadedStructureFile(miniPdb, 'docked_ligand.pdb')
  assert.equal(uploadedPdb.metadata.badge, '[USER UPLOADED STRUCTURE]')
  assert.equal(uploadedPdb.totalAtoms, 1)
})

test('BioStructure: Multi-tab advanced search operates across all 7 modes', async () => {
  // Tab 1: protein_name
  const resProtein = await searchAdvancedBiostructures({ query: 'DNA Gyrase', searchType: 'protein_name' })
  assert.ok(resProtein.results.some((r) => r.pdbId === '2XCT'), 'Should find 2XCT by protein name')

  // Tab 2: pdb_id
  const resPdb = await searchAdvancedBiostructures({ query: '1HSG', searchType: 'pdb_id' })
  assert.ok(resPdb.results.some((r) => r.pdbId === '1HSG'), 'Should find 1HSG by PDB ID')

  // Tab 3: uniprot_sequence
  const resUniprot = await searchAdvancedBiostructures({ query: 'P0AES4', searchType: 'uniprot_sequence' })
  assert.ok(resUniprot.results.some((r) => r.pdbId === '2XCT'), 'Should find 2XCT by UniProt ID')

  // Tab 4: chemical_name
  const resChem = await searchAdvancedBiostructures({ query: 'Ciprofloxacin', searchType: 'chemical_name' })
  assert.ok(resChem.results.some((r) => r.pdbId === '2XCT'), 'Should find 2XCT by chemical name')

  // Tab 5: iupac_name
  const resIupac = await searchAdvancedBiostructures({
    query: '1-cyclopropyl-6-fluoro-4-oxo-7-piperazin-1-ylquinoline-3-carboxylic acid',
    searchType: 'iupac_name',
  })
  assert.ok(resIupac.results.some((r) => r.pdbId === '2XCT'), 'Should find 2XCT by IUPAC name')

  // Tab 6: smiles
  const resSmiles = await searchAdvancedBiostructures({
    query: 'C1CC1N2C=C(C(=O)C3=CC(=C(C=C32)N4CCNCC4)F)C(=O)O',
    searchType: 'smiles',
  })
  assert.ok(resSmiles.results.some((r) => r.pdbId === '2XCT'), 'Should find 2XCT by SMILES')

  // Tab 7: general
  const resGen = await searchAdvancedBiostructures({ query: 'COX-2', searchType: 'general' })
  assert.ok(resGen.results.some((r) => r.pdbId === '1WNL'), 'Should find 1WNL by general query')
})

test('BioStructure: Chemical query with no PDB complex provides explanatory scientific message', async () => {
  // Query chemical with no complex
  const resNoComplex = await searchAdvancedBiostructures({ query: 'Caffeine', searchType: 'chemical_name' })
  assert.equal(resNoComplex.results.length, 0)
  assert.ok(resNoComplex.unmatchedMessage, 'Should provide unmatchedMessage')
  assert.match(resNoComplex.unmatchedMessage, /No experimental PDB macromolecular complex containing ligand "Caffeine"/i)

  // Query valid SMILES with no complex
  const resSmilesNoComplex = await searchAdvancedBiostructures({
    query: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
    searchType: 'smiles',
  })
  assert.equal(resSmilesNoComplex.results.length, 0)
  assert.ok(resSmilesNoComplex.unmatchedMessage)
  assert.match(resSmilesNoComplex.unmatchedMessage, /Valid chemical SMILES parsed\. No macromolecular crystallographic complex/i)

  // Query malformed SMILES
  const resMalformed = await searchAdvancedBiostructures({
    query: 'NOT_VALID_SMILES!@#',
    searchType: 'smiles',
  })
  assert.match(resMalformed.unmatchedMessage, /Invalid chemical SMILES format/i)
})

test('BioStructure: Offline resilience parses all 10 local repository PDB structures', async () => {
  const localStructures = ['1BNC', '1DS7', '1HSG', '1OD2', '1TUP', '1WNL', '2XCT', '4HHB', '4INS', '7DE4']

  for (const pdbId of localStructures) {
    const filePath = path.resolve(`server/data/structures/${pdbId}.pdb`)
    const pdbContent = await fs.readFile(filePath, 'utf-8')
    assert.ok(pdbContent.length > 1000, `${pdbId}.pdb should have substantial content`)

    const structure = parsePdbStructure(pdbContent, pdbId)
    assert.equal(structure.metadata.structureId, pdbId, `Structure ID should match ${pdbId}`)
    assert.ok(structure.atoms.length > 50, `${pdbId} should contain atoms`)
    assert.ok(structure.chains.length >= 1, `${pdbId} should contain chains`)
    assert.ok(structure.residues.length > 10, `${pdbId} should contain residues`)

    // Verify all atoms have finite coordinates
    for (const a of structure.atoms) {
      assert.ok(Number.isFinite(a.x) && Number.isFinite(a.y) && Number.isFinite(a.z), `Atom in ${pdbId} must have finite coordinates`)
    }
  }
})

