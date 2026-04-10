import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Campus</h1>
        <p className="text-gray-500 mb-8">Operations Hub</p>
        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}