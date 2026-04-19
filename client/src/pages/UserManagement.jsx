import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api/axios'

export default function UserManagement() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('')
  const [stats, setStats] = useState({})

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/dashboard')
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/auth/users')
      setUsers(res.data)
      fetchUserStats(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async (userList) => {
    try {
      const [bookingsRes, ticketsRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/tickets')
      ])
      
      const bookingCounts = {}
      const ticketCounts = {}
      
      bookingsRes.data.forEach(b => {
        const uid = b.user?.id
        if (uid) bookingCounts[uid] = (bookingCounts[uid] || 0) + 1
      })
      
      ticketsRes.data.forEach(t => {
        const uid = t.user?.id
        if (uid) ticketCounts[uid] = (ticketCounts[uid] || 0) + 1
      })
      
      const combined = {}
      userList.forEach(u => {
        combined[u.id] = {
          bookings: bookingCounts[u.id] || 0,
          tickets: ticketCounts[u.id] || 0
        }
      })
      setStats(combined)
    } catch (err) {
      console.error(err)
    }
  }

  const updateRole = async (id, role) => {
    try {
      await api.patch(`/api/auth/users/${id}/role`, { role })
      fetchUsers()
    } catch (err) {
      console.error(err)
    }
  }

  const roleConfig = {
    USER: { color: 'bg-gray-100 text-gray-700', label: 'User' },
    ADMIN: { color: 'bg-blue-100 text-blue-700', label: 'Admin' },
    TECHNICIAN: { color: 'bg-green-100 text-green-700', label: 'Technician' }
  }

  const filtered = users.filter(u => !filterRole || u.role === filterRole)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage user roles and permissions</p>
          </div>
          <div className="flex gap-3">
            {[
              { role: '', label: 'All', count: users.length },
              { role: 'USER', label: 'Users', count: users.filter(u => u.role === 'USER').length },
              { role: 'TECHNICIAN', label: 'Technicians', count: users.filter(u => u.role === 'TECHNICIAN').length },
              { role: 'ADMIN', label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length },
            ].map(f => (
              <button key={f.role} onClick={() => setFilterRole(f.role)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  filterRole === f.role
                    ? 'bg-gray-800 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>
                {f.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filterRole === f.role ? 'bg-white text-gray-800' : 'bg-gray-100 text-gray-600'
                }`}>{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-50 border-blue-100' },
            { label: 'Technicians', value: users.filter(u => u.role === 'TECHNICIAN').length, icon: '🔧', color: 'bg-green-50 border-green-100' },
            { label: 'Administrators', value: users.filter(u => u.role === 'ADMIN').length, icon: '👑', color: 'bg-purple-50 border-purple-100' },
          ].map(card => (
            <div key={card.label} className={`${card.color} rounded-2xl p-5 border flex items-center gap-4`}>
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading users...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Bookings</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tickets</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={u.profilePicture} className="w-9 h-9 rounded-full"
                          onError={e => e.target.src = 'https://ui-avatars.com/api/?name=' + u.name} />
                        <span className="font-medium text-gray-800 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${roleConfig[u.role]?.color}`}>
                        {roleConfig[u.role]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-blue-600">{stats[u.id]?.bookings || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-orange-500">{stats[u.id]?.tickets || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {u.id !== user?.id ? (
                        <div className="flex gap-2">
                          {['USER', 'TECHNICIAN', 'ADMIN'].map(role => (
                            <button
                              key={role}
                              onClick={() => updateRole(u.id, role)}
                              disabled={u.role === role}
                              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition ${
                                u.role === role
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}>
                              {role}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl">Your account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}