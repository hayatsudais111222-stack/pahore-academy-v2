'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface StudentData {
  id: string
  full_name: string
  class: string
  board: string
  subjects: string[]
  phone: string
  roll_number: string | null
  is_active: boolean
  avg_pct: number | null
}

export default function TeacherRosterPage() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('all')

  useEffect(() => {
    const load = async () => {
      const { data: profiles } = await supabase.from('profiles').select('*').order('full_name')
      const { data: studentData } = await supabase.from('students').select('*').eq('is_active', true)
      const { data: marks } = await supabase.from('test_results').select('student_id, percentage')

      const rollMap: Record<string, string | null> = {}
      studentData?.forEach((s: { id: string; roll_number: string | null }) => { rollMap[s.id] = s.roll_number })

      const marksMap: Record<string, number[]> = {}
      marks?.forEach((m: { student_id: string; percentage: number }) => {
        if (!marksMap[m.student_id]) marksMap[m.student_id] = []
        marksMap[m.student_id].push(m.percentage)
      })

      const rows: StudentData[] = (profiles || []).map((p: { id: string; full_name: string; class: string; board: string; subjects: string[]; phone: string }) => {
        const pcts = marksMap[p.id] || []
        return {
          id: p.id,
          full_name: p.full_name || 'Unknown',
          class: p.class || '—',
          board: p.board || '—',
          subjects: p.subjects || [],
          phone: p.phone || '—',
          roll_number: rollMap[p.id] || null,
          is_active: true,
          avg_pct: pcts.length ? Math.round(pcts.reduce((a, b) => a + b) / pcts.length * 10) / 10 : null,
        }
      })
      setStudents(rows)
      setLoading(false)
    }
    load()
  }, [])

  const classes = ['all', ...Array.from(new Set(students.map(s => s.class).filter(c => c !== '—')))]
  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    return (filterClass === 'all' || s.class === filterClass) &&
      (!search || s.full_name.toLowerCase().includes(q) || (s.roll_number || '').toLowerCase().includes(q))
  })

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Student Roster" subtitle={`${students.length} students total`} />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or roll number..." className="input-field flex-1" />
            <div className="flex gap-2 flex-wrap">
              {classes.slice(0, 8).map(c => (
                <button key={c} onClick={() => setFilterClass(c)}
                  className="text-xs px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: filterClass === c ? '#C9A84C' : '#E2E8F0',
                    color: filterClass === c ? '#F8F9FC' : '#4A5568',
                    fontWeight: filterClass === c ? 600 : 400,
                  }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            {loading ? (
              <div className="p-6 space-y-2">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
              </div>
            ) : (
              <table className="marks-table">
                <thead>
                  <tr>
                    <th>Student</th><th>Roll #</th><th>Class</th><th>Board</th><th>Avg Score</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: '#C9A84C', color: '#F8F9FC' }}>
                            {s.full_name[0]}
                          </div>
                          <div>
                            <p className="text-text-primary font-medium">{s.full_name}</p>
                            <p className="text-text-muted text-xs">{s.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-text-muted">{s.roll_number || '—'}</td>
                      <td className="text-text-secondary">{s.class}</td>
                      <td className="text-text-secondary">{s.board}</td>
                      <td>
                        {s.avg_pct !== null
                          ? <span className="font-mono font-bold"
                              style={{ color: s.avg_pct >= 70 ? '#C9A84C' : s.avg_pct >= 50 ? '#C9A84C' : '#8B2E2E' }}>
                              {s.avg_pct}%
                            </span>
                          : <span className="text-text-muted text-xs">No data</span>
                        }
                      </td>
                      <td>
                        <Link href={`/dashboard/teacher/marks`}
                          className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: '#E2E8F0', color: '#4A5568' }}>
                          View Marks
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
