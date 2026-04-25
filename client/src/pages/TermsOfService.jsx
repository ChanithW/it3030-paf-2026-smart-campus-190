import { useNavigate } from 'react-router-dom'
import campusBg from '../assets/campus.png'

export default function TermsOfService() {
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
              <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-gray-500 text-sm">Smart Campus Operations Hub · SLIIT</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm leading-relaxed">By accessing and using the Smart Campus Operations Hub, you accept and agree to be bound by these Terms of Service. This platform is intended for use by SLIIT students, staff, and authorized personnel only.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Use of the Platform</h2>
              <p className="text-sm leading-relaxed">You agree to use this platform solely for legitimate campus operations including facility bookings, incident reporting, and resource management. Any misuse, unauthorized access, or abuse of the system will result in account suspension.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">3. User Accounts</h2>
              <p className="text-sm leading-relaxed">Access is granted through Google OAuth 2.0 authentication. You are responsible for maintaining the security of your Google account. The platform automatically creates an account upon your first login using your university Google account.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Booking Policy</h2>
              <p className="text-sm leading-relaxed">All bookings are subject to approval by administrators. Approved bookings must be used for the stated purpose. Cancellations should be made at least 24 hours in advance. Repeated no-shows may result in booking privileges being suspended.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Incident Reporting</h2>
              <p className="text-sm leading-relaxed">Users are encouraged to report genuine incidents and maintenance issues. False or malicious reports are strictly prohibited and may result in disciplinary action.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Intellectual Property</h2>
              <p className="text-sm leading-relaxed">All content, designs, and functionality of this platform are the intellectual property of the Smart Campus development team at SLIIT. Unauthorized reproduction or distribution is prohibited.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Limitation of Liability</h2>
              <p className="text-sm leading-relaxed">The platform is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use or inability to use this platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Changes to Terms</h2>
              <p className="text-sm leading-relaxed">We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
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