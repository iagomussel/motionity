import { API_URL } from './config'

export async function getHealth() {
  const response = await fetch(`${API_URL}/health`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}
