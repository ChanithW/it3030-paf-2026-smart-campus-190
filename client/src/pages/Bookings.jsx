import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { QRCodeSVG as QRCode } from 'qrcode.react'

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [qrBooking, setQrBooking] = useState(null)
  const [selectedResourceType, setSelectedResourceType] = useState('')
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
      setSelectedResourceType('')
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' })
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

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
    APPROVED: { color: 'bg-green-100 text-green-700', label: 'Approved' },
    REJECTED: { color: 'bg-red-100 text-red-700', label: 'Rejected' },
    CANCELLED: { color: 'bg-gray-100 text-gray-500', label: 'Cancelled' }
  }

  const filtered = bookings.filter(b => !filterStatus || b.status === filterStatus)
  const resourceTypes = [...new Set(resources.map(r => r.type).filter(Boolean))].sort()
  const visibleResources = selectedResourceType
    ? resources.filter(r => r.type === selectedResourceType)
    : resources

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.role === 'ADMIN' ? 'Manage all booking requests' : 'Your booking requests'}
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 text-sm font-medium shadow-sm">
            + New Booking
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                filterStatus === s
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading bookings...</div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">{b.resource?.name}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusConfig[b.status]?.color}`}>
                        {statusConfig[b.status]?.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">📋 {b.purpose}</p>
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span>🕐 {new Date(b.startTime).toLocaleString()}</span>
                      <span>→ {new Date(b.endTime).toLocaleString()}</span>
                    </div>
                    {b.expectedAttendees && (
                      <p className="text-sm text-gray-500 mt-1">👥 {b.expectedAttendees} attendees</p>
                    )}
                    {b.rejectionReason && (
                      <p className="text-sm text-red-500 mt-2 bg-red-50 px-3 py-2 rounded-lg">
                        ❌ {b.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {user?.role === 'ADMIN' && b.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusUpdate(b.id, 'APPROVED')}
                          className="text-sm bg-green-50 text-green-600 px-4 py-2 rounded-xl hover:bg-green-100 font-medium">
                          Approve
                        </button>
                        <button onClick={() => {
                          const reason = prompt('Rejection reason:')
                          if (reason) handleStatusUpdate(b.id, 'REJECTED', reason)
                        }}
                          className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-xl hover:bg-red-100 font-medium">
                          Reject
                        </button>
                      </div>
                    )}
                    {b.status === 'APPROVED' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setQrBooking(b) }}
                          className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 font-medium">
                          📱 QR Code
                        </button>
                        {b.user?.email === user?.email && (
                          <button onClick={() => handleCancel(b.id)}
                            className="text-sm bg-gray-50 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 font-medium">
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">No bookings found</p>
                <p className="text-sm mt-1">Create a new booking to get started</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-xl font-bold mb-6 text-gray-800">New Booking Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium">Resource Type</label>
                <select
                  value={selectedResourceType}
                  onChange={e => {
                    const value = e.target.value
                    setSelectedResourceType(value)
                    setForm({ ...form, resourceId: '' })
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="">Select Resource Type</option>
                  {resourceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <select required value={form.resourceId}
                onChange={e => setForm({ ...form, resourceId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-100">
                <option value="">Select Resource</option>
                {visibleResources.map(r => (
                  <option key={r.id} value={r.id}>{r.name} — {r.location}</option>
                ))}
              </select>
              {selectedResourceType && visibleResources.length === 0 && (
                <p className="text-xs text-amber-600 font-medium">
                  No active resources found for this type.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Start Time</label>
                  <input required type="datetime-local" value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">End Time</label>
                  <input required type="datetime-local" value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-100" />
                </div>
              </div>
              <input required placeholder="Purpose of booking" value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-100" />
              <input placeholder="Expected Attendees" type="number" value={form.expectedAttendees}
                onChange={e => setForm({ ...form, expectedAttendees: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-100" />
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium">
                  Submit Request
                </button>
                <button type="button" onClick={() => {
                    setShowForm(false)
                    setSelectedResourceType('')
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Booking QR Code</h2>
            <p className="text-gray-500 text-sm mb-6">Show this at check-in</p>

            <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-2xl">
              <QRCode
                value={JSON.stringify({
                  bookingId: qrBooking.id,
                  resource: qrBooking.resource?.name,
                  purpose: qrBooking.purpose,
                  start: qrBooking.startTime,
                  end: qrBooking.endTime,
                  status: qrBooking.status
                })}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-left bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-2">{qrBooking.resource?.name}</p>
              <p className="text-xs text-blue-600">📋 {qrBooking.purpose}</p>
              <p className="text-xs text-blue-600 mt-1">🕐 {new Date(qrBooking.startTime).toLocaleString()}</p>
              <p className="text-xs text-blue-600">→ {new Date(qrBooking.endTime).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setQrBooking(null)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}