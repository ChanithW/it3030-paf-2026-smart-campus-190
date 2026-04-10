import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

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
        {/* SVG Campus Illustration */}
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
          <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Building 1 - Main */}
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

            {/* Building 2 - Left */}
            <rect x="60" y="150" width="100" height="150" fill="white" rx="4"/>
            <rect x="70" y="160" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="105" y="160" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="70" y="205" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="105" y="205" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="80" y="260" width="40" height="40" fill="#60a5fa" rx="2"/>

            {/* Building 3 - Right */}
            <rect x="360" y="120" width="100" height="180" fill="white" rx="4"/>
            <rect x="370" y="130" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="405" y="130" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="370" y="175" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="405" y="175" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="370" y="220" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="405" y="220" width="25" height="35" fill="#93c5fd" rx="2"/>
            <rect x="380" y="268" width="40" height="32" fill="#60a5fa" rx="2"/>

            {/* Building 4 - Far right */}
            <rect x="490" y="160" width="80" height="140" fill="white" rx="4"/>
            <rect x="498" y="170" width="20" height="28" fill="#93c5fd" rx="2"/>
            <rect x="528" y="170" width="20" height="28" fill="#93c5fd" rx="2"/>
            <rect x="498" y="208" width="20" height="28" fill="#93c5fd" rx="2"/>
            <rect x="528" y="208" width="20" height="28" fill="#93c5fd" rx="2"/>
            <rect x="505" y="268" width="30" height="32" fill="#60a5fa" rx="2"/>

            {/* Ground/Road */}
            <rect x="0" y="300" width="600" height="20" fill="white" opacity="0.3"/>
            <rect x="100" y="303" width="400" height="5" fill="white" opacity="0.5" rx="2"/>

            {/* Trees */}
            <circle cx="170" cy="280" r="20" fill="#4ade80"/>
            <rect x="167" y="295" width="6" height="15" fill="#a16207"/>
            <circle cx="460" cy="270" r="18" fill="#4ade80"/>
            <rect x="457" y="283" width="6" height="15" fill="#a16207"/>
            <circle cx="40" cy="290" r="15" fill="#4ade80"/>
            <rect x="37" y="300" width="6" height="15" fill="#a16207"/>
            <circle cx="570" cy="285" r="16" fill="#4ade80"/>
            <rect x="567" y="296" width="6" height="15" fill="#a16207"/>

            {/* Solar panels on roof */}
            <rect x="210" y="92" width="50" height="8" fill="#fbbf24" rx="1"/>
            <rect x="270" y="92" width="30" height="8" fill="#fbbf24" rx="1"/>
            <rect x="70" y="143" width="40" height="7" fill="#fbbf24" rx="1"/>
            <rect x="370" y="113" width="45" height="7" fill="#fbbf24" rx="1"/>

            {/* Electric car */}
            <rect x="150" y="308" width="55" height="22" fill="#34d399" rx="4"/>
            <rect x="158" y="302" width="38" height="12" fill="#6ee7b7" rx="3"/>
            <circle cx="162" cy="332" r="7" fill="#1e293b"/>
            <circle cx="193" cy="332" r="7" fill="#1e293b"/>
            <circle cx="162" cy="332" r="3" fill="#94a3b8"/>
            <circle cx="193" cy="332" r="3" fill="#94a3b8"/>

            {/* People */}
            <circle cx="350" cy="295" r="8" fill="white" opacity="0.8"/>
            <rect x="346" y="303" width="8" height="15" fill="white" opacity="0.6" rx="2"/>
            <circle cx="430" cy="290" r="8" fill="white" opacity="0.8"/>
            <rect x="426" y="298" width="8" height="15" fill="white" opacity="0.6" rx="2"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
          <div className="max-w-lg">
            <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wider">Smart Campus Portal</p>
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">
              Welcome back,<br />{user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-blue-200 text-lg">
              Here's what's happening on your campus today.
            </p>
            <div className="flex gap-6 mt-6">
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-blue-200 text-sm">Facilities</p>
              </div>
              <div className="w-px bg-blue-500"></div>
              <div>
                <p className="text-2xl font-bold text-white">200+</p>
                <p className="text-blue-200 text-sm">Bookings</p>
              </div>
              <div className="w-px bg-blue-500"></div>
              <div>
                <p className="text-2xl font-bold text-white">99%</p>
                <p className="text-blue-200 text-sm">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Cards */}
      <div className="max-w-6xl mx-auto px-6 py-10">
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

        {/* Role badge */}
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