import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchNotifications() }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications')
      setNotifications(res.data)
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
    try {
      await api.delete(`/api/notifications/${id}`)
      fetchNotifications()
    } catch (err) {
      console.error(err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}
            className="text-sm text-purple-600 hover:text-purple-800">
            Mark all as read
          </button>
        )}
      </nav>

      <div className="p-6 max-w-2xl mx-auto">
        {loading ? <p className="text-center text-gray-500">Loading...</p> : (
          <div className="space-y-3">
            {notifications.map(n => (
              <div key={n.id}
                className={`bg-white rounded-xl shadow-sm p-5 border flex justify-between items-start transition ${!n.read ? 'border-purple-200 bg-purple-50' : 'border-gray-100'}`}>
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  {!n.read && (
                    <button onClick={() => markAsRead(n.id)}
                      className="text-xs text-purple-600 hover:text-purple-800">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)}
                    className="text-xs text-red-400 hover:text-red-600">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-lg">No notifications yet</p>
                <p className="text-gray-300 text-sm mt-1">You'll be notified about booking and ticket updates</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}