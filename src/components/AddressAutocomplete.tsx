'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface PlaceResult {
  address: string
  lat: number
  lng: number
  pincode: string
}

interface Props {
  placeholder?: string
  value: string
  city: string
  onSelect: (result: PlaceResult) => void
}

declare global {
  interface Window {
    google: typeof google
    initGoogleMaps: () => void
  }
}

let scriptLoaded = false
let scriptLoading = false
const callbacks: (() => void)[] = []

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) { resolve(); return }
    callbacks.push(resolve)
    if (scriptLoading) return
    scriptLoading = true
    window.initGoogleMaps = () => {
      scriptLoaded = true
      callbacks.forEach(cb => cb())
      callbacks.length = 0
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

export default function AddressAutocomplete({ placeholder, value, city, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''

  useEffect(() => {
    loadGoogleMaps(apiKey).then(() => setReady(true))
  }, [apiKey])

  useEffect(() => {
    if (!ready || !inputRef.current) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry', 'address_components'],
      types: ['geocode', 'establishment'],
    })

    // Bias results toward selected city
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: `${city}, India` }, (results, status) => {
      if (status === 'OK' && results?.[0] && autocompleteRef.current) {
        const bounds = results[0].geometry.viewport
        autocompleteRef.current.setBounds(bounds)
        autocompleteRef.current.setOptions({ strictBounds: false })
      }
    })

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace()
      if (!place?.geometry?.location) return

      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const address = place.formatted_address || inputRef.current?.value || ''

      // Extract pincode from address components
      const pincodeComponent = place.address_components?.find(c => c.types.includes('postal_code'))
      const pincode = pincodeComponent?.long_name || ''

      setInputValue(address)
      onSelect({ address, lat, lng, pincode })
    })

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [ready, city])

  useEffect(() => { setInputValue(value) }, [value])

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || 'Search address...'}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
      />
    </div>
  )
}
