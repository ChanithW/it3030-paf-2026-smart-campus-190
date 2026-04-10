import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Bookings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: ''
  })

  useEffect(() => {
    fetchBookings()
    fetchResources()
  }, [])

  const fetchBookings = async () => {
    try {
      const endpoint = user?.role === 'ADMIN' ? '/api/bookings' : '/api/bookings/my'
      const res = await api.get(endpoint)
      setBookings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchResources = async () => {
    try {
      const res = await api.get('/api/resources')
      setResources(res.data.filter(r => r.status === 'ACTIVE'))
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/bookings', form)
      fetchBookings()
      setShowForm(false)
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' })
      alert('Booking request submitted successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed — time slot may be taken!')
    }
  }

  const handleStatusUpdate = async (id, status, reason = '') => {
    try {
      await api.patch(`/api/bookings/${id}/status`, { status, reason })
      fetchBookings()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await api.patch(`/api/bookings/${id}/cancel`)
      fetchBookings()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColor = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Bookings</h1>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
          + New Booking
        </button>
      </nav>

      <div className="p-6">
        {loading ? <p className="text-center text-gray-500">Loading...</p> : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{b.resource?.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Purpose: {b.purpose}</p>
                    <p className="text-sm text-gray-500">From: {new Date(b.startTime).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">To: {new Date(b.endTime).toLocaleString()}</p>
                    {b.expectedAttendees && <p className="text-sm text-gray-500">Attendees: {b.expectedAttendees}</p>}
                    {b.rejectionReason && <p className="text-sm text-red-500 mt-1">Reason: {b.rejectionReason}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[b.status]}`}>{b.status}</span>
                    {user?.role === 'ADMIN' && b.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusUpdate(b.id, 'APPROVED')}
                          className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100">
                          Approve
                        </button>
                        <button onClick={() => {
                          const reason = prompt('Rejection reason:')
                          if (reason) handleStatusUpdate(b.id, 'REJECTED', reason)
                        }}
                          className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-lg hover:bg-red-100">
                          Reject
                        </button>
                      </div>
                    )}
                    {b.status === 'APPROVED' && b.user?.email === user?.email && (
                      <button onClick={() => handleCancel(b.id)}
                        className="text-xs bg-gray-50 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <p className="text-center text-gray-400 py-12">No bookings found.</p>
            )}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-6">New Booking Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required value={form.resourceId}
                onChange={e => setForm({ ...form, resourceId: e.target.value })}
                className="w-full border rounded-lg px-4 py-2">
                <option value="">Select Resource</option>
                {resources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.location}</option>
                ))}
              </select>
              <div>
                <label className="text-sm text-gray-600">Start Time</label>
                <input required type="datetime-local" value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-600">End Time</label>
                <input required type="datetime-local" value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 mt-1" />
              </div>
              <input required placeholder="Purpose" value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <input placeholder="Expected Attendees" type="number" value={form.expectedAttendees}
                onChange={e => setForm({ ...form, expectedAttendees: e.target.value })}
                className="w-full border rounded-lg px-4 py-2" />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Submit Request
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
    </div>
  )
}