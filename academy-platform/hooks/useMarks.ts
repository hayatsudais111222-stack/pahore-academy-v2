'use client'

import { useCallback, useEffect, useState } from 'react'
import { getStudentMarks, insertTestResult, updateTestResult, deleteTestResult } from '@/lib/supabase'
import type { TestResult } from '@/types'
import toast from 'react-hot-toast'

export function useMarks(studentId: string) {
  const [marks, setMarks] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMarks = useCallback(async () => {
    if (!studentId) return
    setLoading(true)
    const { data, error } = await getStudentMarks(studentId)
    if (error) toast.error('Failed to load marks')
    else setMarks(data || [])
    setLoading(false)
  }, [studentId])

  useEffect(() => { fetchMarks() }, [fetchMarks])

  const addMark = async (result: Omit<TestResult, 'id' | 'percentage' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await insertTestResult(result)
    if (error) { toast.error('Failed to add mark'); return null }
    toast.success('Mark added!')
    await fetchMarks()
    return data
  }

  const updateMark = async (id: string, updates: Partial<TestResult>) => {
    const { data, error } = await updateTestResult(id, updates)
    if (error) { toast.error('Failed to update mark'); return null }
    toast.success('Mark updated!')
    await fetchMarks()
    return data
  }

  const deleteMark = async (id: string) => {
    const { error } = await deleteTestResult(id)
    if (error) { toast.error('Failed to delete mark'); return }
    toast.success('Mark deleted')
    setMarks(prev => prev.filter(m => m.id !== id))
  }

  // Computed stats
  const stats = {
    total: marks.length,
    average: marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length * 10) / 10 : 0,
    highest: marks.length ? Math.max(...marks.map(m => m.percentage)) : 0,
    lowest: marks.length ? Math.min(...marks.map(m => m.percentage)) : 0,
    bySubject: marks.reduce((acc, m) => {
      if (!acc[m.subject]) acc[m.subject] = []
      acc[m.subject].push(m)
      return acc
    }, {} as Record<string, TestResult[]>),
  }

  return { marks, loading, stats, addMark, updateMark, deleteMark, refresh: fetchMarks }
}
