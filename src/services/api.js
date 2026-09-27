const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
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
