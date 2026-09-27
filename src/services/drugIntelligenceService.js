/**
 * drugIntelligenceService.js
 * Client-side communication, caching, local storage persistence, and export engine
 * for the Drug Intelligence & Analysis Platform.
 */

import {
  DRUG_INTELLIGENCE_LIBRARY,
  getDrugProfile as getFallbackDrugProfile,
  searchDrugs as searchFallbackDrugs,
  analyzeDrugDrugInteraction,
  answerDrugQuestion as localAnswerDrugQuestion,
  predictDrugTargetInteraction as localPredictDti,
} from '../../server/services/drugIntelligenceService.js'

const API_BASE = '/api/drugs'
const STORAGE_PREFIX = 'aegis_drug_intel_'
const FAVORITES_KEY = `${STORAGE_PREFIX}favorites`
const NOTES_KEY = `${STORAGE_PREFIX}notes`
const RECENT_KEY = `${STORAGE_PREFIX}recent`

// Flagship quick-fallback IDs
export const FLAGSHIP_DRUGS = [
  { id: 'ciprofloxacin', name: 'Ciprofloxacin', class: 'Fluoroquinolone Antibacterial', cid: 2764 },
  { id: 'aspirin', name: 'Aspirin (Acetylsalicylic Acid)', class: 'NSAID / Antiplatelet', cid: 2244 },
  { id: 'caffeine', name: 'Caffeine', class: 'Methylxanthine CNS Stimulant', cid: 2519 },
  { id: 'ibuprofen', name: 'Ibuprofen', class: 'NSAID (Propionic Acid Derivative)', cid: 3672 },
  { id: 'paracetamol', name: 'Paracetamol (Acetaminophen)', class: 'Analgesic & Antipyretic', cid: 1983 },
  { id: 'imatinib', name: 'Imatinib Mesylate', class: 'BCR-ABL Tyrosine Kinase Inhibitor', cid: 5291 },
  { id: 'metformin', name: 'Metformin', class: 'Biguanide Antihyperglycemic', cid: 4091 },
  { id: 'atorvastatin', name: 'Atorvastatin', class: 'HMG-CoA Reductase Inhibitor (Statin)', cid: 60823 },
  { id: 'indomethacin', name: 'Indomethacin', class: 'Nonsteroidal Anti-inflammatory (NSAID)', cid: 3715 },
  { id: 'tamoxifen', name: 'Tamoxifen', class: 'Selective Estrogen Receptor Modulator (SERM)', cid: 5376 },
]

/**
 * Search drugs by name, synonym, target, or SMILES
 */
export async function searchDrugs(query) {
  if (!query || !query.trim()) return []
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query.trim())}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results
      }
    }
  } catch (err) {
    console.warn('[DrugIntelService] Search API failed, using fallback filter', err)
  }

  // Fallback to local search
  return await searchFallbackDrugs(query)
}

/**
 * Fetch full drug profile by ID or search term
 */
export async function getDrugProfile(idOrQuery) {
  if (!idOrQuery) return null
  const cleanId = String(idOrQuery).trim()
  
  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(cleanId)}`)
    if (res.ok) {
      const data = await res.json()
      if (data.drug) {
        recordRecentlyViewed(data.drug)
        return data.drug
      }
    }
  } catch (err) {
    console.warn('[DrugIntelService] getDrugProfile API failed, checking local fallback', err)
  }

  try {
    const fallback = await getFallbackDrugProfile(idOrQuery)
    if (fallback) {
      recordRecentlyViewed(fallback)
      return fallback
    }
  } catch (fallbackErr) {
    console.warn('[DrugIntelService] Local fallback getDrugProfile failed', fallbackErr)
  }

  return null
}

/**
 * Analyze Drug-Drug Interaction between Drug A and Drug B
 */
export async function checkDrugInteraction(drugA, drugB) {
  try {
    const res = await fetch(`${API_BASE}/ddi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugA, drugB })
    })
    if (res.ok) {
      const data = await res.json()
      return data.interaction || data
    }
  } catch (err) {
    console.warn('[DrugIntelService] checkDrugInteraction API failed, using local engine', err)
  }

  return await analyzeDrugDrugInteraction(drugA, drugB)
}

/**
 * Ask the Drug natural language grounded question
 */
export async function askDrugQuestion(drug, question) {
  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drug, question })
    })
    if (res.ok) {
      const data = await res.json()
      return typeof data === 'string' ? data : (data.answer || data)
    }
  } catch (err) {
    console.warn('[DrugIntelService] askDrugQuestion API failed, using local analyst', err)
  }

  return localAnswerDrugQuestion(drug, question)
}

/**
 * Predict Drug-Target Interaction (DTI) and explainability features
 */
export async function predictDrugTargetInteraction(drug, targetName) {
  try {
    const res = await fetch(`${API_BASE}/predict-dti`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drug, targetName })
    })
    if (res.ok) {
      const data = await res.json()
      return data.prediction || data
    }
  } catch (err) {
    console.warn('[DrugIntelService] predictDrugTargetInteraction API failed, using local model', err)
  }

  return localPredictDti(drug, targetName)
}

// ==========================================
// LOCAL STORAGE PERSISTENCE (Favorites & Notes)
// ==========================================

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

export function isFavorite(drugId) {
  if (!drugId) return false
  const list = getFavorites()
  return list.some(item => item.id === drugId)
}

export function toggleFavorite(drug) {
  if (!drug?.id) return false
  try {
    const list = getFavorites()
    const index = list.findIndex(item => item.id === drug.id)
    let isNowFavorite = false
    if (index >= 0) {
      list.splice(index, 1)
      isNowFavorite = false
    } else {
      list.unshift({
        id: drug.id,
        name: drug.name,
        class: drug.class,
        formula: drug.formula,
        mw: drug.mw,
        savedAt: new Date().toISOString()
      })
      isNowFavorite = true
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list))
    return isNowFavorite
  } catch (e) {
    return false
  }
}

export function getDrugNotes(drugId) {
  if (!drugId) return []
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    const map = raw ? JSON.parse(raw) : {}
    return map[drugId] || []
  } catch (e) {
    return []
  }
}

export function addDrugNote(drugId, noteText, author = 'Student Researcher') {
  if (!drugId || !noteText || !noteText.trim()) return null
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    const map = raw ? JSON.parse(raw) : {}
    if (!map[drugId]) map[drugId] = []
    
    const newNote = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      text: noteText.trim(),
      author,
      createdAt: new Date().toISOString()
    }
    map[drugId].unshift(newNote)
    localStorage.setItem(NOTES_KEY, JSON.stringify(map))
    return newNote
  } catch (e) {
    return null
  }
}

export function deleteDrugNote(drugId, noteId) {
  if (!drugId || !noteId) return false
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    const map = raw ? JSON.parse(raw) : {}
    if (!map[drugId]) return false
    map[drugId] = map[drugId].filter(n => n.id !== noteId)
    localStorage.setItem(NOTES_KEY, JSON.stringify(map))
    return true
  } catch (e) {
    return false
  }
}

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function recordRecentlyViewed(drug) {
  if (!drug?.id) return
  try {
    const list = getRecentlyViewed().filter(d => d.id !== drug.id)
    list.unshift({
      id: drug.id,
      name: drug.name,
      class: drug.class,
      viewedAt: new Date().toISOString()
    })
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)))
  } catch (e) {
    // ignore
  }
}

// ==========================================
// REPORT GENERATION & FILE EXPORT
// ==========================================

export function generateDrugReportMarkdown(drugInput, aiReport) {
  if (!drugInput) return ''
  const drug = drugInput
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  const inchiKey = drug.inchikey || drug.inchiKey || 'N/A'
  const logP = drug.logP ?? drug.properties?.logP
  const tpsa = drug.tpsa ?? drug.properties?.tpsa
  const hbd = drug.hbd ?? drug.properties?.hbd
  const hba = drug.hba ?? drug.properties?.hba
  const rotBonds = drug.rotatableBonds ?? drug.properties?.rotatableBonds
  const aromaticRings = drug.aromaticRings ?? drug.properties?.aromaticRings
  const lip = drug.lipinski || drug.drugLikeness?.lipinski || { violations: 0, details: [] }
  const veber = drug.drugLikeness?.veber?.compliant ?? drug.drugLikeness?.veber ?? true
  const ghose = drug.drugLikeness?.ghose?.compliant ?? drug.drugLikeness?.ghose ?? true
  const bioScore = drug.drugLikeness?.bioavailabilityScore ?? 0.55
  
  return `# AEGIS DRUG INTELLIGENCE & PHARMACOLOGICAL DOSSIER
**Compound**: ${drug.name}
**Primary Classification**: ${drug.class || drug.drugClass || 'Therapeutic Agent'}
**Generated**: ${date}
**Platform**: AEGIS Molecular Lab — Drug Intelligence & Analysis Workstation

---

## 1. Executive Identification & Chemical Descriptors
- **Formula**: ${drug.formula || 'N/A'}
- **Molecular Weight**: ${drug.mw ? Number(drug.mw).toFixed(2) + ' g/mol' : 'N/A'}
- **Canonical SMILES**: \`${drug.smiles || 'N/A'}\`
- **InChIKey**: \`${inchiKey}\`
- **PubChem CID**: ${drug.pubchemCid || 'N/A'}
- **ChEMBL ID**: ${drug.chemblId || 'N/A'}
- **CAS Registry**: ${drug.cas || 'N/A'}
- **Murcko Scaffold**: \`${drug.murckoScaffold || drug.scaffold?.murcko || 'N/A'}\`

---

## 2. Physicochemical & Drug-Likeness Profile
- **Calculated LogP**: ${logP !== undefined ? Number(logP).toFixed(2) : 'N/A'}
- **Topological Polar Surface Area (TPSA)**: ${tpsa ?? 'N/A'} Å²
- **Hydrogen Bond Donors**: ${hbd ?? 'N/A'}
- **Hydrogen Bond Acceptors**: ${hba ?? 'N/A'}
- **Rotatable Bonds**: ${rotBonds ?? 'N/A'}
- **Aromatic Rings**: ${aromaticRings ?? 'N/A'}
- **Water Solubility (LogS)**: ${drug.solubility || drug.properties?.solubilityText || 'N/A'}
- **Lipinski Rule of 5**: ${lip.violations === 0 ? 'PASSED (0 violations)' : `FAILED (${lip.violations} violations)`}
- **Veber Filter**: ${veber ? 'PASSED' : 'VIOLATION'}
- **Ghose Filter**: ${ghose ? 'PASSED' : 'VIOLATION'}
- **Bioavailability Score**: ${(bioScore * 100).toFixed(0)}%

---

## 3. ADME & Pharmacokinetic Trajectory
- **Human Intestinal Absorption (HIA)**: ${drug.adme?.absorption?.hia || drug.adme?.absorption || 'High'}
- **Blood-Brain Barrier (BBB)**: ${drug.adme?.distribution?.bbb || drug.adme?.bbb || 'Moderate'}
- **Plasma Protein Binding (PPB)**: ${drug.adme?.distribution?.ppb || drug.adme?.plasmaProteinBinding || 'N/A'}
- **Volume of Distribution (Vd)**: ${drug.adme?.distribution?.vd || drug.adme?.volumeOfDistribution || 'N/A'}
- **Metabolism Pathways**: ${(drug.adme?.metabolism?.primaryEnzymes || drug.adme?.cypPathways || []).join(', ') || 'N/A'}
- **Clearance**: ${drug.adme?.excretion?.clearance || drug.adme?.clearance || 'N/A'}
- **Elimination Half-life (t1/2)**: ${drug.adme?.excretion?.halfLife || drug.adme?.halfLife || 'N/A'}
- **hERG Cardiotoxicity Risk**: ${drug.adme?.hergRisk || 'Low Risk'}

---

## 4. Primary Biological Targets & Bioactivity
${drug.targets?.length ? drug.targets.map(t => `### ${t.name} (${t.symbol || t.gene || 'Target'})
- **Class / Role**: ${t.role || t.targetClass || 'Primary Target'}
- **Organism**: ${t.organism || 'Homo sapiens'}
- **UniProt ID**: ${t.uniprot || t.uniprotId || 'N/A'}
- **PDB Structure**: ${t.pdb || t.pdbIds?.[0] || 'N/A'}
- **Potency**: ${t.potency || 'N/A'}
- **Mechanism**: ${t.mechanism || t.function || 'N/A'}
`).join('\n') : 'No targets registered.'}

---

## 5. Mechanism of Action (MoA) Timeline
${drug.moaSteps?.length ? drug.moaSteps.map(s => `${s.step}. **${s.title}**: ${s.description}`).join('\n') : (drug.pharmacology?.timeline?.length ? drug.pharmacology.timeline.map(s => `${s.step}. **${s.title}**: ${s.desc || s.description}`).join('\n') : drug.pharmacology?.moa || drug.mechanismOfAction || 'N/A')}

---

## 6. Drug Interactions & Safety Warnings
- **Common DDI Warnings**:
${(drug.ddiWarnings || drug.drugInteractions || []).map(w => `  - **${w.partner || w.interactingDrug}** (${w.severity}): ${w.effect || w.clinicalEffect || w.mechanism}`).join('\n') || '  - No major warnings listed.'}
- **Food & Dietary Interactions**:
${(drug.foodInteractions || []).map(f => `  - **${f.food || 'Dietary Interaction'}**: ${f.effect}`).join('\n') || '  - None listed.'}

---

## 7. Indications, Pharmacogenomics & Clinical Evidence
- **Approved Indications**: ${drug.indications?.join(', ') || (drug.diseases || []).map(d => typeof d === 'string' ? d : d.name).join(', ') || 'N/A'}
- **Pharmacogenomic Biomarkers**:
${(drug.pharmacogenomics || []).map(pg => `  - Gene **${pg.gene}** (${pg.allele || pg.variant || 'Allele'}): ${pg.clinicalEffect || pg.phenotype} [Recommendation: ${pg.recommendation || 'Standard guideline'}]`).join('\n') || '  - None reported.'}

---

## 8. AI Drug Analyst Synthesis
${aiReport || drug.aiSummary || drug.description || 'Automated multi-parameter synthesis generated by AEGIS Drug Intelligence engine.'}

---
> **Scientific & Educational Disclaimer**: This report is generated by AEGIS Molecular Lab for computational chemistry, bioinformatics, and pharmacology education and research. It does NOT constitute medical, prescribing, or clinical advice.
`
}

export function downloadFile(filename, content, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
