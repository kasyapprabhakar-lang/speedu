'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, Phone } from 'lucide-react'

function QuoteSubmitted() {
  const params = useSearchParams()
  const name = params.get('name') || 'there'
  const phone = params.get('phone') || ''

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen flex items-center justify-center py-10">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Quote Request Received!</h1>
            <p className="text-gray-500 mb-6">
              Thanks {name.split(' ')[0]}! Our team will call you on{' '}
              <strong className="text-gray-900">+91 {phone}</strong> within 30 minutes with the best price.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-800">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Phone className="h-4 w-4" /> What happens next?
              </div>
              <ol className="text-left space-y-1 mt-2 text-blue-700">
                <li>1. Our team reviews your requirements</li>
                <li>2. We call you with an exact quote</li>
                <li>3. You confirm the date and time</li>
                <li>4. Our packers arrive on move day</li>
              </ol>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/" className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors text-center">
                Back to Home
              </Link>
              <a href="tel:+919718111634" className="w-full border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" /> Call Us Now: +91 97181 11634
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function QuoteSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>}>
      <QuoteSubmitted />
    </Suspense>
  )
}
