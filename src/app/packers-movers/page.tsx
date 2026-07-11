'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Home, Package, Phone, User, Calendar } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const CITY_STATE: Record<string, string> = {
  'Wayanad': 'Kerala',
  'Mysuru': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Chennai': 'Tamil Nadu',
  'Visakhapatnam': 'Andhra Pradesh',
  'Muzaffarpur': 'Bihar',
}

const HOME_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK+', 'Studio', 'Office / Shop']

const COMMON_ITEMS = [
  '🛋️ Sofa', '🛏️ Bed', '🚪 Wardrobe', '📺 TV', '❄️ Refrigerator',
  '🧺 Washing Machine', '❄️ AC', '🪑 Dining Table', '🖥️ Computer / Desk',
  '📦 Boxes / Cartons', '🚗 Bike / Scooter', '🪞 Mirror / Glass items',
]

const TIME_PREFS = ['Early morning (6am–9am)', 'Morning (9am–12pm)', 'Afternoon (12pm–3pm)', 'Evening (3pm–6pm)', 'Flexible']

function PMForm() {
  const router = useRouter()
  const params = useSearchParams()
  const city = params.get('city') || 'Bangalore'
  const state = CITY_STATE[city] || ''

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    phone: '',
    fromAddress: '',
    fromPincode: '',
    fromFloor: '',
    fromLift: false,
    toAddress: '',
    toPincode: '',
    toFloor: '',
    toLift: false,
    moveDate: '',
    timePref: 'Flexible',
    homeType: '2 BHK',
    items: [] as string[],
    notes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        setForm((f) => ({
          ...f,
          name: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || '',
          phone: data.user?.phone || '',
        }))
      }
    })
  }, [])

  const toggleItem = (item: string) => {
    setForm((f) => ({
      ...f,
      items: f.items.includes(item) ? f.items.filter((i) => i !== item) : [...f.items, item],
    }))
  }

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!user) { router.push('/auth/login?next=/packers-movers'); return }
    if (!form.name || !form.phone || !form.fromAddress || !form.fromPincode || !form.toAddress || !form.toPincode || !form.moveDate) {
      setError('Please fill all required fields'); return
    }
    if (form.phone.length !== 10) { setError('Enter valid 10-digit phone'); return }
    setLoading(true)
    setError('')
    try {
      const { error: dbError } = await supabase.from('pm_quotes').insert({
        user_id: user.id,
        city,
        name: form.name,
        phone: form.phone,
        from_address: form.fromAddress,
        from_pincode: form.fromPincode,
        from_floor: form.fromFloor,
        from_lift: form.fromLift,
        to_address: form.toAddress,
        to_pincode: form.toPincode,
        to_floor: form.toFloor,
        to_lift: form.toLift,
        move_date: form.moveDate,
        time_preference: form.timePref,
        home_type: form.homeType,
        items: form.items,
        notes: form.notes,
        status: 'new',
      })
      if (dbError) throw new Error(dbError.message)
      router.push(`/packers-movers/quote-submitted?name=${encodeURIComponent(form.name)}&phone=${form.phone}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🏠</div>
            <h1 className="text-3xl font-extrabold text-gray-900">Packers &amp; Movers</h1>
            <p className="text-gray-500 mt-2">Fill in your details and we'll call you with a quote within 30 minutes</p>
          </div>


          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>
          )}

          <div className="space-y-5">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-red-700" />
                <h2 className="text-lg font-bold text-gray-900">Your Contact</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" placeholder="Your name" value={form.name} onChange={update('name')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                    <input type="tel" placeholder="10-digit mobile" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="flex-1 border-2 border-gray-200 rounded-r-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                </div>
              </div>
            </div>

            {/* Move From */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-red-700" />
                <h2 className="text-lg font-bold text-gray-900">Moving From</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address *</label>
                  <input type="text" placeholder="Flat, Street, Area, Landmark" value={form.fromAddress} onChange={update('fromAddress')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input type="text" placeholder="6-digit pincode" value={form.fromPincode} onChange={(e) => setForm((f) => ({ ...f, fromPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                  <input type="text" placeholder="e.g. Ground, 2nd, 5th" value={form.fromFloor} onChange={update('fromFloor')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.fromLift} onChange={(e) => setForm((f) => ({ ...f, fromLift: e.target.checked }))} className="w-4 h-4 accent-red-700" />
                    <span className="text-sm text-gray-700">Lift / Elevator available at pickup</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Move To */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-bold text-gray-900">Moving To</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Drop Address *</label>
                  <input type="text" placeholder="Flat, Street, Area, Landmark" value={form.toAddress} onChange={update('toAddress')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                  <input type="text" placeholder="6-digit pincode" value={form.toPincode} onChange={(e) => setForm((f) => ({ ...f, toPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
                  <input type="text" placeholder="e.g. Ground, 2nd, 5th" value={form.toFloor} onChange={update('toFloor')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.toLift} onChange={(e) => setForm((f) => ({ ...f, toLift: e.target.checked }))} className="w-4 h-4 accent-red-700" />
                    <span className="text-sm text-gray-700">Lift / Elevator available at drop</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Move Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-red-700" />
                <h2 className="text-lg font-bold text-gray-900">Move Details</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Move Date *</label>
                  <input type="date" value={form.moveDate} onChange={update('moveDate')} min={new Date().toISOString().split('T')[0]} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select value={form.timePref} onChange={update('timePref')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition">
                    {TIME_PREFS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home / Office Type *</label>
                  <div className="flex flex-wrap gap-2">
                    {HOME_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, homeType: type }))}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-colors ${form.homeType === type ? 'border-red-700 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-5 w-5 text-red-700" />
                <h2 className="text-lg font-bold text-gray-900">Items to Move</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">Select all that apply (helps us give you an accurate quote)</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ITEMS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={`px-3 py-2 rounded-full text-sm border-2 transition-colors ${form.items.includes(item) ? 'border-red-700 bg-red-50 text-red-700 font-medium' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (optional)</label>
              <textarea placeholder="Any special requirements, fragile items, parking issues, etc." value={form.notes} onChange={update('notes')} rows={3} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition resize-none" />
            </div>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm">
                You need to <a href="/auth/login" className="font-semibold underline">sign in</a> to submit a quote request.
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg"
            >
              {loading ? 'Submitting...' : 'Get Free Quote — We\'ll Call You'}
            </button>
            <p className="text-xs text-gray-400 text-center pb-4">Our team will call you within 30 minutes with the best price</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function PackersMoversPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <PMForm />
    </Suspense>
  )
}
