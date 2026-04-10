import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const modules = [
    { title: 'Facilities', desc: 'Manage rooms & equipment', path: '/facilities', color: 'bg-blue-50 border-blue-100' },
    { title: 'Bookings', desc: 'View & manage bookings', path: '/bookings', color: 'bg-green-50 border-green-100' },
    { title: 'Tickets', desc: 'Report & track incidents', path: '/tickets', color: 'bg-orange-50 border-orange-100' },
    { title: 'Notifications', desc: 'Stay up to date', path: '/notifications', color: 'bg-purple-50 border-purple-100' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <img src={user?.profilePicture} className="w-8 h-8 rounded-full" />
          <span className="text-gray-700">{user?.name}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{user?.role}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Welcome, {user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map(m => (
            <div
              key={m.title}
              onClick={() => navigate(m.path)}
              className={`${m.color} rounded-xl shadow-sm p-6 border cursor-pointer hover:shadow-md transition`}
            >
              <h3 className="font-semibold text-gray-700">{m.title}</h3>
              <p className="text-gray-500 text-sm mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}