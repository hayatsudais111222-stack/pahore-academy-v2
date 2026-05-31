'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { validateAccessCode, upsertProfile, supabase } from '@/lib/supabase'
import { SUBJECTS, CLASSES } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function TeacherOnboardingPage() {
  const router = useRouter()
  const { userId } = useAuthStore()
  const [step, setStep] = useState(1) // 1=code, 2=profile
  const [code, setCode] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [form, setForm] = useState({ subjects: [] as string[], classes: [] as string[] })
  const [saving, setSaving] = useState(false)

  const verifyCode = async () => {
    setCodeLoading(true)
    const { valid } = await validateAccessCode(code, 'teacher')
    if (!valid) { toast.error('Invalid teacher access code'); setCodeLoading(false); return }
    toast.success('Code verified!')
    setStep(2)
    setCodeLoading(false)
  }

  const toggleItem = (arr: string[], item: string, field: 'subjects' | 'classes') => {
    setForm(p => ({ ...p, [field]: arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item] }))
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    await upsertProfile({ id: userId })
    await supabase.from('teachers').upsert({
      id: userId,
      subjects: form.subjects,
      classes: form.classes,
      employee_id: `TCH-${Date.now()}`,
    })
    toast.success('Teacher profile created!')
    router.push('/dashboard/teacher')
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#141d2e', border: '2px solid #C9A84C' }}>
            <span className="font-heading text-lg font-bold text-gold">PA</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Teacher Setup</h1>
          <div className="mt-3 h-1 rounded-full mx-auto max-w-xs" style={{ background: '#1e2d47' }}>
            <div className="h-1 rounded-full transition-all" style={{ background: '#C9A84C', width: `${step * 50}%` }} />
          </div>
        </div>

        <div className="card">
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="text-4xl mb-4">🔐</div>
                <h2 className="font-heading text-xl font-bold text-text-primary mb-2">Teacher Access Code</h2>
                <p className="text-text-secondary text-sm">Enter the code provided by your administrator.</p>
              </div>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="TCH-XXXX-XXXX" className="input-field text-center font-mono text-lg tracking-widest" />
              <button onClick={verifyCode} disabled={codeLoading || !code}
                className="btn-primary w-full py-3 rounded-xl disabled:opacity-50">
                {codeLoading ? 'Verifying...' : 'Verify Code →'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-primary mb-4">Your Teaching Profile</h2>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Subjects You Teach</label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s} type="button" onClick={() => toggleItem(form.subjects, s, 'subjects')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.subjects.includes(s) ? '#7A4A0A' : '#1e2d47',
                        color: form.subjects.includes(s) ? '#FCD9A0' : '#9EA8B8',
                        border: '1px solid ' + (form.subjects.includes(s) ? '#B87A1A' : '#2a3d5c'),
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Classes You Teach</label>
                <div className="flex flex-wrap gap-2">
                  {CLASSES.slice(0, 10).map(c => (
                    <button key={c} type="button" onClick={() => toggleItem(form.classes, c, 'classes')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.classes.includes(c) ? '#7A4A0A' : '#1e2d47',
                        color: form.classes.includes(c) ? '#FCD9A0' : '#9EA8B8',
                        border: '1px solid ' + (form.classes.includes(c) ? '#B87A1A' : '#2a3d5c'),
                      }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 rounded-xl">← Back</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 rounded-xl disabled:opacity-50">
                  {saving ? 'Saving...' : 'Complete →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
