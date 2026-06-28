'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

function ConfirmedContent() {
  const params = useSearchParams()
  const trackingId = params.get('id')

  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Booking Confirmed!</h1>
      <p className="text-gray-500 mb-8 text-lg">Your courier has been booked successfully. We will pick it up shortly.</p>

      {trackingId && (
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Your Tracking ID</p>
          <p className="text-3xl font-extrabold font-mono text-red-700 tracking-wider">{trackingId}</p>
          <p className="text-xs text-gray-400 mt-2">Save this ID to track your shipment</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {trackingId && (
          <Link href={`/track?id=${trackingId}`} className="flex items-center justify-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-8 py-3 rounded-xl transition-colors">
            <Package className="h-5 w-5" />
            Track Shipment
          </Link>
        )}
        <Link href="/dashboard" className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          My Orders <ArrowRight className="h-5 w-5" />
        </Link>
      </div>

      <p className="text-sm text-gray-400 mt-8">
        A confirmation has been sent to your registered email / phone.
      </p>
    </div>
  )
}

export default function BookingConfirmedPage() {
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen flex items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-lg w-full">
          <Suspense fallback={<div>Loading...</div>}>
            <ConfirmedContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
