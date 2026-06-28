'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Package, Menu, X, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <nav className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Package className="h-7 w-7" />
            <span>SpeedU</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/book" className="hover:text-red-200 transition-colors">Book Now</Link>
            <Link href="/track" className="hover:text-red-200 transition-colors">Track Shipment</Link>
            <Link href="/pricing" className="hover:text-red-200 transition-colors">Pricing</Link>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1 hover:text-red-200 transition-colors"
                >
                  My Account <ChevronDown className="h-4 w-4" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg py-1 z-50">
                    <Link href="/dashboard" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                      My Orders
                    </Link>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-50 text-sm" onClick={() => setDropdownOpen(false)}>
                      Profile
                    </Link>
                    <hr className="my-1" />
                    <button onClick={signOut} className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="bg-white text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-red-800 px-4 py-3 space-y-2 text-sm font-medium">
          <Link href="/book" className="block py-2 hover:text-red-200" onClick={() => setMenuOpen(false)}>Book Now</Link>
          <Link href="/track" className="block py-2 hover:text-red-200" onClick={() => setMenuOpen(false)}>Track Shipment</Link>
          <Link href="/pricing" className="block py-2 hover:text-red-200" onClick={() => setMenuOpen(false)}>Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block py-2 hover:text-red-200" onClick={() => setMenuOpen(false)}>My Orders</Link>
              <button onClick={signOut} className="block py-2 text-red-200 hover:text-white">Sign Out</button>
            </>
          ) : (
            <Link href="/auth/login" className="block py-2 font-semibold text-yellow-300 hover:text-yellow-100" onClick={() => setMenuOpen(false)}>
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
