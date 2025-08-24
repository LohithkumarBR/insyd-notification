
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export const api = axios.create({
  baseURL: API_BASE
})

export async function fetchNotifications(userId) {
  const res = await api.get(`/notifications/${userId}`)
  return res.data.notifications
}

export async function postEvent(payload) {
  const res = await api.post('/events', payload)
  return res.data.event
}

export async function markRead(id) {
  const res = await api.post(`/notifications/${id}/read`)
  return res.data.notification
}
