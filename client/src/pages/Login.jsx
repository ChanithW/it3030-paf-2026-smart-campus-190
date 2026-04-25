import { useAuth } from '../context/AuthContext'
import campusBg from '../assets/campus.png'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" 
           style={{background: 'linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 50%, #1a5276 100%)'}}>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border-2 border-white"></div>
          <div className="absolute top-40 left-40 w-40 h-40 rounded-full border border-white"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-40 w-48 h-48 rounded-full border border-white"></div>
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <span className="text-blue-700 font-bold text-lg">SC</span>
          </div>
          <div>
            <span className="text-white font-bold text-lg">Smart Campus</span>
            <p className="text-blue-300 text-xs">Operations Hub</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative">
          <div className="inline-block bg-blue-500 bg-opacity-30 text-blue-200 text-xs px-3 py-1 rounded-full mb-6 border border-blue-400 border-opacity-30">
            SLIIT University Platform
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Your Campus,<br />Smarter.
          </h1>
          <p className="text-blue-200 text-base mb-10 leading-relaxed">
            Streamline facility bookings, incident reporting,<br />
            and campus operations in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: '🏛️', title: 'Facilities & Assets', desc: 'Labs, halls, rooms & equipment' },
              { icon: '📅', title: 'Smart Bookings', desc: 'Conflict-free resource scheduling' },
              { icon: '🔧', title: 'Incident Management', desc: 'Report & track maintenance issues' },
              { icon: '🔔', title: 'Notifications', desc: 'Real-time status updates' },
            ].map(f => (
              <div key={f.title} className="flex items-center gap-4 group">
                <div className="w-9 h-9 bg-white bg-opacity-10 rounded-lg flex items-center justify-center text-lg group-hover:bg-opacity-20 transition flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-blue-300 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex -space-x-2">
              {['bg-blue-400', 'bg-green-400', 'bg-purple-400', 'bg-yellow-400'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-blue-800 flex items-center justify-center text-xs text-white font-bold`}>
                  {['A', 'B', 'C', 'D'][i]}
                </div>
              ))}
            </div>
            <p className="text-blue-200 text-xs">Trusted by 500+ students & staff</p>
          </div>
          <p className="text-blue-400 text-xs">© 2026 Smart Campus Operations Hub · SLIIT</p>
        </div>
      </div>

      {/* Right Panel with campus background */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative"
        style={{
          backgroundImage: `url(${campusBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-white bg-opacity-45 backdrop-blur-sm"></div>

        <div className="w-full max-w-sm relative z-10">
          
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SC</span>
            </div>
            <span className="text-gray-800 font-bold text-lg">Smart Campus</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign in to your account</h2>
              <p className="text-gray-500 text-sm">Use your university Google account to continue</p>
            </div>

            {/* Google Button */}
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-150 shadow-sm mb-5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <span className="text-blue-500 text-lg mt-0.5">✨</span>
                <div>
                  <p className="text-blue-800 text-sm font-medium">New users are registered automatically</p>
                  <p className="text-blue-500 text-xs mt-0.5">First-time login creates your account instantly</p>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-center gap-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-xs">Secured by Google OAuth 2.0</p>
            </div>
          </div>

          <p className="text-center text-xs text-black-400 mt-5">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline cursor-pointer hover:text-gray-600">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="underline cursor-pointer hover:text-gray-600">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}