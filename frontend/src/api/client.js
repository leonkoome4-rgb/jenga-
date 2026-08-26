// Keep browser requests same-origin. Vite proxies /api locally and Nginx
// proxies it in the container deployment, avoiding fragile localhost/CORS
// differences between browsers and machines.
const API_URL = import.meta.env.VITE_API_URL || ''

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Is the backend running?', 0, null)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(data.error || 'Something went wrong', response.status, data)
  }
  return data
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}

export { ApiError }
