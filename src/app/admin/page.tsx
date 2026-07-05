'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Package, Phone, MapPin, CheckCircle, Truck, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const ADMIN_WHITELIST = [
  '9199392317',
  'sunalgautam@gmail.com',
  '+919718111634',
  '9718111634',
  'kasyapprabhakar@gmail.com',
  'sinhavibha340@gmail.com',
]

const STATUS_ORDER = ['pending', 'confirmed', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:          { label: 'Pending',          color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-800 border-blue-200' },
  picked_up:        { label: 'Picked Up',         color: 'bg-purple-100 text-purple-800 border-purple-200' },
  in_transit:       { label: 'In Transit',        color: 'bg-orange-100 text-orange-800 border-orange-200' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-800 border-red-200' },
}

interface Booking {
  id: string
  tracking_id: string
  status: string
  payment_method: string
  payment_status: string
  amount: number
  cod_charge: number
  sender_name: string
  sender_phone: string
  sender_address: string
  sender_city: string
  sender_state: string
  sender_pincode: string
  receiver_name: string
  receiver_phone: string
  receiver_address: string
  receiver_city: string
  receiver_state: string
  receiver_pincode: string
  package_type: string
  weight_kg: number
  description: string
  driver_name: string | null
  driver_phone: string | null
  created_at: string
}

function isAdmin(user: User): boolean {
  const email = user.email || ''
  const phone = user.phone || ''
  const cleanPhone = phone.replace('+91', '').replace(/\s/g, '')
  return ADMIN_WHITELIST.some(w =>
    w === email || w === phone || w === cleanPhone || w === `+91${cleanPhone}`
  )
}

function buildWhatsAppMessage(b: Booking): string {
  const amount = Math.round(b.amount / 100)
  const paymentInfo = b.payment_method === 'cod' ? `COD - ₹${amount} (collect on delivery)` : `Paid Online - ₹${amount}`
  const msg = `🚚 *New SpeedU Order*
📦 ID: ${b.tracking_id}
━━━━━━━━━━━━━━
📍 *Pickup*
${b.sender_name} | +91 ${b.sender_phone}
${b.sender_address}, ${b.sender_city}, ${b.sender_state} - ${b.sender_pincode}

📍 *Delivery*
${b.receiver_name} | +91 ${b.receiver_phone}
${b.receiver_address}, ${b.receiver_city}, ${b.receiver_state} - ${b.receiver_pincode}

📦 *Package*
Type: ${b.package_type} | Weight: ${b.weight_kg} kg
${b.description ? `Details: ${b.description}` : ''}

💰 *Payment*: ${paymentInfo}
━━━━━━━━━━━━━━
Reply with driver name to assign`

  return encodeURIComponent(msg)
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [driverInputs, setDriverInputs] = useState<Record<string, { name: string; phone: string }>>({})
  const [statusFilter, setStatusFilter] = useState('pending')
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  const loadBookings = useCallback(async () => {
    const query = supabase.from('bookings').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') query.eq('status', statusFilter)
    const { data } = await query
    setBookings(data || [])
  }, [statusFilter])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      if (isAdmin(data.user)) {
        setAuthorized(true)
        setLoading(false)
      } else {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (authorized) loadBookings()
  }, [authorized, loadBookings])

  const updateStatus = async (bookingId: string, newStatus: string, driverName?: string, driverPhone?: string) => {
    setUpdating(bookingId)
    const updates: Record<string, string> = { status: newStatus }
    if (driverName) updates.driver_name = driverName
    if (driverPhone) updates.driver_phone = driverPhone
    if (newStatus === 'confirmed') updates.payment_status = 'pending'

    await supabase.from('bookings').update(updates).eq('id', bookingId)

    // Add tracking update
    await supabase.from('tracking_updates').insert({
      booking_id: bookingId,
      status: newStatus,
      description: STATUS_LABELS[newStatus]?.label || newStatus,
    })

    // Notify customer via WhatsApp if confirmed with driver
    if (newStatus === 'confirmed' && driverName && driverPhone) {
      const booking = bookings.find(b => b.id === bookingId)
      if (booking) {
        const msg = `Hi ${booking.sender_name}! Your SpeedU order ${booking.tracking_id} is confirmed. Driver: ${driverName}, Phone: +91 ${driverPhone} will pick up your parcel shortly. Track: https://speedu.in/track?id=${booking.tracking_id}`
        window.open(`https://wa.me/91${booking.sender_phone}?text=${encodeURIComponent(msg)}`, '_blank')
      }
    }

    await loadBookings()
    setUpdating(null)
    setDriverInputs(prev => { const n = { ...prev }; delete n[bookingId]; return n })
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loading...</div>

  if (!authorized) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500">You are not authorized to access the admin panel.</p>
      </div>
    </div>
  )

  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <span className="font-bold text-lg">SpeedU Admin</span>
          {pendingCount > 0 && (
            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </div>
        <span className="text-red-200 text-sm">{user?.email || user?.phone}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'picked_up', label: 'Picked Up' },
            { value: 'in_transit', label: 'In Transit' },
            { value: 'out_for_delivery', label: 'Out for Delivery' },
            { value: 'delivered', label: 'Delivered' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === tab.value ? 'bg-red-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {bookings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No orders found</p>
          </div>
        )}

        <div className="space-y-4">
          {bookings.map((b) => {
            const st = STATUS_LABELS[b.status] || STATUS_LABELS['pending']
            const isExpanded = expandedId === b.id
            const driverInput = driverInputs[b.id] || { name: '', phone: '' }
            const nextStatuses = STATUS_ORDER.slice(STATUS_ORDER.indexOf(b.status) + 1).filter(s => s !== 'cancelled')

            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Card header */}
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <span className="font-mono font-bold text-gray-900">{b.tracking_id}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${st.color}`}>{st.label}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${b.payment_method === 'cod' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                          {b.payment_method === 'cod' ? 'COD' : 'Online'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>{b.sender_name}</strong> ({b.sender_city}) → <strong>{b.receiver_name}</strong> ({b.receiver_city})
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(b.created_at).toLocaleString('en-IN')} · {b.weight_kg}kg · {b.package_type} · ₹{Math.round(b.amount / 100)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Share to Driver Group button */}
                      <a
                        href={`https://chat.whatsapp.com/CHkOBahrWs40AdvdoD05EA`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Copy message to clipboard
                          navigator.clipboard.writeText(decodeURIComponent(buildWhatsAppMessage(b)))
                        }}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Share to Group
                      </a>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-5">
                    {/* Addresses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-2">
                          <MapPin className="h-4 w-4" /> Pickup
                        </div>
                        <p className="font-semibold text-gray-900">{b.sender_name}</p>
                        <p className="text-sm text-gray-600">{b.sender_address}</p>
                        <p className="text-sm text-gray-600">{b.sender_city}, {b.sender_state} - {b.sender_pincode}</p>
                        <a href={`tel:+91${b.sender_phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 mt-2 font-medium">
                          <Phone className="h-3.5 w-3.5" /> +91 {b.sender_phone}
                        </a>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                          <MapPin className="h-4 w-4" /> Delivery
                        </div>
                        <p className="font-semibold text-gray-900">{b.receiver_name}</p>
                        <p className="text-sm text-gray-600">{b.receiver_address}</p>
                        <p className="text-sm text-gray-600">{b.receiver_city}, {b.receiver_state} - {b.receiver_pincode}</p>
                        <a href={`tel:+91${b.receiver_phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 mt-2 font-medium">
                          <Phone className="h-3.5 w-3.5" /> +91 {b.receiver_phone}
                        </a>
                      </div>
                    </div>

                    {/* Driver details — always shown, always editable */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          {b.driver_name ? 'Assigned Driver' : 'Assign Driver'}
                        </h4>
                        {b.driver_name && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{b.driver_name}</p>
                            <a href={`tel:+91${b.driver_phone}`} className="text-xs text-blue-600">+91 {b.driver_phone}</a>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder={b.driver_name || 'Driver name'}
                          value={driverInput.name}
                          onChange={(e) => setDriverInputs(prev => ({ ...prev, [b.id]: { ...driverInput, name: e.target.value } }))}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                        <input
                          type="tel"
                          placeholder={b.driver_phone || 'Driver phone'}
                          value={driverInput.phone}
                          onChange={(e) => setDriverInputs(prev => ({ ...prev, [b.id]: { ...driverInput, phone: e.target.value.replace(/\D/g, '').slice(0, 10) } }))}
                          className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (!driverInput.name && !driverInput.phone) return
                            setUpdating(b.id)
                            await supabase.from('bookings').update({
                              driver_name: driverInput.name || b.driver_name,
                              driver_phone: driverInput.phone || b.driver_phone,
                            }).eq('id', b.id)
                            await loadBookings()
                            setUpdating(null)
                            setDriverInputs(prev => { const n = { ...prev }; delete n[b.id]; return n })
                          }}
                          disabled={(!driverInput.name && !driverInput.phone) || updating === b.id}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          {updating === b.id ? 'Saving...' : b.driver_name ? 'Update Driver' : 'Save Driver'}
                        </button>
                        {b.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(b.id, 'confirmed', driverInput.name || b.driver_name || '', driverInput.phone || b.driver_phone || '')}
                            disabled={(!driverInput.name && !b.driver_name) || updating === b.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            {updating === b.id ? 'Confirming...' : 'Confirm & Notify'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Status update buttons */}
                    {nextStatuses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 text-sm mb-2">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {nextStatuses.map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(b.id, s)}
                              disabled={updating === b.id}
                              className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-red-500 hover:text-red-700 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              → {STATUS_LABELS[s]?.label}
                            </button>
                          ))}
                          <button
                            onClick={() => updateStatus(b.id, 'cancelled')}
                            disabled={updating === b.id}
                            className="px-4 py-2 bg-white border-2 border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Cancel Order
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Track link */}
                    <a
                      href={`/track?id=${b.tracking_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View customer tracking page
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
