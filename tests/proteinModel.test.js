import test from 'node:test'
import assert from 'node:assert/strict'
import { nearbyResidues, parsePdb, parseStructureText, proteinSummary } from '../src/services/proteinModel.js'

const PDB = `HEADER    TEST PROTEIN                                             1ABC
TITLE     MINIMAL IMPORT TEST
EXPDTA    X-RAY DIFFRACTION
REMARK   2 RESOLUTION.    2.10 ANGSTROMS.
HELIX    1   1 ALA A    1  GLY A    2  1                                  2
ATOM      1  N   ALA A   1      10.000  10.000  10.000  1.00 20.00           N
ATOM      2  CA  ALA A   1      11.000  10.000  10.000  1.00 20.00           C
ATOM      3  C   ALA A   1      12.000  10.500  10.000  1.00 20.00           C
ATOM      4  N   GLY A   2      13.000  10.500  10.000  1.00 20.00           N
ATOM      5  CA  GLY A   2      14.000  11.000  10.000  1.00 20.00           C
HETATM    6  C1  ATP A 101      14.500  11.500  10.500  1.00 20.00           C
END`

test('PDB parsing preserves protein hierarchy and imported metadata', () => {
  const protein = parsePdb(PDB, 'Test protein')
  assert.equal(protein.validation.status, 'valid')
  assert.deepEqual(proteinSummary(protein), { chains: 1, residues: 3, atoms: 6, ligands: 1, helices: 1, sheets: 0 })
  assert.equal(protein.metadata.experimentalMethod, 'X-RAY DIFFRACTION')
  assert.equal(protein.metadata.resolution, 2.1)
  assert.equal(protein.ligands[0].name, 'ATP')
})

test('nearby residue candidates use imported 3D coordinates and explicit cutoff', () => {
  const protein = parsePdb(PDB)
  const nearby = nearbyResidues(protein, 'ATP', 4)
  assert.ok(nearby.some((item) => item.residueId === 'A:2'))
  assert.ok(nearby.every((item) => item.distance <= 4))
})

test('unsupported mmCIF input is reported instead of silently parsed', () => {
  assert.throws(() => parseStructureText('data_test\n_atom_site.id', 'auto'), /mmCIF parsing is not configured/i)
})
