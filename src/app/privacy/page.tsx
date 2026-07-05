import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-red-700 text-white py-14 text-center">
          <h1 className="text-4xl font-extrabold mb-2">Privacy Policy</h1>
          <p className="text-red-100">Last updated: July 2025</p>
        </section>

        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4 prose prose-gray">
            <div className="space-y-8 text-gray-600 leading-relaxed">
              {[
                {
                  title: '1. Information We Collect',
                  content: 'We collect information you provide when you create an account or book a courier — including your name, email address, phone number, and delivery addresses. We also collect payment information processed securely through our payment partners.'
                },
                {
                  title: '2. How We Use Your Information',
                  content: 'We use your information to process and deliver your orders, send tracking updates, respond to your queries, and improve our services. We do not sell your personal information to third parties.'
                },
                {
                  title: '3. Sharing of Information',
                  content: 'We share your information with delivery partners only to the extent necessary to fulfill your order (name, address, phone number). We may share data with payment processors to complete transactions securely.'
                },
                {
                  title: '4. Data Security',
                  content: 'We take reasonable measures to protect your personal information from unauthorized access, loss, or misuse. All data is stored securely and encrypted in transit.'
                },
                {
                  title: '5. Cookies',
                  content: 'We use cookies to keep you logged in and to understand how our website is used. You can disable cookies in your browser settings, but some features may not work correctly.'
                },
                {
                  title: '6. Your Rights',
                  content: 'You have the right to access, update, or delete your personal information. To make a request, contact us at support@speedu.in.'
                },
                {
                  title: '7. Contact Us',
                  content: 'If you have questions about this Privacy Policy, please contact us at support@speedu.in or call us at +91 97181 11634.'
                },
              ].map((section) => (
                <div key={section.title}>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
