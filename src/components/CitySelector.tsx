'use client'

import { useState } from 'react'
import { MapPin, ChevronDown, X } from 'lucide-react'

const AVAILABLE_CITIES = [
  { name: 'Wayanad', emoji: '🌿', state: 'Kerala' },
  { name: 'Mysuru', emoji: '🏯', state: 'Karnataka' },
  { name: 'Hyderabad', emoji: '🕌', state: 'Telangana' },
  { name: 'Chennai', emoji: '🏛️', state: 'Tamil Nadu' },
  { name: 'Visakhapatnam', emoji: '🌊', state: 'Andhra Pradesh' },
]

interface CitySelectorProps {
  selected: string
  onSelect: (city: string) => void
  variant?: 'dark' | 'light'
}

export default function CitySelector({ selected, onSelect, variant = 'dark' }: CitySelectorProps) {
  const [open, setOpen] = useState(false)

  const btnClass = variant === 'light'
    ? 'flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl px-4 py-2.5 font-semibold transition-colors border border-gray-200'
    : 'flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl px-4 py-2.5 font-semibold transition-colors'

  return (
    <>
      <button onClick={() => setOpen(true)} className={btnClass}>
        <MapPin className={`h-4 w-4 ${variant === 'light' ? 'text-red-700' : 'text-yellow-300'}`} />
        <span>City: <strong>{selected}</strong></span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center px-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">Choose your city</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Currently available in</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {AVAILABLE_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => { onSelect(city.name); setOpen(false) }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-colors ${selected === city.name ? 'border-red-700 bg-red-50' : 'border-gray-100 hover:border-red-200 hover:bg-gray-50'}`}
                >
                  <span className="text-3xl">{city.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-900">{city.name}</p>
                    <p className="text-xs text-gray-400">{city.state}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 font-medium mb-3">Coming soon</p>
              <div className="flex flex-wrap gap-2">
                {['Patna', 'Kolkata', 'Pune', 'Jaipur', 'Surat'].map((city) => (
                  <span key={city} className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full">{city}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
