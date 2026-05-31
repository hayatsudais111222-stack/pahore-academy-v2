'use client'

import { useState, useMemo } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { useMarks } from '@/hooks/useMarks'
import { gradeColor, gradeLabel, formatDate } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function StudentMarksPage() {
  const { userId } = useAuthStore()
  const { marks, loading, stats } = useMarks(userId || '')
  const [filterSubject, setFilterSubject] = useState('all')
  const [sortBy, setSortBy] = useState<'date' | 'percentage' | 'subject'>('date')

  const subjects = useMemo(() => ['all', ...Object.keys(stats.bySubject)], [stats.bySubject])

  const filtered = useMemo(() => {
    let result = filterSubject === 'all' ? marks : marks.filter(m => m.subject === filterSubject)
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime()
      if (sortBy === 'percentage') return b.percentage - a.percentage
      return a.subject.localeCompare(b.subject)
    })
    return result
  }, [marks, filterSubject, sortBy])

  const subjectChartData = Object.entries(stats.bySubject).map(([subject, results]) => ({
    subject: subject.slice(0, 8),
    avg: Math.round(results.reduce((s, r) => s + r.percentage, 0) / results.length),
  }))

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="My Marks" subtitle="Complete test history" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6">

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Tests', value: stats.total },
              { label: 'Average', value: stats.average + '%', color: gradeColor(stats.average) },
              { label: 'Highest', value: stats.highest + '%', color: gradeColor(stats.highest) },
              { label: 'Grade', value: gradeLabel(stats.average), color: gradeColor(stats.average) },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center">
                <p className="text-text-muted text-xs uppercase tracking-widest mb-2">{label}</p>
                <p className="font-heading text-2xl font-bold" style={{ color: color || '#0F1B35' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Subject averages chart */}
          {subjectChartData.length > 0 && (
            <div className="card mb-6">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Subject-wise Performance</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subjectChartData}>
                  <XAxis dataKey="subject" tick={{ fill: '#9AA5B4', fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#9AA5B4', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F1B35' }} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {subjectChartData.map((entry, i) => (
                      <Cell key={i} fill={gradeColor(entry.avg)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex gap-2 flex-wrap">
              {subjects.map(s => (
                <button key={s} onClick={() => setFilterSubject(s)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-all capitalize"
                  style={{
                    background: filterSubject === s ? '#C9A84C' : '#E2E8F0',
                    color: filterSubject === s ? '#F8F9FC' : '#4A5568',
                    fontWeight: filterSubject === s ? 600 : 400,
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as 'date' | 'percentage' | 'subject')}
              className="ml-auto text-sm px-3 py-1.5 rounded-lg"
              style={{ background: '#E2E8F0', color: '#4A5568', border: 'none' }}>
              <option value="date">Sort: Latest</option>
              <option value="percentage">Sort: Highest %</option>
              <option value="subject">Sort: Subject</option>
            </select>
          </div>

          {/* Table */}
          <div className="card overflow-hidden p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-12 rounded-lg" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="marks-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Test Name</th>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(m => (
                      <tr key={m.id}>
                        <td className="text-text-muted">{formatDate(m.date)}</td>
                        <td className="text-text-primary font-medium">{m.test_name}</td>
                        <td className="text-text-secondary">{m.subject}</td>
                        <td>{m.obtained_marks} / {m.total_marks}</td>
                        <td>
                          <span className="font-bold" style={{ color: gradeColor(m.percentage) }}>
                            {m.percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{ background: gradeColor(m.percentage) + '22', color: gradeColor(m.percentage) }}>
                            {gradeLabel(m.percentage)}
                          </span>
                        </td>
                        <td className="text-text-muted text-xs">{m.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-text-muted">No marks found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
