const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3040/api/v1'

export async function apiRequest(path, { method = 'GET', body, token } = {}) {
  const isFormData = body instanceof FormData
  const headers = {}

  if (!isFormData && body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (networkError) {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Server returned an unexpected response (status ${response.status}).`)
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || `Request failed (status ${response.status}).`)
  }

  return data
}

export { API_BASE }
