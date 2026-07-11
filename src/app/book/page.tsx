'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { generateTrackingId, formatCurrency } from '@/lib/utils'
import { MapPin, Banknote, CreditCard } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const CITY_STATE: Record<string, string> = {
  'Wayanad': 'Kerala',
  'Mysuru': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Chennai': 'Tamil Nadu',
  'Visakhapatnam': 'Andhra Pradesh',
}

const PACKAGE_TYPES = {
  'two-wheeler': [
    { value: 'document', label: '📄 Document', basePrice: 50, perKg: 0, maxKg: 0.5 },
    { value: 'small-parcel', label: '📦 Small Parcel', basePrice: 80, perKg: 15, maxKg: 5 },
  ],
  'mini-truck': [
    { value: 'medium-parcel', label: '🗃️ Medium Parcel', basePrice: 200, perKg: 10, maxKg: 20 },
    { value: 'heavy', label: '🏗️ Heavy / Oversized', basePrice: 350, perKg: 8, maxKg: 50 },
  ],
}

const COD_CHARGE = 20

function BookForm() {
  const router = useRouter()
  const params = useSearchParams()
  const city = params.get('city') || 'Bangalore'
  const vehicle = (params.get('vehicle') || 'two-wheeler') as 'two-wheeler' | 'mini-truck'
  const state = CITY_STATE[city] || ''
  const vehicleLabel = vehicle === 'two-wheeler' ? '🏍️ 2-Wheeler' : '🚐 Mini Truck'
  const packageTypes = PACKAGE_TYPES[vehicle]

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')

  const [form, setForm] = useState({
    senderName: '', senderPhone: '', senderAddress: '', senderPincode: '',
    receiverName: '', receiverPhone: '', receiverAddress: '', receiverPincode: '',
    packageType: packageTypes[0].value, weightKg: '1', description: '',
  })

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        setForm(f => ({
          ...f,
          senderName: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || '',
          senderPhone: data.user?.phone || '',
        }))
      }
    })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const selectedPkg = packageTypes.find(p => p.value === form.packageType) || packageTypes[0]
  const weight = parseFloat(form.weightKg) || 0
  const baseAmount = Math.round(selectedPkg.basePrice + (selectedPkg.value === 'document' ? 0 : weight * selectedPkg.perKg))
  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0
  const totalAmount = Math.round((baseAmount + codCharge) * 1.18)

  const handleSubmit = async () => {
    const { senderName, senderPhone, senderAddress, senderPincode, receiverName, receiverPhone, receiverAddress, receiverPincode } = form
    if (!senderName || !senderPhone || !senderAddress || !senderPincode ||
        !receiverName || !receiverPhone || !receiverAddress || !receiverPincode) {
      setError('Please fill all required fields'); return
    }
    if (senderPhone.length !== 10 || receiverPhone.length !== 10) { setError('Enter valid 10-digit phone numbers'); return }
    if (senderPincode.length !== 6 || receiverPincode.length !== 6) { setError('Enter valid 6-digit pincodes'); return }
    if (!user) { router.push('/auth/login?next=/book'); return }
    if (paymentMethod === 'online') { setError('Online payment coming soon. Please use Cash on Delivery.'); return }

    setLoading(true); setError('')
    try {
      const trackingId = generateTrackingId()
      const { error: dbError } = await supabase.from('bookings').insert({
        tracking_id: trackingId, user_id: user.id,
        sender_name: form.senderName, sender_phone: form.senderPhone,
        sender_address: form.senderAddress, sender_city: city,
        sender_pincode: form.senderPincode, sender_state: state,
        receiver_name: form.receiverName, receiver_phone: form.receiverPhone,
        receiver_address: form.receiverAddress, receiver_city: city,
        receiver_pincode: form.receiverPincode, receiver_state: state,
        package_type: form.packageType, weight_kg: weight,
        description: form.description, amount: totalAmount * 100,
        cod_charge: paymentMethod === 'cod' ? COD_CHARGE * 100 : 0,
        payment_method: paymentMethod, payment_status: 'pending',
        status: 'pending', vehicle_type: vehicle,
      })
      if (dbError) throw new Error(dbError.message)
      router.push(`/booking-confirmed?id=${trackingId}&method=${paymentMethod}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order.')
    } finally { setLoading(false) }
  }

  const inputCls = "w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide"

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Book a Delivery</h1>
              <p className="text-gray-500 text-sm mt-0.5">Within city pickup and drop</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 bg-red-700 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                <MapPin className="h-3.5 w-3.5" /> {city}
              </span>
              <span className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-sm font-semibold">{vehicleLabel}</span>
              <button onClick={() => router.back()} className="text-sm text-red-600 underline px-2">Change</button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left: Pickup + Drop + Package */}
            <div className="lg:col-span-2 space-y-5">

              {/* Pickup & Drop side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <h2 className="font-bold text-gray-900">Pickup</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input type="text" placeholder="Your full name" value={form.senderName} onChange={set('senderName')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone *</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2.5 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-xs">+91</span>
                        <input type="tel" placeholder="10-digit mobile" value={form.senderPhone}
                          onChange={e => setForm(f => ({ ...f, senderPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          className="flex-1 border-2 border-gray-200 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Address *</label>
                      <input type="text" placeholder="Flat, Street, Area, Landmark" value={form.senderAddress} onChange={set('senderAddress')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode *</label>
                      <input type="text" placeholder="6-digit pincode" value={form.senderPincode}
                        onChange={e => setForm(f => ({ ...f, senderPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className={inputCls} />
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">{city}, {state}</div>
                  </div>
                </div>

                {/* Drop */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <h2 className="font-bold text-gray-900">Drop</h2>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input type="text" placeholder="Receiver full name" value={form.receiverName} onChange={set('receiverName')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone *</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2.5 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-xs">+91</span>
                        <input type="tel" placeholder="10-digit mobile" value={form.receiverPhone}
                          onChange={e => setForm(f => ({ ...f, receiverPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                          className="flex-1 border-2 border-gray-200 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Address *</label>
                      <input type="text" placeholder="Flat, Street, Area, Landmark" value={form.receiverAddress} onChange={set('receiverAddress')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode *</label>
                      <input type="text" placeholder="6-digit pincode" value={form.receiverPincode}
                        onChange={e => setForm(f => ({ ...f, receiverPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                        className={inputCls} />
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">{city}, {state}</div>
                  </div>
                </div>
              </div>

              {/* Package details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Package Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Package Type *</label>
                    <div className="flex gap-2">
                      {packageTypes.map(pkg => (
                        <button key={pkg.value} onClick={() => setForm(f => ({ ...f, packageType: pkg.value }))}
                          className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-colors ${form.packageType === pkg.value ? 'border-red-700 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {pkg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedPkg.value !== 'document' && (
                    <div>
                      <label className={labelCls}>Weight (kg) *</label>
                      <input type="number" placeholder={`Max ${selectedPkg.maxKg}kg`} value={form.weightKg}
                        onChange={set('weightKg')} min="0.1" max={selectedPkg.maxKg} step="0.1" className={inputCls} />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Description (optional)</label>
                    <input type="text" placeholder="e.g. Books, clothes, mobile phone..." value={form.description} onChange={set('description')} className={inputCls} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary + Payment + Confirm */}
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>{selectedPkg.label}</span>
                    <span>₹{selectedPkg.basePrice}</span>
                  </div>
                  {selectedPkg.value !== 'document' && weight > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>{weight}kg × ₹{selectedPkg.perKg}</span>
                      <span>₹{Math.round(weight * selectedPkg.perKg)}</span>
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-gray-600">
                      <span>COD fee</span>
                      <span>₹{COD_CHARGE}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST 18%</span>
                    <span>₹{Math.round((baseAmount + codCharge) * 0.18)}</span>
                  </div>
                  <hr className="border-gray-200 my-1" />
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span className="text-red-700">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2"><span className="text-red-500">●</span> {form.senderAddress || 'Pickup address'}</div>
                  <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-3" />
                  <div className="flex items-center gap-2"><span className="text-green-500">●</span> {form.receiverAddress || 'Drop address'}</div>
                  <div className="text-gray-400 mt-1">Both within {city}</div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Payment</h2>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-red-700 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-red-700" />
                    <Banknote className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Cash on Delivery</div>
                      <div className="text-xs text-gray-400">+₹{COD_CHARGE} handling</div>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-red-700 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-red-700" />
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Pay Online</div>
                      <div className="text-xs text-gray-400">Coming soon</div>
                    </div>
                  </label>
                </div>
              </div>

              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
                  <a href="/auth/login" className="font-semibold underline">Sign in</a> to confirm booking.
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading || paymentMethod === 'online'}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg">
                {loading ? 'Placing Order...' : '✓ Confirm Order'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                {paymentMethod === 'cod' ? 'Pay cash to delivery person at pickup' : 'Secured via Razorpay'}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <BookForm />
    </Suspense>
  )
}
