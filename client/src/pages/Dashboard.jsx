import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <img src={user?.profilePicture} className="w-8 h-8 rounded-full" />
          <span className="text-gray-700">{user?.name}</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{user?.role}</span>
          <button
            onClick={logout}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Welcome, {user?.name}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-700">Facilities</h3>
            <p className="text-gray-500 text-sm mt-1">Manage rooms & equipment</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-700">Bookings</h3>
            <p className="text-gray-500 text-sm mt-1">View & manage bookings</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-700">Tickets</h3>
            <p className="text-gray-500 text-sm mt-1">Report & track incidents</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            <p className="text-gray-500 text-sm mt-1">Stay up to date</p>
          </div>
        </div>
      </div>
    </div>
  )
}