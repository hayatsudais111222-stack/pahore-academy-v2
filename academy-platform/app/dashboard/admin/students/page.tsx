'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { CLASSES, BOARDS, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface StudentRow {
  id: string; full_name: string; class: string; board: string
  phone: string; father_name: string; roll_number: string | null
  enrollment_date: string; is_active: boolean; avg_pct: number | null
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<StudentRow>>({})

  const loadStudents = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('full_name')
    const { data: studentData } = await supabase.from('students').select('*')
    const { data: marks } = await supabase.from('test_results').select('student_id, percentage')

    const studentMap: Record<string, { roll_number: string | null; enrollment_date: string; is_active: boolean }> = {}
    studentData?.forEach((s: { id: string; roll_number: string | null; enrollment_date: string; is_active: boolean }) => {
      studentMap[s.id] = { roll_number: s.roll_number, enrollment_date: s.enrollment_date, is_active: s.is_active }
    })

    const marksMap: Record<string, number[]> = {}
    marks?.forEach((m: { student_id: string; percentage: number }) => {
      if (!marksMap[m.student_id]) marksMap[m.student_id] = []
      marksMap[m.student_id].push(m.percentage)
    })

    const rows: StudentRow[] = (profiles || []).map((p: { id: string; full_name: string; class: string; board: string; phone: string; father_name: string }) => {
      const sm = studentMap[p.id]
      const pcts = marksMap[p.id] || []
      return {
        id: p.id, full_name: p.full_name || '—', class: p.class || '—',
        board: p.board || '—', phone: p.phone || '—', father_name: p.father_name || '—',
        roll_number: sm?.roll_number || null,
        enrollment_date: sm?.enrollment_date || '',
        is_active: sm?.is_active ?? true,
        avg_pct: pcts.length ? Math.round(pcts.reduce((a, b) => a + b) / pcts.length * 10) / 10 : null,
      }
    })
    setStudents(rows)
    setLoading(false)
  }

  useEffect(() => { loadStudents() }, [])

  const saveEdit = async () => {
    if (!editingId) return
    await supabase.from('profiles').update({
      full_name: editForm.full_name, class: editForm.class,
      board: editForm.board, phone: editForm.phone, father_name: editForm.father_name,
    }).eq('id', editingId)
    if (editForm.roll_number !== undefined) {
      await supabase.from('students').upsert({ id: editingId, roll_number: editForm.roll_number })
    }
    toast.success('Student updated!')
    setEditingId(null)
    loadStudents()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('students').update({ is_active: !current }).eq('id', id)
    toast.success(current ? 'Student deactivated' : 'Student activated')
    loadStudents()
  }

  const classes = ['all', ...Array.from(new Set(students.map(s => s.class).filter(c => c !== '—')))]
  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return (filterClass === 'all' || s.class === filterClass) &&
      (!search || s.full_name.toLowerCase().includes(q) || (s.roll_number || '').toLowerCase().includes(q))
  })

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Student Database" subtitle={`${students.length} total students`} />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or roll number..." className="input-field flex-1" />
            <div className="flex gap-2 flex-wrap">
              {classes.slice(0, 7).map(c => (
                <button key={c} onClick={() => setFilterClass(c)}
                  className="text-xs px-3 py-2 rounded-lg transition-all"
                  style={{ background: filterClass === c ? '#C9A84C' : '#E2E8F0', color: filterClass === c ? '#F8F9FC' : '#4A5568' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <table className="marks-table">
              <thead>
                <tr><th>Student</th><th>Roll #</th><th>Class</th><th>Board</th><th>Avg</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-text-muted">Loading...</td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id}>
                    {editingId === s.id ? (
                      <>
                        <td>
                          <input type="text" value={editForm.full_name || ''} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                            className="input-field text-sm py-1" />
                        </td>
                        <td>
                          <input type="text" value={editForm.roll_number || ''} onChange={e => setEditForm(p => ({ ...p, roll_number: e.target.value }))}
                            className="input-field text-sm py-1 font-mono" />
                        </td>
                        <td>
                          <select value={editForm.class || ''} onChange={e => setEditForm(p => ({ ...p, class: e.target.value }))}
                            className="input-field text-sm py-1">
                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td>
                          <select value={editForm.board || ''} onChange={e => setEditForm(p => ({ ...p, board: e.target.value }))}
                            className="input-field text-sm py-1">
                            {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </td>
                        <td>—</td>
                        <td>—</td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} className="btn-primary text-xs px-2 py-1 rounded">Save</button>
                            <button onClick={() => setEditingId(null)} className="btn-secondary text-xs px-2 py-1 rounded">Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: s.is_active ? '#C9A84C' : '#E2E8F0', color: s.is_active ? '#F8F9FC' : '#9AA5B4' }}>
                              {s.full_name[0]}
                            </div>
                            <div>
                              <p className="text-text-primary text-sm">{s.full_name}</p>
                              <p className="text-text-muted text-xs">{s.father_name ? `s/o ${s.father_name}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-text-muted text-xs">{s.roll_number || '—'}</td>
                        <td className="text-text-secondary">{s.class}</td>
                        <td className="text-text-secondary">{s.board}</td>
                        <td>
                          {s.avg_pct !== null
                            ? <span className="font-mono font-bold text-sm"
                                style={{ color: s.avg_pct >= 70 ? '#C9A84C' : s.avg_pct >= 50 ? '#C9A84C' : '#8B2E2E' }}>
                                {s.avg_pct}%
                              </span>
                            : <span className="text-text-muted text-xs">—</span>
                          }
                        </td>
                        <td>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: s.is_active ? '#C9A84C22' : '#8B2E2E22', color: s.is_active ? '#C9A84C' : '#8B2E2E' }}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditingId(s.id); setEditForm(s) }}
                              className="text-xs px-2 py-1 rounded" style={{ background: '#E2E8F0', color: '#4A5568' }}>
                              Edit
                            </button>
                            <button onClick={() => toggleActive(s.id, s.is_active)}
                              className="text-xs px-2 py-1 rounded"
                              style={{ background: s.is_active ? '#8B2E2E22' : '#C9A84C22', color: s.is_active ? '#FCA5A5' : '#C9A84C' }}>
                              {s.is_active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
