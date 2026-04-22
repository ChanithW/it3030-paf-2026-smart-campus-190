import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function Profile() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ bookings: 0, tickets: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [bookingsRes, ticketsRes] = await Promise.all([
        api.get('/api/bookings/my'),
        api.get('/api/tickets/my')
      ])
      setStats({
        bookings: bookingsRes.data.length,
        tickets: ticketsRes.data.length
      })
    } catch (err) {
      console.error(err)
    }
  }

  const roleConfig = {
    ADMIN: { color: 'bg-blue-100 text-blue-700', label: 'Administrator' },
    USER: { color: 'bg-gray-100 text-gray-700', label: 'User' },
    TECHNICIAN: { color: 'bg-green-100 text-green-700', label: 'Technician' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 py-8 flex items-center gap-6">
            <img
              src={user?.profilePicture}
              alt={user?.name}
              className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <p className="text-blue-200 mt-1">{user?.email}</p>
              <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${roleConfig[user?.role]?.color}`}>
                {roleConfig[user?.role]?.label}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Full Name</span>
              <span className="text-sm font-medium text-gray-800">{user?.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Email Address</span>
              <span className="text-sm font-medium text-gray-800">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Role</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${roleConfig[user?.role]?.color}`}>
                {roleConfig[user?.role]?.label}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Member Since</span>
              <span className="text-sm font-medium text-gray-800">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-50">
              <span className="text-sm text-gray-500">Last Login</span>
              <span className="text-sm font-medium text-gray-800">
                {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-500">Authentication</span>
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700">Google OAuth 2.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.bookings}</p>
            <p className="text-sm text-gray-500 mt-1">Total Bookings</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-3xl font-bold text-orange-500">{stats.tickets}</p>
            <p className="text-sm text-gray-500 mt-1">Tickets Submitted</p>
          </div>
        </div>
      </div>
    </div>
  )
}