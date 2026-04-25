import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useEffect, useState, useCallback } from 'react'
import campusBg from './assets/campus.png'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Facilities from './pages/Facilities'
import Bookings from './pages/Bookings'
import Tickets from './pages/Tickets'
import Notifications from './pages/Notifications'
import UserManagement from './pages/UserManagement'
import NotificationPreferences from './pages/NotificationPreferences'
import BookingVerification from './pages/BookingVerification'
import Profile from './pages/Profile'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'

const INACTIVE_TIMEOUT = 15 * 60 * 1000
const WARNING_BEFORE = 2 * 60 * 1000

function App() {
  const { user, loading, logout } = useAuth()
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const [countdown, setCountdown] = useState(120)

  const resetTimer = useCallback(() => {
    if (!user) return
    setShowTimeoutWarning(false)
    setCountdown(120)
  }, [user])

  useEffect(() => {
    if (!user) return

    let warningTimer
    let logoutTimer
    let countdownInterval

    const startTimers = () => {
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      clearInterval(countdownInterval)

      warningTimer = setTimeout(() => {
        setShowTimeoutWarning(true)
        setCountdown(120)
        countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }, INACTIVE_TIMEOUT - WARNING_BEFORE)

      logoutTimer = setTimeout(() => {
        logout()
      }, INACTIVE_TIMEOUT)
    }

    const handleActivity = () => {
      resetTimer()
      startTimers()
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(e => window.addEventListener(e, handleActivity))
    startTimers()

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity))
      clearTimeout(warningTimer)
      clearTimeout(logoutTimer)
      clearInterval(countdownInterval)
    }
  }, [user, logout, resetTimer])

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Loading Smart Campus...</p>
      </div>
    </div>
  )

  return (
    <div style={{
      backgroundImage: `url(${campusBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
    }}>
      <div style={{ minHeight: '100vh', backgroundColor: 'rgba(255,255,255,0.75)' }}>

        {/* Session Timeout Warning */}
        {showTimeoutWarning && user && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏰</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Session Expiring Soon</h2>
              <p className="text-gray-500 text-sm mb-4">
                You've been inactive for a while. Your session will expire in:
              </p>
              <div className="text-4xl font-bold text-red-500 mb-6">
                {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowTimeoutWarning(false)
                    resetTimer()
                  }}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 font-medium">
                  Stay Logged In
                </button>
                <button
                  onClick={logout}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 font-medium">
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/facilities" element={user ? <Facilities /> : <Navigate to="/login" />} />
          <Route path="/bookings" element={user ? <Bookings /> : <Navigate to="/login" />} />
          <Route path="/tickets" element={user ? <Tickets /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
          <Route path="/users" element={user?.role === 'ADMIN' ? <UserManagement /> : <Navigate to="/dashboard" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/verify" element={user ? <BookingVerification /> : <Navigate to="/login" />} />
          <Route path="/preferences" element={user ? <NotificationPreferences /> : <Navigate to="/login" />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>

      </div>
    </div>
  )
}

export default App