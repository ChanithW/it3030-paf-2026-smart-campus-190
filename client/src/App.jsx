import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
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

function App() {
  const { user, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
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
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}

export default App
