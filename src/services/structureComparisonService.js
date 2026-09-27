/**
 * structureComparisonService.js
 * Client-side comparison service connecting to /api/compounds/compare
 * with graceful client-side fallback computation for offline/standalone execution.
 */

import { compareCompounds, compareCompoundObjects, resolveCompoundQuery } from './api.js'
import {
  calculateMCS,
  calculateTanimotoSimilarity,
  analyzeStructuralDifferences,
} from '../../server/services/structureComparison.js'

export const PRESET_COMPARISON_PAIRS = [
  {
    id: 'benzene-toluene',
    nameA: 'Benzene',
    nameB: 'Toluene',
    category: 'Arene & Alkylation',
    description: 'Aromatic core scaffold comparison illustrating methyl group substituent addition.',
  },
  {
    id: 'caffeine-theobromine',
    nameA: 'Caffeine',
    nameB: 'Theobromine',
    category: 'Purine Alkaloids',
    description: 'Xanthine scaffold comparison demonstrating N-demethylation (N1 methyl position difference).',
  },
  {
    id: 'aspirin-salicylic',
    nameA: 'Aspirin',
    nameB: 'Salicylic Acid',
    category: 'Analgesics / NSAIDs',
    description: 'Comparison of acetylsalicylic acid with salicylic acid, highlighting ester acetylation.',
  },
  {
    id: 'methanol-ethanol',
    nameA: 'Methanol',
    nameB: 'Ethanol',
    category: 'Homologous Alcohols',
    description: 'Primary aliphatic alcohol series showing methylene (-CH₂-) homologation.',
  },
  {
    id: 'ibuprofen-naproxen',
    nameA: 'Ibuprofen',
    nameB: 'Naproxen',
    category: 'Anti-inflammatory NSAIDs',
    description: 'Arylpropionic acid comparison (isobutylphenyl vs methoxynaphthyl ring systems).',
  },
  {
    id: 'dopamine-epinephrine',
    nameA: 'Dopamine',
    nameB: 'Epinephrine',
    category: 'Catecholamines',
    description: 'Neurotransmitter comparison showing beta-hydroxyl and N-methyl substitutions.',
  },
]

/**
 * Executes full comparison between two compounds by query or object.
 */
export async function runStructureComparison(queryA, queryB, customCompoundA = null, customCompoundB = null) {
  // If custom/edited compound objects are passed directly
  if (customCompoundA && customCompoundB) {
    try {
      const res = await compareCompoundObjects(customCompoundA, customCompoundB)
      return res
    } catch {
      // Local calculation fallback
      const mcs = calculateMCS(customCompoundA, customCompoundB)
      const similarity = calculateTanimotoSimilarity(customCompoundA, customCompoundB)
      const differences = analyzeStructuralDifferences(customCompoundA, customCompoundB, mcs)
      return {
        compoundA: customCompoundA,
        compoundB: customCompoundB,
        mcs,
        similarity,
        differences,
      }
    }
  }

  // Otherwise perform query-based comparison
  try {
    const res = await compareCompounds(queryA, queryB)
    return res
  } catch (apiErr) {
    // If backend endpoint failed, attempt client-side resolution and calculation
    try {
      const [resA, resB] = await Promise.all([
        resolveCompoundQuery(queryA),
        resolveCompoundQuery(queryB),
      ])
      const compA = resA.compound
      const compB = resB.compound
      const mcs = calculateMCS(compA, compB)
      const similarity = calculateTanimotoSimilarity(compA, compB)
      const differences = analyzeStructuralDifferences(compA, compB, mcs)

      return {
        compoundA: compA,
        compoundB: compB,
        mcs,
        similarity,
        differences,
      }
    } catch (innerErr) {
      throw new Error(
        apiErr.message || innerErr.message || 'Unable to resolve or compare these compounds.'
      )
    }
  }
}

/**
 * Formats a comparison summary report in Markdown.
 */
export function formatComparisonReport(data) {
  const { compoundA, compoundB, mcs, similarity, differences } = data
  const dateStr = new Date().toISOString().split('T')[0]

  return `# MOLECULAR STRUCTURE COMPARISON REPORT
Generated: ${dateStr} · Aegis Computational Cheminformatics Engine

## 1. Identifiers
- **Compound A**: ${compoundA.name || 'Compound A'} (${compoundA.formula || 'N/A'})
  - SMILES: \`${compoundA.canonicalSmiles || compoundA.smiles || 'N/A'}\`
  - InChIKey: \`${compoundA.inchikey || 'N/A'}\`
  - Molecular Weight: ${compoundA.molecularWeight || 'N/A'} g/mol
- **Compound B**: ${compoundB.name || 'Compound B'} (${compoundB.formula || 'N/A'})
  - SMILES: \`${compoundB.canonicalSmiles || compoundB.smiles || 'N/A'}\`
  - InChIKey: \`${compoundB.inchikey || 'N/A'}\`
  - Molecular Weight: ${compoundB.molecularWeight || 'N/A'} g/mol

## 2. Substructure Similarity & Overlap
- **Maximum Common Substructure (MCS)**:
  - Common Heavy Atoms: ${mcs?.commonAtomsCount ?? 0}
  - Common Bonds: ${mcs?.commonBondsCount ?? 0}
  - Scaffold Overlap (Score): ${(mcs?.similarityScore ? (mcs.similarityScore * 100).toFixed(1) : 0)}%
- **Fingerprint Similarity (Tanimoto ECFP2)**:
  - Tanimoto Score: ${similarity?.score ?? 0} (${similarity?.percentage ?? 0}%)
  - Shared Circular Features: ${similarity?.commonFeatures ?? 0}

## 3. Structural & Formula Evolution
- ${differences?.summaryText || 'Structural difference analysis complete.'}
- **Added to B**: ${differences?.additionsSummary || 'None'}
- **Removed from A**: ${differences?.subtractionsSummary || 'None'}
- **Elemental Formula Shift (B - A)**:
${(differences?.elementalDifference || [])
  .map((e) => `  - ${e.element}: ${e.diff > 0 ? `+${e.diff}` : e.diff}`)
  .join('\n')}

## 4. Physicochemical Property Shifts (Δ = B - A)
| Property | Compound A | Compound B | Δ Difference |
| :--- | :--- | :--- | :--- |
| Molecular Weight | ${compoundA.molecularWeight ?? '—'} | ${compoundB.molecularWeight ?? '—'} | ${differences?.propertyDeltas?.molecularWeight?.diff ?? '—'} g/mol |
| LogP | ${compoundA.properties?.logP ?? '—'} | ${compoundB.properties?.logP ?? '—'} | ${differences?.propertyDeltas?.logP?.diff ?? '—'} |
| TPSA | ${compoundA.properties?.tpsa ?? '—'} Å² | ${compoundB.properties?.tpsa ?? '—'} Å² | ${differences?.propertyDeltas?.tpsa?.diff ?? '—'} Å² |
| H-Bond Donors | ${compoundA.properties?.hbd ?? '—'} | ${compoundB.properties?.hbd ?? '—'} | ${differences?.propertyDeltas?.hbd?.diff ?? '—'} |
| H-Bond Acceptors | ${compoundA.properties?.hba ?? '—'} | ${compoundB.properties?.hba ?? '—'} | ${differences?.propertyDeltas?.hba?.diff ?? '—'} |
| Rotatable Bonds | ${compoundA.properties?.rotatableBonds ?? '—'} | ${compoundB.properties?.rotatableBonds ?? '—'} | ${differences?.propertyDeltas?.rotatableBonds?.diff ?? '—'} |

> **Disclaimer**: This comparison report is generated computationally by Aegis for research and educational purposes. Molecular similarity metrics reflect 2D/3D topological arrangements and do not constitute biological efficacy or safety determinations.
`
}
