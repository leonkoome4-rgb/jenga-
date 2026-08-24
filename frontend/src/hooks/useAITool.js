import { useState } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../api/client.js'
import { selectAuthToken } from '../features/auth/authSlice.js'

export function useAITool(endpoint) {
  const token = useSelector(selectAuthToken)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const run = async (payload) => {
    setStatus('loading')
    setError(null)
    try {
      const data = await api.post(endpoint, payload, { token })
      setResult(data.result)
      setStatus('succeeded')
      return data.result
    } catch (err) {
      setError(err.data?.error || err.message)
      setStatus('failed')
      return null
    }
  }

  return { run, status, error, result, loading: status === 'loading' }
}
