import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { getAllResourceTypes } from '../constants/resourceTypes'
import { getAllResourceLocations } from '../constants/resourceLocations'

export default function Bookings() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterResource, setFilterResource] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [qrBooking, setQrBooking] = useState(null)
  const [selectedResourceType, setSelectedResourceType] = useState('')
  const [resourceTypes, setResourceTypes] = useState([])
  const [resourceLocations, setResourceLocations] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingBooking, setEditingBooking] = useState(null)
  const [form, setForm] = useState({
    resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: ''
  })

  useEffect(() => {
    fetchBookings()
    fetchResources()
    setResourceTypes(getAllResourceTypes())
    setResourceLocations(getAllResourceLocations())
  }, [])

  useEffect(() => {
    const handleTypesChanged = () => setResourceTypes(getAllResourceTypes())
    window.addEventListener('resource-types-changed', handleTypesChanged)
    return () => window.removeEventListener('resource-types-changed', handleTypesChanged)
  }, [])

  useEffect(() => {
    const handleLocationsChanged = () => setResourceLocations(getAllResourceLocations())
    window.addEventListener('resource-locations-changed', handleLocationsChanged)
    return () => window.removeEventListener('resource-locations-changed', handleLocationsChanged)
  }, [])

  const fetchBookings = async () => {
    try {
      const endpoint = user?.role === 'ADMIN' ? '/api/bookings' : '/api/bookings/my'
      const res = await api.get(endpoint)
      setBookings(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
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

  const toDatetimeLocal = (iso) => iso ? iso.slice(0, 16) : ''

  const handleEdit = (booking) => {
    setEditingBooking(booking)
    setSelectedResourceType(booking.resource?.type || '')
    setForm({
      resourceId: booking.resource?.id || '',
      startTime: toDatetimeLocal(booking.startTime),
      endTime: toDatetimeLocal(booking.endTime),
      purpose: booking.purpose || '',
      expectedAttendees: booking.expectedAttendees || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (overCapacity) {
      setError(`This resource cannot be booked for ${form.expectedAttendees} attendees. Maximum capacity is ${selectedResource.capacity}.`)
      return
    }

    setSubmitting(true)
    try {
      if (editingBooking) {
        await api.put(`/api/bookings/${editingBooking.id}`, form)
        setSuccess('Booking updated successfully!')
      } else {
        await api.post('/api/bookings', form)
        setSuccess('Booking request submitted successfully!')
      }
      fetchBookings()
      setShowForm(false)
      setEditingBooking(null)
      setSelectedResourceType('')
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' })
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed — time slot may be taken!')
    } finally {
      setSubmitting(false)
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

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking from the view?')) return
    try {
      await api.delete(`/api/bookings/${id}`)
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

  const filtered = bookings.filter(b => {
    if (filterStatus && b.status !== filterStatus) return false
    if (filterDateFrom && new Date(b.startTime) < new Date(filterDateFrom)) return false
    if (filterDateTo && new Date(b.startTime) > new Date(filterDateTo + 'T23:59:59')) return false
    if (filterResource && !b.resource?.name?.toLowerCase().includes(filterResource.toLowerCase())) return false
    if (filterUser && !b.user?.name?.toLowerCase().includes(filterUser.toLowerCase())) return false
    return true
  })
  const visibleResources = selectedResourceType
    ? resources.filter(r => r.type === selectedResourceType)
    : resources
  const selectedResource = resources.find(r => r.id === form.resourceId)
  const hasCapacity = !!(selectedResource?.capacity)
  const overCapacity = !!(
    selectedResource?.capacity &&
    form.expectedAttendees &&
    Number(form.expectedAttendees) > Number(selectedResource.capacity)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {success && (
        <div className="fixed right-4 top-4 z-[70] w-full max-w-sm">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg">
            <p className="text-sm font-semibold">Success</p>
            <p className="mt-1 text-sm">{success}</p>
          </div>
        </div>
      )}
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
        <div className="mb-6 space-y-3">
          <div className="flex gap-2 flex-wrap">
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
          {user?.role === 'ADMIN' && (
            <div className="space-y-2">
              <div className="flex gap-3 items-center flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Date range:</span>
                <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
                <span className="text-gray-400 text-sm">to</span>
                <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200" />
                {(filterDateFrom || filterDateTo) && (
                  <button onClick={() => { setFilterDateFrom(''); setFilterDateTo('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline">
                    Clear dates
                  </button>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Filter by resource name..."
                  value={filterResource}
                  onChange={e => setFilterResource(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-56"
                />
                <input
                  type="text"
                  placeholder="Filter by user name..."
                  value={filterUser}
                  onChange={e => setFilterUser(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-56"
                />
                {(filterResource || filterUser) && (
                  <button onClick={() => { setFilterResource(''); setFilterUser('') }}
                    className="text-xs text-gray-400 hover:text-gray-600 underline">
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
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
                    {user?.role === 'ADMIN' && (
                      <p className="text-sm text-gray-400 mb-1">👤 {b.user?.name || b.user?.email}</p>
                    )}
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
                      <button
                        onClick={(e) => { e.stopPropagation(); setQrBooking(b) }}
                        className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-xl hover:bg-blue-100 font-medium">
                        📱 QR Code
                      </button>
                    )}
                    {b.status === 'PENDING' && b.user?.email === user?.email && (
                      <button onClick={() => handleEdit(b)}
                        className="text-sm bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl hover:bg-yellow-100 font-medium">
                        Edit
                      </button>
                    )}
                    {(b.status === 'APPROVED' || b.status === 'PENDING') && b.user?.email === user?.email && (
                      <button onClick={() => handleCancel(b.id)}
                        className="text-sm bg-gray-50 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-100 font-medium">
                        Cancel
                      </button>
                    )}
                    {user?.role === 'ADMIN' && (
                      <button onClick={() => handleDelete(b.id)}
                        className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-xl hover:bg-red-100 font-medium">
                        Delete
                      </button>
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
            <h2 className="text-xl font-bold mb-6 text-gray-800">{editingBooking ? 'Edit Booking' : 'New Booking Request'}</h2>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm" role="alert" aria-live="assertive">
                <p className="text-sm font-semibold">Please fix this issue</p>
                <p className="mt-1 text-sm">{error}</p>
              </div>
            )}
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
              {hasCapacity && (
                <input placeholder="Expected Attendees" type="number" value={form.expectedAttendees}
                  onChange={e => setForm({ ...form, expectedAttendees: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-100" />
              )}
              {overCapacity && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                  <p className="text-sm font-semibold">Capacity exceeded</p>
                  <p className="mt-1 text-sm">
                    This resource supports up to {selectedResource.capacity} attendees.
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting || overCapacity}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {submitting ? 'Saving...' : editingBooking ? 'Save Changes' : 'Submit Request'}
                </button>
                <button type="button" onClick={() => {
                    setShowForm(false)
                    setEditingBooking(null)
                    setSelectedResourceType('')
                    setError('')
                    setForm({ resourceId: '', startTime: '', endTime: '', purpose: '', expectedAttendees: '' })
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