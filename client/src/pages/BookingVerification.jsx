import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function BookingVerification() {
  const { user } = useAuth()
  const [bookingId, setBookingId] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyBooking = async () => {
    if (!bookingId.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.get(`/api/bookings/${bookingId.trim()}`)
      setResult(res.data)
    } catch (err) {
      setError('Booking not found. Please check the ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'APPROVED': return { color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', icon: '✅', message: 'This booking is APPROVED. Check-in allowed!' }
      case 'PENDING': return { color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', icon: '⏳', message: 'This booking is pending approval.' }
      case 'CANCELLED': return { color: 'bg-gray-50 border-gray-200', badge: 'bg-gray-100 text-gray-600', icon: '❌', message: 'This booking has been cancelled.' }
      case 'REJECTED': return { color: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700', icon: '🚫', message: 'This booking was rejected.' }
      default: return { color: 'bg-gray-50 border-gray-200', badge: 'bg-gray-100 text-gray-600', icon: '❓', message: 'Unknown status.' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Booking Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Verify a booking by entering the booking ID from the QR code</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Enter Booking ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={bookingId}
              onChange={e => setBookingId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyBooking()}
              placeholder="Paste booking ID here..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm font-mono"
            />
            <button
              onClick={verifyBooking}
              disabled={loading || !bookingId.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium disabled:opacity-50 transition">
              {loading ? 'Checking...' : 'Verify'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            💡 Tip: Scan the QR code with a QR reader to get the booking ID, then paste it here
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <p className="text-red-600 font-medium">🚫 {error}</p>
          </div>
        )}

        {/* Result */}
        {result && (() => {
          const statusInfo = getStatusInfo(result.status)
          return (
            <div className={`${statusInfo.color} border-2 rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{statusInfo.icon}</span>
                <div>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusInfo.badge}`}>
                    {result.status}
                  </span>
                  <p className="text-gray-700 font-medium mt-1">{statusInfo.message}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Resource</span>
                  <span className="text-sm font-semibold text-gray-800">{result.resource?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Location</span>
                  <span className="text-sm font-medium text-gray-700">{result.resource?.location}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Purpose</span>
                  <span className="text-sm font-medium text-gray-700">{result.purpose}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Booked by</span>
                  <span className="text-sm font-medium text-gray-700">{result.user?.name}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">Start Time</span>
                  <span className="text-sm font-medium text-gray-700">{new Date(result.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <span className="text-sm text-gray-500">End Time</span>
                  <span className="text-sm font-medium text-gray-700">{new Date(result.endTime).toLocaleString()}</span>
                </div>
                {result.expectedAttendees && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Expected Attendees</span>
                    <span className="text-sm font-medium text-gray-700">{result.expectedAttendees}</span>
                  </div>
                )}
              </div>

              {result.status === 'APPROVED' && (
                <div className="mt-4 bg-green-600 text-white rounded-xl p-4 text-center">
                  <p className="font-bold text-lg">✅ CHECK-IN APPROVED</p>
                  <p className="text-green-100 text-sm mt-1">This person is authorized to use the facility</p>
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}