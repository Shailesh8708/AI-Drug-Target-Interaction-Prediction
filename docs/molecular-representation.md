# Molecular Representation

The planned molecular-processing module will independently provide SMILES validation, molecule parsing, fingerprint generation, descriptor generation, and basic property calculation.

RDKit is intentionally not installed in Phase 1. Add it in the research environment when the real preprocessing service is implemented, with tests for invalid SMILES and deterministic feature vectors.

## Molecular Studio graph

The editor uses a versioned JSON structure:

```json
{
	"version": 1,
	"name": "Benzene draft",
	"atoms": [{ "id": "a-0", "element": "C", "x": 250, "y": 180, "charge": 0 }],
	"bonds": [{ "id": "b-0", "from": "a-0", "to": "a-1", "type": "aromatic", "order": 1.5 }],
	"source": "editor"
}
```

The editor supports single, double, triple, and aromatic bonds plus reusable templates. Local calculations are limited to deterministic graph-derived values. Implicit hydrogens, valence, stereocenters, TPSA, LogP, fingerprints, and validated 3D coordinates remain unavailable until a chemistry engine is connected.

## Protein representation

Protein imports are modeled separately from small-molecule graphs:

```text
Protein
	chains[]
		residues[]
			atoms[] { x, y, z, element, bFactor }
	ligands[]
	secondaryStructure { helices, sheets, turns, available }
	metadata { structureId, experimentalMethod, resolution, organism }
```

The current local adapter parses PDB `ATOM`, `HETATM`, `HELIX`, `SHEET`, `HEADER`, `TITLE`, `EXPDTA`, and resolution records. Imported coordinates are rendered by a lazily loaded Three.js WebGL point/backbone viewer and are cleaned up when the view changes. mmCIF parsing, molecular surfaces, validated contacts, and structural alignment remain explicit future service boundaries. Validated molecule and protein payloads can be staged locally under `aegis-dti-molecule` and `aegis-dti-protein` for the existing DTI Lab handoff; no prediction is produced.
