import { useNavigate } from 'react-router-dom'
import campusBg from '../assets/campus.png'

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <img src={campusBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white bg-opacity-85"></div>
      </div>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-800 text-sm mb-8 flex items-center gap-2">
          ← Back
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SC</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-500 text-sm">Smart Campus Operations Hub · SLIIT</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
              <p className="text-sm leading-relaxed">When you sign in using Google OAuth 2.0, we collect your name, email address, and profile picture from your Google account. We also collect data related to your bookings, incident tickets, and platform activity.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">2. How We Use Your Information</h2>
              <p className="text-sm leading-relaxed">Your information is used to:</p>
              <ul className="text-sm leading-relaxed mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Authenticate your identity and manage your account</li>
                <li>Process and manage facility bookings</li>
                <li>Track and resolve incident tickets</li>
                <li>Send notifications about your bookings and tickets</li>
                <li>Improve platform performance and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Google OAuth 2.0</h2>
              <p className="text-sm leading-relaxed">We use Google OAuth 2.0 for authentication. We only request access to your basic profile information (name, email, profile picture). We do not access your Google Drive, Gmail, or any other Google services. Your Google password is never shared with or stored by our platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Data Storage</h2>
              <p className="text-sm leading-relaxed">Your data is stored securely in our PostgreSQL database hosted on SLIIT infrastructure. We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or modification.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Data Sharing</h2>
              <p className="text-sm leading-relaxed">We do not sell, trade, or share your personal information with third parties. Your data may be visible to authorized administrators for the purpose of managing campus operations.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Cookies</h2>
              <p className="text-sm leading-relaxed">We use session cookies (JSESSIONID) to maintain your login session. These cookies are essential for the platform to function and are deleted when you log out.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Your Rights</h2>
              <p className="text-sm leading-relaxed">You have the right to access, correct, or request deletion of your personal data. Contact the platform administrator to exercise these rights.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Contact</h2>
              <p className="text-sm leading-relaxed">For privacy-related questions, contact the Smart Campus development team at SLIIT Faculty of Computing.</p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">© 2026 Smart Campus Operations Hub · SLIIT Faculty of Computing</p>
          </div>
        </div>
      </div>
    </div>
  )
}