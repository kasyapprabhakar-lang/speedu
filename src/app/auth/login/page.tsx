'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Package, Mail, Phone } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'input' | 'otp'>('input')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleEmailOtp = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
      setMessage('Check your email for the OTP code.')
    }
    setLoading(false)
  }

  const handlePhoneOtp = async () => {
    setLoading(true)
    setError('')
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
      setMessage('OTP sent to your mobile number.')
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setError('')
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.verifyOtp(
      mode === 'email'
        ? { email, token: otp, type: 'email' }
        : { phone: formattedPhone, token: otp, type: 'sms' }
    )
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-red-700 font-bold text-2xl">
            <Package className="h-8 w-8" />
            SpeedU
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-4">Sign In / Sign Up</h1>
          <p className="text-gray-500 mt-1">Your account is created automatically on first login</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {message}
            </div>
          )}

          {step === 'input' && (
            <>
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 px-4 font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-400">or continue with</span>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="flex rounded-lg border border-gray-200 p-1 mb-5">
                <button
                  onClick={() => setMode('email')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'email' ? 'bg-red-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Mail className="h-4 w-4" /> Email OTP
                </button>
                <button
                  onClick={() => setMode('phone')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'phone' ? 'bg-red-700 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Phone className="h-4 w-4" /> Mobile OTP
                </button>
              </div>

              {mode === 'email' ? (
                <>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-red-500 transition"
                  />
                  <button
                    onClick={handleEmailOtp}
                    disabled={loading || !email}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send OTP to Email'}
                  </button>
                </>
              ) : (
                <>
                  <div className="flex mb-4">
                    <span className="inline-flex items-center px-3 border-2 border-r-0 border-gray-200 rounded-l-xl bg-gray-50 text-gray-500 text-sm font-medium">+91</span>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 border-2 border-gray-200 rounded-r-xl px-4 py-3 focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <button
                    onClick={handlePhoneOtp}
                    disabled={loading || phone.length < 10}
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send OTP to Mobile'}
                  </button>
                </>
              )}
            </>
          )}

          {step === 'otp' && (
            <div>
              <p className="text-gray-600 text-sm mb-5">
                Enter the 6-digit OTP sent to <strong>{mode === 'email' ? email : `+91 ${phone}`}</strong>
              </p>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-red-500 transition"
              />
              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mb-3"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={() => { setStep('input'); setOtp(''); setError(''); setMessage('') }}
                className="w-full text-gray-500 hover:text-gray-700 text-sm py-2"
              >
                ← Change {mode === 'email' ? 'email' : 'number'}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
