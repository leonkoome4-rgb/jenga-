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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Free-tier hosts (Render, etc.) spin the backend down after inactivity and
// take up to ~30-50s to wake back up on the next request, which otherwise
// surfaces as a hard "can't reach the server" failure. Retry network-level
// failures a couple of times with a short backoff before giving up.
const RETRY_DELAYS_MS = [3000, 6000]

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  let attempt = 0
  while (true) {
    try {
      response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
      break
    } catch {
      if (attempt >= RETRY_DELAYS_MS.length) {
        throw new ApiError('Could not reach the server. Please try again in a moment.', 0, null)
      }
      await sleep(RETRY_DELAYS_MS[attempt])
      attempt += 1
    }
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
