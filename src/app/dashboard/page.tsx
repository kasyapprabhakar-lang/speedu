import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Package, Plus, ChevronRight } from 'lucide-react'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:           { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700' },
  confirmed:         { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700' },
  picked_up:         { label: 'Picked Up',         color: 'bg-purple-100 text-purple-700' },
  in_transit:        { label: 'In Transit',        color: 'bg-orange-100 text-orange-700' },
  out_for_delivery:  { label: 'Out for Delivery',  color: 'bg-indigo-100 text-indigo-700' },
  delivered:         { label: 'Delivered',         color: 'bg-green-100 text-green-700' },
  cancelled:         { label: 'Cancelled',         color: 'bg-red-100 text-red-700' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/dashboard')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const stats = {
    total: bookings?.length || 0,
    delivered: bookings?.filter((b) => b.status === 'delivered').length || 0,
    active: bookings?.filter((b) => !['delivered', 'cancelled'].includes(b.status)).length || 0,
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="bg-red-700 text-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold">
              Hello, {profile?.full_name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-red-100 mt-1">Manage your shipments and track deliveries</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Orders', value: stats.total, color: 'text-gray-900' },
              { label: 'Active', value: stats.active, color: 'text-blue-600' },
              { label: 'Delivered', value: stats.delivered, color: 'text-green-600' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Book new */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
            <Link href="/book" className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
              <Plus className="h-4 w-4" /> Book New
            </Link>
          </div>

          {/* Orders list */}
          {!bookings || bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-400 mb-6">Book your first courier to get started</p>
              <Link href="/book" className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                <Plus className="h-5 w-5" /> Book a Courier
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const st = STATUS_LABELS[booking.status] || STATUS_LABELS['pending']
                return (
                  <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-red-700" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-mono font-bold text-gray-900 text-sm">{booking.tracking_id}</span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {booking.sender_city} → {booking.receiver_city}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(booking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {booking.weight_kg} kg · {booking.package_type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{Math.round(booking.amount / 100)}</p>
                          <p className={`text-xs ${booking.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {booking.payment_status}
                          </p>
                        </div>
                        <Link href={`/track?id=${booking.tracking_id}`} className="flex items-center gap-1 text-red-600 hover:text-red-800 font-semibold text-sm">
                          Track <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
