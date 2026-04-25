import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import { QRCodeSVG as QRCode } from 'qrcode.react'
import { getAllResourceTypes } from '../constants/resourceTypes'
import { getAllResourceLocations } from '../constants/resourceLocations'
import campusBg from '../assets/campus.png'

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
  const [remainingSeats, setRemainingSeats] = useState(null)
  const [slotAvailable, setSlotAvailable] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [reportUsers, setReportUsers] = useState([])
  const [reportLoading, setReportLoading] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
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

  useEffect(() => {
    const checkSlot = async () => {
      if (!form.resourceId || !form.startTime || !form.endTime) {
        setRemainingSeats(null)
        setSlotAvailable(null)
        return
      }
      const start = form.startTime.length === 16 ? form.startTime + ':00' : form.startTime
      const end = form.endTime.length === 16 ? form.endTime + ':00' : form.endTime
      if (selectedResource?.type === 'Lab') {
        try {
          const res = await api.get(`/api/bookings/remaining-capacity?resourceId=${form.resourceId}&startTime=${start}&endTime=${end}`)
          setRemainingSeats(res.data)
        } catch {
          setRemainingSeats(null)
        }
        setSlotAvailable(null)
      } else {
        setRemainingSeats(null)
        try {
          const res = await api.get(`/api/bookings/is-available?resourceId=${form.resourceId}&startTime=${start}&endTime=${end}`)
          setSlotAvailable(res.data)
        } catch {
          setSlotAvailable(null)
        }
      }
    }
    checkSlot()
  }, [form.resourceId, form.startTime, form.endTime])

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
    setRemainingSeats(null)
    setForm({
      resourceId: booking.resource?.id || '',
      startTime: toDatetimeLocal(booking.startTime),
      endTime: toDatetimeLocal(booking.endTime),
      purpose: booking.purpose || '',
      expectedAttendees: booking.expectedAttendees || ''
    })
    setShowForm(true)
  }

  const nowLocal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const now = new Date()
    if (new Date(form.startTime) < now) {
      setError('Start time cannot be in the past.')
      return
    }
    if (new Date(form.endTime) <= new Date(form.startTime)) {
      setError('End time must be after start time.')
      return
    }

    if (hasCapacity && !form.expectedAttendees) {
      setError('Please enter the expected number of attendees.')
      return
    }

    if (overCapacity) {
      setError(
        selectedResource?.type === 'Lab' && remainingSeats !== null
          ? `Only ${remainingSeats} seats remaining for this time slot.`
          : `This resource cannot be booked for ${form.expectedAttendees} attendees. Maximum capacity is ${selectedResource.capacity}.`
      )
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

  const handleCancel = (id) => {
    setConfirmModal({
      title: 'Cancel Booking',
      message: 'Are you sure you want to cancel this booking? This cannot be undone.',
      confirmLabel: 'Yes, Cancel Booking',
      confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
      onConfirm: async () => {
        try {
          await api.patch(`/api/bookings/${id}/cancel`)
          fetchBookings()
        } catch (err) {
          console.error(err)
        }
      }
    })
  }

  const handleDelete = (id) => {
    setConfirmModal({
      title: 'Delete Booking',
      message: 'This will permanently remove the booking from the list.',
      confirmLabel: 'Delete',
      confirmClass: 'bg-red-600 hover:bg-red-700 text-white',
      onConfirm: async () => {
        try {
          await api.delete(`/api/bookings/${id}`)
          fetchBookings()
        } catch (err) {
          console.error(err)
        }
      }
    })
  }

  const handleGenerateReport = async () => {
    setReportLoading(true)
    try {
      const res = await api.get('/api/auth/users')
      const users = res.data
      const enriched = users.map(u => {
        const userBookings = bookings.filter(b => b.user?.email === u.email)
        return {
          ...u,
          totalBookings: userBookings.length,
          pending: userBookings.filter(b => b.status === 'PENDING').length,
          approved: userBookings.filter(b => b.status === 'APPROVED').length,
          rejected: userBookings.filter(b => b.status === 'REJECTED').length,
          cancelled: userBookings.filter(b => b.status === 'CANCELLED').length,
        }
      })
      setReportUsers(enriched)
      setShowReport(true)
    } catch (err) {
      console.error(err)
    } finally {
      setReportLoading(false)
    }
  }

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Total Bookings', 'Pending', 'Approved', 'Rejected', 'Cancelled']
    const rows = reportUsers.map(u => [
      u.name || '',
      u.email || '',
      u.role || '',
      u.totalBookings,
      u.pending,
      u.approved,
      u.rejected,
      u.cancelled,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusConfig = {
    PENDING: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', border: 'border-l-yellow-400' },
    APPROVED: { color: 'bg-green-100 text-green-700', label: 'Approved', border: 'border-l-green-500' },
    REJECTED: { color: 'bg-red-100 text-red-700', label: 'Rejected', border: 'border-l-red-500' },
    CANCELLED: { color: 'bg-gray-100 text-gray-500', label: 'Cancelled', border: 'border-l-gray-300' }
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
  const effectiveCapacity = (selectedResource?.type === 'Lab' && remainingSeats !== null)
    ? remainingSeats
    : selectedResource?.capacity
  const overCapacity = !!(
    effectiveCapacity !== null &&
    effectiveCapacity !== undefined &&
    form.expectedAttendees &&
    Number(form.expectedAttendees) > Number(effectiveCapacity)
  )

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={campusBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
      </div>
      {success && (
        <div className="fixed right-4 top-4 z-[70] w-full max-w-sm">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg">
            <p className="text-sm font-semibold">Success</p>
            <p className="mt-1 text-sm">{success}</p>
          </div>
        </div>
      )}
      <Navbar />
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
              <p className="text-gray-500 text-sm mt-1">
                {user?.role === 'ADMIN' ? 'Manage all booking requests' : 'Your booking requests'}
              </p>
            </div>
            <div className="flex gap-3">
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleGenerateReport}
                  disabled={reportLoading}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 text-sm font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                  {reportLoading ? 'Generating...' : 'Generate Report'}
                </button>
              )}
              <button onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 text-sm font-medium shadow-sm">
                + New Booking
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Filter */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => {
              const count = s ? bookings.filter(b => b.status === s).length : bookings.length
              const label = s ? statusConfig[s]?.label : 'All'
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ease-in-out ${
                    filterStatus === s
                      ? 'bg-gray-800 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>
                  {label} <span className={`ml-1 text-xs font-semibold ${filterStatus === s ? 'opacity-75' : 'text-gray-400'}`}>({count})</span>
                </button>
              )
            })}
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 border-l-4 border-l-gray-200 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-40 bg-gray-200 rounded-lg" />
                      <div className="h-5 w-20 bg-gray-100 rounded-full" />
                    </div>
                    <div className="h-4 w-56 bg-gray-100 rounded-lg" />
                    <div className="flex gap-6">
                      <div className="h-4 w-44 bg-gray-100 rounded-lg" />
                      <div className="h-4 w-36 bg-gray-100 rounded-lg" />
                    </div>
                  </div>
                  <div className="h-9 w-24 bg-gray-100 rounded-xl ml-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => (
              <div key={b.id} className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 border-l-4 ${statusConfig[b.status]?.border} hover:shadow-md transition-all duration-200 ease-in-out`}>
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
              {selectedResource?.availabilityWindows && (() => {
                const parts = selectedResource.availabilityWindows.split('|')
                const days = parts[0]?.trim() || ''
                const times = parts[1]?.trim() || ''
                const formatT = t => {
                  if (!t) return t
                  const [h, m] = t.trim().split(':').map(Number)
                  const period = h >= 12 ? 'PM' : 'AM'
                  const display = h % 12 === 0 ? 12 : h % 12
                  return `${display}:${String(m).padStart(2, '0')} ${period}`
                }
                const [start, end] = times.split('to').map(formatT)
                return (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-green-700 text-xs flex items-center gap-2">
                    <span className="text-green-500">🕐</span>
                    <span>
                    <span className="font-semibold">Available:</span> {days} | {start} – {end}
                    {remainingSeats !== null && (
                      <span className="ml-2 font-semibold">· {remainingSeats} seats remaining</span>
                    )}
                  </span>
                  </div>
                )
              })()}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 font-medium">Start Time</label>
                  <input required type="datetime-local" value={form.startTime}
                    min={nowLocal()}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-100" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">End Time</label>
                  <input required type="datetime-local" value={form.endTime}
                    min={form.startTime || nowLocal()}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-green-100" />
                </div>
              </div>
              {slotAvailable === false && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm font-medium">
                  This resource is already booked for the selected time slot.
                </div>
              )}
              <input required placeholder="Purpose of booking" value={form.purpose}
                onChange={e => setForm({ ...form, purpose: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-100" />
              {hasCapacity && (
                <input required placeholder="Expected Attendees" type="number" min="1" value={form.expectedAttendees}
                  onChange={e => setForm({ ...form, expectedAttendees: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-100" />
              )}
              {overCapacity && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                  <p className="text-sm font-semibold">Capacity exceeded</p>
                  <p className="mt-1 text-sm">
                    {selectedResource?.type === 'Lab' && remainingSeats !== null
                      ? `Only ${remainingSeats} seats remaining for this time slot.`
                      : `This resource supports up to ${selectedResource?.capacity} attendees.`}
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting || overCapacity || slotAvailable === false}
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

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Booking Report</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Generated on {new Date().toLocaleString()} · {reportUsers.length} users
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 text-sm font-medium">
                  ⬇ Download CSV
                </button>
                <button
                  onClick={() => setShowReport(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 text-sm font-medium">
                  Close
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-4 px-8 py-4 border-b border-gray-100">
              {[
                { label: 'Total Users', value: reportUsers.length, color: 'text-gray-800' },
                { label: 'Total Bookings', value: reportUsers.reduce((s, u) => s + u.totalBookings, 0), color: 'text-blue-600' },
                { label: 'Approved', value: reportUsers.reduce((s, u) => s + u.approved, 0), color: 'text-green-600' },
                { label: 'Pending', value: reportUsers.reduce((s, u) => s + u.pending, 0), color: 'text-yellow-600' },
              ].map(card => (
                <div key={card.label} className="bg-gray-50 rounded-xl px-4 py-3 text-center">
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1 px-8 py-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Role</th>
                    <th className="pb-3 font-semibold text-center">Total</th>
                    <th className="pb-3 font-semibold text-center">Pending</th>
                    <th className="pb-3 font-semibold text-center">Approved</th>
                    <th className="pb-3 font-semibold text-center">Rejected</th>
                    <th className="pb-3 font-semibold text-center">Cancelled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {u.profilePicture
                            ? <img src={u.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover" />
                            : <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                          }
                          <span className="font-medium text-gray-800">{u.name || '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-500">{u.email}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700'
                          : u.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-center font-semibold text-gray-800">{u.totalBookings}</td>
                      <td className="py-3 text-center">
                        <span className={u.pending > 0 ? 'text-yellow-600 font-medium' : 'text-gray-300'}>{u.pending}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={u.approved > 0 ? 'text-green-600 font-medium' : 'text-gray-300'}>{u.approved}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={u.rejected > 0 ? 'text-red-500 font-medium' : 'text-gray-300'}>{u.rejected}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className={u.cancelled > 0 ? 'text-gray-500 font-medium' : 'text-gray-300'}>{u.cancelled}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportUsers.length === 0 && (
                <p className="text-center text-gray-400 py-12">No users found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-2">{confirmModal.title}</h2>
            <p className="text-sm text-gray-500 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await confirmModal.onConfirm()
                  setConfirmModal(null)
                }}
                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${confirmModal.confirmClass}`}>
                {confirmModal.confirmLabel}
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-150">
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Booking QR Code</h2>
            <p className="text-gray-500 text-sm mb-6">Show this at the check-in</p>

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