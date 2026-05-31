'use client'

import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { useAuthStore } from '@/store'
import { supabase, insertTestResult, updateTestResult, deleteTestResult } from '@/lib/supabase'
import { gradeColor, gradeLabel, formatDate, SUBJECTS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Profile, TestResult } from '@/types'

interface StudentRow {
  id: string
  full_name: string
  class: string
  roll_number: string | null
}

interface EditingMark {
  studentId: string
  existingId?: string
  subject: string
  testName: string
  date: string
  totalMarks: string
  obtainedMarks: string
  remarks: string
}

export default function TeacherMarksPage() {
  const { userId } = useAuthStore()
  const [students, setStudents] = useState<StudentRow[]>([])
  const [marks, setMarks] = useState<Record<string, TestResult[]>>({})
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<EditingMark>({
    studentId: '', subject: SUBJECTS[0], testName: '',
    date: new Date().toISOString().split('T')[0],
    totalMarks: '100', obtainedMarks: '', remarks: '',
  })
  const [saving, setSaving] = useState(false)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, class')
      .order('full_name')
    const { data: studentData } = await supabase
      .from('students')
      .select('id, roll_number')
      .eq('is_active', true)
    const rollMap: Record<string, string | null> = {}
    studentData?.forEach((s: { id: string; roll_number: string | null }) => { rollMap[s.id] = s.roll_number })
    const rows: StudentRow[] = (data || []).map((p: { id: string; full_name: string; class: string }) => ({
      id: p.id, full_name: p.full_name || 'Unknown', class: p.class || '—',
      roll_number: rollMap[p.id] || null,
    }))
    setStudents(rows)
    setLoading(false)
  }, [])

  const fetchMarks = useCallback(async (studentId: string) => {
    const { data } = await supabase
      .from('test_results')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
    setMarks(prev => ({ ...prev, [studentId]: data || [] }))
  }, [])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  useEffect(() => {
    if (selectedStudent) fetchMarks(selectedStudent.id)
  }, [selectedStudent, fetchMarks])

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    (s.roll_number || '').toLowerCase().includes(search.toLowerCase())
  )

  const openAddForm = (studentId: string) => {
    setEditing({
      studentId, subject: SUBJECTS[0], testName: '',
      date: new Date().toISOString().split('T')[0],
      totalMarks: '100', obtainedMarks: '', remarks: '',
    })
    setShowForm(true)
  }

  const openEditForm = (mark: TestResult) => {
    setEditing({
      studentId: mark.student_id,
      existingId: mark.id,
      subject: mark.subject,
      testName: mark.test_name,
      date: mark.date,
      totalMarks: String(mark.total_marks),
      obtainedMarks: String(mark.obtained_marks),
      remarks: mark.remarks || '',
    })
    setShowForm(true)
  }

  const saveMark = async () => {
    if (!editing.testName || !editing.obtainedMarks || !userId) {
      toast.error('Fill all required fields')
      return
    }
    const obtained = parseInt(editing.obtainedMarks)
    const total = parseInt(editing.totalMarks)
    if (obtained > total) { toast.error('Obtained marks cannot exceed total'); return }

    setSaving(true)
    const payload = {
      student_id: editing.studentId,
      teacher_id: userId,
      subject: editing.subject,
      test_name: editing.testName,
      date: editing.date,
      total_marks: total,
      obtained_marks: obtained,
      remarks: editing.remarks || null,
    }

    const { error } = editing.existingId
      ? await updateTestResult(editing.existingId, payload)
      : await insertTestResult(payload)

    if (error) { toast.error('Failed to save'); setSaving(false); return }
    toast.success(editing.existingId ? 'Updated!' : 'Mark added!')
    setShowForm(false)
    fetchMarks(editing.studentId)
    setSaving(false)
  }

  const deleteMark = async (markId: string, studentId: string) => {
    if (!confirm('Delete this mark?')) return
    await deleteTestResult(markId)
    toast.success('Deleted')
    fetchMarks(studentId)
  }

  const studentMarks = selectedStudent ? (marks[selectedStudent.id] || []) : []
  const avgPct = studentMarks.length
    ? studentMarks.reduce((s, m) => s + m.percentage, 0) / studentMarks.length
    : 0

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="Marks Entry" subtitle="Enter and manage student marks" />

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="card w-full max-w-md" style={{ borderColor: '#C9A84C' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl font-bold text-text-primary">
                {editing.existingId ? 'Edit Mark' : 'Add Mark'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-text-muted hover:text-text-primary text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Subject *</label>
                <select value={editing.subject} onChange={e => setEditing(p => ({ ...p, subject: e.target.value }))} className="input-field">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Test Name *</label>
                <input type="text" value={editing.testName}
                  onChange={e => setEditing(p => ({ ...p, testName: e.target.value }))}
                  placeholder="e.g. Mid-Term Exam, Chapter 3 Test"
                  className="input-field" />
              </div>
              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Date *</label>
                <input type="date" value={editing.date}
                  onChange={e => setEditing(p => ({ ...p, date: e.target.value }))}
                  className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Total Marks *</label>
                  <input type="number" value={editing.totalMarks}
                    onChange={e => setEditing(p => ({ ...p, totalMarks: e.target.value }))}
                    placeholder="100" className="input-field font-mono" />
                </div>
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Obtained *</label>
                  <input type="number" value={editing.obtainedMarks}
                    onChange={e => setEditing(p => ({ ...p, obtainedMarks: e.target.value }))}
                    placeholder="75" className="input-field font-mono" />
                </div>
              </div>
              {editing.obtainedMarks && editing.totalMarks && (
                <div className="text-center py-2 rounded-lg" style={{ background: '#F8F9FC' }}>
                  <span className="font-mono text-2xl font-bold"
                    style={{ color: gradeColor((parseInt(editing.obtainedMarks) / parseInt(editing.totalMarks)) * 100) }}>
                    {((parseInt(editing.obtainedMarks) / parseInt(editing.totalMarks)) * 100).toFixed(1)}%
                  </span>
                  <span className="ml-2 text-text-muted text-sm">
                    {gradeLabel((parseInt(editing.obtainedMarks) / parseInt(editing.totalMarks)) * 100)}
                  </span>
                </div>
              )}
              <div>
                <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Remarks</label>
                <input type="text" value={editing.remarks}
                  onChange={e => setEditing(p => ({ ...p, remarks: e.target.value }))}
                  placeholder="Optional comments..." className="input-field" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5 rounded-xl">Cancel</button>
                <button onClick={saveMark} disabled={saving} className="btn-primary flex-1 py-2.5 rounded-xl disabled:opacity-50">
                  {saving ? 'Saving...' : (editing.existingId ? 'Update' : 'Add Mark')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 flex gap-6">
          {/* Student list */}
          <div className="w-72 shrink-0">
            <div className="card p-0 overflow-hidden">
              <div className="p-3" style={{ borderBottom: '1px solid #E2E8F0' }}>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search students..." className="input-field text-sm" />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-text-muted text-sm">No students found</div>
                ) : (
                  filteredStudents.map(s => (
                    <button key={s.id} onClick={() => setSelectedStudent(s)}
                      className="w-full text-left px-4 py-3 transition-all flex items-center gap-3"
                      style={{
                        background: selectedStudent?.id === s.id ? 'rgba(184,150,106,0.12)' : 'transparent',
                        borderLeft: `3px solid ${selectedStudent?.id === s.id ? '#C9A84C' : 'transparent'}`,
                        borderBottom: '1px solid rgba(42,64,96,0.4)',
                      }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ background: selectedStudent?.id === s.id ? '#C9A84C' : '#E2E8F0', color: selectedStudent?.id === s.id ? '#F8F9FC' : '#4A5568' }}>
                        {s.full_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-text-primary text-sm font-medium truncate">{s.full_name}</p>
                        <p className="text-text-muted text-xs">{s.class}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Marks panel */}
          <div className="flex-1 min-w-0">
            {!selectedStudent ? (
              <div className="card h-64 flex flex-col items-center justify-center gap-3">
                <div className="text-5xl">👈</div>
                <p className="font-heading text-xl text-text-primary">Select a student</p>
                <p className="text-text-muted text-sm">Choose a student from the left panel to view and edit their marks</p>
              </div>
            ) : (
              <>
                {/* Student header */}
                <div className="card mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                        style={{ background: '#C9A84C', color: '#F8F9FC' }}>
                        {selectedStudent.full_name[0]}
                      </div>
                      <div>
                        <h3 className="font-heading text-lg font-bold text-text-primary">{selectedStudent.full_name}</h3>
                        <p className="text-text-muted text-sm">{selectedStudent.class} · Roll: {selectedStudent.roll_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {studentMarks.length > 0 && (
                        <div className="text-right">
                          <p className="text-text-muted text-xs">Average</p>
                          <p className="font-mono font-bold text-xl" style={{ color: gradeColor(avgPct) }}>
                            {avgPct.toFixed(1)}% <span className="text-sm">{gradeLabel(avgPct)}</span>
                          </p>
                        </div>
                      )}
                      <button onClick={() => openAddForm(selectedStudent.id)} className="btn-primary px-4 py-2 rounded-xl">
                        + Add Mark
                      </button>
                    </div>
                  </div>
                </div>

                {/* Marks table */}
                <div className="card overflow-hidden p-0">
                  {studentMarks.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-text-primary font-medium mb-1">No marks yet</p>
                      <p className="text-text-muted text-sm mb-4">Add the first test result for this student</p>
                      <button onClick={() => openAddForm(selectedStudent.id)} className="btn-primary px-6 py-2.5 rounded-xl">
                        Add First Mark
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="marks-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Test Name</th>
                            <th>Subject</th>
                            <th>Marks</th>
                            <th>%</th>
                            <th>Grade</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentMarks.map(m => (
                            <tr key={m.id}>
                              <td className="text-text-muted whitespace-nowrap">{formatDate(m.date)}</td>
                              <td className="text-text-primary font-medium">{m.test_name}</td>
                              <td className="text-text-secondary">{m.subject}</td>
                              <td className="font-mono">{m.obtained_marks} / {m.total_marks}</td>
                              <td>
                                <span className="font-mono font-bold" style={{ color: gradeColor(m.percentage) }}>
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
                              <td>
                                <div className="flex gap-2">
                                  <button onClick={() => openEditForm(m)}
                                    className="text-xs px-2 py-1 rounded transition-colors"
                                    style={{ background: '#E2E8F0', color: '#4A5568' }}>
                                    Edit
                                  </button>
                                  <button onClick={() => deleteMark(m.id, selectedStudent.id)}
                                    className="text-xs px-2 py-1 rounded transition-colors"
                                    style={{ background: '#8B2E2E22', color: '#FCA5A5' }}>
                                    Del
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
