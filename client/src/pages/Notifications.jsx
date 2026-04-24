import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import campusBg from '../assets/campus.png'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all')
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const deleteNotification = async (id) => {
  if (!confirm('Delete this notification?')) return
    try {
      await api.delete(`/api/notifications/${id}`)
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const typeIcon = {
    BOOKING: '📅',
    TICKET: '🔧',
    COMMENT: '💬'
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered = notifications.filter(n =>
    filter === 'all' ? true : filter === 'unread' ? !n.read : n.read
  )

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={campusBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
      </div>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            <p className="text-gray-500 text-sm mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead}
              className="text-sm bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 font-medium">
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread', 'read'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
                filter === f
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}>
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading notifications...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map(n => (
              <div key={n.id}
                className={`bg-white rounded-2xl p-5 border transition ${
                  !n.read
                    ? 'border-blue-200 shadow-sm'
                    : 'border-gray-100'
                }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    !n.read ? 'bg-blue-50' : 'bg-gray-50'
                  }`}>
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap">
                        Mark read
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition">
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🔔</p>
                <p className="text-gray-500 font-medium">No notifications here</p>
                <p className="text-gray-400 text-sm mt-1">
                  {filter === 'unread' ? 'You have no unread notifications' : 'Nothing to show'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}