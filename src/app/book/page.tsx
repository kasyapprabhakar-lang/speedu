'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { generateTrackingId, formatCurrency } from '@/lib/utils'
import { MapPin, Banknote, CreditCard, Navigation } from 'lucide-react'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const CITY_STATE: Record<string, string> = {
  'Wayanad': 'Kerala',
  'Mysuru': 'Karnataka',
  'Hyderabad': 'Telangana',
  'Chennai': 'Tamil Nadu',
  'Visakhapatnam': 'Andhra Pradesh',
  'Muzaffarpur': 'Bihar',
}

// Porter-style distance-based pricing
const VEHICLE_CONFIG = {
  'two-wheeler': { baseFare: 55, perKm: 12, freeKm: 1, label: '🏍️ 2-Wheeler', maxKg: 20, maxDistanceKm: 15 },
  'mini-truck':  { baseFare: 200, perKm: 20, freeKm: 1, label: '🚐 Mini Truck', maxKg: 200, maxDistanceKm: 300 },
}

const PACKAGE_TYPES = {
  'two-wheeler': ['📄 Document', '📦 Parcel', '🛍️ Shopping / Grocery', '💊 Medicine'],
  'mini-truck':  ['📦 Boxes / Cartons', '🪑 Furniture', '🏗️ Heavy Goods', '🏪 Shop / Office Items'],
}

const COD_CHARGE = 20

// Haversine distance in km, with 1.3x road factor
function calcDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3
}

function calcFare(vehicle: 'two-wheeler' | 'mini-truck', distanceKm: number): number {
  const cfg = VEHICLE_CONFIG[vehicle]
  const extraKm = Math.max(0, distanceKm - cfg.freeKm)
  return Math.round(cfg.baseFare + extraKm * cfg.perKm)
}

function BookForm() {
  const router = useRouter()
  const params = useSearchParams()
  const city = params.get('city') || 'Muzaffarpur'
  const vehicle = (params.get('vehicle') || 'two-wheeler') as 'two-wheeler' | 'mini-truck'
  const state = CITY_STATE[city] || ''
  const cfg = VEHICLE_CONFIG[vehicle]
  const packageTypes = PACKAGE_TYPES[vehicle]

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')

  const [form, setForm] = useState({
    senderName: '', senderPhone: '', senderAddress: '', senderPincode: '',
    senderLat: 0, senderLng: 0,
    receiverName: '', receiverPhone: '', receiverAddress: '', receiverPincode: '',
    receiverLat: 0, receiverLng: 0,
    packageType: packageTypes[0], weightKg: '', description: '',
  })

  const supabase = createClient()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])

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

  const hasDistance = !!(form.senderLat && form.senderLng && form.receiverLat && form.receiverLng)
  const distanceKm = hasDistance
    ? calcDistanceKm(form.senderLat, form.senderLng, form.receiverLat, form.receiverLng)
    : 0

  const baseFare = hasDistance ? calcFare(vehicle, distanceKm) : cfg.baseFare
  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0
  const totalAmount = Math.round((baseFare + codCharge) * 1.18)

  const saveBooking = async (trackingId: string, paymentStatus: string, razorpayOrderId?: string) => {
    return supabase.from('bookings').insert({
      tracking_id: trackingId, user_id: user!.id,
      sender_name: form.senderName, sender_phone: form.senderPhone,
      sender_address: form.senderAddress, sender_city: city,
      sender_pincode: form.senderPincode, sender_state: state,
      sender_lat: form.senderLat || null, sender_lng: form.senderLng || null,
      receiver_name: form.receiverName, receiver_phone: form.receiverPhone,
      receiver_address: form.receiverAddress, receiver_city: city,
      receiver_pincode: form.receiverPincode, receiver_state: state,
      receiver_lat: form.receiverLat || null, receiver_lng: form.receiverLng || null,
      package_type: form.packageType,
      weight_kg: parseFloat(form.weightKg) || null,
      description: form.description,
      amount: totalAmount * 100,
      cod_charge: paymentMethod === 'cod' ? COD_CHARGE * 100 : 0,
      payment_method: paymentMethod, payment_status: paymentStatus,
      status: 'pending', vehicle_type: vehicle,
      razorpay_order_id: razorpayOrderId || null,
      distance_km: hasDistance ? Math.round(distanceKm * 10) / 10 : null,
    })
  }

  const handleSubmit = async () => {
    const { senderName, senderPhone, senderAddress, senderPincode, receiverName, receiverPhone, receiverAddress, receiverPincode } = form
    if (!senderName || !senderPhone || !senderAddress || !senderPincode ||
        !receiverName || !receiverPhone || !receiverAddress || !receiverPincode) {
      setError('Please fill all required fields'); return
    }
    if (senderPhone.length !== 10 || receiverPhone.length !== 10) { setError('Enter valid 10-digit phone numbers'); return }
    if (senderPincode.length !== 6 || receiverPincode.length !== 6) { setError('Enter valid 6-digit pincodes'); return }
    if (!user) { router.push('/auth/login?next=/book'); return }
    if (hasDistance && distanceKm > cfg.maxDistanceKm) {
      setError(`Both addresses must be within ${city}. Distance ${distanceKm.toFixed(1)} km exceeds the ${cfg.maxDistanceKm} km city limit for ${cfg.label}.`)
      return
    }

    setLoading(true); setError('')
    try {
      const trackingId = generateTrackingId()

      if (paymentMethod === 'cod') {
        const { error: dbError } = await saveBooking(trackingId, 'pending')
        if (dbError) throw new Error(dbError.message)
        router.push(`/booking-confirmed?id=${trackingId}&method=cod`)
        return
      }

      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount * 100, trackingId }),
      })
      const { orderId, error: orderError } = await orderRes.json()
      if (orderError) throw new Error(orderError)

      const { error: dbError } = await saveBooking(trackingId, 'pending', orderId)
      if (dbError) throw new Error(dbError.message)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'SpeedU',
        description: `${cfg.label} · ${hasDistance ? distanceKm.toFixed(1) + ' km' : city}`,
        order_id: orderId,
        prefill: { name: form.senderName, contact: `+91${form.senderPhone}` },
        theme: { color: '#b91c1c' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, trackingId }),
          })
          const { success, error: verifyError } = await verifyRes.json()
          if (!success) { setError(verifyError || 'Payment verification failed'); return }
          router.push(`/booking-confirmed?id=${trackingId}&method=online`)
        },
        modal: { ondismiss: () => { setLoading(false) } },
      }
      // @ts-expect-error Razorpay loaded via script tag
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order.')
      setLoading(false)
    }
  }

  const inputCls = "w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
  const labelCls = "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide"

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Book a Delivery</h1>
              <p className="text-gray-500 text-sm mt-0.5">Within city pickup and drop</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-red-700 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                <MapPin className="h-3.5 w-3.5" /> {city}
              </span>
              <span className="bg-gray-800 text-white px-3 py-1.5 rounded-full text-sm font-semibold">{cfg.label}</span>
              <button onClick={() => router.back()} className="text-sm text-red-600 underline px-2">Change</button>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Left: Pickup + Drop + Package */}
            <div className="lg:col-span-2 space-y-5">

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
                      <AddressAutocomplete placeholder="Search pickup address..." value={form.senderAddress} city={city}
                        boundsArea={vehicle === 'mini-truck' ? state : undefined}
                        onSelect={r => setForm(f => ({ ...f, senderAddress: r.address, senderLat: r.lat, senderLng: r.lng, senderPincode: r.pincode || f.senderPincode }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode *</label>
                      <input type="text" placeholder="Auto-filled or enter manually" value={form.senderPincode}
                        onChange={e => setForm(f => ({ ...f, senderPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className={inputCls} />
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
                      <AddressAutocomplete placeholder="Search drop address..." value={form.receiverAddress} city={city}
                        boundsArea={vehicle === 'mini-truck' ? state : undefined}
                        onSelect={r => setForm(f => ({ ...f, receiverAddress: r.address, receiverLat: r.lat, receiverLng: r.lng, receiverPincode: r.pincode || f.receiverPincode }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Pincode *</label>
                      <input type="text" placeholder="Auto-filled or enter manually" value={form.receiverPincode}
                        onChange={e => setForm(f => ({ ...f, receiverPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className={inputCls} />
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
                    <label className={labelCls}>What are you sending?</label>
                    <div className="flex flex-wrap gap-2">
                      {packageTypes.map(pkg => (
                        <button key={pkg} onClick={() => setForm(f => ({ ...f, packageType: pkg }))}
                          className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition-colors ${form.packageType === pkg ? 'border-red-700 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {pkg}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Approx Weight (kg)</label>
                    <input type="number" placeholder={`Max ${cfg.maxKg} kg`} value={form.weightKg}
                      onChange={set('weightKg')} min="0.1" max={cfg.maxKg} step="0.1" className={inputCls} />
                    <p className="text-xs text-gray-400 mt-1">For reference only — price is distance-based</p>
                  </div>
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
                <h2 className="font-bold text-gray-900 mb-4">Price Estimate</h2>

                {/* Distance badge */}
                {hasDistance && distanceKm > cfg.maxDistanceKm ? (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 mb-4 text-sm">
                    <Navigation className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">{distanceKm.toFixed(1)} km</span>
                    <span>— exceeds {cfg.maxDistanceKm} km city limit</span>
                  </div>
                ) : hasDistance ? (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 mb-4 text-sm">
                    <Navigation className="h-4 w-4 shrink-0" />
                    <span className="font-semibold">{distanceKm.toFixed(1)} km</span>
                    <span className="text-green-600">estimated route</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg px-3 py-2 mb-4 text-xs">
                    <Navigation className="h-3.5 w-3.5 shrink-0" />
                    Select both addresses to see exact price
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Base fare (first {cfg.freeKm} km)</span>
                    <span>₹{cfg.baseFare}</span>
                  </div>
                  {hasDistance && distanceKm > cfg.freeKm && (
                    <div className="flex justify-between text-gray-600">
                      <span>{(distanceKm - cfg.freeKm).toFixed(1)} km × ₹{cfg.perKm}</span>
                      <span>₹{Math.round((distanceKm - cfg.freeKm) * cfg.perKm)}</span>
                    </div>
                  )}
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-gray-600">
                      <span>COD handling</span>
                      <span>₹{COD_CHARGE}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST 18%</span>
                    <span>₹{Math.round((baseFare + codCharge) * 0.18)}</span>
                  </div>
                  <hr className="border-gray-200 my-1" />
                  <div className="flex justify-between font-bold text-gray-900 text-base">
                    <span>Total</span>
                    <span className="text-red-700">{hasDistance ? formatCurrency(totalAmount) : `₹${Math.round(cfg.baseFare * 1.18)}+`}</span>
                  </div>
                </div>

                {/* Route preview */}
                <div className="mt-4 bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2"><span className="text-red-500">●</span> {form.senderAddress || 'Pickup address'}</div>
                  <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-3" />
                  <div className="flex items-center gap-2"><span className="text-green-500">●</span> {form.receiverAddress || 'Drop address'}</div>
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
                      <div className="text-xs text-gray-400">UPI, Card, Net Banking</div>
                    </div>
                  </label>
                </div>
              </div>

              {!user && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 text-sm">
                  <a href="/auth/login" className="font-semibold underline">Sign in</a> to confirm booking.
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 text-lg shadow-lg">
                {loading ? 'Placing Order...' : '✓ Confirm Order'}
              </button>
              <p className="text-xs text-gray-400 text-center">
                {paymentMethod === 'cod' ? 'Pay cash to delivery person at pickup' : '100% secure · Powered by Razorpay'}
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
