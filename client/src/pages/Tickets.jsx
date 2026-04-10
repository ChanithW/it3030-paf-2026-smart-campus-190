import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Tickets() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [form, setForm] = useState({
    category: '', description: '', priority: 'MEDIUM', location: '', contactDetails: ''
  })

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    try {
      const endpoint = user?.role === 'ADMIN' ? '/api/tickets' : '/api/tickets/my'
      const res = await api.get(endpoint)
      setTickets(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (ticketId) => {
    try {
      const res = await api.get(`/api/tickets/${ticketId}/comments`)
      setComments(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/tickets', form)
      fetchTickets()
      setShowForm(false)
      setForm({ category: '', description: '', priority: 'MEDIUM', location: '', contactDetails: '' })
      alert('Ticket created successfully!')
    } catch (err) {
      console.error(err)
    }
  }

  const handleStatusUpdate = async (id, status, notes = '') => {
    try {
      await api.patch(`/api/tickets/${id}/status`, { status, resolutionNotes: notes })
      fetchTickets()
      if (selectedTicket?.id === id) {
        setSelectedTicket(prev => ({ ...prev, status }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComment = async (ticketId) => {
    if (!newComment.trim()) return
    try {
      await api.post(`/api/tickets/${ticketId}/comments`, { content: newComment })
      setNewComment('')
      fetchComments(ticketId)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    try {
      await api.delete(`/api/tickets/comments/${commentId}`)
      fetchComments(selectedTicket.id)
    } catch (err) {
      console.error(err)
    }
  }

  const openTicket = (ticket) => {
    setSelectedTicket(ticket)
    fetchComments(ticket.id)
  }

  const priorityColor = {
    LOW: 'bg-blue-100 text-blue-700',
    MEDIUM: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700'
  }

  const statusColor = {
    OPEN: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
    RESOLVED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-gray-100 text-gray-500',
    REJECTED: 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Incident Tickets</h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm">
          + New Ticket
        </button>
      </nav>

      <div className="p-6">
        {loading ? <p className="text-center text-gray-500">Loading...</p> : (
          <div className="space-y-4">
            {tickets.map(t => (
              <div key={t.id} onClick={() => openTicket(t)}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{t.category}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                    {t.location && <p className="text-sm text-gray-400 mt-1">📍 {t.location}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[t.priority]}`}>{t.priority}</span>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <p className="text-center text-gray-400 py-12">No tickets found.</p>
            )}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-6">Create Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Category (e.g. Electrical, Plumbing)" value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <textarea required placeholder="Description" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" rows={3} />
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full border rounded-lg px-4 py-2">
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="CRITICAL">Critical</option>
              </select>
              <input placeholder="Location" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <input placeholder="Contact Details" value={form.contactDetails}
                onChange={e => setForm({ ...form, contactDetails: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600">
                  Create Ticket
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.category}</h2>
                <p className="text-gray-500 mt-1">{selectedTicket.description}</p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="flex gap-2 mb-6">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[selectedTicket.status]}`}>{selectedTicket.status}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[selectedTicket.priority]}`}>{selectedTicket.priority}</span>
            </div>

            {user?.role === 'ADMIN' && (
              <div className="flex gap-2 mb-6 flex-wrap">
                {['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selectedTicket.id, s)}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200">
                    → {s}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-4">Comments</h3>
              <div className="space-y-3 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700">{c.content}</p>
                      {c.user?.email === user?.email && (
                        <button onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-red-400 hover:text-red-600 ml-2">Delete</button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{c.user?.name}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-gray-400 text-sm">No comments yet.</p>}
              </div>
              <div className="flex gap-2">
                <input placeholder="Add a comment..." value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedTicket.id)}
                  className="flex-1 border rounded-lg px-4 py-2 text-sm" />
                <button onClick={() => handleAddComment(selectedTicket.id)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}