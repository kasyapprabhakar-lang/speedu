import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-red-700 text-white py-16 text-center">
          <h1 className="text-4xl font-extrabold mb-3">Contact Us</h1>
          <p className="text-red-100 text-lg">We are here to help. Reach out anytime.</p>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact info */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Get in Touch</h2>
              <div className="space-y-5">
                {[
                  { icon: <Phone className="h-5 w-5 text-red-700" />, label: 'Phone', value: '+91 97181 11634', href: 'tel:+919718111634' },
                  { icon: <Mail className="h-5 w-5 text-red-700" />, label: 'Email', value: 'support@speedu.in', href: 'mailto:support@speedu.in' },
                  { icon: <MapPin className="h-5 w-5 text-red-700" />, label: 'Location', value: 'India', href: null },
                  { icon: <Clock className="h-5 w-5 text-red-700" />, label: 'Support Hours', value: 'Mon–Sat, 9am–7pm IST', href: null },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-gray-900 font-semibold hover:text-red-700 transition-colors">{item.value}</a>
                      ) : (
                        <p className="text-gray-900 font-semibold">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/919718111634"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Frequently Asked</h2>
              <div className="space-y-4">
                {[
                  { q: 'How do I book a courier?', a: 'Go to our Book page, fill in sender and receiver details, choose package type and confirm your order.' },
                  { q: 'How do I track my order?', a: 'Use the tracking ID you receive after booking. Enter it on our Track page for real-time updates.' },
                  { q: 'What areas do you serve?', a: 'We currently serve select cities in India. Contact us to check availability in your area.' },
                  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD). Online payment via UPI and cards coming soon.' },
                  { q: 'How long does delivery take?', a: 'Delivery typically takes 1-3 days depending on the distance between pickup and delivery locations.' },
                ].map((faq) => (
                  <div key={faq.q} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 text-sm mb-1">{faq.q}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
