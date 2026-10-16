import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import { autocompleteCompound, resolveCompound } from './services/compoundResolver.js'
import {
  calculateMCS,
  calculateTanimotoSimilarity,
  analyzeStructuralDifferences,
} from './services/structureComparison.js'
import {
  getStructureData,
  generateFallbackPdbText,
  calculateBindingPocket,
  findSimilarMolecules,
  alignStructures,
  generateStructureInterpretation,
  answerStructureQuestion,
  parseUploadedStructureFile,
} from './services/bioStructureService.js'
import {
  searchUniversalProteins,
  resolveUniversalProtein,
  calculateSequenceMetrics,
  classifyProteinQuery,
  searchAdvancedBiostructures,
} from './services/universalProteinService.js'
import { scientificDataHub } from './services/scientificDataHub.js'
import { dtiPipelineService } from './services/dtiPipelineService.js'
import { rcsbAdapter } from './services/scientificAdapters/rcsbAdapter.js'

const app = express()
const port = process.env.PORT || 5001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'aegis-api', phase: 'foundation' })
})

app.get('/api/models', (_request, response) => {
  response.json({ models: [], message: 'Model registry is ready for trained artifacts.' })
})

// Autocomplete suggestions for chemical queries
app.get('/api/compounds/autocomplete', async (req, res) => {
  const term = req.query.term || ''
  try {
    const terms = await autocompleteCompound(term)
    res.json({ terms })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve autocomplete terms', message: err.message })
  }
})

// Compare two chemical compounds
async function handleComparison(queryA, queryB, res, bodyCompoundA = null, bodyCompoundB = null) {
  let compoundA = bodyCompoundA
  let compoundB = bodyCompoundB

  try {
    if (!compoundA) {
      if (!queryA || !queryA.trim()) {
        return res.status(400).json({ error: 'Both compound A and compound B must be provided' })
      }
      compoundA = await resolveCompound(queryA.trim())
    }
    if (!compoundB) {
      if (!queryB || !queryB.trim()) {
        return res.status(400).json({ error: 'Both compound A and compound B must be provided' })
      }
      compoundB = await resolveCompound(queryB.trim())
    }

    const mcs = calculateMCS(compoundA, compoundB)
    const similarity = calculateTanimotoSimilarity(compoundA, compoundB)
    const differences = analyzeStructuralDifferences(compoundA, compoundB, mcs)

    res.json({
      compoundA,
      compoundB,
      mcs,
      similarity,
      differences,
    })
  } catch (err) {
    res.status(404).json({ error: 'Comparison failed', message: err.message })
  }
}

app.post('/api/compounds/compare', (req, res) => {
  const { queryA, queryB, compoundA, compoundB } = req.body || {}
  handleComparison(queryA, queryB, res, compoundA, compoundB)
})

app.get('/api/compounds/compare', (req, res) => {
  const queryA = req.query.a || req.query.queryA
  const queryB = req.query.b || req.query.queryB
  handleComparison(queryA, queryB, res)
})

// Resolve a compound by name, SMILES, formula, or CID
app.get('/api/compounds/resolve', async (req, res) => {
  const q = req.query.q || ''
  if (!q.trim()) {
    return res.status(400).json({ error: 'Search query parameter "q" is required' })
  }
  try {
    const compound = await resolveCompound(q)
    res.json({ compound })
  } catch (err) {
    res.status(404).json({ error: 'Compound not found', message: err.message })
  }
})

// Alias for search
app.get('/api/compounds/search', async (req, res) => {
  const q = req.query.q || ''
  if (!q.trim()) {
    return res.status(400).json({ error: 'Search query parameter "q" is required' })
  }
  try {
    const compound = await resolveCompound(q)
    res.json({ results: [compound] })
  } catch (err) {
    res.status(404).json({ error: 'Search failed', message: err.message })
  }
})

// Fetch compound by CID directly
app.get('/api/compounds/:cid', async (req, res) => {
  const cid = req.params.cid
  try {
    const compound = await resolveCompound(cid)
    res.json({ compound })
  } catch (err) {
    res.status(404).json({ error: 'Compound not found', message: err.message })
  }
})

// Fetch raw 3D SDF for a compound
app.get('/api/compounds/:cid/3d', async (req, res) => {
  const cid = req.params.cid
  try {
    const compound = await resolveCompound(cid)
    res.type('text/plain').send(compound.sdfRaw || '')
  } catch (err) {
    res.status(404).send('3D structure not available')
  }
})

// ==========================================
// BIOSTRUCTURE INTELLIGENCE HUB API ENDPOINTS
// ==========================================

// Search biostructures and proteins across UniProt, PDB, and catalog
app.get('/api/structure/search', async (req, res) => {
  const q = req.query.q || ''
  try {
    const results = await searchUniversalProteins(q)
    res.json({ results })
  } catch (err) {
    res.status(500).json({ error: 'Protein search failed', message: err.message })
  }
})

// Advanced multi-tab structural search (Protein, PDB, UniProt, Chemical, IUPAC, SMILES, General)
app.get('/api/structure/search-advanced', async (req, res) => {
  const query = req.query.q || req.query.query || ''
  const searchType = req.query.type || req.query.searchType || 'general'
  const method = req.query.method || 'all'
  const maxResolution = req.query.maxResolution || 'all'
  const organism = req.query.organism || 'all'
  try {
    const data = await searchAdvancedBiostructures({
      query,
      searchType,
      method,
      maxResolution,
      organism,
    })
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Advanced search failed', message: err.message })
  }
})

// Parse and validate uploaded structure files (PDB, mmCIF, FASTA)
app.post('/api/structure/parse-upload', (req, res) => {
  const { content, fileName } = req.body || {}
  if (!content) {
    return res.status(400).json({ error: 'No structure file content provided' })
  }
  try {
    const structure = parseUploadedStructureFile(content, fileName || 'upload.pdb')
    res.json({ structure })
  } catch (err) {
    res.status(400).json({ error: 'Structure parsing failed', message: err.message })
  }
})

// Analyze arbitrary amino acid sequence or FASTA
app.post('/api/structure/sequence-analyze', (req, res) => {
  const { sequence } = req.body || {}
  try {
    const metrics = calculateSequenceMetrics(sequence)
    if (!metrics) {
      return res.status(400).json({ error: 'Invalid sequence provided' })
    }
    res.json({ metrics })
  } catch (err) {
    res.status(500).json({ error: 'Sequence analysis failed', message: err.message })
  }
})

// Universal Protein Profile resolution (UniProt + PDB + Sequence + Domains)
app.get('/api/structure/protein/:id', async (req, res) => {
  const queryOrId = req.params.id
  try {
    const protein = await resolveUniversalProtein(queryOrId)
    res.json({ protein })
  } catch (err) {
    res.status(404).json({ error: 'Protein not found', message: err.message })
  }
})

// Helper to detect synthetic fallback text
function isSyntheticFallback(text) {
  if (!text || typeof text !== 'string' || text.length < 50) return true
  return text.includes('15-OCT-26') && text.includes('A 901') && text.includes('MG   MG   A 902')
}

// Get parsed structure metadata and hierarchy
app.get('/api/structure/:id', async (req, res) => {
  const pdbId = req.params.id
  try {
    const structure = await getStructureData(pdbId)
    if (req.query.metadataOnly === 'true') {
      const { atoms, ...rest } = structure
      return res.json({
        structure: {
          ...rest,
          atomCount: atoms ? atoms.length : 0,
        },
      })
    }
    // Return complete parsed structure including full atomic coordinates
    res.json({ structure })
  } catch (err) {
    res.status(404).json({ error: 'Structure not found', message: err.message })
  }
})

// Get raw PDB coordinate text
app.get('/api/structure/:id/pdb', async (req, res) => {
  const pdbId = req.params.id
  try {
    const cleanId = String(pdbId).trim().toUpperCase()
    let pdbText = null
    const filePath = path.join(__dirname, 'data/structures', `${cleanId}.pdb`)

    try {
      const existing = await fs.readFile(filePath, 'utf-8')
      if (existing && existing.length > 50 && !isSyntheticFallback(existing)) {
        pdbText = existing
      }
    } catch {
      // Not cached locally
    }

    if (!pdbText) {
      try {
        const response = await fetch(`https://files.rcsb.org/download/${cleanId}.pdb`, {
          signal: AbortSignal.timeout(12000),
        })
        if (response.ok) {
          const fetchedText = await response.text()
          if (fetchedText && fetchedText.length > 200 && !isSyntheticFallback(fetchedText)) {
            pdbText = fetchedText
            await fs.mkdir(path.dirname(filePath), { recursive: true })
            await fs.writeFile(filePath, pdbText, 'utf-8').catch(() => {})
          }
        }
      } catch {
        // Network timeout / blocked
      }
    }

    if (!pdbText) {
      // Try existing cached file even if synthetic before generating fresh
      try {
        const existing = await fs.readFile(filePath, 'utf-8')
        if (existing && existing.length > 50) {
          pdbText = existing
        }
      } catch {}
    }

    if (!pdbText) {
      pdbText = generateFallbackPdbText(cleanId)
      // NOTE: Do NOT write synthetic fallback to disk cache so future fetches can still retrieve real PDB
    }

    res.type('text/plain').send(pdbText)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve PDB', message: err.message })
  }
})

// Retrieve complete RCSB PDB metadata snapshot (literature, crystallographic, polymer, ligand)
app.get('/api/structure/:id/rcsb', async (req, res) => {
  const pdbId = req.params.id
  try {
    const meta = await rcsbAdapter.getEntryMetadata(pdbId)
    if (meta) {
      return res.json({ success: true, rcsb: meta })
    }
    res.status(404).json({ error: 'RCSB entry not found' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve RCSB metadata', message: err.message })
  }
})

// Calculate binding pocket and molecular interactions
app.get('/api/structure/:id/pocket', async (req, res) => {
  const pdbId = req.params.id
  const ligandId = req.query.ligand || ''
  const cutoff = Number.parseFloat(req.query.cutoff) || 4.5
  try {
    const structure = await getStructureData(pdbId)
    const effectiveLigandId = ligandId || structure.ligands[0]?.id || 'CPF'
    const pocket = calculateBindingPocket(structure, effectiveLigandId, cutoff)
    const interpretation = generateStructureInterpretation(structure, pocket)
    res.json({ pocket, interpretation })
  } catch (err) {
    res.status(500).json({ error: 'Pocket calculation failed', message: err.message })
  }
})

// Search chemically similar molecules to a ligand
app.get('/api/structure/similar-molecules', (req, res) => {
  const id = req.query.id || 'CPF'
  const smiles = req.query.smiles || ''
  const threshold = Number.parseFloat(req.query.threshold) || 0.6
  try {
    const similarMolecules = findSimilarMolecules({ id, smiles }, threshold)
    res.json({ similarMolecules })
  } catch (err) {
    res.status(500).json({ error: 'Similarity search failed', message: err.message })
  }
})

// Pairwise structural alignment
app.post('/api/structure/align', async (req, res) => {
  const { pdbIdA, pdbIdB } = req.body || {}
  if (!pdbIdA || !pdbIdB) {
    return res.status(400).json({ error: 'Both pdbIdA and pdbIdB are required' })
  }
  try {
    const [structA, structB] = await Promise.all([
      getStructureData(pdbIdA),
      getStructureData(pdbIdB),
    ])
    const alignment = alignStructures(structA, structB)
    res.json({ alignment })
  } catch (err) {
    res.status(500).json({ error: 'Alignment failed', message: err.message })
  }
})

// Grounded AI Q&A ("Ask the Structure")
app.post('/api/structure/ask', async (req, res) => {
  const { pdbId, question, ligandId } = req.body || {}
  try {
    const structure = await getStructureData(pdbId || '2XCT')
    const effectiveLigandId = ligandId || structure.ligands[0]?.id || 'CPF'
    const pocket = calculateBindingPocket(structure, effectiveLigandId, 4.5)
    const answer = answerStructureQuestion(question, structure, pocket)
    res.json(answer)
  } catch (err) {
    res.status(500).json({ error: 'AI interpretation failed', message: err.message })
  }
})

// ==========================================
// SCIENTIFIC DATA INTEGRATION HUB API ENDPOINTS
// ==========================================

// Integrations live status across all 7 scientific databases
app.get('/api/integrations/status', async (_req, res) => {
  try {
    const status = await scientificDataHub.getIntegrationsStatus()
    res.json(status)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve integrations status', message: err.message })
  }
})

// Unified multi-database search
app.get('/api/science/search', async (req, res) => {
  const q = req.query.q || ''
  const limit = Number.parseInt(req.query.limit, 10) || 10
  try {
    const results = await scientificDataHub.search(q, limit)
    res.json(results)
  } catch (err) {
    res.status(500).json({ error: 'Scientific search failed', message: err.message })
  }
})

// Unified compound resolution (PubChem + ChEMBL)
app.get('/api/science/compound/:identifier', async (req, res) => {
  const id = req.params.identifier
  try {
    const record = await scientificDataHub.resolveCompound(id)
    if (!record || !record.success) {
      return res.status(404).json(record || { error: 'Compound not found' })
    }
    res.json(record)
  } catch (err) {
    res.status(500).json({ error: 'Compound resolution failed', message: err.message })
  }
})

// Unified protein & target resolution (UniProt + AlphaFold)
app.get('/api/science/protein/:identifier', async (req, res) => {
  const id = req.params.identifier
  try {
    const record = await scientificDataHub.resolveProtein(id)
    if (!record || !record.success) {
      return res.status(404).json(record || { error: 'Protein target not found' })
    }
    res.json(record)
  } catch (err) {
    res.status(500).json({ error: 'Protein resolution failed', message: err.message })
  }
})

// Unified macromolecular structure resolution (RCSB PDB + AlphaFold)
app.get('/api/science/structure/:identifier', async (req, res) => {
  const id = req.params.identifier
  try {
    const record = await scientificDataHub.resolveStructure(id)
    if (!record || !record.success) {
      return res.status(404).json(record || { error: 'Structure not found' })
    }
    res.json(record)
  } catch (err) {
    res.status(500).json({ error: 'Structure resolution failed', message: err.message })
  }
})

// Quantitative bioactivity records (ChEMBL + BindingDB)
app.get('/api/science/compound/:identifier/bioactivity', async (req, res) => {
  const id = req.params.identifier
  try {
    const bioactivity = await scientificDataHub.getCompoundBioactivity(id)
    res.json(bioactivity)
  } catch (err) {
    res.status(500).json({ error: 'Bioactivity retrieval failed', message: err.message })
  }
})

// Target interacting ligands (ChEMBL + BindingDB)
app.get('/api/science/target/:identifier/ligands', async (req, res) => {
  const id = req.params.identifier
  try {
    const ligands = await scientificDataHub.getTargetLigands(id)
    res.json(ligands)
  } catch (err) {
    res.status(500).json({ error: 'Target ligands retrieval failed', message: err.message })
  }
})

// ==========================================
// DTI PREDICTION & DATASET PIPELINE ENDPOINTS
// ==========================================

// Predict Drug-Target Interaction
app.post('/api/dti/predict', async (req, res) => {
  const { drug, target, thresholdUm } = req.body || {}
  try {
    const prediction = await dtiPipelineService.predict({ drug, target, thresholdUm })
    res.json(prediction)
  } catch (err) {
    res.status(400).json({ error: 'DTI prediction failed', message: err.message })
  }
})

// DTI benchmark datasets status
app.get('/api/datasets/status', (_req, res) => {
  try {
    const status = dtiPipelineService.getDatasetStatus()
    res.json(status)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve dataset status', message: err.message })
  }
})

// DTI benchmark dataset preparation & splitting
app.post('/api/datasets/prepare', (req, res) => {
  const { datasetId, splitStrategy, thresholdUm } = req.body || {}
  try {
    const result = dtiPipelineService.prepareDataset({ datasetId, splitStrategy, thresholdUm })
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to prepare dataset', message: err.message })
  }
})

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`Aegis API listening on http://localhost:${port}`)
})
