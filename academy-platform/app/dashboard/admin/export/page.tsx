'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function AdminExportPage() {
  const [exporting, setExporting] = useState<string | null>(null)

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) { toast.error('No data to export'); return }
    const headers = Object.keys(data[0])
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filename} downloaded!`)
  }

  const exportStudents = async () => {
    setExporting('students')
    const { data } = await supabase
      .from('profiles')
      .select('full_name, class, board, phone, father_name, age, gender')
      .order('full_name')
    exportCSV(data || [], 'pahore-academy-students.csv')
    setExporting(null)
  }

  const exportMarks = async () => {
    setExporting('marks')
    const { data } = await supabase
      .from('test_results')
      .select('*, profiles!test_results_student_id_fkey(full_name, class)')
      .order('date', { ascending: false })
    const rows = (data || []).map((r: { profiles: { full_name: string; class: string }; subject: string; test_name: string; date: string; obtained_marks: number; total_marks: number; percentage: number; remarks: string }) => ({
      student_name: r.profiles?.full_name,
      class: r.profiles?.class,
      subject: r.subject,
      test_name: r.test_name,
      date: r.date,
      obtained: r.obtained_marks,
      total: r.total_marks,
      percentage: r.percentage,
      remarks: r.remarks,
    }))
    exportCSV(rows, 'pahore-academy-marks.csv')
    setExporting(null)
  }

  const exportLibrary = async () => {
    setExporting('library')
    const { data } = await supabase
      .from('library_files')
      .select('title, subject, class, board, file_url, upload_date, file_size')
      .eq('is_active', true)
    exportCSV(data || [], 'pahore-academy-library.csv')
    setExporting(null)
  }

  const exports = [
    { id: 'students', icon: '🎓', title: 'Student Records', desc: 'All student profiles with class, board, and contact info', action: exportStudents },
    { id: 'marks', icon: '📊', title: 'All Marks Data', desc: 'Complete test results with percentages for all students', action: exportMarks },
    { id: 'library', icon: '📚', title: 'Library Catalogue', desc: 'All uploaded files with subject and class tags', action: exportLibrary },
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Export Data" subtitle="Download academy data as CSV" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 max-w-2xl">
          <div className="space-y-4">
            {exports.map(({ id, icon, title, desc, action }) => (
              <div key={id} className="card flex items-center gap-4">
                <span className="text-4xl shrink-0">{icon}</span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-bold text-text-primary">{title}</h3>
                  <p className="text-text-muted text-sm">{desc}</p>
                </div>
                <button onClick={action} disabled={exporting === id}
                  className="btn-primary px-5 py-2.5 rounded-xl shrink-0 disabled:opacity-50">
                  {exporting === id ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            ))}

            <div className="card" style={{ borderColor: '#C9A84C' }}>
              <p className="text-success text-sm font-medium mb-2">📋 Export Notes</p>
              <ul className="text-text-secondary text-sm space-y-1">
                <li>• All exports are in CSV format, compatible with Excel and Google Sheets</li>
                <li>• Files download directly to your device</li>
                <li>• Exported data reflects current database state</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
