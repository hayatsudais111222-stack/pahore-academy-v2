'use client'

import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import { gradeColor, gradeLabel } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line } from 'recharts'

const COLORS = ['#C9A84C', '#5B4FCF', '#C9A84C', '#B87A1A', '#C4541A', '#8B2E2E']

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<{
    subjectAvgs: { subject: string; avg: number }[]
    classAvgs: { class: string; avg: number; count: number }[]
    gradeDistrib: { name: string; value: number }[]
    topStudents: { name: string; avg: number }[]
    monthlyTests: { month: string; count: number }[]
  }>({ subjectAvgs: [], classAvgs: [], gradeDistrib: [], topStudents: [], monthlyTests: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: results } = await supabase
        .from('test_results')
        .select('*, profiles!test_results_student_id_fkey(full_name, class)')
        .order('created_at')

      if (!results) { setLoading(false); return }

      const bySubject: Record<string, number[]> = {}
      const byClass: Record<string, { total: number; count: number; students: number }> = {}
      const byStudent: Record<string, { name: string; pcts: number[] }> = {}
      const grades: Record<string, number> = { 'A+': 0, A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 }
      const byMonth: Record<string, number> = {}

      results.forEach((r: { subject: string; percentage: number; profiles: { full_name: string; class: string }; student_id: string; created_at: string }) => {
        if (!bySubject[r.subject]) bySubject[r.subject] = []
        bySubject[r.subject].push(r.percentage)

        const cls = r.profiles?.class
        if (cls) {
          if (!byClass[cls]) byClass[cls] = { total: 0, count: 0, students: 0 }
          byClass[cls].total += r.percentage
          byClass[cls].count++
        }

        const sid = r.student_id
        if (!byStudent[sid]) byStudent[sid] = { name: r.profiles?.full_name || 'Unknown', pcts: [] }
        byStudent[sid].pcts.push(r.percentage)

        grades[gradeLabel(r.percentage)]++

        const month = r.created_at?.slice(0, 7)
        if (month) byMonth[month] = (byMonth[month] || 0) + 1
      })

      setData({
        subjectAvgs: Object.entries(bySubject).map(([subject, pcts]) => ({
          subject: subject.slice(0, 10),
          avg: Math.round(pcts.reduce((a, b) => a + b) / pcts.length),
        })).sort((a, b) => b.avg - a.avg),

        classAvgs: Object.entries(byClass).map(([cls, d]) => ({
          class: cls.replace('Class ', 'Cls '), avg: Math.round(d.total / d.count), count: d.count,
        })).sort((a, b) => b.avg - a.avg),

        gradeDistrib: Object.entries(grades).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })),

        topStudents: Object.values(byStudent)
          .map(s => ({ name: s.name, avg: Math.round(s.pcts.reduce((a, b) => a + b) / s.pcts.length * 10) / 10 }))
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 10),

        monthlyTests: Object.entries(byMonth).sort().map(([month, count]) => ({
          month: month.slice(5), count,
        })),
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC]">
        <Sidebar /><Topbar title="Analytics" />
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
      <Topbar title="Analytics" subtitle="Academy-wide performance insights" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Subject averages */}
            <div className="card">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Subject Averages</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.subjectAvgs}>
                  <XAxis dataKey="subject" tick={{ fill: '#9AA5B4', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#9AA5B4', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F1B35' }} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {data.subjectAvgs.map((e, i) => <Cell key={i} fill={gradeColor(e.avg)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Grade distribution */}
            <div className="card">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data.gradeDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                    {data.gradeDistrib.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F1B35' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly test volume */}
            <div className="card">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Tests Recorded per Month</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.monthlyTests}>
                  <XAxis dataKey="month" tick={{ fill: '#9AA5B4', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#9AA5B4', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#0F1B35' }} />
                  <Line type="monotone" dataKey="count" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top students */}
            <div className="card overflow-hidden p-0">
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <h3 className="font-heading text-lg font-bold text-text-primary">Top Performing Students</h3>
              </div>
              <div className="p-4 space-y-2">
                {data.topStudents.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="font-mono text-xs w-6 text-text-muted">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-text-primary">{s.name}</span>
                        <span className="font-mono font-bold" style={{ color: gradeColor(s.avg) }}>{s.avg}%</span>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
                        <div className="h-1.5 rounded-full" style={{ background: gradeColor(s.avg), width: `${s.avg}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
