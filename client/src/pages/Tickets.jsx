import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

const TICKET_CATEGORIES = [
  'Electrical',
  'Plumbing',
  'IT Support',
  'Carpentry & Furniture',
  'Cleaning & Janitorial',
  'Security & Safety',
  'Other'
]

export default function Tickets() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ category: '', description: '', location: '' })
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [form, setForm] = useState({
    category: '', description: '', priority: 'MEDIUM', location: '', contactDetails: ''
  })
  const [campusLocations, setCampusLocations] = useState([])

  const validateContact = (contact) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    const phoneRegex = /^\+?[0-9]{10}$/
    return emailRegex.test(contact) || phoneRegex.test(contact)
  }

  useEffect(() => { 
    fetchTickets() 
    fetchLocations()
  }, [])

  const fetchTickets = async () => {
    try {
      const endpoint = user?.role === 'ADMIN' || user?.role === 'TECHNICIAN'
        ? '/api/tickets'
        : '/api/tickets/my'
      const res = await api.get(endpoint)
      setTickets(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    try {
      const res = await api.get('/api/resources')
      // Extract unique locations and sort them
      const uniqueLocs = [...new Set(res.data.map(r => r.location))]
        .filter(Boolean)
        .sort()
      setCampusLocations(uniqueLocs)
    } catch (err) {
      console.error('Error fetching locations:', err)
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3)
    setSelectedFiles(files)
    const urls = files.map(f => URL.createObjectURL(f))
    setPreviewUrls(urls)
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateContact(form.contactDetails)) {
      alert('Please provide a valid email address or 10-digit phone number')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('category', form.category)
      formData.append('description', form.description)
      formData.append('priority', form.priority)
      if (form.location) formData.append('location', form.location)
      if (form.contactDetails) formData.append('contactDetails', form.contactDetails)
      selectedFiles.forEach(file => formData.append('files', file))

      await api.post('/api/tickets/with-attachments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      fetchTickets()
      setShowForm(false)
      setForm({ category: '', description: '', priority: 'MEDIUM', location: '', contactDetails: '' })
      setSelectedFiles([])
      setPreviewUrls([])
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      let resolutionNotes = ''
      let reason = ''

      if (status === 'RESOLVED') {
        const input = prompt('Enter resolution notes (optional):')
        if (input === null) return
        resolutionNotes = input || 'Resolved by admin'
      }

      if (status === 'REJECTED') {
        const input = prompt('Enter rejection reason:')
        if (input === null) return
        reason = input || 'Rejected by admin'
      }

      await api.patch(`/api/tickets/${id}/status`, {
        status,
        resolutionNotes,
        reason
      })

      await fetchTickets()

      const refreshed = await api.get(`/api/tickets/${id}`)
      setSelectedTicket(refreshed.data)

    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async () => {
    try {
      await api.put(`/api/tickets/${selectedTicket.id}`, {
        ...editForm,
        priority: selectedTicket.priority,
        contactDetails: selectedTicket.contactDetails
      })
      const refreshed = await api.get(`/api/tickets/${selectedTicket.id}`)
      setSelectedTicket(refreshed.data)
      setIsEditing(false)
      fetchTickets()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Failed to update ticket')
    }
  }

  const startEditing = () => {
    setEditForm({
      category: selectedTicket.category,
      description: selectedTicket.description,
      location: selectedTicket.location || ''
    })
    setIsEditing(true)
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

  const openTicket = async (ticket) => {
    setIsEditing(false)
    try {
      const res = await api.get(`/api/tickets/${ticket.id}`)
      setSelectedTicket(res.data)
      fetchComments(ticket.id)
    } catch (err) {
      setSelectedTicket(ticket)
      fetchComments(ticket.id)
    }
  }

  const priorityConfig = {
    LOW: { color: 'bg-blue-100 text-blue-700', label: 'Low' },
    MEDIUM: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
    HIGH: { color: 'bg-orange-100 text-orange-700', label: 'High' },
    CRITICAL: { color: 'bg-red-100 text-red-700', label: 'Critical' }
  }

  const statusConfig = {
    OPEN: { color: 'bg-blue-100 text-blue-700', label: 'Open' },
    IN_PROGRESS: { color: 'bg-yellow-100 text-yellow-700', label: 'In Progress' },
    RESOLVED: { color: 'bg-green-100 text-green-700', label: 'Resolved' },
    CLOSED: { color: 'bg-gray-100 text-gray-500', label: 'Closed' },
    REJECTED: { color: 'bg-red-100 text-red-700', label: 'Rejected' }
  }

  const filtered = tickets.filter(t => !filterStatus || t.status === filterStatus)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Incident Tickets</h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.role === 'ADMIN' ? 'Manage all incident reports' :
                user?.role === 'TECHNICIAN' ? 'Assigned incident reports' :
                  'Your incident reports'}
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 text-sm font-medium shadow-sm">
            + New Ticket
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterStatus === s
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>
              {s ? statusConfig[s]?.label : 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading tickets...</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(t => (
              <div key={t.id} onClick={() => openTicket(t)}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{t.category}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[t.status]?.color}`}>
                        {statusConfig[t.status]?.label}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityConfig[t.priority]?.color}`}>
                        {priorityConfig[t.priority]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{t.description}</p>
                    <div className="flex items-center gap-4">
                      {t.location && <p className="text-sm text-gray-400">📍 {t.location}</p>}
                      {t.attachments?.length > 0 && (
                        <p className="text-sm text-gray-400">📎 {t.attachments.length} attachment{t.attachments.length > 1 ? 's' : ''}</p>
                      )}
                      {t.assignedTo && (
                        <p className="text-sm text-gray-400">👷 {t.assignedTo.name}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 ml-4">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">No tickets found</p>
                <p className="text-sm mt-1">Create a new ticket to report an incident</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Create Incident Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-100">
                <option value="">Select Category</option>
                {TICKET_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <textarea required placeholder="Describe the issue in detail..." value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-100" rows={3} />
              <div className="grid grid-cols-2 gap-4">
                <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-100">
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-100">
                  <option value="">Select Location</option>
                  {campusLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <input required placeholder="Contact Details (Email or 10-digit Phone)" value={form.contactDetails}
                onChange={e => setForm({ ...form, contactDetails: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-100" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (up to 3 images)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-orange-300 transition">
                  <input type="file" accept="image/*" multiple onChange={handleFileChange}
                    className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="text-sm text-gray-500">Click to upload images</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </label>
                </div>
                {previewUrls.length > 0 && (
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                        <button type="button" onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={uploading}
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 font-medium disabled:opacity-50">
                  {uploading ? 'Creating...' : 'Create Ticket'}
                </button>
                <button type="button" onClick={() => {
                  setShowForm(false)
                  setSelectedFiles([])
                  setPreviewUrls([])
                }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTicket && (        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <select
                      className="w-full text-xl font-bold border-b border-gray-200 focus:outline-none focus:border-orange-500 pb-1 bg-transparent"
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {TICKET_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <textarea
                      className="w-full text-sm text-gray-600 border border-gray-100 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-100"
                      rows={3}
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="Description"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-800">{selectedTicket.category}</h2>
                    <p className="text-gray-500 mt-1 text-sm">{selectedTicket.description}</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                {!isEditing && selectedTicket.user?.email === user?.email && selectedTicket.status === 'OPEN' && (
                  <button
                    onClick={startEditing}
                    className="text-xs font-medium text-orange-500 hover:text-orange-600 px-3 py-1.5 bg-orange-50 rounded-lg transition"
                  >
                    Edit
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-lg transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-600 px-3 py-1.5 bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button onClick={() => { setSelectedTicket(null); setIsEditing(false); }}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-2">×</button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[selectedTicket.status]?.color}`}>
                {statusConfig[selectedTicket.status]?.label}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${priorityConfig[selectedTicket.priority]?.color}`}>
                {priorityConfig[selectedTicket.priority]?.label}
              </span>
            </div>

            {isEditing ? (
              <div className="mb-4">
                <select
                  className="w-full text-sm text-gray-500 border-b border-gray-100 focus:outline-none focus:border-orange-500 py-1"
                  value={editForm.location}
                  onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                >
                  <option value="">Select Location</option>
                  {campusLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            ) : (
              selectedTicket.location && (
                <p className="text-sm text-gray-500 mb-3">📍 {selectedTicket.location}</p>
              )
            )}

            {selectedTicket.assignedTo && (
              <p className="text-sm text-gray-500 mb-3">👷 Assigned to: {selectedTicket.assignedTo.name}</p>
            )}

            {selectedTicket.resolutionNotes && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-green-700 mb-1">✅ Resolution Notes</p>
                <p className="text-sm text-green-600">{selectedTicket.resolutionNotes}</p>
              </div>
            )}

            {selectedTicket.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-red-700 mb-1">❌ Rejection Reason</p>
                <p className="text-sm text-red-600">{selectedTicket.rejectionReason}</p>
              </div>
            )}

            {selectedTicket.attachments?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
                <div className="flex gap-3 flex-wrap">
                  {selectedTicket.attachments.map((url, index) => (
                    <a key={index} href={`http://localhost:8080${url}`} target="_blank" rel="noreferrer">
                      <img src={`http://localhost:8080${url}`} alt={`Attachment ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-xl border border-gray-200 hover:opacity-80 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
              <div className="flex gap-2 mb-6 flex-wrap bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 w-full font-medium">Update Status:</p>
                {['IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
                  <button key={s} onClick={() => handleStatusUpdate(selectedTicket.id, s)}
                    className={`text-xs px-3 py-2 rounded-xl font-medium transition ${statusConfig[s]?.color} hover:opacity-80`}>
                    → {statusConfig[s]?.label}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-gray-700 mb-4">Comments ({comments.length})</h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {comments.map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{c.content}</p>
                        <p className="text-xs text-gray-400 mt-1">{c.user?.name} · {new Date(c.createdAt).toLocaleString()}</p>
                      </div>
                      {c.user?.email === user?.email && (
                        <button onClick={() => handleDeleteComment(c.id)}
                          className="text-xs text-red-400 hover:text-red-600 ml-3">Delete</button>
                      )}
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-gray-400 text-sm text-center py-4">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input placeholder="Add a comment..." value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment(selectedTicket.id)}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100" />
                <button onClick={() => handleAddComment(selectedTicket.id)}
                  className="bg-orange-500 text-white px-5 py-3 rounded-xl hover:bg-orange-600 text-sm font-medium">
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