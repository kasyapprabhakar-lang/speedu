'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { createClient } from '@/lib/supabase/client'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setFullName(data.full_name || ''); setPhone(data.phone || '') }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
    setMessage(error ? error.message : 'Profile updated successfully!')
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-red-700" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>
            </div>

            {message && (
              <div className={`rounded-lg px-4 py-3 mb-5 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+91</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="flex-1 border-2 border-gray-200 rounded-r-lg px-4 py-3 focus:outline-none focus:border-red-500 transition" placeholder="10-digit number" />
                </div>
              </div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
