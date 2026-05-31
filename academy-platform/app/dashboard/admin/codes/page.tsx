'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { rotateAccessCode } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminCodesPage() {
  const { userId } = useAuthStore()
  const [teacherCode, setTeacherCode] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [saving, setSaving] = useState<'teacher' | 'admin' | null>(null)

  const rotate = async (role: 'teacher' | 'admin', code: string) => {
    if (!userId || !code.trim()) { toast.error('Enter a code'); return }
    if (code.length < 8) { toast.error('Code must be at least 8 characters'); return }
    setSaving(role)
    const { error } = await rotateAccessCode(role, code.trim(), userId)
    if (error) { toast.error('Failed to update code'); setSaving(null); return }
    toast.success(`${role === 'teacher' ? 'Teacher' : 'Admin'} code updated!`)
    setSaving(null)
    if (role === 'teacher') setTeacherCode('')
    else setAdminCode('')
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Access Codes" subtitle="Manage teacher and admin codes" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 max-w-2xl">
          <div className="space-y-6">
            {/* Teacher code */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📝</span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">Teacher Access Code</h3>
                  <p className="text-text-muted text-sm">New teachers enter this code to verify their role</p>
                </div>
                <span className="badge-teacher ml-auto">Teacher</span>
              </div>
              <div className="p-3 rounded-xl mb-4" style={{ background: '#F8F9FC', border: '1px solid #E2E8F0' }}>
                <p className="text-text-muted text-xs mb-1">Current default code</p>
                <p className="font-mono text-gold text-lg tracking-widest">TCH-2024-ACAD</p>
              </div>
              <div className="flex gap-3">
                <input type="text" value={teacherCode} onChange={e => setTeacherCode(e.target.value.toUpperCase())}
                  placeholder="Enter new teacher code (min 8 chars)"
                  className="input-field flex-1 font-mono tracking-wider" />
                <button onClick={() => rotate('teacher', teacherCode)} disabled={saving === 'teacher'}
                  className="btn-primary px-5 rounded-xl disabled:opacity-50">
                  {saving === 'teacher' ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>

            {/* Admin code */}
            <div className="card">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔐</span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-text-primary">Admin Access Code</h3>
                  <p className="text-text-muted text-sm">New admins enter this code during onboarding</p>
                </div>
                <span className="badge-admin ml-auto">Admin</span>
              </div>
              <div className="p-3 rounded-xl mb-4" style={{ background: '#F8F9FC', border: '1px solid #E2E8F0' }}>
                <p className="text-text-muted text-xs mb-1">Current default code</p>
                <p className="font-mono text-gold text-lg tracking-widest">ADM-ROOT-001</p>
              </div>
              <div className="flex gap-3">
                <input type="text" value={adminCode} onChange={e => setAdminCode(e.target.value.toUpperCase())}
                  placeholder="Enter new admin code (min 8 chars)"
                  className="input-field flex-1 font-mono tracking-wider" />
                <button onClick={() => rotate('admin', adminCode)} disabled={saving === 'admin'}
                  className="btn-primary px-5 rounded-xl disabled:opacity-50">
                  {saving === 'admin' ? 'Saving...' : 'Update'}
                </button>
              </div>
            </div>

            <div className="card" style={{ borderColor: '#B87A1A' }}>
              <p className="text-warning text-sm font-medium mb-2">⚠️ Important</p>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• Rotating a code immediately invalidates the old one</li>
                <li>• Share new codes securely with authorized staff only</li>
                <li>• Codes already used to verify existing users are not affected</li>
                <li>• Keep codes at least 8 characters for security</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
