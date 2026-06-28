'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { Package, MapPin, CheckCircle, Clock, Truck } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:           { label: 'Booking Pending',       color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock className="h-4 w-4" /> },
  confirmed:         { label: 'Booking Confirmed',     color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: <CheckCircle className="h-4 w-4" /> },
  picked_up:         { label: 'Picked Up',             color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Package className="h-4 w-4" /> },
  in_transit:        { label: 'In Transit',            color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <Truck className="h-4 w-4" /> },
  out_for_delivery:  { label: 'Out for Delivery',      color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: <Truck className="h-4 w-4" /> },
  delivered:         { label: 'Delivered',             color: 'text-green-600 bg-green-50 border-green-200',    icon: <CheckCircle className="h-4 w-4" /> },
  cancelled:         { label: 'Cancelled',             color: 'text-red-600 bg-red-50 border-red-200',          icon: <Clock className="h-4 w-4" /> },
}

const STATUS_ORDER = ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered']

interface Booking {
  tracking_id: string
  status: string
  sender_name: string
  sender_city: string
  sender_state: string
  receiver_name: string
  receiver_city: string
  receiver_state: string
  package_type: string
  weight_kg: number
  created_at: string
  estimated_delivery: string | null
}

interface TrackingUpdate {
  id: string
  status: string
  location: string | null
  description: string
  created_at: string
}

function TrackContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [trackingId, setTrackingId] = useState(params.get('id') || '')
  const [booking, setBooking] = useState<Booking | null>(null)
  const [updates, setUpdates] = useState<TrackingUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (params.get('id')) {
      handleTrack(params.get('id')!)
    }
  }, [])

  const handleTrack = async (id?: string) => {
    const tid = id || trackingId
    if (!tid.trim()) return
    setLoading(true)
    setError('')
    setBooking(null)
    setUpdates([])

    const { data, error: err } = await supabase
      .from('bookings')
      .select('*')
      .eq('tracking_id', tid.trim().toUpperCase())
      .single()

    if (err || !data) {
      setError('No shipment found with this tracking ID. Please check and try again.')
    } else {
      setBooking(data)
      const { data: trackData } = await supabase
        .from('tracking_updates')
        .select('*')
        .eq('booking_id', data.id)
        .order('created_at', { ascending: false })
      setUpdates(trackData || [])
    }
    setLoading(false)
  }

  const statusCfg = booking ? STATUS_CONFIG[booking.status] || STATUS_CONFIG['pending'] : null
  const currentStep = booking ? STATUS_ORDER.indexOf(booking.status) : -1

  return (
    <div>
      {/* Search bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Enter Tracking ID</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. SPDABC123XYZ"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-lg focus:outline-none focus:border-red-500 transition uppercase"
          />
          <button
            onClick={() => handleTrack()}
            disabled={loading || !trackingId.trim()}
            className="bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-center mb-8">
          {error}
        </div>
      )}

      {booking && statusCfg && (
        <>
          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tracking ID</p>
                <p className="text-xl font-extrabold font-mono text-gray-900">{booking.tracking_id}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${statusCfg.color}`}>
                {statusCfg.icon}
                {statusCfg.label}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                {STATUS_ORDER.slice(0, -1).map((s, i) => (
                  <div key={s} className="flex flex-col items-center flex-1">
                    <div className={`w-4 h-4 rounded-full border-2 mb-1 ${i <= currentStep ? 'bg-red-700 border-red-700' : 'bg-white border-gray-300'}`} />
                    <div className={`h-1 w-full ${i < currentStep ? 'bg-red-700' : 'bg-gray-200'} ${i === 0 ? 'hidden' : ''}`} style={{ marginLeft: '-50%' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Route */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500">From</p>
                <p className="font-semibold text-gray-900">{booking.sender_city}, {booking.sender_state}</p>
                <p className="text-xs text-gray-400">{booking.sender_name}</p>
              </div>
              <div className="text-red-700"><Truck className="h-6 w-6" /></div>
              <div className="flex-1 text-right">
                <p className="text-xs text-gray-500">To</p>
                <p className="font-semibold text-gray-900">{booking.receiver_city}, {booking.receiver_state}</p>
                <p className="text-xs text-gray-400">{booking.receiver_name}</p>
              </div>
            </div>

            {booking.estimated_delivery && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                Expected delivery: <strong className="text-gray-900">{new Date(booking.estimated_delivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </div>
            )}
          </div>

          {/* Package info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Package Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-500">Type</p><p className="font-semibold capitalize">{booking.package_type}</p></div>
              <div><p className="text-gray-500">Weight</p><p className="font-semibold">{booking.weight_kg} kg</p></div>
              <div><p className="text-gray-500">Booked On</p><p className="font-semibold">{new Date(booking.created_at).toLocaleDateString('en-IN')}</p></div>
            </div>
          </div>

          {/* Tracking Timeline */}
          {updates.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-5">Tracking History</h3>
              <div className="space-y-4">
                {updates.map((u, i) => (
                  <div key={u.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-1 ${i === 0 ? 'bg-red-700' : 'bg-gray-300'}`} />
                      {i < updates.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-gray-900 text-sm">{u.description}</p>
                      {u.location && <p className="text-gray-500 text-xs flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{u.location}</p>}
                      <p className="text-gray-400 text-xs mt-1">{new Date(u.created_at).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {updates.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center text-gray-400">
              <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Tracking updates will appear here once pickup is scheduled.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="bg-red-700 text-white py-12 text-center">
          <h1 className="text-4xl font-extrabold mb-2">Track Your Shipment</h1>
          <p className="text-red-100">Real-time updates for your courier</p>
        </div>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <Suspense fallback={<div>Loading...</div>}>
            <TrackContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
