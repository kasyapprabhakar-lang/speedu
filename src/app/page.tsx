import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Package, MapPin, Clock, Shield, Star, CheckCircle, Truck, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-600 bg-opacity-50 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                  <span className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  Fast Delivery Across India
                </div>
                <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                  Send Parcels &amp; Couriers{' '}
                  <span className="text-yellow-300">Anywhere in India</span>
                </h1>
                <p className="text-red-100 text-lg mb-8 leading-relaxed">
                  Book courier pickups from your doorstep, track in real-time, and get guaranteed delivery.
                  Trusted by 50,000+ customers across India.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/book" className="bg-white text-red-700 font-bold px-8 py-4 rounded-xl text-center hover:bg-red-50 transition-colors text-lg shadow-lg">
                    Book a Courier →
                  </Link>
                  <Link href="/track" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-center hover:bg-white hover:text-red-700 transition-colors text-lg">
                    Track Shipment
                  </Link>
                </div>
              </div>

              {/* Quick Track Box */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-gray-900">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Track Your Shipment</h2>
                <p className="text-gray-500 text-sm mb-5">Enter your tracking ID to get real-time updates</p>
                <form action="/track" method="get">
                  <input
                    name="id"
                    type="text"
                    placeholder="e.g. SPDABC123XYZ"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 mb-3 font-mono"
                  />
                  <button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-lg transition-colors">
                    Track Now
                  </button>
                </form>
                <div className="mt-5 pt-5 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    Or{' '}
                    <Link href="/book" className="text-red-600 font-semibold hover:underline">
                      book a new courier
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { num: '50,000+', label: 'Happy Customers' },
                { num: '500+', label: 'Cities Covered' },
                { num: '99.2%', label: 'Delivery Success' },
                { num: '24/7', label: 'Support' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold text-red-400">{s.num}</div>
                  <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Our Services</h2>
              <p className="text-gray-500 mt-3 text-lg">Everything you need for hassle-free shipping</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: <Package className="h-8 w-8" />, title: 'Document Courier', desc: 'Fast and secure delivery of documents, contracts, and important papers.', from: '₹50' },
                { icon: <Truck className="h-8 w-8" />, title: 'Parcel Delivery', desc: 'Send packages of any size across India with door-to-door pickup.', from: '₹80' },
                { icon: <Shield className="h-8 w-8" />, title: 'Fragile & Heavy', desc: 'Special handling for fragile items and heavy cargo with extra care.', from: '₹120' },
              ].map((s) => (
                <div key={s.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center text-red-700 mb-4">
                    {s.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 font-bold">Starting {s.from}</span>
                    <Link href="/book" className="text-sm text-red-600 font-semibold hover:underline flex items-center gap-1">
                      Book <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
              <p className="text-gray-500 mt-3">Book a courier in 3 simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Book Online', desc: 'Fill sender & receiver details, package info and pay securely.' },
                { step: '02', title: 'We Pick Up', desc: 'Our delivery partner picks up from your doorstep at scheduled time.' },
                { step: '03', title: 'Delivered', desc: 'Track in real-time and get notified when delivered.' },
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-20 h-20 bg-red-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-3xl font-extrabold">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/book" className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg">
                Book Your First Courier
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-red-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold">Why Choose SpeedU?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <MapPin className="h-6 w-6" />, title: 'Real-time Tracking', desc: 'Track every step of your shipment live.' },
                { icon: <Clock className="h-6 w-6" />, title: 'On-time Delivery', desc: '99.2% on-time delivery record across India.' },
                { icon: <Shield className="h-6 w-6" />, title: 'Secure & Insured', desc: 'Every shipment is handled with care and insured.' },
                { icon: <Star className="h-6 w-6" />, title: '24/7 Support', desc: 'Our team is always ready to help you.' },
              ].map((f) => (
                <div key={f.title} className="bg-red-600 bg-opacity-50 rounded-xl p-5 text-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    {f.icon}
                  </div>
                  <h3 className="font-bold mb-1">{f.title}</h3>
                  <p className="text-red-100 text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">What Customers Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Ravi Kumar', city: 'Mumbai', text: 'Booked a courier for my office documents. Picked up same day and delivered next morning. Excellent service!', stars: 5 },
                { name: 'Priya Sharma', city: 'Bangalore', text: 'Very easy to book online. Real-time tracking is fantastic. Will definitely use again.', stars: 5 },
                { name: 'Arun Nair', city: 'Chennai', text: 'Sent a fragile item and it arrived in perfect condition. The packaging was handled with great care.', stars: 5 },
              ].map((t) => (
                <div key={t.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.city}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to Ship?</h2>
            <p className="text-gray-500 text-lg mb-8">Join 50,000+ customers who trust SpeedU for their deliveries.</p>
            <Link href="/book" className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-12 py-4 rounded-xl text-xl transition-colors shadow-xl">
              Book a Courier Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
