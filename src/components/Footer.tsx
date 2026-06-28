import Link from 'next/link'
import { Package, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <Package className="h-6 w-6 text-red-500" />
              SpeedU
            </div>
            <p className="text-sm leading-relaxed">
              Fast, reliable courier and parcel delivery across India. Trusted by thousands of customers.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/book" className="hover:text-white transition-colors">Book Courier</Link></li>
              <li><Link href="/track" className="hover:text-white transition-colors">Track Shipment</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-red-400" /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-400" /> support@speedu.in</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-red-400 mt-0.5" /> India</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-700 mt-8 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© 2024 SpeedU. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made in India 🇮🇳</p>
        </div>
      </div>
    </footer>
  )
}
