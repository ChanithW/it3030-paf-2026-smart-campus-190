import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api.get('/api/analytics/summary')
        .then(res => setAnalytics(res.data))
        .catch(err => console.error(err))
    }
  }, [user])

  const modules = [
    { title: 'Facilities & Assets', desc: 'Manage rooms, labs & equipment', path: '/facilities', color: 'bg-blue-50 border-blue-200 hover:border-blue-400', icon: '🏛️', iconBg: 'bg-blue-100' },
    { title: 'Bookings', desc: 'Request & manage resource bookings', path: '/bookings', color: 'bg-green-50 border-green-200 hover:border-green-400', icon: '📅', iconBg: 'bg-green-100' },
    { title: 'Incident Tickets', desc: 'Report & track maintenance issues', path: '/tickets', color: 'bg-orange-50 border-orange-200 hover:border-orange-400', icon: '🔧', iconBg: 'bg-orange-100' },
    { title: 'Notifications', desc: 'View your latest updates', path: '/notifications', color: 'bg-purple-50 border-purple-200 hover:border-purple-400', icon: '🔔', iconBg: 'bg-purple-100' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <rect x="200" y="100" width="120" height="200" fill="white" rx="4"/>
            <rect x="210" y="110" width="30" height="40" fill="#93c5fd" rx="2"/>
            <rect x="250" y="110" width="30" height="40" fill="#93c5fd" rx="2"/>
            <rect x="290" y="110" width="20" height="40" fill="#93c5fd" rx="2"/>
            <rect x="210" y="160" width="30" height="40" fill="#93c5fd" rx="2"/>
            <rect x="250" y="160" width="30" height="40" fill="#93c5fd" rx="2"/>
            <rect x="290" y="160" width="20" height="40" fill="#93c5fd" rx="2"/>
            <rect x="210" y="210" width="30" height="40" fill="#93c5fd" rx="2"/>
            <rect x="250" y="210" width="30" height="40" fill="#93c5fd" rx="2"/>
            <rect x="230" y="260" width="60" height="40" fill="#60a5fa" rx="2"/>
            <rect x="60" y="150" width="100" height="150" fill="white" rx="4"/>
            <rect x="70" y="160" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="105" y="160" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="70" y="205" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="105" y="205" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="80" y="260" width="40" height="40" fill="#60a5fa" rx="2"/>
            <rect x="360" y="120" width="100" height="180" fill="white" rx="4"/>
            <rect x="370" y="130" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="405" y="130" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="370" y="175" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="405" y="175" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="380" y="268" width="40" height="32" fill="#60a5fa" rx="2"/>
            <circle cx="170" cy="280" r="20" fill="#4ade80"/>
            <rect x="167" y="295" width="6" height="15" fill="#a16207"/>
            <circle cx="460" cy="270" r="18" fill="#4ade80"/>
            <rect x="457" y="283" width="6" height="15" fill="#a16207"/>
            <rect x="150" y="308" width="55" height="22" fill="#34d399" rx="4"/>
            <rect x="158" y="302" width="38" height="12" fill="#6ee7b7" rx="3"/>
            <circle cx="162" cy="332" r="7" fill="#1e293b"/>
            <circle cx="193" cy="332" r="7" fill="#1e293b"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-lg">
            <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wider">Smart Campus Portal</p>
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
              Welcome back,<br />{user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-blue-200 text-lg">Here's what's happening on your campus today.</p>
            {analytics && (
              <div className="flex gap-6 mt-6">
                <div>
                  <p className="text-2xl font-bold text-white">{analytics.totalResources}</p>
                  <p className="text-blue-200 text-sm">Facilities</p>
                </div>
                <div className="w-px bg-blue-500"></div>
                <div>
                  <p className="text-2xl font-bold text-white">{analytics.totalBookings}</p>
                  <p className="text-blue-200 text-sm">Bookings</p>
                </div>
                <div className="w-px bg-blue-500"></div>
                <div>
                  <p className="text-2xl font-bold text-white">{analytics.totalTickets}</p>
                  <p className="text-blue-200 text-sm">Tickets</p>
                </div>
                <div className="w-px bg-blue-500"></div>
                <div>
                  <p className="text-2xl font-bold text-white">{analytics.totalUsers}</p>
                  <p className="text-blue-200 text-sm">Users</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Admin Analytics */}
        {user?.role === 'ADMIN' && analytics && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">📊 Analytics Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Booking Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Booking Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Pending', value: analytics.bookingStats?.PENDING || 0, color: 'bg-yellow-400', total: analytics.totalBookings },
                    { label: 'Approved', value: analytics.bookingStats?.APPROVED || 0, color: 'bg-green-400', total: analytics.totalBookings },
                    { label: 'Rejected', value: analytics.bookingStats?.REJECTED || 0, color: 'bg-red-400', total: analytics.totalBookings },
                    { label: 'Cancelled', value: analytics.bookingStats?.CANCELLED || 0, color: 'bg-gray-400', total: analytics.totalBookings },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ticket Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">Ticket Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Open', value: analytics.ticketStats?.OPEN || 0, color: 'bg-blue-400', total: analytics.totalTickets },
                    { label: 'In Progress', value: analytics.ticketStats?.IN_PROGRESS || 0, color: 'bg-yellow-400', total: analytics.totalTickets },
                    { label: 'Resolved', value: analytics.ticketStats?.RESOLVED || 0, color: 'bg-green-400', total: analytics.totalTickets },
                    { label: 'Closed', value: analytics.ticketStats?.CLOSED || 0, color: 'bg-gray-400', total: analytics.totalTickets },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-800">{item.value}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Resources */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">🏆 Top Resources</h3>
                {analytics.topResources?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topResources.map((r, index) => (
                      <div key={r.name} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-400'
                        }`}>{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{r.name}</span>
                            <span className="text-gray-500">{r.count} bookings</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-blue-400 h-1.5 rounded-full"
                              style={{ width: `${(r.count / analytics.topResources[0].count) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No booking data yet</p>
                )}
              </div>

              {/* Peak Booking Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 mb-4">⏰ Peak Booking Hours</h3>
                {analytics.peakHours?.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.peakHours.map(h => (
                      <div key={h.hour}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{h.hour}</span>
                          <span className="text-gray-500">{h.count} bookings</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${(h.count / analytics.peakHours[0].count) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-4">No booking data yet</p>
                )}
              </div>

              {/* Summary Cards */}
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Resources', value: analytics.totalResources, icon: '🏛️', color: 'bg-blue-50 border-blue-100' },
                  { label: 'Total Bookings', value: analytics.totalBookings, icon: '📅', color: 'bg-green-50 border-green-100' },
                  { label: 'Total Tickets', value: analytics.totalTickets, icon: '🔧', color: 'bg-orange-50 border-orange-100' },
                  { label: 'Total Users', value: analytics.totalUsers, icon: '👥', color: 'bg-purple-50 border-purple-100' },
                ].map(card => (
                  <div key={card.label} className={`${card.color} rounded-2xl p-5 border`}>
                    <p className="text-2xl mb-1">{card.icon}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Module Cards */}
        <h2 className="text-lg font-semibold text-gray-600 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {modules.map(m => (
            <div
              key={m.title}
              onClick={() => navigate(m.path)}
              className={`${m.color} rounded-2xl p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className={`${m.iconBg} w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4`}>
                {m.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-base mb-1">{m.title}</h3>
              <p className="text-gray-500 text-sm">{m.desc}</p>
            </div>
          ))}
        </div>

        {user?.role === 'ADMIN' && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg">👑</div>
            <div>
              <p className="font-semibold text-blue-800">Admin Access</p>
              <p className="text-blue-600 text-sm">You have full access to approve bookings, manage resources and assign tickets.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}