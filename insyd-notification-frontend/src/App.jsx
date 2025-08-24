
import React, { useEffect, useMemo, useState } from 'react'
import { fetchNotifications, postEvent, markRead, api } from './api.js'

function usePolling(userId, intervalMs = 3000) {
  const [data, setData] = useState([])
  useEffect(() => {
    if (!userId) return
    let active = true
    const pull = async () => {
      try {
        const notes = await fetchNotifications(userId)
        if (active) setData(notes)
      } catch {}
    }
    pull()
    const id = setInterval(pull, intervalMs)
    return () => { active = false; clearInterval(id) }
  }, [userId, intervalMs])
  return data
}

export default function App() {
  const [users, setUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [targetUserId, setTargetUserId] = useState('')
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    // Simple dev helper: fetch users from backend via Mongo? We don't expose users route,
    // so ask root to infer service health and then instruct user to paste IDs.
  }, [])

  const notifications = usePolling(currentUserId, 3000)

  const canTrigger = useMemo(() => currentUserId && targetUserId && currentUserId !== targetUserId, [currentUserId, targetUserId])

  async function trigger(type) {
    if (!canTrigger) return alert('Select different source & target users')
    const data = type === 'comment' ? { text: commentText } : {}
    try {
      await postEvent({ type, sourceUserId: currentUserId, targetUserId, data })
      setCommentText('')
    } catch (e) {
      alert('Failed to post event: ' + (e?.response?.data?.error || e.message))
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', margin: 24, maxWidth: 900 }}>
      <h1>Insyd Notifications — POC</h1>
      <p style={{ opacity: 0.8 }}>Set your API base with <code>VITE_API_BASE</code> (current: {api.defaults.baseURL})</p>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
          <h2>Trigger Events</h2>
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Source (who acts) — Mongo _id</label>
            <input value={currentUserId} onChange={e => setCurrentUserId(e.target.value)} placeholder="sourceUserId" />
            <label>Target (who receives) — Mongo _id</label>
            <input value={targetUserId} onChange={e => setTargetUserId(e.target.value)} placeholder="targetUserId" />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button onClick={() => trigger('like')}>Like</button>
              <button onClick={() => trigger('follow')}>Follow</button>
              <button onClick={() => trigger('post')}>New Post</button>
            </div>
            <div style={{ marginTop: 8 }}>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="comment text" />
              <button style={{ marginLeft: 8 }} onClick={() => trigger('comment')}>Comment</button>
            </div>
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              Tip: On first backend start, users <b>alice</b> and <b>bob</b> are created. Use their MongoDB ObjectIDs as source/target.
            </p>
          </div>
        </div>

        <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
          <h2>Notifications</h2>
          {!currentUserId && <p>Enter your <code>sourceUserId</code> (really your user) to start polling.</p>}
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {notifications.map(n => (
              <li key={n._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{n.type}</div>
                    <div>{n.content}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(n.timestamp).toLocaleString()}</div>
                  </div>
                  {n.status !== 'read' && (
                    <button onClick={() => markRead(n._id)}>Mark read</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <details style={{ marginTop: 16 }}>
        <summary>How to get user IDs?</summary>
        <ol>
          <li>Start backend → connect MongoDB.</li>
          <li>Open Mongo shell and run: <code>db.users.find().pretty()</code> to see <code>_id</code> values for <b>alice</b> & <b>bob</b>.</li>
          <li>Use those IDs above as Source/Target.</li>
        </ol>
      </details>
    </div>
  )
}
