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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage user roles and permissions</p>
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Current Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
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
                        <span className="text-xs text-gray-400">Your account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}