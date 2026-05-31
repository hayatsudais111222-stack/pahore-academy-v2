'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface UserRow {
  id: string; email: string; full_name: string; roles: string[]; created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = async () => {
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, created_at').order('created_at', { ascending: false })
    const { data: roles } = await supabase.from('roles').select('user_id, role')
    const { data: authUsers } = await supabase.from('profiles').select('id')

    const roleMap: Record<string, string[]> = {}
    roles?.forEach((r: { user_id: string; role: string }) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = []
      roleMap[r.user_id].push(r.role)
    })

    const rows: UserRow[] = (profiles || []).map((p: { id: string; full_name: string; created_at: string }) => ({
      id: p.id,
      email: '—',
      full_name: p.full_name || 'Unknown',
      roles: roleMap[p.id] || [],
      created_at: p.created_at,
    }))
    setUsers(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const revokeRole = async (userId: string, role: string) => {
    if (!confirm(`Remove ${role} role from this user?`)) return
    await supabase.from('roles').delete().eq('user_id', userId).eq('role', role)
    toast.success('Role revoked')
    load()
  }

  const filtered = users.filter(u =>
    !search || u.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="User Management" subtitle={`${users.length} registered users`} />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search users..." className="input-field max-w-sm mb-6" />

          <div className="card overflow-hidden p-0">
            <table className="marks-table">
              <thead>
                <tr><th>Name</th><th>Roles</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-text-muted">Loading...</td></tr>
                ) : filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: '#E2E8F0', color: '#4A5568' }}>
                          {u.full_name[0]}
                        </div>
                        <p className="text-text-primary font-medium">{u.full_name}</p>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.length > 0
                          ? u.roles.map(r => <span key={r} className={`badge-${r}`}>{r}</span>)
                          : <span className="text-text-muted text-xs">No roles</span>
                        }
                      </div>
                    </td>
                    <td className="text-text-muted text-xs">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {u.roles.map(r => (
                          <button key={r} onClick={() => revokeRole(u.id, r)}
                            className="text-xs px-2 py-1 rounded transition-colors"
                            style={{ background: '#8B2E2E22', color: '#FCA5A5' }}>
                            Revoke {r}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
