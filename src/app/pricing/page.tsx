import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

const pricingTiers = [
  {
    name: 'Document',
    description: 'For letters, envelopes and documents',
    basePrice: 50,
    perKg: 10,
    highlight: false,
    features: ['Up to 0.5 kg', 'Same-day pickup', 'Tracking included', 'Delivery in 2-4 days'],
  },
  {
    name: 'Standard Parcel',
    description: 'For everyday packages and gifts',
    basePrice: 80,
    perKg: 20,
    highlight: true,
    features: ['Up to 20 kg', 'Same-day pickup', 'Real-time tracking', 'Insurance up to ₹5,000', 'Delivery in 1-3 days'],
  },
  {
    name: 'Fragile / Heavy',
    description: 'For delicate or oversized items',
    basePrice: 150,
    perKg: 25,
    highlight: false,
    features: ['Up to 50 kg', 'Special packaging', 'Priority handling', 'Insurance up to ₹20,000', 'Delivery in 2-5 days'],
  },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="bg-red-700 text-white py-14 text-center">
          <h1 className="text-4xl font-extrabold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-red-100 text-lg">No hidden charges. Pay only what you see.</p>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 ${tier.highlight ? 'bg-red-700 text-white shadow-2xl scale-105' : 'bg-white text-gray-900 shadow-sm border border-gray-100'}`}
              >
                {tier.highlight && (
                  <div className="text-xs font-bold bg-yellow-400 text-gray-900 rounded-full px-3 py-1 inline-block mb-3">
                    MOST POPULAR
                  </div>
                )}
                <h2 className="text-2xl font-extrabold mb-1">{tier.name}</h2>
                <p className={`text-sm mb-5 ${tier.highlight ? 'text-red-200' : 'text-gray-500'}`}>{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">₹{tier.basePrice}</span>
                  <span className={`text-sm ml-1 ${tier.highlight ? 'text-red-200' : 'text-gray-500'}`}>base + ₹{tier.perKg}/kg</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${tier.highlight ? 'text-yellow-300' : 'text-green-500'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/book"
                  className={`block text-center font-bold py-3 rounded-xl transition-colors ${tier.highlight ? 'bg-white text-red-700 hover:bg-red-50' : 'bg-red-700 text-white hover:bg-red-800'}`}
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>

          {/* Price Calculator */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Price Estimator</h2>
            <p className="text-gray-500 mb-6">Get an instant estimate before booking</p>
            <PriceCalculator />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function PriceCalculator() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Package Type</label>
        <select className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" id="calc-type">
          <option value="50-10">Document (₹50 base + ₹10/kg)</option>
          <option value="80-20">Standard Parcel (₹80 base + ₹20/kg)</option>
          <option value="150-25">Fragile/Heavy (₹150 base + ₹25/kg)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
        <input type="number" placeholder="e.g. 2.5" min="0.1" step="0.1" className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500" id="calc-weight" />
      </div>
      <p className="text-sm text-gray-500">* Final price may vary based on pickup and delivery locations. Exact amount shown at checkout.</p>
      <Link href="/book" className="block text-center bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors">
        Get Exact Quote & Book
      </Link>
    </div>
  )
}
