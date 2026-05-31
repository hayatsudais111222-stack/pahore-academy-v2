'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { upsertProfile, supabase } from '@/lib/supabase'
import { CLASSES, BOARDS, SUBJECTS } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function StudentOnboardingPage() {
  const router = useRouter()
  const { userId, setProfile } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    class: '', board: '', subjects: [] as string[], father_name: '',
    phone: '', age: '', gender: '', bio: '',
  })

  const update = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }))

  const toggleSubject = (subject: string) => {
    setForm(p => ({
      ...p,
      subjects: p.subjects.includes(subject)
        ? p.subjects.filter(s => s !== subject)
        : [...p.subjects, subject],
    }))
  }

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await upsertProfile({
      id: userId, ...form, age: parseInt(form.age) || null,
    })
    if (error) { toast.error('Failed to save profile'); setLoading(false); return }
    if (data) setProfile(data)

    // Create student record
    await supabase.from('students').upsert({
      id: userId,
      roll_number: null,
      enrollment_date: new Date().toISOString().split('T')[0],
      is_active: true,
    })

    toast.success('Profile set up! Welcome to Pahore Academy 🎓')
    router.push('/dashboard/student')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: '#141d2e', border: '2px solid #C9A84C' }}>
            <span className="font-heading text-lg font-bold text-gold">PA</span>
          </div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Student Setup</h1>
          <p className="text-text-muted text-sm">Step {step} of 2</p>
          {/* Progress bar */}
          <div className="mt-4 h-1 rounded-full mx-auto max-w-xs" style={{ background: '#1e2d47' }}>
            <div className="h-1 rounded-full transition-all" style={{ background: '#C9A84C', width: `${step * 50}%` }} />
          </div>
        </div>

        <div className="card">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-primary mb-4">Academic Details</h2>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
                <select value={form.class} onChange={e => update('class', e.target.value)}
                  className="input-field" style={{ cursor: 'pointer' }}>
                  <option value="">Select your class</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Board</label>
                <select value={form.board} onChange={e => update('board', e.target.value)} className="input-field">
                  <option value="">Select your board</option>
                  {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                  Subjects (select all you study)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(subject => (
                    <button key={subject} type="button" onClick={() => toggleSubject(subject)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.subjects.includes(subject) ? '#C9A84C' : '#1e2d47',
                        color: form.subjects.includes(subject) ? '#0A0F1C' : '#9EA8B8',
                        border: '1px solid ' + (form.subjects.includes(subject) ? '#C9A84C' : '#2a3d5c'),
                      }}>
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setStep(2)} className="btn-primary w-full py-3 rounded-xl mt-4">
                Next →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-heading text-xl font-bold text-text-primary mb-4">Personal Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Age</label>
                  <input type="number" value={form.age} onChange={e => update('age', e.target.value)}
                    placeholder="16" className="input-field" />
                </div>
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Gender</label>
                  <select value={form.gender} onChange={e => update('gender', e.target.value)} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Father&apos;s Name</label>
                <input type="text" value={form.father_name} onChange={e => update('father_name', e.target.value)}
                  placeholder="Father's full name" className="input-field" />
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="03001234567" className="input-field" />
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
                  Bio <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                  placeholder="A few words about yourself..." rows={3}
                  className="input-field resize-none" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 rounded-xl">← Back</button>
                <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 py-3 rounded-xl disabled:opacity-50">
                  {loading ? 'Saving...' : 'Complete Setup →'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip link */}
        <p className="text-center mt-4">
          <button onClick={() => router.push('/dashboard/student')}
            className="text-text-muted text-sm hover:text-text-secondary transition-colors">
            Skip for now
          </button>
        </p>
      </div>
    </div>
  )
}
