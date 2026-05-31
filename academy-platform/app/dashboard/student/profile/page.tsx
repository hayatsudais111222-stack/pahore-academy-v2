'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { upsertProfile } from '@/lib/supabase'
import { CLASSES, BOARDS, SUBJECTS } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function StudentProfilePage() {
  const { profile, setProfile, email } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    father_name: profile?.father_name || '',
    phone: profile?.phone || '',
    age: profile?.age?.toString() || '',
    gender: profile?.gender || '',
    class: profile?.class || '',
    board: profile?.board || '',
    subjects: profile?.subjects || [] as string[],
    bio: profile?.bio || '',
  })

  const update = (field: string, val: unknown) => setForm(p => ({ ...p, [field]: val }))
  const toggleSubject = (s: string) =>
    setForm(p => ({ ...p, subjects: p.subjects.includes(s) ? p.subjects.filter(x => x !== s) : [...p.subjects, s] }))

  const save = async () => {
    if (!profile?.id) return
    setSaving(true)
    const { data, error } = await upsertProfile({ ...form, id: profile.id, age: parseInt(form.age) || null })
    if (error) { toast.error('Save failed'); setSaving(false); return }
    if (data) setProfile(data)
    toast.success('Profile saved!')
    setEditing(false)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="My Profile" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 max-w-3xl">
          {/* Header card */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: '#C9A84C', color: '#F8F9FC' }}>
                  {form.full_name?.[0] || '?'}
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-bold text-text-primary">{form.full_name || 'Student'}</h2>
                  <p className="text-text-muted text-sm">{email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="badge-student">Student</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setEditing(!editing)} className={editing ? 'btn-secondary px-4 py-2 rounded-lg' : 'btn-primary px-4 py-2 rounded-lg'}>
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Profile form */}
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'Your full name' },
                { label: "Father's Name", field: 'father_name', type: 'text', placeholder: "Father's name" },
                { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '03001234567' },
                { label: 'Age', field: 'age', type: 'number', placeholder: '16' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">{label}</label>
                  {editing ? (
                    <input type={type} value={(form as Record<string, unknown>)[field] as string}
                      onChange={e => update(field, e.target.value)} placeholder={placeholder} className="input-field" />
                  ) : (
                    <p className="text-text-primary py-2">{(form as Record<string, unknown>)[field] as string || <span className="text-text-muted">Not set</span>}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Gender</label>
                {editing ? (
                  <select value={form.gender} onChange={e => update('gender', e.target.value)} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <p className="text-text-primary py-2 capitalize">{form.gender || <span className="text-text-muted">Not set</span>}</p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Class</label>
                {editing ? (
                  <select value={form.class} onChange={e => update('class', e.target.value)} className="input-field">
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <p className="text-text-primary py-2">{form.class || <span className="text-text-muted">Not set</span>}</p>
                )}
              </div>

              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Board</label>
                {editing ? (
                  <select value={form.board} onChange={e => update('board', e.target.value)} className="input-field">
                    <option value="">Select board</option>
                    {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                ) : (
                  <p className="text-text-primary py-2">{form.board || <span className="text-text-muted">Not set</span>}</p>
                )}
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Subjects</label>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map(s => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: form.subjects.includes(s) ? '#C9A84C' : '#E2E8F0',
                        color: form.subjects.includes(s) ? '#F8F9FC' : '#4A5568',
                        border: '1px solid ' + (form.subjects.includes(s) ? '#C9A84C' : '#CBD5E0'),
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.subjects.length > 0
                    ? form.subjects.map(s => <span key={s} className="px-2 py-1 rounded text-xs" style={{ background: '#E2E8F0', color: '#4A5568' }}>{s}</span>)
                    : <span className="text-text-muted text-sm">No subjects selected</span>
                  }
                </div>
              )}
            </div>

            <div className="mt-5">
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">Bio</label>
              {editing ? (
                <textarea value={form.bio} onChange={e => update('bio', e.target.value)}
                  placeholder="A few words about yourself..." rows={3} className="input-field resize-none" />
              ) : (
                <p className="text-text-secondary text-sm">{form.bio || <span className="text-text-muted">No bio added</span>}</p>
              )}
            </div>

            {editing && (
              <div className="mt-6 flex justify-end">
                <button onClick={save} disabled={saving} className="btn-primary px-8 py-3 rounded-xl disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
