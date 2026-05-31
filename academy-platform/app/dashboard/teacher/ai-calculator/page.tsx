'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { callClaude, MARKS_CALCULATOR_SYSTEM } from '@/lib/claude'
import { SUBJECTS } from '@/lib/utils'
import toast from 'react-hot-toast'

interface MarkEntry { subject: string; obtained: string; total: string }

export default function AICalculatorPage() {
  const [marks, setMarks] = useState<MarkEntry[]>([{ subject: SUBJECTS[0], obtained: '', total: '100' }])
  const [studentName, setStudentName] = useState('')
  const [className, setClassName] = useState('')
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  const addRow = () => setMarks(p => [...p, { subject: SUBJECTS[0], obtained: '', total: '100' }])
  const removeRow = (i: number) => setMarks(p => p.filter((_, idx) => idx !== i))
  const updateRow = (i: number, field: keyof MarkEntry, val: string) =>
    setMarks(p => p.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const calcPct = (o: string, t: string) => {
    const pct = (parseInt(o) / parseInt(t)) * 100
    return isNaN(pct) ? null : pct
  }

  const analyze = async () => {
    const validMarks = marks.filter(m => m.obtained && m.total)
    if (validMarks.length === 0) { toast.error('Enter at least one mark'); return }
    setLoading(true)
    setAnalysis('')

    const marksText = validMarks.map(m => {
      const pct = calcPct(m.obtained, m.total)
      return `${m.subject}: ${m.obtained}/${m.total} (${pct?.toFixed(1)}%)`
    }).join('\n')

    const prompt = `Analyze these marks for ${studentName || 'a student'} in ${className || 'their class'}:

${marksText}

Please provide:
1. Overall percentage and grade
2. Subject-wise performance breakdown
3. Strongest and weakest subjects
4. Specific improvement recommendations
5. Study priorities for next month`

    try {
      const result = await callClaude([{ role: 'user', content: prompt }], MARKS_CALCULATOR_SYSTEM)
      setAnalysis(result)
      setChatHistory([{ role: 'user', content: prompt }, { role: 'assistant', content: result }])
    } catch {
      toast.error('AI analysis failed')
    }
    setLoading(false)
  }

  const askFollowUp = async () => {
    if (!question.trim() || !analysis) return
    const q = question.trim()
    setQuestion('')
    setLoading(true)
    const newHistory = [...chatHistory, { role: 'user' as const, content: q }]
    setChatHistory(newHistory)
    try {
      const result = await callClaude(newHistory, MARKS_CALCULATOR_SYSTEM)
      setChatHistory(prev => [...prev, { role: 'assistant', content: result }])
    } catch {
      toast.error('Failed to get response')
    }
    setLoading(false)
  }

  const totalObtained = marks.filter(m => m.obtained && m.total).reduce((s, m) => s + parseInt(m.obtained), 0)
  const totalMarks = marks.filter(m => m.obtained && m.total).reduce((s, m) => s + parseInt(m.total), 0)
  const overallPct = totalMarks > 0 ? (totalObtained / totalMarks * 100).toFixed(1) : null

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Sidebar />
      <Topbar title="AI Marks Calculator" subtitle="Intelligent performance analysis" />
      <main className="pt-[60px] pl-[248px]">
        <div className="p-6 flex gap-6">
          {/* Input panel */}
          <div className="w-96 shrink-0 space-y-4">
            <div className="card">
              <h3 className="font-heading text-lg font-bold text-text-primary mb-4">Enter Marks</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Student Name</label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                    placeholder="Optional" className="input-field text-sm" />
                </div>
                <div>
                  <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1.5">Class</label>
                  <input type="text" value={className} onChange={e => setClassName(e.target.value)}
                    placeholder="e.g. Class 10" className="input-field text-sm" />
                </div>
              </div>

              <div className="space-y-2 mb-3">
                {marks.map((m, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={m.subject} onChange={e => updateRow(i, 'subject', e.target.value)}
                      className="input-field text-xs flex-1">
                      {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="number" value={m.obtained} onChange={e => updateRow(i, 'obtained', e.target.value)}
                      placeholder="Got" className="input-field text-xs w-16 text-center font-mono" />
                    <span className="text-text-muted text-xs">/</span>
                    <input type="number" value={m.total} onChange={e => updateRow(i, 'total', e.target.value)}
                      placeholder="100" className="input-field text-xs w-16 text-center font-mono" />
                    {marks.length > 1 && (
                      <button onClick={() => removeRow(i)} className="text-danger text-sm shrink-0">✕</button>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={addRow} className="btn-secondary w-full py-2 rounded-lg text-sm mb-4">
                + Add Subject
              </button>

              {overallPct && (
                <div className="text-center py-3 rounded-xl mb-4" style={{ background: '#F8F9FC', border: '1px solid #E2E8F0' }}>
                  <p className="text-text-muted text-xs mb-1">Overall Score</p>
                  <p className="font-mono text-3xl font-bold text-gold">{overallPct}%</p>
                  <p className="text-text-muted text-xs mt-1">{totalObtained} / {totalMarks} marks</p>
                </div>
              )}

              <button onClick={analyze} disabled={loading} className="btn-primary w-full py-3 rounded-xl disabled:opacity-50">
                {loading ? '🤖 Analyzing...' : '🤖 Analyze with AI'}
              </button>
            </div>

            {/* Per-subject preview */}
            {marks.some(m => m.obtained && m.total) && (
              <div className="card">
                <h4 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Live Preview</h4>
                <div className="space-y-2">
                  {marks.filter(m => m.obtained && m.total).map((m, i) => {
                    const pct = calcPct(m.obtained, m.total)!
                    const colors = ['#C9A84C', '#C9A84C', '#B87A1A', '#8B2E2E']
                    const colIdx = pct >= 80 ? 0 : pct >= 60 ? 1 : pct >= 40 ? 2 : 3
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-secondary">{m.subject}</span>
                          <span className="font-mono font-bold" style={{ color: colors[colIdx] }}>{pct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#E2E8F0' }}>
                          <div className="h-1.5 rounded-full transition-all" style={{ background: colors[colIdx], width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Analysis panel */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {!analysis && !loading ? (
              <div className="card flex-1 flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-5xl">🤖</div>
                <h3 className="font-heading text-xl font-bold text-text-primary">AI Marks Analyzer</h3>
                <p className="text-text-secondary text-sm max-w-xs">
                  Enter student marks on the left, then click Analyze to get detailed AI-powered performance insights.
                </p>
              </div>
            ) : (
              <>
                <div className="card flex-1 overflow-y-auto">
                  {loading && !analysis ? (
                    <div className="flex items-center justify-center h-40 gap-3">
                      <div className="w-3 h-3 rounded-full bg-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-3 h-3 rounded-full bg-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-3 h-3 rounded-full bg-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.filter(m => m.role === 'assistant').map((m, i) => (
                        <div key={i} className="prose prose-sm max-w-none">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                              style={{ background: '#C9A84C', color: '#F8F9FC', fontWeight: 700 }}>AI</div>
                            <span className="text-text-muted text-xs">Analysis Result</span>
                          </div>
                          <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{m.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {analysis && (
                  <div className="card">
                    <p className="text-text-muted text-xs mb-2">Ask a follow-up question about these marks</p>
                    <div className="flex gap-3">
                      <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && askFollowUp()}
                        placeholder="e.g. What study plan would you recommend?"
                        className="input-field flex-1 text-sm" disabled={loading} />
                      <button onClick={askFollowUp} disabled={loading || !question.trim()}
                        className="btn-primary px-4 rounded-xl text-sm disabled:opacity-50">
                        Ask
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
