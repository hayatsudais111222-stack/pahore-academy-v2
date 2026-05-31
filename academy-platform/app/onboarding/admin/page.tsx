'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { validateAccessCode } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminOnboardingPage() {
  const router = useRouter()
  const { userId } = useAuthStore()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  const verifyCode = async () => {
    if (!userId) return
    setLoading(true)
    const { valid } = await validateAccessCode(code, 'admin')
    if (!valid) { toast.error('Invalid admin code'); setLoading(false); return }
    toast.success('Admin access granted!')
    router.push('/dashboard/admin')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#141d2e', border: '2px solid #C9A84C' }}>
            <span className="font-heading text-lg font-bold text-gold">PA</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Admin Verification</h1>
          <p className="text-text-muted text-sm mt-2">Admin access requires a special code</p>
        </div>

        <div className="card">
          <div className="text-center py-4">
            <div className="text-5xl mb-4">🔐</div>
            <div className="inline-block badge-admin mb-4">Admin</div>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Enter Admin Code</h2>
            <p className="text-text-secondary text-sm">This code is set and managed by the system administrator.</p>
          </div>

          <div className="mt-6 space-y-4">
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="ADM-ROOT-XXX" className="input-field text-center font-mono text-lg tracking-widest" />
            <button onClick={verifyCode} disabled={loading || !code}
              className="btn-primary w-full py-3 rounded-xl disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify Admin Access →'}
            </button>
          </div>

          <p className="text-center text-text-muted text-xs mt-4">
            Default admin code: <code className="font-mono" style={{ color: '#C9A84C' }}>ADM-ROOT-001</code>
          </p>
        </div>
      </div>
    </div>
  )
}
