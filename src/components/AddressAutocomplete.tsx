'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface PlaceResult {
  address: string
  lat: number
  lng: number
  pincode: string
}

interface Suggestion {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
}

interface Props {
  placeholder?: string
  value: string
  city: string
  onSelect: (result: PlaceResult) => void
}

declare global {
  interface Window {
    google: typeof globalThis.google
    initGoogleMaps: () => void
  }
}

let scriptLoaded = false
let scriptLoading = false
const pendingCallbacks: (() => void)[] = []

function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) { resolve(); return }
    pendingCallbacks.push(resolve)
    if (scriptLoading) return
    scriptLoading = true
    window.initGoogleMaps = () => {
      scriptLoaded = true
      pendingCallbacks.forEach(cb => cb())
      pendingCallbacks.length = 0
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })
}

export default function AddressAutocomplete({ placeholder, value, city, onSelect }: Props) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const cityBoundsRef = useRef<google.maps.LatLngBounds | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ''

  useEffect(() => {
    loadGoogleMaps(apiKey).then(() => {
      serviceRef.current = new window.google.maps.places.AutocompleteService()
      geocoderRef.current = new window.google.maps.Geocoder()
      // Get city bounds for restricting suggestions
      geocoderRef.current.geocode({ address: `${city}, India` }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          cityBoundsRef.current = results[0].geometry.viewport
        }
      })
      setReady(true)
    })
  }, [apiKey, city])

  useEffect(() => { setInputValue(value) }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchSuggestions = useCallback((query: string) => {
    if (!ready || !serviceRef.current || query.length < 3) {
      setSuggestions([]); setOpen(false); return
    }
    setLoading(true)
    serviceRef.current.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'in' },
        types: ['geocode', 'establishment'],
        ...(cityBoundsRef.current ? { bounds: cityBoundsRef.current, strictBounds: true } : {}),
      },
      (predictions, status) => {
        setLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text || '',
          })))
          setOpen(true)
          setActiveIndex(-1)
        } else {
          setSuggestions([]); setOpen(false)
        }
      }
    )
  }, [ready])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300)
  }

  const handleSelect = (suggestion: Suggestion) => {
    setInputValue(suggestion.description)
    setSuggestions([])
    setOpen(false)

    if (!geocoderRef.current) return
    geocoderRef.current.geocode({ placeId: suggestion.placeId }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const r = results[0]
        const lat = r.geometry.location.lat()
        const lng = r.geometry.location.lng()
        const address = r.formatted_address
        const pincodeComp = r.address_components.find(c => c.types.includes('postal_code'))
        const pincode = pincodeComp?.long_name || ''
        onSelect({ address, lat, lng, pincode })
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={placeholder || 'Search address...'}
          value={inputValue}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
          className="w-full border-2 border-gray-200 rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:border-red-500 transition"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={s.placeId}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-red-50 transition-colors ${i === activeIndex ? 'bg-red-50' : ''} ${i !== suggestions.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{s.mainText}</div>
                  <div className="text-xs text-gray-400 truncate mt-0.5">{s.secondaryText}</div>
                </div>
              </button>
            </li>
          ))}
          <li className="px-4 py-2 flex items-center justify-end gap-1">
            <span className="text-xs text-gray-300">Powered by</span>
            <img src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png" alt="Google" className="h-3.5 opacity-50" />
          </li>
        </ul>
      )}
    </div>
  )
}
