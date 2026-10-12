const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    let errorBody = null
    try {
      errorBody = await response.json()
    } catch {
      // not json
    }
    const message = errorBody?.message || errorBody?.error || `API request failed with status ${response.status}`
    const error = new Error(message)
    error.status = response.status
    error.body = errorBody
    throw error
  }

  return response.json()
}

export function getHealth() {
  return request('/api/health')
}

export function getModels() {
  return request('/api/models')
}

export function resolveCompoundQuery(query) {
  return request(`/api/compounds/resolve?q=${encodeURIComponent(query)}`)
}

export function autocompleteCompoundQuery(term) {
  return request(`/api/compounds/autocomplete?term=${encodeURIComponent(term)}`)
}

export function compareCompounds(queryA, queryB) {
  return request('/api/compounds/compare', {
    method: 'POST',
    body: JSON.stringify({ queryA, queryB }),
  })
}

export function compareCompoundObjects(compoundA, compoundB) {
  return request('/api/compounds/compare', {
    method: 'POST',
    body: JSON.stringify({ compoundA, compoundB }),
  })
}

// ==========================================
// SCIENTIFIC DATA HUB & ADAPTER SERVICES
// ==========================================

export function getIntegrationsStatus() {
  return request('/api/integrations/status')
}

export function searchScientificData(query, limit = 10) {
  return request(`/api/science/search?q=${encodeURIComponent(query)}&limit=${limit}`)
}

export function getScientificCompound(identifier) {
  return request(`/api/science/compound/${encodeURIComponent(identifier)}`)
}

export function getScientificProtein(identifier) {
  return request(`/api/science/protein/${encodeURIComponent(identifier)}`)
}

export function getScientificStructure(identifier) {
  return request(`/api/science/structure/${encodeURIComponent(identifier)}`)
}

export function getCompoundBioactivities(identifier) {
  return request(`/api/science/compound/${encodeURIComponent(identifier)}/bioactivity`)
}

export function getTargetLigands(identifier) {
  return request(`/api/science/target/${encodeURIComponent(identifier)}/ligands`)
}

// ==========================================
// AI DTI PREDICTION & DATASET PIPELINE SERVICES
// ==========================================

export function predictDti(drug, target, thresholdUm = 10.0) {
  return request('/api/dti/predict', {
    method: 'POST',
    body: JSON.stringify({ drug, target, thresholdUm }),
  })
}

export function getDatasetStatus() {
  return request('/api/datasets/status')
}

export function prepareDataset(datasetId = 'bindingdb-core', splitStrategy = 'scaffold', thresholdUm = 10.0) {
  return request('/api/datasets/prepare', {
    method: 'POST',
    body: JSON.stringify({ datasetId, splitStrategy, thresholdUm }),
  })
}
