/**
 * structureComparison.js
 * Advanced Cheminformatics Module for Molecular Structure Comparison,
 * Maximum Common Substructure (MCS), and Topological Fingerprint Similarity.
 */

import { ELEMENT_METRICS } from './compoundResolver.js'

/**
 * Calculates topological circular fingerprints (Morgan/ECFP-like) for a molecule
 * and computes the Tanimoto similarity coefficient between Molecule A and Molecule B.
 */
export function calculateTanimotoSimilarity(molA, molB) {
  const fpA = generateCircularFingerprint(molA)
  const fpB = generateCircularFingerprint(molB)

  const setA = new Set(fpA)
  const setB = new Set(fpB)

  if (setA.size === 0 && setB.size === 0) {
    return {
      score: 1.0,
      percentage: 100,
      commonFeatures: 0,
      totalFeaturesA: 0,
      totalFeaturesB: 0,
      method: 'Morgan/ECFP-like circular topological fingerprint (radius 2)',
    }
  }

  if (setA.size === 0 || setB.size === 0) {
    return {
      score: 0.0,
      percentage: 0,
      commonFeatures: 0,
      totalFeaturesA: setA.size,
      totalFeaturesB: setB.size,
      method: 'Morgan/ECFP-like circular topological fingerprint (radius 2)',
    }
  }

  let intersection = 0
  setA.forEach((feature) => {
    if (setB.has(feature)) intersection += 1
  })

  const union = setA.size + setB.size - intersection
  const score = union > 0 ? parseFloat((intersection / union).toFixed(3)) : 0
  const percentage = Math.round(score * 100)

  return {
    score,
    percentage,
    commonFeatures: intersection,
    totalFeaturesA: setA.size,
    totalFeaturesB: setB.size,
    method: 'Morgan/ECFP-like circular topological fingerprint (radius 2)',
  }
}

/**
 * Generates an array of hashed feature identifiers for atoms at radius 0, 1, and 2
 */
function generateCircularFingerprint(molecule) {
  const atoms = molecule.atoms || []
  const bonds = molecule.bonds || []
  if (atoms.length === 0) return []

  // Build adjacency list
  const adj = Array.from({ length: atoms.length }, () => [])
  bonds.forEach((b) => {
    const fromIdx = typeof b.from === 'number' ? b.from : atoms.findIndex((a) => a.id === b.from)
    const toIdx = typeof b.to === 'number' ? b.to : atoms.findIndex((a) => a.id === b.to)
    if (fromIdx >= 0 && toIdx >= 0) {
      const type = b.isAromatic || b.type === 'aromatic' || b.order === 1.5 ? 'aro' : (b.type || (b.order === 2 ? 'double' : b.order === 3 ? 'triple' : 'single'))
      adj[fromIdx].push({ target: toIdx, type })
      adj[toIdx].push({ target: fromIdx, type })
    }
  })

  const features = []

  // Radius 0: Element + aromatic status
  const r0 = atoms.map((a) => {
    const isAro = Boolean(a.aromatic || a.isAromatic)
    const hash = `${a.element}${isAro ? ':aro' : ''}`
    features.push(hash)
    return hash
  })

  // Radius 1: Atom + sorted immediate neighbors
  const r1 = atoms.map((_, i) => {
    const neighborSignatures = adj[i]
      .map((e) => `${e.type}:${r0[e.target]}`)
      .sort()
      .join(',')
    const hash = `${r0[i]}(${neighborSignatures})`
    features.push(hash)
    return hash
  })

  // Radius 2: 2-hop topological environment
  atoms.forEach((_, i) => {
    const twoHopSignatures = adj[i]
      .map((e) => `${e.type}:${r1[e.target]}`)
      .sort()
      .join(',')
    const hash = `${r1[i]}(${twoHopSignatures})`
    features.push(hash)
  })

  return features
}

/**
 * Computes Maximum Common Substructure (MCS) between two molecules
 * with a time-budget guard (default 2500ms) to ensure UI responsiveness.
 */
export function calculateMCS(molA, molB, options = {}) {
  const startTime = Date.now()
  const timeoutMs = options.timeoutMs || 2500

  const atomsA = (molA.atoms || []).filter((a) => a.element !== 'H')
  const atomsB = (molB.atoms || []).filter((a) => a.element !== 'H')

  if (atomsA.length === 0 || atomsB.length === 0) {
    return {
      commonAtomsCount: 0,
      commonBondsCount: 0,
      similarityScore: 0,
      similarityPercentage: 0,
      matchedAtomsA: [],
      matchedAtomsB: [],
      atomMapAtoB: {},
      atomMapBtoA: {},
      matchedBondsA: [],
      matchedBondsB: [],
      timedOut: false,
    }
  }

  // Pre-index atom IDs to local indices
  const idToIdxA = new Map(atomsA.map((a, i) => [a.id, i]))
  const idToIdxB = new Map(atomsB.map((a, i) => [a.id, i]))

  const adjA = Array.from({ length: atomsA.length }, () => [])
  const adjB = Array.from({ length: atomsB.length }, () => [])

  ;(molA.bonds || []).forEach((b) => {
    const u = idToIdxA.has(b.from) ? idToIdxA.get(b.from) : b.from
    const v = idToIdxA.has(b.to) ? idToIdxA.get(b.to) : b.to
    if (u >= 0 && u < atomsA.length && v >= 0 && v < atomsA.length) {
      const isAro = Boolean(b.isAromatic || b.type === 'aromatic' || b.order === 1.5)
      const order = isAro ? 1.5 : (b.order || 1)
      adjA[u].push({ target: v, order, id: b.id, isAro })
      adjA[v].push({ target: u, order, id: b.id, isAro })
    }
  })

  ;(molB.bonds || []).forEach((b) => {
    const u = idToIdxB.has(b.from) ? idToIdxB.get(b.from) : b.from
    const v = idToIdxB.has(b.to) ? idToIdxB.get(b.to) : b.to
    if (u >= 0 && u < atomsB.length && v >= 0 && v < atomsB.length) {
      const isAro = Boolean(b.isAromatic || b.type === 'aromatic' || b.order === 1.5)
      const order = isAro ? 1.5 : (b.order || 1)
      adjB[u].push({ target: v, order, id: b.id, isAro })
      adjB[v].push({ target: u, order, id: b.id, isAro })
    }
  })

  // Candidate seed pairs based on matching element & ring/aromatic properties
  const candidateSeeds = []
  for (let i = 0; i < atomsA.length; i++) {
    for (let j = 0; j < atomsB.length; j++) {
      if (atomsA[i].element === atomsB[j].element) {
        let score = 0
        const aroA = Boolean(atomsA[i].aromatic || atomsA[i].isAromatic)
        const aroB = Boolean(atomsB[j].aromatic || atomsB[j].isAromatic)
        if (aroA === aroB) score += 4
        if (Math.abs(adjA[i].length - adjB[j].length) <= 1) score += 2
        candidateSeeds.push({ a: i, b: j, score })
      }
    }
  }

  candidateSeeds.sort((s1, s2) => s2.score - s1.score)

  let bestMapping = new Map()
  let timedOut = false

  // Limit seed exploration to top 15 candidates
  const seedsToTry = candidateSeeds.slice(0, 15)

  for (const seed of seedsToTry) {
    if (Date.now() - startTime > timeoutMs) {
      timedOut = true
      break
    }

    const currentMapping = new Map([[seed.a, seed.b]])
    const mappedB = new Set([seed.b])
    const queue = [seed.a]

    // Breadth-First-Search expansion on compatible edges
    while (queue.length > 0) {
      if (Date.now() - startTime > timeoutMs) {
        timedOut = true
        break
      }

      const currA = queue.shift()
      const currB = currentMapping.get(currA)

      for (const edgeA of adjA[currA]) {
        const nextA = edgeA.target
        if (currentMapping.has(nextA)) continue

        // Look for compatible unmapped neighbor in B
        let matchedNeighborB = -1
        for (const edgeB of adjB[currB]) {
          const nextB = edgeB.target
          if (!mappedB.has(nextB) && atomsA[nextA].element === atomsB[nextB].element) {
            // Check bond order / aromaticity compatibility
            const orderMatch =
              edgeA.isAro === edgeB.isAro ||
              edgeA.order === edgeB.order ||
              Math.abs(edgeA.order - edgeB.order) < 0.6

            if (orderMatch) {
              matchedNeighborB = nextB
              break
            }
          }
        }

        if (matchedNeighborB !== -1) {
          currentMapping.set(nextA, matchedNeighborB)
          mappedB.add(matchedNeighborB)
          queue.push(nextA)
        }
      }
    }

    if (currentMapping.size > bestMapping.size) {
      bestMapping = currentMapping
    }

    if (bestMapping.size >= Math.min(atomsA.length, atomsB.length)) {
      break
    }
  }

  // Format mapping results
  const matchedAtomsA = []
  const matchedAtomsB = []
  const atomMapAtoB = {}
  const atomMapBtoA = {}

  bestMapping.forEach((bIdx, aIdx) => {
    const atomA = atomsA[aIdx]
    const atomB = atomsB[bIdx]
    matchedAtomsA.push(atomA.id)
    matchedAtomsB.push(atomB.id)
    atomMapAtoB[atomA.id] = atomB.id
    atomMapBtoA[atomB.id] = atomA.id
  })

  // Detect common bonds in MCS
  const matchedBondsA = []
  const matchedBondsB = []

  ;(molA.bonds || []).forEach((bA) => {
    const targetInB1 = atomMapAtoB[bA.from]
    const targetInB2 = atomMapAtoB[bA.to]
    if (targetInB1 && targetInB2) {
      const matchInB = (molB.bonds || []).find(
        (bB) =>
          (bB.from === targetInB1 && bB.to === targetInB2) ||
          (bB.from === targetInB2 && bB.to === targetInB1)
      )
      if (matchInB) {
        matchedBondsA.push(bA.id)
        if (!matchedBondsB.includes(matchInB.id)) {
          matchedBondsB.push(matchInB.id)
        }
      }
    }
  })

  const totalHeavy = atomsA.length + atomsB.length
  const similarityScore = totalHeavy > 0 ? parseFloat(((2 * matchedAtomsA.length) / totalHeavy).toFixed(3)) : 0

  return {
    commonAtomsCount: matchedAtomsA.length,
    commonBondsCount: matchedBondsA.length,
    similarityScore,
    similarityPercentage: Math.round(similarityScore * 100),
    matchedAtomsA,
    matchedAtomsB,
    atomMapAtoB,
    atomMapBtoA,
    matchedBondsA,
    matchedBondsB,
    timedOut,
  }
}

/**
 * Analyzes full property differences and structural additions/deletions
 */
export function analyzeStructuralDifferences(molA, molB, mcsResult) {
  const descA = molA.properties || molA.descriptors || {}
  const descB = molB.properties || molB.descriptors || {}

  // 1. Numerical Differences (B - A)
  const numericProps = [
    { key: 'molecularWeight', label: 'Molecular Weight', unit: 'g/mol', precision: 2 },
    { key: 'logP', label: 'LogP', unit: '', precision: 2 },
    { key: 'tpsa', label: 'TPSA', unit: 'Å²', precision: 1 },
    { key: 'hbd', label: 'H-Bond Donors', unit: '', precision: 0 },
    { key: 'hba', label: 'H-Bond Acceptors', unit: '', precision: 0 },
    { key: 'rotatableBonds', label: 'Rotatable Bonds', unit: '', precision: 0 },
    { key: 'ringCount', label: 'Ring Count', unit: '', precision: 0 },
    { key: 'aromaticRingCount', label: 'Aromatic Ring Count', unit: '', precision: 0 },
    { key: 'heavyAtomCount', label: 'Heavy Atom Count', unit: '', precision: 0 },
    { key: 'formalCharge', label: 'Formal Charge', unit: '', precision: 0 },
  ]

  const propertyComparison = numericProps.map((p) => {
    const valA = descA[p.key] != null ? Number(descA[p.key]) : null
    const valB = descB[p.key] != null ? Number(descB[p.key]) : null
    const diff = valA != null && valB != null ? Number((valB - valA).toFixed(p.precision)) : null

    return {
      key: p.key,
      label: p.label,
      unit: p.unit,
      valueA: valA,
      valueB: valB,
      difference: diff,
      formattedDiff:
        diff != null
          ? diff > 0
            ? `+${diff.toFixed(p.precision)}`
            : diff.toFixed(p.precision)
          : 'N/A',
    }
  })

  // 2. Molecular Formula & Elemental Shift
  const formulaA = molA.formula || 'Unknown'
  const formulaB = molB.formula || 'Unknown'
  const elementCountsA = countElements(molA.atoms || [])
  const elementCountsB = countElements(molB.atoms || [])
  const allElements = [...new Set([...Object.keys(elementCountsA), ...Object.keys(elementCountsB)])].sort()

  const elementalDifference = allElements.map((elem) => {
    const countA = elementCountsA[elem] || 0
    const countB = elementCountsB[elem] || 0
    const diff = countB - countA
    return {
      element: elem,
      countA,
      countB,
      diff,
      formattedDiff: diff > 0 ? `+${diff}` : `${diff}`,
    }
  })

  // 3. Structural Additions and Deletions
  const atomsA = molA.atoms || []
  const atomsB = molB.atoms || []
  const matchedSetA = new Set(mcsResult.matchedAtomsA || [])
  const matchedSetB = new Set(mcsResult.matchedAtomsB || [])

  const deletedFromA = atomsA.filter((a) => !matchedSetA.has(a.id) && a.element !== 'H')
  const addedToB = atomsB.filter((a) => !matchedSetB.has(a.id) && a.element !== 'H')

  const additionsSummary = summarizeSubstituentChanges(addedToB, atomsB)
  const deletionsSummary = summarizeSubstituentChanges(deletedFromA, atomsA)

  // 4. Functional Groups Comparison
  const fgA = (molA.topology?.functionalGroups || []).map((fg) => fg.name)
  const fgB = (molB.topology?.functionalGroups || []).map((fg) => fg.name)
  const allFgNames = [...new Set([...fgA, ...fgB])]

  const functionalGroupComparison = allFgNames.map((name) => ({
    name,
    presentInA: fgA.includes(name),
    presentInB: fgB.includes(name),
  }))

  // 5. Plain-Language Comparison Summary
  const summaryText = generateComparisonSummary(
    molA,
    molB,
    mcsResult,
    propertyComparison,
    additionsSummary,
    deletionsSummary
  )

  return {
    propertyComparison,
    elementalDifference,
    formulaA,
    formulaB,
    deletedFromA: deletedFromA.map((a) => a.id),
    addedToB: addedToB.map((a) => a.id),
    additionsSummary,
    deletionsSummary,
    functionalGroupComparison,
    summaryText,
  }
}

/**
 * Counts occurrences of each element
 */
function countElements(atoms) {
  const counts = {}
  atoms.forEach((a) => {
    counts[a.element] = (counts[a.element] || 0) + 1
  })
  return counts
}

/**
 * Summarizes added or deleted atom clusters into readable substituent names
 */
function summarizeSubstituentChanges(unmatchedAtoms, allAtoms) {
  if (unmatchedAtoms.length === 0) return 'No substantial heavy atom additions'

  const elementCounts = {}
  unmatchedAtoms.forEach((a) => {
    elementCounts[a.element] = (elementCounts[a.element] || 0) + 1
  })

  if (elementCounts.C === 1 && Object.keys(elementCounts).length === 1) {
    return 'Methyl group (-CH₃)'
  }
  if (elementCounts.O === 1 && Object.keys(elementCounts).length === 1) {
    return 'Hydroxyl / Carbonyl oxygen'
  }
  if (elementCounts.N === 1 && Object.keys(elementCounts).length === 1) {
    return 'Amine / Nitrogen center'
  }
  if (elementCounts.Cl === 1 && Object.keys(elementCounts).length === 1) {
    return 'Chlorine substituent (-Cl)'
  }

  const parts = Object.entries(elementCounts).map(([elem, count]) => `${count} ${elem}`)
  return `${unmatchedAtoms.length} atom substituent (${parts.join(', ')})`
}

/**
 * Generates an objective, scientifically responsible plain-language comparison summary
 */
function generateComparisonSummary(molA, molB, mcs, props, additions, deletions) {
  const nameA = molA.name || 'Compound A'
  const nameB = molB.name || 'Compound B'

  const mwDiff = props.find((p) => p.key === 'molecularWeight')?.formattedDiff || '0'
  const logPDiff = props.find((p) => p.key === 'logP')?.formattedDiff || '0'
  const tpsaDiff = props.find((p) => p.key === 'tpsa')?.formattedDiff || '0'

  let coreDesc = ''
  if (mcs.commonAtomsCount >= 6) {
    coreDesc = `${nameA} and ${nameB} share a significant common core scaffold composed of ${mcs.commonAtomsCount} matching atoms and ${mcs.commonBondsCount} bonds.`
  } else if (mcs.commonAtomsCount > 0) {
    coreDesc = `${nameA} and ${nameB} exhibit a structural overlap of ${mcs.commonAtomsCount} shared atom(s).`
  } else {
    coreDesc = `${nameA} and ${nameB} possess distinct, structurally non-overlapping topologies.`
  }

  let modDesc = ''
  if (additions !== 'No substantial heavy atom additions') {
    modDesc = ` ${nameB} incorporates an additional ${additions}.`
  }
  if (deletions !== 'No substantial heavy atom additions') {
    modDesc += ` Conversely, ${nameA} features an extra ${deletions}.`
  }

  const propDesc = ` Molecular weight shifts by ${mwDiff} g/mol, LogP by ${logPDiff}, and polar surface area (TPSA) by ${tpsaDiff} Å².`

  const disclaimer = ` Note: Chemical structural similarity reflects topological overlap and does not predict identical biological binding or therapeutic equivalence.`

  return `${coreDesc}${modDesc}${propDesc}${disclaimer}`
}
