'use client'

import { useState } from 'react'
import { Phone, Mail, X } from 'lucide-react'

const PHONE = '+91 97181 11634'
const EMAIL = 'support@speedu.in'

export default function FloatingContact() {
  const [expanded, setExpanded] = useState<'phone' | 'email' | null>(null)

  const toggle = (type: 'phone' | 'email') =>
    setExpanded(prev => (prev === type ? null : type))

  return (
    <div className="fixed right-0 bottom-24 z-50 flex flex-col items-end gap-3 pr-0">

      {/* Email button */}
      <div className="flex items-center">
        {/* Expanded panel */}
        <div className={`flex items-center gap-3 bg-gray-800 text-white rounded-l-xl pl-4 pr-3 py-2.5 shadow-xl transition-all duration-300 origin-right ${expanded === 'email' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'}`}
          style={{ width: expanded === 'email' ? '220px' : '0px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-gray-800" />
          </div>
          <a href={`mailto:${EMAIL}`} className="text-sm font-medium hover:text-yellow-300 transition-colors truncate">
            {EMAIL}
          </a>
        </div>

        {/* Icon button */}
        <button
          onClick={() => toggle('email')}
          aria-label="Email support"
          className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center shadow-lg transition-all duration-200 shrink-0 -ml-px
            ${expanded === 'email'
              ? 'bg-red-700 border-red-500 text-white'
              : 'bg-red-700 border-red-400 text-white hover:bg-red-800'}`}
        >
          {expanded === 'email' ? <X className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
        </button>
      </div>

      {/* Phone button */}
      <div className="flex items-center">
        {/* Expanded panel */}
        <div className={`flex items-center gap-3 bg-gray-800 text-white rounded-l-xl pl-4 pr-3 py-2.5 shadow-xl transition-all duration-300 origin-right ${expanded === 'phone' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'}`}
          style={{ width: expanded === 'phone' ? '220px' : '0px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4 text-gray-800" />
          </div>
          <a href={`tel:+919718111634`} className="text-sm font-medium hover:text-yellow-300 transition-colors">
            {PHONE}
          </a>
        </div>

        {/* Icon button */}
        <button
          onClick={() => toggle('phone')}
          aria-label="Call support"
          className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center shadow-lg transition-all duration-200 shrink-0 -ml-px
            ${expanded === 'phone'
              ? 'bg-red-700 border-red-500 text-white'
              : 'bg-red-700 border-red-400 text-white hover:bg-red-800'}`}
        >
          {expanded === 'phone' ? <X className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
        </button>
      </div>

    </div>
  )
}
