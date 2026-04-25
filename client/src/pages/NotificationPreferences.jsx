import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import campusBg from '../assets/campus.png'

export default function NotificationPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState({
    bookingApproved: true,
    bookingRejected: true,
    bookingSubmitted: true,
    ticketStatusChanged: true,
    ticketComments: true,
    ticketAssigned: true,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.notificationPreferences) {
      try {
        setPreferences(JSON.parse(user.notificationPreferences))
      } catch (e) {
        console.error(e)
      }
    }
  }, [user])

  const handleSave = async () => {
    try {
      await api.patch('/api/auth/users/preferences', {
        preferences: JSON.stringify(preferences)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const togglePref = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const preferenceGroups = [
    {
      title: 'Booking Notifications',
      icon: '📅',
      items: [
        { key: 'bookingSubmitted', label: 'Booking submitted', desc: 'When you submit a new booking request' },
        { key: 'bookingApproved', label: 'Booking approved', desc: 'When your booking gets approved' },
        { key: 'bookingRejected', label: 'Booking rejected', desc: 'When your booking gets rejected' },
      ]
    },
    {
      title: 'Ticket Notifications',
      icon: '🔧',
      items: [
        { key: 'ticketStatusChanged', label: 'Ticket status changed', desc: 'When your ticket status is updated' },
        { key: 'ticketComments', label: 'New comments', desc: 'When someone comments on your ticket' },
        { key: 'ticketAssigned', label: 'Ticket assigned', desc: 'When a technician is assigned to your ticket' },
      ]
    }
  ]

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={campusBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
      </div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Notification Preferences</h1>
          <p className="text-gray-500 text-sm mt-1">Choose which notifications you want to receive</p>
        </div>

        <div className="space-y-6">
          {preferenceGroups.map(group => (
            <div key={group.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                <span className="text-xl">{group.icon}</span>
                <h2 className="font-semibold text-gray-700">{group.title}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {group.items.map(item => (
                  <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => togglePref(item.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                        preferences[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        preferences[item.key] ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button onClick={handleSave}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-medium">
            Save Preferences
          </button>
          {saved && (
            <span className="text-green-600 text-sm font-medium">✅ Preferences saved!</span>
          )}
        </div>
      </div>
    </div>
  )
}