import express from 'express'
import cors from 'cors'
import { autocompleteCompound, resolveCompound } from './services/compoundResolver.js'

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

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`Aegis API listening on http://localhost:${port}`)
})
