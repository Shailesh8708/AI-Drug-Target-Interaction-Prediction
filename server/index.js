import express from 'express'
import cors from 'cors'

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

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' })
})

app.listen(port, () => {
  console.log(`Aegis API listening on http://localhost:${port}`)
})
