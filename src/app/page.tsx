'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CitySelector from '@/components/CitySelector'
import { MapPin, Clock, Shield, Star, CheckCircle, Truck, ArrowRight } from 'lucide-react'

const VEHICLE_TYPES = [
  {
    id: 'two-wheeler',
    label: '2-Wheeler',
    emoji: '🏍️',
    desc: 'Documents & small parcels',
    weight: 'Up to 20 kg',
    eta: 'Same day',
    priceRange: '₹55 – ₹200',
    isQuote: false,
  },
  {
    id: 'mini-truck',
    label: 'Mini Truck',
    emoji: '🚐',
    desc: 'Medium & heavy packages',
    weight: 'Up to 200 kg',
    eta: 'Same day',
    priceRange: '₹200 – ₹800',
    isQuote: false,
  },
  {
    id: 'packers-movers',
    label: 'Packers & Movers',
    emoji: '🏠',
    desc: 'Home & office relocation',
    weight: 'Any size',
    eta: 'Scheduled',
    priceRange: 'Get a Quote',
    isQuote: true,
  },
]

const CITY_STATE: Record<string, string> = {
  'Wayanad': 'Kerala', 'Mysuru': 'Karnataka', 'Hyderabad': 'Telangana',
  'Chennai': 'Tamil Nadu', 'Visakhapatnam': 'Andhra Pradesh', 'Muzaffarpur': 'Bihar',
}

export default function HomePage() {
  const router = useRouter()
  const [city, setCity] = useState('Muzaffarpur')
  const [vehicle, setVehicle] = useState('two-wheeler')
  const state = CITY_STATE[city] || ''

  const handleBook = () => {
    if (vehicle === 'packers-movers') {
      router.push(`/packers-movers?city=${encodeURIComponent(city)}`)
    } else {
      router.push(`/book?city=${encodeURIComponent(city)}&vehicle=${vehicle}`)
    }
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative text-white overflow-hidden min-h-[580px] flex items-center">

          {/* ── Background image + overlays ── */}
          <div className="absolute inset-0 pointer-events-none select-none">
            {/* Photo */}
            <img
              src="/hero-bg.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Dark overlay — keeps text readable */}
            <div className="absolute inset-0 bg-red-950 opacity-35" />
            {/* Left-to-right fade so left text is clearest */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-950/80 via-red-950/30 to-transparent" />
          </div>

          {/* ── Content ── */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-900 rounded-full px-4 py-1.5 text-sm font-bold mb-6">
                  <span className="h-2 w-2 bg-red-700 rounded-full animate-pulse"></span>
                  Same Day Delivery Within City
                </div>
                <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg">
                  SpeedU matlab{' '}
                  <span className="text-yellow-300">Speed &amp; Secure!</span>
                </h1>
                <p className="text-red-100 text-lg mb-8 leading-relaxed max-w-md">
                  Fast and reliable within-city courier pickup and delivery. Book in 2 minutes, track in real-time.
                </p>
                <div className="flex gap-3">
                  <Link href="/track" className="bg-yellow-400 hover:bg-yellow-300 text-red-900 font-bold px-6 py-3 rounded-xl transition-colors shadow-lg">
                    Track Shipment
                  </Link>
                </div>
              </div>

              {/* Booking Widget */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 text-gray-900">
                {/* City selector */}
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Book a Delivery</h2>
                  <CitySelector selected={city} onSelect={setCity} variant="light" />
                </div>

                {/* Vehicle type */}
                <p className="text-sm font-medium text-gray-500 mb-3">Select service</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {VEHICLE_TYPES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setVehicle(v.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${vehicle === v.id ? 'border-red-700 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <span className="text-2xl block mb-1.5">{v.emoji}</span>
                      <p className="font-bold text-gray-900 text-xs leading-tight">{v.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-tight">{v.desc}</p>
                      <p className={`text-xs font-semibold mt-1 ${v.isQuote ? 'text-blue-600' : 'text-red-600'}`}>{v.priceRange}</p>
                    </button>
                  ))}
                </div>

                {/* Selected vehicle info */}
                {VEHICLE_TYPES.filter(v => v.id === vehicle).map(v => (
                  <div key={v.id} className="bg-gray-50 rounded-xl p-3 mb-4 flex justify-between text-xs text-gray-500">
                    <span>⚖️ {v.weight}</span>
                    <span>⏱️ {v.eta}</span>
                    {vehicle === 'mini-truck'
                      ? <span>📍 All of {state} · up to 300 km</span>
                      : <span>📍 Within {city} · up to 30 km</span>
                    }
                  </div>
                ))}

                <button
                  onClick={handleBook}
                  className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
                >
                  {vehicle === 'packers-movers' ? 'Get a Free Quote →' : 'Get Estimate & Book →'}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  {vehicle === 'packers-movers' ? 'We will call you within 30 minutes' : 'Takes ~2 minutes'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="bg-gray-900 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { num: '6', label: 'Cities' },
                { num: '99.2%', label: 'Delivery Success' },
                { num: 'Same Day', label: 'Delivery' },
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
              <p className="text-gray-500 mt-3 text-lg">Fast within-city delivery for all your needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {[
                { emoji: '🏍️', title: '2-Wheeler Delivery', desc: 'Perfect for documents, small packages and urgent deliveries. Fast and affordable.', from: '₹55', weight: 'Up to 20 kg' },
                { emoji: '🚐', title: 'Mini Truck Delivery', desc: 'For medium to heavy packages, furniture items and bulk goods within city.', from: '₹200', weight: 'Up to 200 kg' },
              ].map((s) => (
                <div key={s.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <span className="text-4xl block mb-4">{s.emoji}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{s.desc}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-red-700 font-bold">Starting {s.from}</span>
                      <span className="text-gray-400 text-xs ml-2">{s.weight}</span>
                    </div>
                    <button onClick={handleBook} className="text-sm text-red-600 font-semibold hover:underline flex items-center gap-1">
                      Book <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Available Cities</h2>
            <p className="text-gray-500 mb-10">Expanding rapidly across India</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {[
                { name: 'Wayanad', emoji: '🌿' },
                { name: 'Mysuru', emoji: '🏯' },
                { name: 'Hyderabad', emoji: '🕌' },
                { name: 'Chennai', emoji: '🏛️' },
                { name: 'Visakhapatnam', emoji: '🌊' },
                { name: 'Muzaffarpur', emoji: '🌆' },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 font-semibold px-5 py-3 rounded-full">
                  <span>{c.emoji}</span> {c.name}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-400">Coming soon — Patna, Kolkata, Pune, Jaipur, Surat and more</p>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
              <p className="text-gray-500 mt-3">Book a delivery in 3 simple steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Select City & Vehicle', desc: 'Choose your city and vehicle type based on package size.' },
                { step: '02', title: 'Enter Addresses', desc: 'Fill pickup and delivery address within the city.' },
                { step: '03', title: 'We Deliver', desc: 'Driver picks up and delivers same day. Track in real-time.' },
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
              <button onClick={handleBook} className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg">
                Book a Delivery Now
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative py-16 bg-red-700 text-white overflow-hidden">
          {/* Decorative trucks & boxes in background */}
          <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-around opacity-10 text-white">
            <span className="text-[160px] leading-none -rotate-12">🚚</span>
            <span className="text-[120px] leading-none">📦</span>
            <span className="text-[140px] leading-none rotate-6">🚐</span>
            <span className="text-[110px] leading-none -rotate-6">📫</span>
            <span className="text-[150px] leading-none rotate-12">🚛</span>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold">Why Choose SpeedU?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { emoji: '📍', title: 'Real-time Tracking', desc: 'Track every step of your delivery live.' },
                { emoji: '⚡', title: 'Same Day Delivery', desc: 'Book before 6pm for same day delivery.' },
                { emoji: '🔒', title: 'Secure & Safe', desc: 'Every package handled with care.' },
                { emoji: '🎧', title: '24/7 Support', desc: 'Our team is always ready to help.' },
              ].map((f) => (
                <div key={f.title} className="bg-red-600 bg-opacity-60 backdrop-blur-sm rounded-xl p-5 text-center border border-white border-opacity-10">
                  <div className="text-4xl mb-3">{f.emoji}</div>
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
                { name: 'Ravi Kumar', city: 'Bangalore', text: 'Booked a delivery for office documents. Picked up within 30 mins and delivered in 2 hours. Excellent!', stars: 5 },
                { name: 'Priya Sharma', city: 'Delhi', text: 'Very easy to book online. Real-time tracking is fantastic. Will definitely use again.', stars: 5 },
                { name: 'Arun Nair', city: 'Hyderabad', text: 'Sent a fragile item across the city. Arrived in perfect condition. Great service!', stars: 5 },
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
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ready to Send?</h2>
            <p className="text-gray-500 text-lg mb-8">Fast, reliable within-city delivery at your fingertips.</p>
            <button onClick={handleBook} className="inline-block bg-red-700 hover:bg-red-800 text-white font-bold px-12 py-4 rounded-xl text-xl transition-colors shadow-xl">
              Book a Delivery Now
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
