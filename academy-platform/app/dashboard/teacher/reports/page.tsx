'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { gradeColor, gradeLabel, formatDate } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts'

interface SubjectStat { subject: string; avg: number; count: number; highest: number; lowest: number }
interface RecentTest { student: string; test: string; subject: string; pct: number; date: string }

const COLORS = ['#C9A84C', '#5B4FCF', '#C9A84C', '#B87A1A', '#C4541A', '#8B2E2E']

export default function TeacherReportsPage() {
  const [subjectStats, setSubjectStats] = useState<SubjectStat[]>([])
  const [recent, setRecent] = useState<RecentTest[]>([])
  const [loading, setLoading] = useState(true)
  const [gradeDistrib, setGradeDistrib] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: results } = await supabase
        .from('test_results')
        .select('*, profiles!test_results_student_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!results) { setLoading(false); return }

      // Subject stats
      const bySubject: Record<string, number[]> = {}
      results.forEach((r: { subject: string; percentage: number }) => {
        if (!bySubject[r.subject]) bySubject[r.subject] = []
        bySubject[r.subject].push(r.percentage)
      })
      const stats: SubjectStat[] = Object.entries(bySubject).map(([subject, pcts]) => ({
        subject,
        avg: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length * 10) / 10,
        count: pcts.length,
        highest: Math.max(...pcts),
        lowest: Math.min(...pcts),
      })).sort((a, b) => b.avg - a.avg)
      setSubjectStats(stats)

      // Grade distribution
      const grades: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
      results.forEach((r: { percentage: number }) => { grades[gradeLabel(r.percentage)]++ })
      setGradeDistrib(Object.entries(grades).map(([name, value]) => ({ name, value })))

      // Recent tests
      setRecent(results.slice(0, 15).map((r: { profiles: { full_name: string }; test_name: string; subject: string; percentage: number; date: string }) => ({
        student: r.profiles?.full_name || 'Unknown',
        test: r.test_name, subject: r.subject,
        pct: r.percentage, date: r.date,
      })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC]">
        <Sidebar /><Topbar title="Reports" />
        <main className="pt-[60px] pl-[248px] p-6">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-card" />)}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Class Reports" subtitle="Performance analytics" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 space-y-6">

          {/* Subject averages */}
          <div className="card">
            <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Subject-wise Average Scores</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subjectStats.map(s => ({ name: s.subject.slice(0, 10), avg: s.avg }))}>
                <XAxis dataKey="name" tick={{ fill: '#9AA5B4', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9AA5B4', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F1B35' }} />
                <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                  {subjectStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade distribution pie */}
            <div className="card">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={gradeDistrib.filter(g => g.value > 0)} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {gradeDistrib.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F1B35' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Subject stats table */}
            <div className="card overflow-hidden p-0">
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <h3 className="font-heading text-lg font-bold text-text-primary">Subject Breakdown</h3>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                <table className="marks-table">
                  <thead>
                    <tr><th>Subject</th><th>Tests</th><th>Avg</th><th>High</th><th>Low</th></tr>
                  </thead>
                  <tbody>
                    {subjectStats.map(s => (
                      <tr key={s.subject}>
                        <td className="text-text-primary font-medium">{s.subject}</td>
                        <td className="text-text-muted">{s.count}</td>
                        <td><span className="font-mono font-bold" style={{ color: gradeColor(s.avg) }}>{s.avg}%</span></td>
                        <td><span className="font-mono text-success">{s.highest.toFixed(0)}%</span></td>
                        <td><span className="font-mono text-danger">{s.lowest.toFixed(0)}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent tests */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
              <h3 className="font-heading text-lg font-bold text-text-primary">Recent Test Entries</h3>
            </div>
            <table className="marks-table">
              <thead>
                <tr><th>Student</th><th>Test</th><th>Subject</th><th>Score</th><th>Grade</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={i}>
                    <td className="text-text-primary font-medium">{r.student}</td>
                    <td className="text-text-secondary">{r.test}</td>
                    <td className="text-text-muted">{r.subject}</td>
                    <td><span className="font-mono font-bold" style={{ color: gradeColor(r.pct) }}>{r.pct.toFixed(1)}%</span></td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: gradeColor(r.pct) + '22', color: gradeColor(r.pct) }}>
                        {gradeLabel(r.pct)}
                      </span>
                    </td>
                    <td className="text-text-muted">{formatDate(r.date)}</td>
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
