import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Package, Target, Users, Truck } from 'lucide-react'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-red-700 text-white py-20 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex justify-center mb-4">
              <Package className="h-14 w-14 text-red-200" />
            </div>
            <h1 className="text-4xl font-extrabold mb-4">About SpeedU</h1>
            <p className="text-red-100 text-lg leading-relaxed">
              We are on a mission to make courier and parcel delivery fast, affordable and reliable for every Indian.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Our Story</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              SpeedU was founded with a simple idea — sending a parcel in India should be as easy as ordering food online. We saw that small businesses, individuals and students struggled with complicated booking processes, unreliable pickups and zero visibility into their shipments.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We built SpeedU to fix that. A simple online booking, doorstep pickup, real-time tracking and reliable delivery — all in one place.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">What We Stand For</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Target className="h-7 w-7" />, title: 'Reliability', desc: 'We pick up on time, every time. Your trust is our priority.' },
                { icon: <Users className="h-7 w-7" />, title: 'Customer First', desc: 'Every decision we make starts with what is best for our customers.' },
                { icon: <Truck className="h-7 w-7" />, title: 'Speed', desc: 'Fast pickups, quick deliveries. We respect your time.' },
              ].map((v) => (
                <div key={v.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-700 mx-auto mb-4">{v.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white text-center">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">Ready to Ship?</h2>
          <p className="text-gray-500 mb-6">Book your first courier in under 2 minutes.</p>
          <Link href="/book" className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-10 py-4 rounded-xl transition-colors">
            Book a Courier
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
