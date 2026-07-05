import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-red-700 text-white py-14 text-center">
          <h1 className="text-4xl font-extrabold mb-2">Terms of Service</h1>
          <p className="text-red-100">Last updated: July 2025</p>
        </section>

        <section className="py-14 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="space-y-8 text-gray-600 leading-relaxed">
              {[
                {
                  title: '1. Acceptance of Terms',
                  content: 'By using SpeedU\'s website or services, you agree to these Terms of Service. If you do not agree, please do not use our services.'
                },
                {
                  title: '2. Our Services',
                  content: 'SpeedU provides courier and parcel booking services. We facilitate pickup and delivery of parcels through our network of delivery partners. We reserve the right to refuse service for any order that violates our policies.'
                },
                {
                  title: '3. Prohibited Items',
                  content: 'You may not send illegal items, hazardous materials, flammable substances, weapons, drugs, perishable food, live animals, or any items prohibited by Indian law. SpeedU reserves the right to refuse or return any such shipments.'
                },
                {
                  title: '4. Pricing and Payment',
                  content: 'Prices are calculated based on package type, weight, and distance. For COD orders, payment is collected at the time of pickup. All prices are inclusive of applicable GST.'
                },
                {
                  title: '5. Liability',
                  content: 'SpeedU\'s liability for lost or damaged shipments is limited to the declared value of the goods, subject to a maximum of ₹5,000 per shipment unless additional insurance is purchased. We are not liable for delays caused by circumstances beyond our control.'
                },
                {
                  title: '6. Cancellation and Refunds',
                  content: 'Orders may be cancelled before pickup at no charge. Once picked up, cancellations are not accepted. Refunds for online payments will be processed within 5-7 business days to the original payment method.'
                },
                {
                  title: '7. User Accounts',
                  content: 'You are responsible for maintaining the security of your account. SpeedU is not liable for any loss resulting from unauthorized use of your account.'
                },
                {
                  title: '8. Changes to Terms',
                  content: 'SpeedU reserves the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.'
                },
                {
                  title: '9. Governing Law',
                  content: 'These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in India.'
                },
                {
                  title: '10. Contact',
                  content: 'For any questions about these terms, contact us at support@speedu.in or +91 97181 11634.'
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
