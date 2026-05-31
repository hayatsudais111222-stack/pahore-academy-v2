'use client'

import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store'
import { addRole } from '@/lib/supabase'
import type { Role } from '@/types'

export default function SelectRolePage() {
  const router = useRouter()
  const { userId } = useAuthStore()

  const selectRole = async (role: Role) => {
    if (!userId) return
    await addRole(userId, role)
    router.push(`/onboarding/${role}`)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#141d2e', border: '2px solid #C9A84C' }}>
            <span className="font-heading text-2xl font-bold text-gold">PA</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">Who are you?</h1>
          <p className="text-text-secondary">Select your role to get started. You can add more roles later.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              role: 'student' as Role,
              icon: '🎓',
              label: 'Student',
              badge: 'badge-student',
              desc: 'Access your marks, library, and AI study assistant',
              color: '#C4B5FD',
            },
            {
              role: 'teacher' as Role,
              icon: '📝',
              label: 'Teacher',
              badge: 'badge-teacher',
              desc: 'Manage marks sheets, reports, and library uploads',
              color: '#FCD9A0',
              note: 'Requires access code',
            },
            {
              role: 'admin' as Role,
              icon: '⚙️',
              label: 'Admin',
              badge: 'badge-admin',
              desc: 'Full control over students, users, and system settings',
              color: '#FCA5A5',
              note: 'Requires admin code',
            },
          ].map(({ role, icon, label, badge, desc, color, note }) => (
            <button key={role} onClick={() => selectRole(role)}
              className="card text-left group hover:border-border-light transition-all cursor-pointer w-full">
              <div className="text-3xl mb-4">{icon}</div>
              <span className={badge}>{label}</span>
              <p className="text-text-secondary text-sm mt-3 mb-2 leading-relaxed">{desc}</p>
              {note && <p className="text-xs" style={{ color }}>{note}</p>}
              <div className="mt-4 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Choose {label} →
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
