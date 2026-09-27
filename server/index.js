import express from 'express'
import cors from 'cors'
import { autocompleteCompound, resolveCompound } from './services/compoundResolver.js'
import {
  calculateMCS,
  calculateTanimotoSimilarity,
  analyzeStructuralDifferences,
} from './services/structureComparison.js'
import {
  getStructureData,
  calculateBindingPocket,
  findSimilarMolecules,
  alignStructures,
  generateStructureInterpretation,
  answerStructureQuestion,
} from './services/bioStructureService.js'

const app = express()
const port = process.env.PORT || 4000

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

// Get parsed structure metadata and hierarchy
app.get('/api/structure/:id', async (req, res) => {
  const pdbId = req.params.id
  try {
    const structure = await getStructureData(pdbId)
    // Send lightweight representation without massive atom array for metadata calls
    const { atoms, ...rest } = structure
    res.json({
      structure: {
        ...rest,
        atomCount: atoms.length,
      },
    })
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
    try {
      const fs = await import('node:fs/promises')
      const path = await import('node:path')
      const filePath = path.resolve(`server/data/structures/${cleanId}.pdb`)
      pdbText = await fs.readFile(filePath, 'utf-8')
    } catch {
      const response = await fetch(`https://files.rcsb.org/download/${cleanId}.pdb`)
      if (response.ok) pdbText = await response.text()
    }
    if (!pdbText) return res.status(404).send('PDB file not found')
    res.type('text/plain').send(pdbText)
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve PDB', message: err.message })
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

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`Aegis API listening on http://localhost:${port}`)
})
