import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread')
      setUnreadCount(res.data.length)
    } catch (err) {
      console.error(err)
    }
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Facilities', path: '/facilities' },
    { label: 'Bookings', path: '/bookings' },
    { label: 'Tickets', path: '/tickets' },
    ...(user?.role === 'ADMIN' ? [{ label: 'Users', path: '/users' }, { label: 'Verify', path: '/verify' }] : []),
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">SC</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">Smart Campus</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <img
            src={user?.profilePicture}
            className="w-8 h-8 rounded-full ring-2 ring-gray-200 cursor-pointer hover:ring-blue-400 transition"
            onClick={() => navigate('/profile')}
            title="View Profile"
          />
          <div className="hidden md:block cursor-pointer" onClick={() => navigate('/profile')}>
            <p className="text-sm font-medium text-gray-800 leading-none hover:text-blue-600 transition">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.role}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => navigate('/preferences')}
              className="text-sm text-gray-500 hover:text-gray-700 transition px-2 py-1 rounded-lg hover:bg-gray-50"
              title="Notification Preferences">
              ⚙️
            </button>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}