'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { generateTrackingId, formatCurrency } from '@/lib/utils'
import { Package, MapPin, User, ChevronRight, CreditCard, Banknote } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const CITY_STATE: Record<string, string> = {
  'Bangalore': 'Karnataka',
  'Delhi': 'Delhi',
  'Hyderabad': 'Telangana',
  'Muzaffarpur': 'Bihar',
  'Patna': 'Bihar',
}

const PACKAGE_TYPES = {
  'two-wheeler': [
    { value: 'document', label: 'Document / Envelope', basePrice: 50, perKg: 0, maxKg: 0.5, emoji: '📄' },
    { value: 'small-parcel', label: 'Small Parcel', basePrice: 80, perKg: 15, maxKg: 5, emoji: '📦' },
  ],
  'mini-truck': [
    { value: 'medium-parcel', label: 'Medium Parcel', basePrice: 200, perKg: 10, maxKg: 20, emoji: '🗃️' },
    { value: 'heavy', label: 'Heavy / Oversized', basePrice: 350, perKg: 8, maxKg: 50, emoji: '🏗️' },
  ],
}

const COD_CHARGE = 20

interface FormData {
  senderName: string
  senderPhone: string
  senderAddress: string
  senderPincode: string
  receiverName: string
  receiverPhone: string
  receiverAddress: string
  receiverPincode: string
  packageType: string
  weightKg: string
  description: string
}

function BookForm() {
  const router = useRouter()
  const params = useSearchParams()
  const city = params.get('city') || 'Bangalore'
  const vehicle = (params.get('vehicle') || 'two-wheeler') as 'two-wheeler' | 'mini-truck'
  const state = CITY_STATE[city] || ''

  const vehicleLabel = vehicle === 'two-wheeler' ? '🏍️ 2-Wheeler' : '🚐 Mini Truck'
  const packageTypes = PACKAGE_TYPES[vehicle]

  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [form, setForm] = useState<FormData>({
    senderName: '', senderPhone: '', senderAddress: '', senderPincode: '',
    receiverName: '', receiverPhone: '', receiverAddress: '', receiverPincode: '',
    packageType: packageTypes[0].value, weightKg: '1', description: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        setForm((f) => ({
          ...f,
          senderName: data.user?.user_metadata?.full_name || data.user?.user_metadata?.name || '',
          senderPhone: data.user?.phone || '',
        }))
      }
    })
  }, [])

  const selectedPkg = packageTypes.find((p) => p.value === form.packageType) || packageTypes[0]
  const weight = parseFloat(form.weightKg) || 0
  const baseAmount = Math.round(selectedPkg.basePrice + weight * selectedPkg.perKg)
  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0
  const totalAmount = Math.round((baseAmount + codCharge) * 1.18)

  const update = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  const saveBooking = async () => {
    if (!user) { router.push('/auth/login?next=/book'); return }
    setLoading(true)
    setError('')
    try {
      const trackingId = generateTrackingId()
      const { error: dbError } = await supabase.from('bookings').insert({
        tracking_id: trackingId,
        user_id: user.id,
        sender_name: form.senderName,
        sender_phone: form.senderPhone,
        sender_address: form.senderAddress,
        sender_city: city,
        sender_pincode: form.senderPincode,
        sender_state: state,
        receiver_name: form.receiverName,
        receiver_phone: form.receiverPhone,
        receiver_address: form.receiverAddress,
        receiver_city: city,
        receiver_pincode: form.receiverPincode,
        receiver_state: state,
        package_type: form.packageType,
        weight_kg: weight,
        description: form.description,
        amount: totalAmount * 100,
        cod_charge: paymentMethod === 'cod' ? COD_CHARGE * 100 : 0,
        payment_method: paymentMethod === 'cod' ? 'cod' : 'online',
        payment_status: 'pending',
        status: 'pending',
        vehicle_type: vehicle,
      })
      if (dbError) throw new Error(dbError.message)
      router.push(`/booking-confirmed?id=${trackingId}&method=${paymentMethod}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceed = async () => {
    if (!user) { router.push('/auth/login?next=/book'); return }
    if (paymentMethod === 'cod') {
      await saveBooking()
    } else {
      setError('Online payment coming soon. Please use Cash on Delivery for now.')
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Book a Delivery</h1>
            <p className="text-gray-500 mt-2">Within city pickup and drop</p>
          </div>

          {/* City + Vehicle badge */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-red-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
              <MapPin className="h-4 w-4" /> {city}
            </div>
            <div className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {vehicleLabel}
            </div>
            <button onClick={() => router.back()} className="text-sm text-red-600 underline">Change</button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-red-700 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-12 h-1 rounded ${step > s ? 'bg-red-700' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 text-xs text-gray-500 mb-6">
            <span className={step === 1 ? 'text-red-700 font-semibold' : ''}>Pickup</span>
            <span className={step === 2 ? 'text-red-700 font-semibold' : ''}>Drop</span>
            <span className={step === 3 ? 'text-red-700 font-semibold' : ''}>Package & Pay</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

            {/* Step 1: Pickup (Sender) */}
            {step === 1 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <User className="h-5 w-5 text-red-700" />
                  <h2 className="text-xl font-bold text-gray-900">Pickup Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input type="text" placeholder="Full name" value={form.senderName} onChange={update('senderName')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Phone *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                      <input type="tel" placeholder="10-digit mobile" value={form.senderPhone} onChange={(e) => setForm((f) => ({ ...f, senderPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="flex-1 border-2 border-gray-200 rounded-r-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address *</label>
                    <input type="text" placeholder="Flat no., Street, Area, Landmark" value={form.senderAddress} onChange={update('senderAddress')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" placeholder="6-digit pincode" value={form.senderPincode} onChange={(e) => setForm((f) => ({ ...f, senderPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <div className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 text-sm">{city}, {state}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!form.senderName || !form.senderPhone || !form.senderAddress || !form.senderPincode) {
                      setError('Please fill all pickup details'); return
                    }
                    if (form.senderPhone.length !== 10) { setError('Enter valid 10-digit phone'); return }
                    if (form.senderPincode.length !== 6) { setError('Enter valid 6-digit pincode'); return }
                    setError(''); setStep(2)
                  }}
                  className="mt-6 w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Next: Drop Details <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Step 2: Drop (Receiver) */}
            {step === 2 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-red-700" />
                  <h2 className="text-xl font-bold text-gray-900">Drop Details</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name *</label>
                    <input type="text" placeholder="Receiver full name" value={form.receiverName} onChange={update('receiverName')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Phone *</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                      <input type="tel" placeholder="10-digit mobile" value={form.receiverPhone} onChange={(e) => setForm((f) => ({ ...f, receiverPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="flex-1 border-2 border-gray-200 rounded-r-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Drop Address *</label>
                    <input type="text" placeholder="Flat no., Street, Area, Landmark" value={form.receiverAddress} onChange={update('receiverAddress')} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" placeholder="6-digit pincode" value={form.receiverPincode} onChange={(e) => setForm((f) => ({ ...f, receiverPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <div className="w-full border-2 border-gray-100 bg-gray-50 rounded-lg px-4 py-3 text-gray-500 text-sm">{city}, {state}</div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">Back</button>
                  <button
                    onClick={() => {
                      if (!form.receiverName || !form.receiverPhone || !form.receiverAddress || !form.receiverPincode) {
                        setError('Please fill all drop details'); return
                      }
                      if (form.receiverPhone.length !== 10) { setError('Enter valid 10-digit phone'); return }
                      if (form.receiverPincode.length !== 6) { setError('Enter valid 6-digit pincode'); return }
                      setError(''); setStep(3)
                    }}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Next: Package <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Package & Payment */}
            {step === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Package className="h-5 w-5 text-red-700" />
                  <h2 className="text-xl font-bold text-gray-900">Package &amp; Payment</h2>
                </div>

                <div className="space-y-5">
                  {/* Package type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Package Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {packageTypes.map((pkg) => (
                        <label key={pkg.value} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${form.packageType === pkg.value ? 'border-red-700 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="packageType" value={pkg.value} checked={form.packageType === pkg.value} onChange={update('packageType')} className="mt-0.5 accent-red-700" />
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{pkg.emoji} {pkg.label}</div>
                            <div className="text-xs text-gray-500">up to {pkg.maxKg}kg · from ₹{pkg.basePrice}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Weight — hide for documents */}
                  {selectedPkg.value !== 'document' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                      <input type="number" placeholder={`Max ${selectedPkg.maxKg} kg`} value={form.weightKg} onChange={update('weightKg')} min="0.1" max={selectedPkg.maxKg} step="0.1" className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" />
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Description (optional)</label>
                    <textarea placeholder="e.g. Books, clothes, mobile phone..." value={form.description} onChange={update('description')} rows={2} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition resize-none" />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-red-700 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-red-700" />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                            <Banknote className="h-4 w-4 text-green-600" /> Cash on Delivery
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">+₹{COD_CHARGE} handling fee</div>
                        </div>
                      </label>
                      <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'online' ? 'border-red-700 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="accent-red-700" />
                        <div>
                          <div className="flex items-center gap-1.5 font-semibold text-sm text-gray-900">
                            <CreditCard className="h-4 w-4 text-blue-600" /> Pay Online
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">Coming soon</div>
                        </div>
                      </label>
                    </div>
                    {paymentMethod === 'online' && (
                      <p className="text-xs text-orange-600 mt-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                        Online payment coming soon. Please use Cash on Delivery for now.
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="mt-6 bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>{selectedPkg.emoji} {selectedPkg.label}</span>
                      <span>₹{selectedPkg.basePrice}</span>
                    </div>
                    {selectedPkg.value !== 'document' && (
                      <div className="flex justify-between text-gray-600">
                        <span>Weight ({weight}kg × ₹{selectedPkg.perKg})</span>
                        <span>₹{Math.round(weight * selectedPkg.perKg)}</span>
                      </div>
                    )}
                    {paymentMethod === 'cod' && (
                      <div className="flex justify-between text-gray-600">
                        <span>COD handling fee</span>
                        <span>₹{COD_CHARGE}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-600">
                      <span>GST (18%)</span>
                      <span>₹{Math.round((baseAmount + codCharge) * 0.18)}</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between font-bold text-gray-900 text-base">
                      <span>Total {paymentMethod === 'cod' ? '(Pay on pickup)' : ''}</span>
                      <span className="text-red-700">{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Route */}
                <div className="mt-3 bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>📍 <strong>Pickup:</strong> {form.senderAddress}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>🏁 <strong>Drop:</strong> {form.receiverAddress}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">Both within {city}</div>
                </div>

                {!user && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg px-4 py-3 text-sm">
                    You need to <a href="/auth/login" className="font-semibold underline">sign in</a> to complete the booking.
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors">Back</button>
                  <button
                    onClick={handleProceed}
                    disabled={loading || (selectedPkg.value !== 'document' && (!form.weightKg || parseFloat(form.weightKg) <= 0)) || paymentMethod === 'online'}
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Placing Order...' : paymentMethod === 'cod' ? 'Confirm Order' : 'Pay Online'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center mt-3">
                  {paymentMethod === 'cod' ? 'Pay cash to the delivery person at pickup' : 'Secured payment via Razorpay'}
                </p>
              </div>
            )}
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
